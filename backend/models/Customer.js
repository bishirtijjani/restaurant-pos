const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    phone: { type: String, sparse: true },
    email: { type: String, sparse: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    address: { type: String },
    debtLimit: {
      type: Number,
      default: 0,
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
      }, // User who performed the action
      createdAt: { type: Date, default: null }, // Timestamp of last action
      reason: { type: String, default: null }, // Reason for the action
    },
    notes: [
      {
        content: { type: String, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for store-scoped uniqueness
customerSchema.index({ storeId: 1, phone: 1 }, { unique: true, sparse: true });
customerSchema.index({ storeId: 1, email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Customer", customerSchema);
