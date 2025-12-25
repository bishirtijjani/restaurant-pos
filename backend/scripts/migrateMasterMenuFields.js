const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load models
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const AddOnGroup = require("../models/AddOnGroup");

dotenv.config({ path: path.join(__dirname, "../.env") });

const migrateMasterMenuFields = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Connected to MongoDB for Master Menu Migration...");

    // Update all existing MenuItems
    const menuResult = await MenuItem.updateMany(
      { isMaster: { $exists: false } },
      {
        $set: {
          isMaster: false,
          masterId: null,
          syncOverrides: {},
        },
      }
    );
    console.log(`Updated ${menuResult.modifiedCount} MenuItem documents.`);

    // Update all existing Categories
    const categoryResult = await Category.updateMany(
      { isMaster: { $exists: false } },
      {
        $set: {
          isMaster: false,
          masterId: null,
          syncOverrides: {},
        },
      }
    );
    console.log(`Updated ${categoryResult.modifiedCount} Category documents.`);

    // Update all existing AddOnGroups
    const addOnResult = await AddOnGroup.updateMany(
      { isMaster: { $exists: false } },
      {
        $set: {
          isMaster: false,
          masterId: null,
          syncOverrides: {},
        },
      }
    );
    console.log(`Updated ${addOnResult.modifiedCount} AddOnGroup documents.`);

    console.log("Master Menu Migration Finished Successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration Failed:", error);
    process.exit(1);
  }
};

migrateMasterMenuFields();
