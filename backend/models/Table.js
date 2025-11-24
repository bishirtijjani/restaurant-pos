const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      required: true,
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
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    shape: {
      type: String,
      enum: ["square", "circle", "rectangle"],
      default: "square",
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
    lastOccupiedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
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

tableSchema.index({ floorId: 1, tableNumber: 1 }, { unique: true });
tableSchema.index({ status: 1 });
tableSchema.index({ currentOrder: 1 });

module.exports = mongoose.model("Table", tableSchema);
