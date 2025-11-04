// backend/models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    table: {
      type: String,
      default: "Takeaway",
      required: false,
    },
    customerDetails: {
      name: { type: String, default: "Walk-in" },
      phone: { type: String, required: false },
      email: { type: String, required: false },
      address: { type: String, required: false },
    },
    orderType: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery"],
      default: "dine-in",
    },
    orderItems: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        customizations: { type: String },
        subtotal: { type: Number, required: true },
        itemStatus: {
          type: String,
          enum: ["pending", "preparing", "ready", "completed", "cancelled"],
          default: "pending",
        },
      },
    ],
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalAmount: { type: Number, required: true },
    taxBreakdown: {
      items: [
        {
          menuItemId: mongoose.Schema.Types.ObjectId,
          name: String,
          taxRate: Number,
          taxAmount: Number,
        },
      ],
      totalTax: { type: Number, default: 0 },
      serviceCharge: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
    },
    discount: { type: Number, default: 0 },
    amountPaid: { type: Number, required: true, default: 0 },
    balance: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "Transfer"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "ready",
        "served",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    estimatedReadyTime: {
      type: Date,
      required: false,
    },
    actualReadyTime: {
      type: Date,
      required: false,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    lastAction: {
      action: {
        type: String,
        enum: [
          "create",
          "update",
          "edit",
          "complete",
          "cancel",
          "bump",
          "recall",
        ],
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

// Generate a unique order number before saving
OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });
    this.orderNumber = `${dateStr}${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

// Middleware to auto-compute estimated ready time based on menu items
OrderSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("orderItems")) {
    const maxPrepTime = Math.max(
      ...this.orderItems.map((item) => item.preparationTime || 15),
      15
    );
    this.estimatedReadyTime = new Date(Date.now() + maxPrepTime * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
