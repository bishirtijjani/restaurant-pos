// backend/models/MenuItem.js (UPDATED)
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    customTax: {
      enabled: { type: Boolean, default: false },
      rate: { type: Number, default: 0, min: 0, max: 100 },
    },
    discount: {
      enabled: { type: Boolean, default: false },
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
      },
      value: { type: Number, default: 0, min: 0 },
      maxDiscount: { type: Number, default: null }, // Cap for percentage discounts
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    itemCode: {
      type: String,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number, // in minutes
      default: 15,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: null,
    },
    // NEW: Add-on groups associated with this menu item
    addOnGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AddOnGroup",
      },
    ],
    // NEW: Allow item-level notes
    allowNotes: {
      type: Boolean,
      default: true,
    },
    lastAction: {
      action: {
        type: String,
        enum: ["create", "update", "edit", "delete"],
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

// Create index for itemCode field, making it unique but optional
menuItemSchema.index(
  { itemCode: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { itemCode: { $type: "string" } },
  }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
