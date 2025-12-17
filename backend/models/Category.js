const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    description: { type: String, required: false },
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

// Scoped uniqueness
categorySchema.index({ storeId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
