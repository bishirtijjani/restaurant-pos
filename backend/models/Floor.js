// backend/models/Floor.js - ENHANCED VERSION
const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema(
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
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // NEW: Layout configuration
    layout: {
      width: { type: Number, default: 1200 },
      height: { type: Number, default: 800 },
      gridSize: { type: Number, default: 20 },
      backgroundColor: { type: String, default: "#f5f5f5" },
    },
    // NEW: Capacity tracking
    capacity: {
      total: { type: Number, default: 0 },
      occupied: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 },
    },
    // NEW: Performance metrics
    metrics: {
      averageTurnoverTime: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
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

// Auto-update capacity
floorSchema.methods.updateCapacity = async function () {
  const Table = mongoose.model("Table");
  const tables = await Table.find({ floorId: this._id, isActive: true });

  this.capacity.total = tables.reduce((sum, t) => sum + t.capacity, 0);
  this.capacity.occupied = tables.filter((t) =>
    ["occupied", "ordered"].includes(t.status)
  ).length;
  this.capacity.reserved = tables.filter((t) => t.status === "reserved").length;

  await this.save();
};

floorSchema.index({ name: 1 });
floorSchema.index({ order: 1 });
floorSchema.index({ isActive: 1 });

module.exports = mongoose.model("Floor", floorSchema);
