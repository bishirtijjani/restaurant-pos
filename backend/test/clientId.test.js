/**
 * Integration Tests: clientId-based dedup
 *
 * Verifies:
 *  - Order/Customer schemas accept the clientId field
 *  - Unique compound index { storeId, clientId } prevents duplicates within a store
 *  - The same clientId can exist independently in different stores
 *  - Documents without clientId (sparse) don't conflict with each other
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "vitest";
import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";

import Order from "../models/Order.js";
import Customer from "../models/Customer.js";

const STORE_A = new mongoose.Types.ObjectId();
const STORE_B = new mongoose.Types.ObjectId();
const ORG = new mongoose.Types.ObjectId();
const USER = new mongoose.Types.ObjectId();

beforeAll(async () => {
  // Force index synchronization (otherwise sparse unique index may be missing)
  await Order.init();
  await Customer.init();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await Customer.deleteMany({});
});

afterAll(async () => {
  await Order.deleteMany({});
  await Customer.deleteMany({});
});

function buildOrder(overrides = {}) {
  return {
    orderNumber: `ORD-${Math.random().toString(36).slice(2, 8)}`,
    storeId: STORE_A,
    organizationId: ORG,
    orderItems: [
      {
        menuItemId: new mongoose.Types.ObjectId(),
        name: "Burger",
        price: 10,
        quantity: 1,
        subtotal: 10,
      },
    ],
    totalAmount: 10,
    servedBy: USER,
    ...overrides,
  };
}

function buildCustomer(overrides = {}) {
  return {
    fullname: "Alice",
    phone: `+44${Math.floor(Math.random() * 9e9 + 1e9)}`,
    storeId: STORE_A,
    organizationId: ORG,
    ...overrides,
  };
}

describe("Order.clientId", () => {
  it("accepts and persists a clientId", async () => {
    const clientId = uuidv7();
    const order = await Order.create(buildOrder({ clientId }));
    expect(order.clientId).toBe(clientId);
  });

  it("rejects two orders with the same clientId in the same store", async () => {
    const clientId = uuidv7();
    await Order.create(buildOrder({ clientId }));

    await expect(
      Order.create(buildOrder({ clientId })),
    ).rejects.toThrow(/duplicate key|E11000/);
  });

  it("allows the same clientId in different stores", async () => {
    const clientId = uuidv7();
    await Order.create(buildOrder({ clientId, storeId: STORE_A }));

    const second = await Order.create(
      buildOrder({ clientId, storeId: STORE_B }),
    );
    expect(second.clientId).toBe(clientId);
    expect(String(second.storeId)).toBe(String(STORE_B));
  });

  it("allows multiple orders without clientId (sparse)", async () => {
    const first = await Order.create(buildOrder());
    const second = await Order.create(buildOrder());
    expect(first.clientId).toBeUndefined();
    expect(second.clientId).toBeUndefined();
  });

  it("findOne by storeId + clientId returns the right order", async () => {
    const targetClientId = uuidv7();
    await Order.create(buildOrder({ clientId: uuidv7() }));
    await Order.create(buildOrder({ clientId: targetClientId }));
    await Order.create(buildOrder({ clientId: uuidv7() }));

    const found = await Order.findOne({
      storeId: STORE_A,
      clientId: targetClientId,
    });
    expect(found).not.toBeNull();
    expect(found.clientId).toBe(targetClientId);
  });
});

describe("Customer.clientId", () => {
  it("accepts and persists a clientId", async () => {
    const clientId = uuidv7();
    const customer = await Customer.create(buildCustomer({ clientId }));
    expect(customer.clientId).toBe(clientId);
  });

  it("rejects two customers with the same clientId in the same store", async () => {
    const clientId = uuidv7();
    await Customer.create(buildCustomer({ clientId }));

    await expect(
      Customer.create(buildCustomer({ clientId })),
    ).rejects.toThrow(/duplicate key|E11000/);
  });

  it("allows the same clientId in different stores", async () => {
    const clientId = uuidv7();
    await Customer.create(buildCustomer({ clientId, storeId: STORE_A }));

    const second = await Customer.create(
      buildCustomer({ clientId, storeId: STORE_B }),
    );
    expect(second.clientId).toBe(clientId);
  });
});
