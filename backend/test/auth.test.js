import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authController from "../controllers/authController";
import User from "../models/User";
import Store from "../models/Store";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);
app.post("/api/auth/pin-login", authController.pinLogin);
app.post("/api/auth/refresh", authController.refreshToken);
app.post("/api/auth/logout", authController.logout);

describe("Authentication Logic", () => {
  let testUser;

  beforeEach(async () => {
    testUser = {
      fullname: "Test User Auth",
      email: `test-auth-${Math.random().toString(36).substring(7)}@example.com`,
      password: "password123",
      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
      ],
      pinCode: "1234",
    };
    await User.deleteMany({});
    await Store.deleteMany({});
  });

  it("should register a new user and create a store", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    if (res.status !== 201) {
      process.stdout.write(
        `\n--- REGISTER ERROR: ${JSON.stringify(res.body)}\n`
      );
    }

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should login with valid credentials", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.header["set-cookie"]).toBeDefined();
  });

  it("should login with PIN code", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/pin-login")
      .send({ email: testUser.email, pinCode: testUser.pinCode });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should refresh token using cookie", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    const cookies = loginRes.header["set-cookie"];
    expect(cookies).toBeDefined();

    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookies);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.token).toBeDefined();
  });

  it("should logout successfully", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    const cookies = loginRes.header["set-cookie"];

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies);

    expect(logoutRes.status).toBe(200);
  });
});
