import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";

// Minimal app for health check test
const app = express();
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

describe("Health Check", () => {
  it("should return 200 OK", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
  });
});
