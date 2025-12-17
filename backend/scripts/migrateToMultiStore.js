const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import Models
const Store = require("../models/Store");
const User = require("../models/User");
const GeneralSettings = require("../models/GeneralSettings");

// Models that need simple storeId injection
const SIMPLE_MODELS = [
  "AddOnGroup",
  "AuditLog",
  "Category",
  "Customer",
  "CustomerPayment",
  "Discount",
  "Expense",
  "Floor",
  "InventoryItem",
  "KDSStation",
  "MenuItem",
  "OnboardingProgress",
  "Order",
  "OrderModificationLog",
  "PromoCode",
  "PurchaseOrder",
  "Report",
  "Reservation",
  "StockAdjustment",
  "Supplier",
  "Table",
  "UltraFastPOSSettings",
  "VoidLog",
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("MongoDB Connected for Migration");
  } catch (err) {
    console.error("DB Connection Error:", err);
    process.exit(1);
  }
};

const migrate = async () => {
  await connectDB();

  try {
    console.log("--- Starting Multi-Store Migration ---");

    // 1. Get or Create Default Store
    let defaultStore = await Store.findOne({ name: "Default Store" });

    if (!defaultStore) {
      console.log("Creating Default Store...");
      // Try to find existing GeneralSettings to migrate
      const existingSettings = await GeneralSettings.findOne();

      const storeData = {
        name: "Default Store",
        location: "Main Location",
        status: "active",
      };

      if (existingSettings) {
        console.log("Migrating existing GeneralSettings to Default Store...");
        storeData.settings = existingSettings.toObject();
        // Remove _id and __v from settings
        delete storeData.settings._id;
        delete storeData.settings.__v;
        delete storeData.settings.createdAt;
        delete storeData.settings.updatedAt;
      }

      defaultStore = await Store.create(storeData);
      console.log(`Default Store Created: ${defaultStore._id}`);
    } else {
      console.log(`Using existing Default Store: ${defaultStore._id}`);
    }

    const storeId = defaultStore._id;

    // 2. Migrate Users
    console.log("Migrating Users...");
    const users = await User.find({});
    for (const user of users) {
      let needsSave = false;

      // Check if user has updated schema structure (stores array)
      // Note: Schema in code might be updated but data in DB is old.
      // We use 'toObject()' to check raw data or just check property existence.

      if (!user.stores || user.stores.length === 0) {
        // Determine role (fallback to 'staff' if missing)
        const currentRole = user.role || "staff";

        user.stores = [
          {
            storeId: storeId,
            role: currentRole,
            isDefault: true,
            status: "active",
            permissions: [],
          },
        ];
        user.lastActiveStore = storeId;

        // IMPORTANT: We are NOT removing the old 'role' field yet to maintain backward compatibility
        // if the code hasn't been fully updated, or we can just ignore it.
        // But the User model schema update (next step) will likely deprecate it.

        needsSave = true;
        console.log(`Updated User: ${user.email} -> Added to Default Store`);
      }

      if (needsSave) {
        await user.save();
      }
    }

    // 3. Migrate Simple Models
    console.log("Migrating Collections...");
    for (const modelName of SIMPLE_MODELS) {
      try {
        // Dynamically load model
        const Model = require(`../models/${modelName}`);

        const result = await Model.updateMany(
          { storeId: { $exists: false } },
          { $set: { storeId: storeId } }
        );

        if (result.modifiedCount > 0) {
          console.log(
            `${modelName}: Updated ${result.modifiedCount} documents.`
          );
        }
      } catch (err) {
        if (err.code === "MODULE_NOT_FOUND") {
          console.warn(`Warning: Model ${modelName} not found, skipping.`);
        } else {
          console.error(`Error migrating ${modelName}:`, err.message);
        }
      }
    }

    console.log("--- Migration Complete Successfully ---");
    process.exit(0);
  } catch (error) {
    console.error("Migration Failed:", error);
    process.exit(1);
  }
};

migrate();
