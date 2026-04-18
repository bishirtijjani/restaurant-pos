// backend/models/MenuItem.js (UPDATED)
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: false,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
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
    allergens: [{
      type: String,
      trim: true,
    }],
    dietaryTags: [{
      type: String,
      trim: true,
    }],
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
    // Master Menu Fields
    isMaster: {
      type: Boolean,
      default: false,
      index: true,
    },
    masterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      default: null,
      index: true,
    },
    syncOverrides: {
      type: Map,
      of: Boolean,
      default: {},
    },
    // Version Tracking & Publish Status
    publishStatus: {
      type: String,
      enum: ["draft", "published"],
      default: "published", // Store items are always published
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    lastPublishedAt: {
      type: Date,
      default: null,
    },
    masterVersion: {
      type: Number,
      default: null, // Only for store items linked to master
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
  { storeId: 1, itemCode: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { itemCode: { $type: "string" } },
  }
);

// Uniqueness for master items: (organizationId, name) must be unique
menuItemSchema.index(
  { organizationId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isMaster: true },
  }
);

// Uniqueness for store items: (storeId, name) must be unique for local items
menuItemSchema.index(
  { storeId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isMaster: false,
      masterId: null,
    },
  }
);

// Uniqueness for synced items: (storeId, masterId) must be unique
menuItemSchema.index(
  { storeId: 1, masterId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { masterId: { $ne: null } },
  }
);

module.exports =
  mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
