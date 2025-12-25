const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    industry: {
      type: String,
      default: "Restaurant",
    },
    brandSettings: {
      // Branding Defaults
      branding: {
        restaurantName: { type: String, default: "" },
        restaurantLogo: { type: String, default: "" },
        restaurantMotto: { type: String, default: "" },
        restaurantPhone: { type: String, default: "" },
        restaurantEmail: { type: String, default: "" },
        restaurantAddress: { type: String, default: "" },
        website: { type: String, default: "" },
      },

      // Localization
      currency: {
        code: { type: String, default: "NGN" },
        symbol: { type: String, default: "₦" },
        name: { type: String, default: "Nigerian Naira" },
      },
      dateFormat: {
        type: String,
        enum: ["MM/DD/YYYY", "DD/MM/YYYY"],
        default: "MM/DD/YYYY",
      },
      timezone: { type: String, default: "UTC" },

      // Inventory
      inventory: {
        lowStockAlert: { type: Number, default: 10 },
        autoGenerateSKU: { type: Boolean, default: true },
      },

      // Global Discount
      globalDiscount: {
        enabled: { type: Boolean, default: false },
        name: { type: String, default: "Brand Discount" },
        type: {
          type: String,
          enum: ["percentage", "fixed"],
          default: "percentage",
        },
        value: { type: Number, default: 0 },
        applicableOrderTypes: {
          type: [String],
          enum: ["dine-in", "takeaway", "delivery"],
          default: ["dine-in", "takeaway", "delivery"],
        },
      },

      // Hardware Defaults
      printerSettings: {
        mode: { type: String, enum: ["browser", "webusb"], default: "browser" },
        paperWidth: { type: String, enum: ["58mm", "80mm"], default: "80mm" },
      },

      // Communication (Defaults)
      communication: {
        email: {
          provider: {
            type: String,
            enum: ["log", "sendgrid", "ses"],
            default: "log",
          },
          enabled: { type: Boolean, default: true },
          config: { type: Map, of: String, default: {}, select: false },
        },
        sms: {
          provider: {
            type: String,
            enum: ["log", "twilio", "vonage"],
            default: "log",
          },
          enabled: { type: Boolean, default: false },
          config: { type: Map, of: String, default: {}, select: false },
        },
        whatsapp: {
          provider: {
            type: String,
            enum: ["log", "twilio", "official"],
            default: "log",
          },
          enabled: { type: Boolean, default: false },
          config: { type: Map, of: String, default: {}, select: false },
        },
      },

      // Financials
      taxSettings: {
        enabled: { type: Boolean, default: true },
        globalRate: { type: Number, default: 7.5 },
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
        rate: { type: Number, default: 0 },
        name: { type: String, default: "Service Charge" },
        applyTo: {
          type: String,
          enum: ["all", "dine-in", "delivery"],
          default: "all",
        },
      },

      // Payment Gateways
      paymentGateways: {
        stripe: {
          enabled: { type: Boolean, default: false },
          publishableKey: { type: String, default: "" },
          secretKey: { type: String, select: false, default: "" },
        },
      },

      // Menu Management Defaults
      menuSettings: {
        enforceBrandPricing: { type: Boolean, default: false },
        allowLocalModifiers: { type: Boolean, default: true },
        notifyOnUpdates: { type: Boolean, default: true },
      },
    },
    status: {
      type: String,
      enum: ["active", "suspended", "trial"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the model from being re-compiled if it already exists
module.exports =
  mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);
