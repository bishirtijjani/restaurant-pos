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
  // Master Menu: track original vs local price
  originalPrice: {
    type: Number,
    default: null,
  },
  localPrice: {
    type: Number,
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
      required: false,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
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
    // Master Menu Fields
    isMaster: {
      type: Boolean,
      default: false,
      index: true,
    },
    masterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddOnGroup",
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
      default: "published",
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
      default: null,
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

// Uniqueness for master add-on groups
addOnGroupSchema.index(
  { organizationId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isMaster: true },
  }
);

// Uniqueness for local add-on groups
addOnGroupSchema.index(
  { storeId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isMaster: false, masterId: null },
  }
);

// Uniqueness for synced add-on groups
addOnGroupSchema.index(
  { storeId: 1, masterId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { masterId: { $ne: null } },
  }
);

module.exports =
  mongoose.models.AddOnGroup || mongoose.model("AddOnGroup", addOnGroupSchema);
