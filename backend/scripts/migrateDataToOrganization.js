const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load models
const Store = require("../models/Store");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const AddOnGroup = require("../models/AddOnGroup");
const Discount = require("../models/Discount");
const Expense = require("../models/Expense");
const Table = require("../models/Table");
const Supplier = require("../models/Supplier");
const InventoryItem = require("../models/InventoryItem");
const AuditLog = require("../models/AuditLog");
const KDSStation = require("../models/KDSStation");
const Floor = require("../models/Floor");
const PurchaseOrder = require("../models/PurchaseOrder");

dotenv.config({ path: path.join(__dirname, "../.env") });

const MODELS_TO_MIGRATE = [
  { name: "MenuItem", model: MenuItem },
  { name: "Category", model: Category },
  { name: "Order", model: Order },
  { name: "Customer", model: Customer },
  { name: "AddOnGroup", model: AddOnGroup },
  { name: "Discount", model: Discount },
  { name: "Expense", model: Expense },
  { name: "Table", model: Table },
  { name: "Supplier", model: Supplier },
  { name: "InventoryItem", model: InventoryItem },
  { name: "AuditLog", model: AuditLog },
  { name: "KDSStation", model: KDSStation },
  { name: "Floor", model: Floor },
  { name: "PurchaseOrder", model: PurchaseOrder },
];

const migrateDataToOrganization = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Connected to MongoDB for Data Migration (SaaS Scoping)...");

    const stores = await Store.find({ organizationId: { $exists: true } });
    console.log(`Found ${stores.length} stores with organizations.`);

    for (const store of stores) {
      console.log(
        `Processing Store: ${store.name} (Org: ${store.organizationId})...`
      );

      for (const { name, model } of MODELS_TO_MIGRATE) {
        // Find documents for this store that lack organizationId
        const result = await model.updateMany(
          {
            storeId: store._id,
            organizationId: { $exists: false },
          },
          {
            $set: { organizationId: store.organizationId },
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`  Updated ${result.modifiedCount} ${name} documents.`);
        }
      }
    }

    console.log("Data Migration for SaaS Scoping Finished Successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration Failed:", error);
    process.exit(1);
  }
};

migrateDataToOrganization();
