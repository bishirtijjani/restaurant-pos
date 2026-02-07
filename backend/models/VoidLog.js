// backend/models/VoidLog.js
const mongoose = require("mongoose");

const voidLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
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
    orderNumber: {
      type: String,
      required: true,
    },
    voidedItems: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
        },
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number,
        addOns: [
          {
            groupId: mongoose.Schema.Types.ObjectId,
            groupName: String,
            selectedItems: [
              {
                itemId: mongoose.Schema.Types.ObjectId,
                name: String,
                price: Number,
              },
            ],
          },
        ],
        itemNote: String,
      },
    ],
    reason: {
      type: String,
      required: true,
    },
    totalVoidedAmount: {
      type: Number,
      required: true,
    },
    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inventoryRestored: {
      type: Boolean,
      default: false,
    },
    restoredItems: [
      {
        inventoryItemId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantityRestored: Number,
      },
    ],
  },
  { timestamps: true },
);

// Indexes for efficient queries
voidLogSchema.index({ orderId: 1 });
voidLogSchema.index({ voidedBy: 1 });
voidLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("VoidLog", voidLogSchema);
