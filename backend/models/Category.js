const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
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
    description: { type: String, required: false },
    // Master Menu Fields
    isMaster: {
      type: Boolean,
      default: false,
      index: true,
    },
    masterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
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

// Scoped uniqueness for local categories
categorySchema.index(
  { storeId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isMaster: false, masterId: null },
  }
);

// Uniqueness for master categories
categorySchema.index(
  { organizationId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isMaster: true },
  }
);

// Uniqueness for synced categories
categorySchema.index(
  { storeId: 1, masterId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { masterId: { $ne: null } },
  }
);

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
