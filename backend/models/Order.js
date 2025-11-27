// backend/models/Order.js (UPDATED)
const mongoose = require("mongoose");

// Schema for selected add-ons within an order item
const selectedAddOnSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddOnGroup",
      required: true,
    },
    groupName: {
      type: String,
      required: true,
    },
    selectedItems: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          default: 0,
        },
        // Store inventory info for stock management
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          default: null,
        },
        quantityUsed: {
          type: Number,
          default: 1,
        },
      },
    ],
    addOnSubtotal: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  customizations: { type: String }, // Legacy field
  // NEW: Item-level note
  itemNote: {
    type: String,
    default: "",
  },
  // NEW: Selected add-ons for this item
  addOns: [selectedAddOnSchema],
  // NEW: Add-ons total for this item
  addOnsTotal: {
    type: Number,
    default: 0,
  },
  subtotal: { type: Number, required: true },
  itemStatus: {
    type: String,
    enum: ["pending", "preparing", "ready", "completed", "cancelled", "voided"],
    default: "pending",
  },
  // NEW: Void information if item was voided
  voidInfo: {
    isVoided: { type: Boolean, default: false },
    voidedAt: { type: Date, default: null },
    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    voidReason: { type: String, default: null },
  },
});

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
    orderItems: [orderItemSchema],
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // NEW: Order-level note
    orderNote: {
      type: String,
      default: "",
    },
    // Legacy note field (keeping for backward compatibility)
    note: {
      type: String,
      default: "",
    },
    totalAmount: { type: Number, required: true },
    // NEW: Separate tracking for add-ons total
    addOnsTotal: {
      type: Number,
      default: 0,
    },
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
    discountBreakdown: {
      hasDiscount: { type: Boolean, default: false },
      originalSubtotal: { type: Number, default: 0 },
      totalDiscountAmount: { type: Number, default: 0 },
      discountedSubtotal: { type: Number, default: 0 },
      appliedDiscounts: [
        {
          name: { type: String },
          type: {
            type: String,
            enum: [
              "global",
              "item",
              "order",
              "happy_hour",
              "happy_hour_bogo",
              "promo_code",
            ],
          },
          discountType: { type: String, enum: ["percentage", "fixed", "bogo"] },
          discountValue: { type: Number },
          amount: { type: Number },
          promoCode: { type: String, default: null },
          discountId: { type: mongoose.Schema.Types.ObjectId, ref: "Discount" },
        },
      ],
      itemDiscounts: [
        {
          menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
          name: { type: String },
          discountType: { type: String },
          discountValue: { type: Number },
          amount: { type: Number },
        },
      ],
    },
    // Promo code used
    promoCodeUsed: {
      code: { type: String, default: null },
      discountType: { type: String, default: null },
      discountValue: { type: Number, default: null },
      discountAmount: { type: Number, default: null },
    },
    packagingFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
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
    // NEW: Modification tracking
    hasModifications: {
      type: Boolean,
      default: false,
    },
    modificationCount: {
      type: Number,
      default: 0,
    },
    lastModifiedAt: {
      type: Date,
      default: null,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // NEW: Version for optimistic locking
    version: {
      type: Number,
      default: 1,
    },
    // NEW: Void tracking
    hasVoidedItems: {
      type: Boolean,
      default: false,
    },
    voidedItemsCount: {
      type: Number,
      default: 0,
    },
    totalVoidedAmount: {
      type: Number,
      default: 0,
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
          "modify",
          "void_item",
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
      ...this.orderItems
        .filter((item) => !item.voidInfo?.isVoided)
        .map((item) => item.preparationTime || 15),
      15
    );
    this.estimatedReadyTime = new Date(Date.now() + maxPrepTime * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
