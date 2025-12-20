const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // The "Owner" of this store (Franchisee / Branch Manager)
    // In a single-store setup, this is the main Admin.
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Store-Specific Settings (Migrated from GeneralSettings)
    settings: {
      restaurantName: { type: String, trim: true, default: "Codeket Ltd." },
      restaurantLogo: { type: String, trim: true, default: "📦" },
      restaurantAddress: {
        type: String,
        trim: true,
        default: "No. 123, Main Road, Colombo 01",
      },
      restaurantPhone: {
        type: String,
        trim: true,
        default: "+234 906 814 9540",
      },
      restaurantEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: "contact@codeket.com",
      },
      restaurantMotto: { type: String, trim: true, default: "" },

      currency: {
        code: { type: String, default: "USD" },
        name: { type: String, default: "US Dollar" },
        symbol: { type: String, default: "$" },
      },
      dateFormat: {
        type: String,
        enum: ["MM/DD/YYYY", "DD/MM/YYYY"],
        default: "MM/DD/YYYY",
      },
      timezone: { type: String, default: "Nigeria/Lagos" },

      // Inventory
      lowStockAlert: { type: Number, default: 10 },
      autoGenerateSKU: { type: Boolean, default: true },

      // Notifications
      emailNotifications: { type: Boolean, default: true },

      // Financials
      taxSettings: {
        enabled: { type: Boolean, default: true },
        globalRate: { type: Number, default: 7.5, min: 0, max: 100 },
        name: { type: String, default: "VAT" },
        mode: {
          type: String,
          enum: ["per-item", "per-order"],
          default: "per-item",
        },
        includeInPrice: { type: Boolean, default: false },
      },
      serviceCharge: {
        enabled: { type: Boolean, default: false },
        rate: { type: Number, default: 0, min: 0, max: 100 },
        name: { type: String, default: "Service Charge" },
        applyTo: {
          type: String,
          enum: ["all", "dine-in", "delivery"],
          default: "dine-in",
        },
      },
      globalDiscount: {
        enabled: { type: Boolean, default: false },
        name: { type: String, default: "Store Discount" },
        type: {
          type: String,
          enum: ["percentage", "fixed"],
          default: "percentage",
        },
        value: { type: Number, default: 0, min: 0 },
        maxDiscount: { type: Number, default: null },
        applicableOrderTypes: {
          type: [String],
          enum: ["dine-in", "takeaway", "delivery"],
          default: ["dine-in", "takeaway", "delivery"],
        },
        minimumOrderAmount: { type: Number, default: 0 },
      },

      // Hardware
      printerSettings: {
        mode: { type: String, enum: ["browser", "webusb"], default: "browser" },
        paperWidth: { type: String, enum: ["58mm", "80mm"], default: "80mm" },
        vendorId: { type: Number, default: null },
        productId: { type: Number, default: null },
        deviceName: { type: String, default: null },
      },

      // Payment Gateways
      paymentGateways: {
        stripe: {
          enabled: { type: Boolean, default: false },
          publishableKey: { type: String, default: "" },
          secretKey: { type: String, select: false, default: "" }, // Hidden by default for security
          accountId: { type: String, default: "" },
        },
        // Future providers can be added here
      },
    },
    // Last Action for Audit
    lastAction: {
      action: { type: String, default: null },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      createdAt: { type: Date, default: null },
      reason: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Store", storeSchema);
