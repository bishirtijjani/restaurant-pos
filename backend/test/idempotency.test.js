/**
 * Integration Tests: Idempotency Middleware
 *
 * Verifies the core guarantees:
 *  - Without Idempotency-Key header, requests pass through unchanged
 *  - Same key + same body → handler runs once, cached response replayed
 *  - Same key + different body → 409 conflict (key reuse with mismatch)
 *  - Invalid UUID format → 400
 *  - Missing scope (no store/user) → 400
 *  - Failed requests are NOT cached (next retry can succeed)
 *  - Non-2xx responses release the pending slot
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import express from "express";
import { v7 as uuidv7 } from "uuid";

import IdempotencyKey from "../models/IdempotencyKey.js";
import idempotencyMiddleware from "../middleware/idempotencyMiddleware.js";

const STORE_ID = "store-abc-123";
const USER_ID = new mongoose.Types.ObjectId().toString();

let app;
let handlerCallCount = 0;
let handlerImpl = null;

beforeAll(() => {
  app = express();
  app.use(express.json());

  const injectContext = (req, _res, next) => {
    req.storeId = STORE_ID;
    req.user = { id: USER_ID, role: "admin" };
    next();
  };

  // Wire a test endpoint with idempotency
  app.post("/test/op", injectContext, idempotencyMiddleware, async (req, res) => {
    handlerCallCount++;
    if (handlerImpl) {
      return handlerImpl(req, res);
    }
    res.status(201).json({ success: true, echo: req.body, count: handlerCallCount });
  });

  // Endpoint with no scope context (no storeId, no user) — for the "missing scope" test
  app.post("/test/no-scope", idempotencyMiddleware, async (_req, res) => {
    res.status(200).json({ success: true });
  });
});

beforeEach(async () => {
  await IdempotencyKey.deleteMany({});
  handlerCallCount = 0;
  handlerImpl = null;
  await IdempotencyKey.init();
});

afterAll(async () => {
  await IdempotencyKey.deleteMany({});
});

describe("Idempotency Middleware", () => {
  describe("Pass-through", () => {
    it("proceeds normally when no Idempotency-Key header is present", async () => {
      const res = await request(app)
        .post("/test/op")
        .send({ value: "first" });

      expect(res.status).toBe(201);
      expect(res.body.echo.value).toBe("first");
      expect(handlerCallCount).toBe(1);

      // No record stored
      const records = await IdempotencyKey.find({});
      expect(records.length).toBe(0);
    });
  });

  describe("Key validation", () => {
    it("rejects malformed Idempotency-Key with 400", async () => {
      const res = await request(app)
        .post("/test/op")
        .set("Idempotency-Key", "not-a-uuid")
        .send({ value: "x" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid Idempotency-Key/);
      expect(handlerCallCount).toBe(0);
    });

    it("rejects request without scope (no store, no user)", async () => {
      const res = await request(app)
        .post("/test/no-scope")
        .set("Idempotency-Key", uuidv7())
        .send({ value: "x" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/store context|authenticated user/i);
    });
  });

  describe("Replay behavior", () => {
    it("runs handler once and replays cached response on retry", async () => {
      const key = uuidv7();
      const payload = { value: "create me", amount: 100 };

      const first = await request(app)
        .post("/test/op")
        .set("Idempotency-Key", key)
        .send(payload);

      expect(first.status).toBe(201);
      expect(first.body.count).toBe(1);
      expect(handlerCallCount).toBe(1);

      const second = await request(app)
        .post("/test/op")
        .set("Idempotency-Key", key)
        .send(payload);

      expect(second.status).toBe(201);
      // Handler was NOT called again
      expect(handlerCallCount).toBe(1);
      // Cached response is byte-for-byte identical
      expect(second.body).toEqual(first.body);
    });

    it("survives many retries without ever re-running the handler", async () => {
      const key = uuidv7();
      const payload = { value: "stable" };

      await request(app).post("/test/op").set("Idempotency-Key", key).send(payload);

      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post("/test/op")
          .set("Idempotency-Key", key)
          .send(payload);
        expect(res.status).toBe(201);
      }

      expect(handlerCallCount).toBe(1);
    });
  });

  describe("Conflict detection", () => {
    it("returns 409 when same key is used with a different body", async () => {
      const key = uuidv7();

      const first = await request(app)
        .post("/test/op")
        .set("Idempotency-Key", key)
        .send({ value: "original" });
      expect(first.status).toBe(201);

      const conflict = await request(app)
        .post("/test/op")
        .set("Idempotency-Key", key)
        .send({ value: "different" });

      expect(conflict.status).toBe(409);
      expect(conflict.body.message).toMatch(/mismatched request body/);
      // Handler did NOT run for the second request
      expect(handlerCallCount).toBe(1);
    });
  });

  describe("Scope isolation", () => {
    it("isolates idempotency by scope — same key in different stores is independent", async () => {
      const key = uuidv7();
      const payload = { value: "same" };

      // First request under STORE_ID
      const first = await request(app)
        .post("/test/op")
        .set("Idempotency-Key", key)
        .send(payload);
      expect(first.status).toBe(201);

      // Manually create record for a different scope to simulate cross-store collision
      // (Since our test app only has one scope, we verify the unique index allows it via direct insert)
      const otherScopeRecord = await IdempotencyKey.create({
        key,
        scopeId: "store-xyz-999",
        requestHash: "anyhash",
        status: "completed",
        statusCode: 200,
        responseBody: { ok: true },
      });

      expect(otherScopeRecord.key).toBe(key);
      expect(otherScopeRecord.scopeId).toBe("store-xyz-999");

      const all = await IdempotencyKey.find({ key });
      expect(all.length).toBe(2);
    });
  });

  describe("Failure handling", () => {
    it("does NOT cache failed responses — next request runs the handler again", async () => {
      const key = uuidv7();
      const payload = { value: "will-fail-first" };

      // First call: handler returns 500
      handlerImpl = (_req, res) => {
        res.status(500).json({ success: false, message: "boom" });
      };
      const failed = await request(app)
        .post("/test/op")
        .set("Idempotency-Key", key)
        .send(payload);
      expect(failed.status).toBe(500);

      // Wait briefly for the fire-and-forget cleanup of the pending record
      await new Promise((r) => setTimeout(r, 50));

      // Second call with same key+body: handler succeeds
      handlerImpl = (_req, res) => {
        res.status(201).json({ success: true, retried: true });
      };
      const retried = await request(app)
        .post("/test/op")
        .set("Idempotency-Key", key)
        .send(payload);

      expect(retried.status).toBe(201);
      expect(retried.body.retried).toBe(true);
      // Handler ran TWICE total (once failed, once succeeded)
      expect(handlerCallCount).toBe(2);
    });
  });

  describe("Persistence", () => {
    it("stores the response body and status code for completed requests", async () => {
      const key = uuidv7();
      const payload = { value: "persist me" };

      await request(app)
        .post("/test/op")
        .set("Idempotency-Key", key)
        .send(payload);

      // Wait for fire-and-forget update to land
      await new Promise((r) => setTimeout(r, 50));

      const record = await IdempotencyKey.findOne({ key, scopeId: STORE_ID }).lean();
      expect(record).not.toBeNull();
      expect(record.status).toBe("completed");
      expect(record.statusCode).toBe(201);
      expect(record.responseBody.echo.value).toBe("persist me");
      expect(record.requestHash).toBeTruthy();
      expect(record.requestHash.length).toBe(64); // sha256 hex
    });
  });
});
