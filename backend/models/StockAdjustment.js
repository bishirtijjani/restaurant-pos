const mongoose = require("mongoose");

const stockAdjustmentSchema = new mongoose.Schema(
  {
    adjustmentNumber: {
      type: String,
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    type: {
      type: String,
      enum: ["addition", "subtraction", "correction"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "wastage",
        "damage",
        "theft",
        "return",
        "donation",
        "correction",
        "stock_take",
        "other",
      ],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Generate adjustment number - FIXED VERSION
stockAdjustmentSchema.pre("save", async function (next) {
  try {
    if (this.isNew && !this.adjustmentNumber) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      // Use the model directly from mongoose.models
      const StockAdjustment =
        mongoose.models.StockAdjustment || this.constructor;

      const count = await StockAdjustment.countDocuments({
        storeId: this.storeId,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      });

      this.adjustmentNumber = `ADJ${dateStr}${(count + 1)
        .toString()
        .padStart(3, "0")}`;
    }
    next();
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error);
  }
});

// Scoped uniqueness
stockAdjustmentSchema.index(
  { storeId: 1, adjustmentNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("StockAdjustment", stockAdjustmentSchema);
