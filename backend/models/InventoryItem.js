const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      sparse: true, // Unique index moved to compound index
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Raw Materials",
        "Beverages",
        "Packaging",
        "Cleaning Supplies",
        "Other",
      ],
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "L", "ml", "pcs", "pack", "box", "bag"],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStockLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    linkedMenuItems: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
        },
        quantityUsed: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    lastRestockDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastAction: {
      action: {
        type: String,
        enum: ["create", "update", "delete", "restock", "adjustment"],
        default: null,
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      createdAt: { type: Date, default: null },
      reason: { type: String, default: null },
    },
  },
  { timestamps: true }
);

// Index for efficient queries
inventoryItemSchema.index({ name: 1, category: 1 });
inventoryItemSchema.index({ currentStock: 1 });
inventoryItemSchema.index(
  { storeId: 1, sku: 1 },
  { unique: true, sparse: true }
);

module.exports =
  mongoose.models.InventoryItem ||
  mongoose.model("InventoryItem", inventoryItemSchema);
