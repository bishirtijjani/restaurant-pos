const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Inventory Purchase",
        "Utilities",
        "Rent",
        "Transportation",
        "Maintenance",
        "Salaries",
        "Miscellaneous",
        "Other",
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit", "Bank Transfer", "Card", "Other"],
      required: true,
    },
    invoice: {
      type: String, // Invoice number or ID
      required: false,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
  { timestamps: true },
);

// Scoped uniqueness
ExpenseSchema.index(
  { storeId: 1, invoice: 1 },
  {
    unique: true,
    partialFilterExpression: { invoice: { $exists: true, $ne: "" } },
  },
);

module.exports = mongoose.model("Expense", ExpenseSchema);
