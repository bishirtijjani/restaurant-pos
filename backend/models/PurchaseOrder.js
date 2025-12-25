const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
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
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    items: [
      {
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        unit: String,
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
        },
        receivedQuantity: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "received", "cancelled"],
      default: "draft",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer", "credit"],
    },
    notes: {
      type: String,
    },
    invoiceNumber: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastAction: {
      action: {
        type: String,
        enum: ["create", "update", "approve", "receive", "cancel"],
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

// Generate order number before saving
purchaseOrderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.constructor.countDocuments({
      storeId: this.storeId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });
    this.orderNumber = `PO${dateStr}${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

// Compound index for unique PO numbers within a store
purchaseOrderSchema.index({ storeId: 1, orderNumber: 1 }, { unique: true });

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
