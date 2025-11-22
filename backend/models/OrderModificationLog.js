// backend/models/OrderModificationLog.js
const mongoose = require("mongoose");

const orderModificationLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    modificationType: {
      type: String,
      enum: [
        "item_added",
        "item_removed",
        "quantity_changed",
        "addon_modified",
        "note_updated",
      ],
      required: true,
    },
    previousState: {
      type: Object,
      required: true,
    },
    newState: {
      type: Object,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inventoryAdjustments: [
      {
        inventoryItemId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantityChange: Number, // positive = restored, negative = deducted
      },
    ],
  },
  { timestamps: true }
);

orderModificationLogSchema.index({ orderId: 1 });
orderModificationLogSchema.index({ modifiedBy: 1 });
orderModificationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model(
  "OrderModificationLog",
  orderModificationLogSchema
);
