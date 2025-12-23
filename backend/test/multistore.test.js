import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware";
import storeMiddleware from "../middleware/storeMiddleware";
import orderController from "../controllers/orderController";
import User from "../models/User";
import Store from "../models/Store";
import Order from "../models/Order";
import MenuItem from "../models/MenuItem";

const app = express();
app.use(express.json());
app.use(cookieParser());

// Setup mock routes
app.get(
  "/api/orders",
  authMiddleware,
  storeMiddleware,
  orderController.getAllOrders
);
app.get(
  "/api/orders/:id",
  authMiddleware,
  storeMiddleware,
  orderController.getOrderById
);
app.get("/api/menu-items", authMiddleware, storeMiddleware, (req, res) => {
  // Mocking a simple controller for menu items list to test store scoping
  MenuItem.find({ storeId: req.storeId }).then((items) =>
    res.json({ success: true, data: items })
  );
});

describe("Multi-Store Data Isolation", () => {
  let user1, user2, store1, store2, token1, token2;

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({});
      await Store.deleteMany({});
      await Order.deleteMany({});
      await MenuItem.deleteMany({});
    }

    // Create Store 1 & User 1
    store1 = await Store.create({
      name: "Store One",
      settings: { restaurantName: "R1" },
    });
    user1 = await User.create({
      fullname: "User One",
      email: "u1@example.com",
      password: "hashed_password",
      stores: [{ storeId: store1._id, role: "admin" }],
    });
    token1 = jwt.sign({ id: user1._id, role: "admin" }, process.env.JWT_SECRET);

    // Create Store 2 & User 2
    store2 = await Store.create({
      name: "Store Two",
      settings: { restaurantName: "R2" },
    });
    user2 = await User.create({
      fullname: "User Two",
      email: "u2@example.com",
      password: "hashed_password",
      stores: [{ storeId: store2._id, role: "admin" }],
    });
    token2 = jwt.sign({ id: user2._id, role: "admin" }, process.env.JWT_SECRET);

    // Create orders
    await Order.create({
      orderNumber: "ORD-S1-001",
      storeId: store1._id,
      servedBy: user1._id,
      totalAmount: 100,
      amountPaid: 0,
      orderItems: [],
      customerDetails: { name: "Cust 1" },
    });

    await Order.create({
      orderNumber: "ORD-S2-001",
      storeId: store2._id,
      servedBy: user2._id,
      totalAmount: 200,
      amountPaid: 0,
      orderItems: [],
      customerDetails: { name: "Cust 2" },
    });

    // Create menu items
    await MenuItem.create({
      name: "S1 Item",
      storeId: store1._id,
      category: "Food",
      price: 10,
    });
    await MenuItem.create({
      name: "S2 Item",
      storeId: store2._id,
      category: "Food",
      price: 20,
    });
  });

  it("User 1 should only see orders from Store 1", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token1}`)
      .set("x-store-id", store1._id.toString());

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].storeId.toString()).toBe(store1._id.toString());
  });

  it("User 2 should only see orders from Store 2", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token2}`)
      .set("x-store-id", store2._id.toString());

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].storeId.toString()).toBe(store2._id.toString());
  });

  it("User 1 should be denied access to Store 2 context at middleware level", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token1}`)
      .set("x-store-id", store2._id.toString());

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Access to this store is denied");
  });

  it("scoping check: User 1 should not find User 2's order even if context is bypassed", async () => {
    const order2 = await Order.findOne({ storeId: store2._id });

    const res = await request(app)
      .get(`/api/orders/${order2._id}`)
      .set("Authorization", `Bearer ${token1}`)
      .set("x-store-id", store1._id.toString());

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Order not found");
  });

  it("User 1 should only see menu items from Store 1", async () => {
    const res = await request(app)
      .get("/api/menu-items")
      .set("Authorization", `Bearer ${token1}`)
      .set("x-store-id", store1._id.toString());

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe("S1 Item");
  });
});
