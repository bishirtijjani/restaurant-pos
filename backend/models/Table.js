// backend/models/Table.js - ENHANCED VERSION
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      required: true,
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
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 4,
    },
    // NEW: Original capacity for restoring after split
    originalCapacity: {
      type: Number,
      default: 4,
    },
    status: {
      type: String,
      enum: [
        "available",
        "occupied",
        "ordered",
        "reserved",
        "cleaning",
        "unavailable",
      ],
      default: "available",
    },
    // ENHANCED: Position with rotation and size
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      rotation: { type: Number, default: 0 }, // NEW
      width: { type: Number, default: 100 }, // NEW
      height: { type: Number, default: 100 }, // NEW
    },
    shape: {
      type: String,
      enum: ["square", "circle", "rectangle", "custom"],
      default: "square",
    },
    // NEW: Visual customization
    styling: {
      color: { type: String, default: "#ffffff" },
      borderColor: { type: String, default: "#e5e7eb" },
      icon: { type: String, default: "table" },
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    mergedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
      },
    ],
    notes: {
      type: String,
      default: "",
    },
    // NEW: Time tracking
    timing: {
      seatedAt: { type: Date, default: null },
      orderedAt: { type: Date, default: null },
      estimatedDuration: { type: Number, default: 90 }, // minutes
    },
    lastOccupiedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // NEW: Reservation link
    currentReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },
    // NEW: QR code for contactless ordering
    qrCode: {
      type: String,
      default: null,
    },
    lastAction: {
      action: {
        type: String,
        enum: ["create", "update", "delete", "merge", "split", "state_change"],
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

// Virtual for occupancy duration
tableSchema.virtual("occupancyDuration").get(function () {
  if (!this.timing.seatedAt) return 0;
  return Math.floor((Date.now() - this.timing.seatedAt) / 1000 / 60); // minutes
});

tableSchema.index({ floorId: 1, tableNumber: 1 }, { unique: true });
tableSchema.index({ status: 1 });
tableSchema.index({ currentOrder: 1 });
tableSchema.index({ isActive: 1 });

module.exports = mongoose.models.Table || mongoose.model("Table", tableSchema);
