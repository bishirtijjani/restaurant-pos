const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Store = require("../models/Store");
const Organization = require("../models/Organization");

dotenv.config({ path: path.join(__dirname, "../.env") });

const migrateSettingsToBrand = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Connected to MongoDB for Settings Migration...");

    const organizations = await Organization.find();
    console.log(`Found ${organizations.length} organizations.`);

    for (const org of organizations) {
      console.log(`Processing Organization: ${org.name} (${org._id})...`);

      // Skip if already has branding populated
      if (org.brandSettings?.branding?.restaurantName) {
        console.log(`  Skipping: Brand settings already initialized.`);
        continue;
      }

      // Find the first store to use as default settings source
      const firstStore = await Store.findOne({ organizationId: org._id });
      if (!firstStore || !firstStore.settings) {
        console.log(`  Skipping: No stores found with settings.`);
        continue;
      }

      const s = firstStore.settings;

      // Map store settings to organization brandSettings
      const brandSettings = {
        branding: {
          restaurantName: s.restaurantName || firstStore.name || org.name,
          restaurantLogo: s.restaurantLogo || "",
          restaurantMotto: s.restaurantMotto || "",
          restaurantPhone: s.restaurantPhone || firstStore.contactPhone || "",
          restaurantEmail: s.restaurantEmail || "",
          restaurantAddress: s.restaurantAddress || firstStore.location || "",
          website: s.website || "",
        },
        currency: s.currency || {
          code: "NGN",
          symbol: "₦",
          name: "Nigerian Naira",
        },
        dateFormat: s.dateFormat || "MM/DD/YYYY",
        timezone: s.timezone || "UTC",
        taxSettings: s.taxSettings || {
          enabled: true,
          globalRate: 7.5,
          name: "VAT",
          mode: "per-item",
        },
        serviceCharge: s.serviceCharge || {
          enabled: false,
          rate: 0,
          name: "Service Charge",
        },
        communication: s.communication || {
          email: { provider: "log", enabled: true, config: {} },
          sms: { provider: "log", enabled: false, config: {} },
          whatsapp: { provider: "log", enabled: false, config: {} },
        },
        paymentGateways: s.paymentGateways || {
          stripe: { enabled: false, publishableKey: "", secretKey: "" },
        },
      };

      org.brandSettings = brandSettings;
      await org.save();
      console.log(
        `  Success: Migrated settings from Store [${firstStore.name}] to Organization [${org.name}].`
      );
    }

    console.log("Settings Migration Finished Successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration Failed:", error);
    process.exit(1);
  }
};

migrateSettingsToBrand();
