const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      default: "",
    },
    partySize: {
      type: Number,
      required: true,
      min: 1,
    },
    reservationDate: {
      type: Date,
      required: true,
    },
    reservationTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 120,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "seated", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    lastAction: {
      action: {
        type: String,
        enum: ["create", "update", "delete", "confirm", "cancel", "complete"],
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

reservationSchema.index({ tableId: 1, reservationDate: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ customerPhone: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
