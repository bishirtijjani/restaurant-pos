// backend/models/PromoCode.js
const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // Constraints
    minimumOrderAmount: {
      type: Number,
      default: 0,
    },
    maximumDiscountAmount: {
      type: Number,
      default: null,
    },
    // Usage limits
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    usageLimitPerCustomer: {
      type: Number,
      default: null,
    },
    // Track usage by customer
    usedBy: [
      {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
        usageCount: { type: Number, default: 1 },
        lastUsed: { type: Date },
      },
    ],
    // Validity
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    // Restrictions
    applicableOrderTypes: {
      type: [String],
      enum: ["dine-in", "takeaway", "delivery"],
      default: ["dine-in", "takeaway", "delivery"],
    },
    // Can combine with other discounts?
    stackable: {
      type: Boolean,
      default: false,
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
    },
  },
  { timestamps: true }
);

promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("PromoCode", promoCodeSchema);
