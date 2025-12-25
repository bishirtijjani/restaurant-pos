const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load models
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const AddOnGroup = require("../models/AddOnGroup");

dotenv.config({ path: path.join(__dirname, "../.env") });

const migrateVersionFields = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Connected to MongoDB for Version Tracking Migration...");

    // Update all existing MenuItems
    const menuResult = await MenuItem.updateMany(
      { publishStatus: { $exists: false } },
      {
        $set: {
          publishStatus: "published",
          version: 1,
          lastPublishedAt: null,
          masterVersion: null,
        },
      }
    );
    console.log(`Updated ${menuResult.modifiedCount} MenuItem documents.`);

    // Update all existing Categories
    const categoryResult = await Category.updateMany(
      { publishStatus: { $exists: false } },
      {
        $set: {
          publishStatus: "published",
          version: 1,
          lastPublishedAt: null,
          masterVersion: null,
        },
      }
    );
    console.log(`Updated ${categoryResult.modifiedCount} Category documents.`);

    // Update all existing AddOnGroups
    const addOnResult = await AddOnGroup.updateMany(
      { publishStatus: { $exists: false } },
      {
        $set: {
          publishStatus: "published",
          version: 1,
          lastPublishedAt: null,
          masterVersion: null,
        },
      }
    );
    console.log(`Updated ${addOnResult.modifiedCount} AddOnGroup documents.`);

    console.log("Version Tracking Migration Finished Successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration Failed:", error);
    process.exit(1);
  }
};

migrateVersionFields();
