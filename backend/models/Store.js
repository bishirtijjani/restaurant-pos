const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: false, // Will be populated during migration
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

    // Store-Specific Settings (Inherits from Brand if not set)
    settings: {
      restaurantName: { type: String, trim: true },
      restaurantLogo: { type: String, trim: true },
      restaurantAddress: { type: String, trim: true },
      restaurantPhone: { type: String, trim: true },
      restaurantEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
      restaurantMotto: { type: String, trim: true },

      currency: {
        code: { type: String },
        name: { type: String },
        symbol: { type: String },
      },
      dateFormat: {
        type: String,
        enum: ["MM/DD/YYYY", "DD/MM/YYYY"],
      },
      timezone: { type: String },

      // Inventory
      lowStockAlert: { type: Number },
      autoGenerateSKU: { type: Boolean },

      // Communication Settings (Modular & Multi-Provider)
      communication: {
        email: {
          provider: {
            type: String,
            enum: ["log", "sendgrid", "ses"],
          },
          enabled: { type: Boolean },
          config: { type: Map, of: String, select: false },
        },
        sms: {
          provider: {
            type: String,
            enum: ["log", "twilio", "vonage"],
          },
          enabled: { type: Boolean },
          config: { type: Map, of: String, select: false },
        },
        whatsapp: {
          provider: {
            type: String,
            enum: ["log", "twilio", "official"],
          },
          enabled: { type: Boolean },
          config: { type: Map, of: String, select: false },
        },
      },

      // Financials
      taxSettings: {
        enabled: { type: Boolean },
        globalRate: { type: Number, min: 0, max: 100 },
        name: { type: String },
        mode: {
          type: String,
          enum: ["per-item", "per-order"],
        },
        includeInPrice: { type: Boolean },
      },
      serviceCharge: {
        enabled: { type: Boolean },
        rate: { type: Number, min: 0, max: 100 },
        name: { type: String },
        applyTo: {
          type: String,
          enum: ["all", "dine-in", "delivery"],
        },
      },
      globalDiscount: {
        enabled: { type: Boolean },
        name: { type: String },
        type: {
          type: String,
          enum: ["percentage", "fixed"],
        },
        value: { type: Number, min: 0 },
        maxDiscount: { type: Number, default: null },
        applicableOrderTypes: {
          type: [String],
          enum: ["dine-in", "takeaway", "delivery"],
        },
        minimumOrderAmount: { type: Number },
      },

      // Hardware
      printerSettings: {
        mode: { type: String, enum: ["browser", "webusb"] },
        paperWidth: { type: String, enum: ["58mm", "80mm"] },
        vendorId: { type: Number, default: null },
        productId: { type: Number, default: null },
        deviceName: { type: String, default: null },
      },

      // Payment Gateways
      paymentGateways: {
        stripe: {
          enabled: { type: Boolean },
          publishableKey: { type: String },
          secretKey: { type: String, select: false }, // Hidden by default for security
          accountId: { type: String },
        },
      },

      // Master Menu Policies
      menuSettings: {
        enforceBrandPricing: { type: Boolean },
        allowLocalModifiers: { type: Boolean },
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

module.exports = mongoose.models.Store || mongoose.model("Store", storeSchema);
