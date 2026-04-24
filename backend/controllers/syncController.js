const mongoose = require("mongoose");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Expense = require("../models/Expense");
const InventoryItem = require("../models/InventoryItem");
const PurchaseOrder = require("../models/PurchaseOrder");
const User = require("../models/User");
const Store = require("../models/Store");
const { getEffectiveSettings } = require("../utils/settingsManager");
const orderController = require("./orderController");
const customerController = require("./customerController");
const menuItemController = require("./menuItemController");

// Mapping of store names to Mongoose models
const MODEL_MAP = {
  categories: Category,
  menuItems: MenuItem,
  orders: Order,
  customers: Customer,
  suppliers: Supplier,
  expenses: Expense,
  inventory: InventoryItem,
  purchaseOrders: PurchaseOrder,
  users: User,
};

// @desc    Pull changes for multiple data stores in a single batch
// @route   POST /api/sync/pull
// @access  Private
const pullChanges = async (req, res) => {
  try {
    const { lastSync } = req.body; // { categories: 'ISO-DATE', orders: 'ISO-DATE', ... }
    const storeId = req.storeId;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store context is required",
      });
    }

    const changes = {};
    const timestamp = new Date().toISOString();

    // 1. Process standard collections
    const promises = Object.entries(MODEL_MAP).map(async ([key, Model]) => {
      const lastSyncDate =
        lastSync && lastSync[key] ? new Date(lastSync[key]) : null;

      const query = { storeId: storeId };

      // If we have a last sync date, fetch only updated items
      if (lastSyncDate) {
        query.updatedAt = { $gt: lastSyncDate };
      }

      // Execute query
      const items = await Model.find(query).lean();
      return { key, items };
    });

    // 2. Process Settings (Special Case)
    // Settings are not a collection but a computed object or embedded field
    const lastSettingsSync =
      lastSync && lastSync.settings ? new Date(lastSync.settings) : null;
    const settingsPromise = (async () => {
      const store = await Store.findById(storeId).lean();

      // Check if store settings have changed since last sync
      // Note: Store generic updatedAt might change for other reasons, but it's a safe proxy
      if (!lastSettingsSync || store.updatedAt > lastSettingsSync) {
        // Re-use logic from generalSettingsController
        // If we had a shared service, we would call it.
        // For now, assuming getEffectiveSettings works.
        try {
          // We need to import getEffectiveSettings if it exists, or just return store.settings
          // I'll check if getEffectiveSettings is available or duplicate logic.
          // It was imported above.
          return {
            key: "settings",
            items: [await getEffectiveSettings(storeId)],
          };
          // Wrap in array for consistency with other stores
        } catch (e) {
          return { key: "settings", items: [] };
        }
      }
      return { key: "settings", items: [] };
    })();

    promises.push(settingsPromise);

    // Wait for all queries
    const results = await Promise.all(promises);

    // Assemble response
    results.forEach(({ key, items }) => {
      changes[key] = items;
    });

    res.json({
      success: true,
      timestamp,
      changes,
    });
  } catch (error) {
    console.error("Batch sync failed:", error);
    res.status(500).json({
      success: false,
      message: "Server error during batch sync",
    });
  }
};

// Helper to build a mock res that captures the result
const buildMockRes = () => {
  const result = { statusCode: 200, body: null };
  return {
    result,
    status(code) {
      result.statusCode = code;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };
};

// Map of operation types to controller functions
const OPERATION_MAP = {
  "order:create": orderController.createOrder,
  "order:updateStatus": orderController.updateOrderStatus,
  "order:cancel": orderController.cancelOrder,
  "customer:create": customerController.createCustomer,
  "customer:update": customerController.updateCustomer,
  "menuItem:update": menuItemController.updateMenuItem,
};

// @desc    Push multiple offline changes in a single atomic transaction
// @route   POST /api/sync/push
// @access  Private
const pushChanges = async (req, res) => {
  const { operations } = req.body;

  if (!Array.isArray(operations) || operations.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Operations array is required",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = [];

    for (const op of operations) {
      const handler = OPERATION_MAP[op.type];
      if (!handler) {
        throw new Error(`Unknown operation type: ${op.type}`);
      }

      // Build a mock request reusing auth/store context from the real request
      const mockReq = {
        ...op.data, // spread to allow destructuring inside controllers
        body: op.data,
        params: op.params || {},
        storeId: req.storeId,
        organizationId: req.organizationId,
        user: req.user,
        transactionSession: session, // SESSION INJECTION
      };

      const mockRes = buildMockRes();
      await handler(mockReq, mockRes);

      const { statusCode, body } = mockRes.result;
      if (statusCode >= 400) {
        const err = new Error(
          body?.message ||
            `Operation ${op.type} failed with status ${statusCode}`,
        );
        err.statusCode = statusCode;
        err.body = body;
        throw err;
      }

      results.push({ type: op.type, tempId: op.tempId, data: body?.data });
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: `Batch of ${operations.length} operations committed successfully`,
      results,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Batch push failed, rolled back:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Batch sync failed. All changes rolled back.",
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  pullChanges,
  pushChanges,
};

