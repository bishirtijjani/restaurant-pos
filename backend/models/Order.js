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
      address: { type: String, required: false }, // For delivery orders
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
        name: { type: String, required: true }, // Store the name at time of order
        price: { type: Number, required: true }, // Store the price at time of order
        quantity: { type: Number, required: true, default: 1 },
        customizations: { type: String }, // Special instructions or modifications
        subtotal: { type: Number, required: true },
      },
    ],
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    amountPaid: { type: Number, required: true, default: 0 },
    balance: { type: Number, default: 0 }, // For unpaid or partially paid orders
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
      enum: ["new", "preparing", "ready", "served", "completed", "cancelled"],
      default: "new",
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
        enum: ["create", "update", "edit", "complete", "cancel"],
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
  // Only generate a number for new orders
  if (this.isNew) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });
    // Format: [Date][3-digit sequential number] - e.g. 20250407001
    this.orderNumber = `${dateStr}${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

// Middleware to auto-compute estimated ready time based on menu items
OrderSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("orderItems")) {
    // Only update for new orders or when items change

    // Get the maximum preparation time of all items
    const maxPrepTime = Math.max(
      ...this.orderItems.map((item) => item.preparationTime || 15),
      15 // Default to 15 minutes if no preparation time found
    );

    this.estimatedReadyTime = new Date(Date.now() + maxPrepTime * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
