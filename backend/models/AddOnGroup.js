// backend/models/AddOnGroup.js
const mongoose = require("mongoose");

const addOnItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  // Optional inventory link - deduct stock when add-on is used
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryItem",
    default: null,
  },
  quantityUsed: {
    type: Number,
    default: 1,
    min: 0,
  },
});

const addOnGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    items: [addOnItemSchema],
    selectionType: {
      type: String,
      enum: ["single", "multiple"],
      default: "single",
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    minSelections: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxSelections: {
      type: Number,
      default: null, // null means unlimited for multiple selection
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastAction: {
      action: {
        type: String,
        enum: ["create", "update", "delete"],
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
addOnGroupSchema.index({ name: 1 });
addOnGroupSchema.index({ isActive: 1 });

module.exports =
  mongoose.models.AddOnGroup || mongoose.model("AddOnGroup", addOnGroupSchema);
