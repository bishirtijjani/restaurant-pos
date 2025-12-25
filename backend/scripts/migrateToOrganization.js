const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load models
const User = require("../models/User");
const Store = require("../models/Store");
const Organization = require("../models/Organization");

dotenv.config({ path: path.join(__dirname, "../.env") });

const migrateToOrganization = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Connected to MongoDB for Organization Migration...");

    // 1. Find all users who own stores or have admin roles
    const users = await User.find({ "stores.role": "admin" });

    for (const user of users) {
      console.log(`Processing User: ${user.fullname} (${user.email})...`);

      // Find stores where this user is an admin
      const adminStoreLinks = user.stores.filter((s) => s.role === "admin");

      if (adminStoreLinks.length === 0) continue;

      // Check if user already has an organization
      let org = await Organization.findOne({ ownerId: user.id });

      if (!org) {
        // Create a new "Shadow Organization" based on the first store
        const firstStore = await Store.findById(adminStoreLinks[0].storeId);

        if (!firstStore) {
          console.log(
            `  Warning: Could not find store ${adminStoreLinks[0].storeId}, skipping.`
          );
          continue;
        }

        console.log(
          `  Creating Organization for ${user.fullname} based on store: ${firstStore.name}...`
        );

        org = await Organization.create({
          name: firstStore.name,
          ownerId: user.id,
          brandSettings: {
            currency: {
              code: firstStore.settings?.currency || "NGN",
              symbol: firstStore.settings?.currencySymbol || "₦",
              name: firstStore.settings?.currencyName || "Nigerian Naira",
            },
            taxSettings: {
              defaultTaxRate: firstStore.settings?.taxRate || 0,
              isTaxInclusive: firstStore.settings?.isTaxInclusive || false,
            },
          },
        });
      }

      // 2. Link all the user's stores to this Organization
      for (const storeLink of user.stores) {
        const storeIdStr = storeLink.storeId.toString();

        // Update the Store document
        await Store.findByIdAndUpdate(storeLink.storeId, {
          organizationId: org._id,
        });

        // Update the User's store link entry
        storeLink.organizationId = org._id;
        console.log(`  Linked Store ${storeIdStr} to Org ${org.name}`);
      }

      // 3. Set currentOrganizationId for the user
      user.currentOrganizationId = org._id;
      await user.save();

      console.log(`  Migration complete for ${user.fullname}!\n`);
    }

    console.log("Global Migration to Organization Finished Successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration Failed:", error);
    process.exit(1);
  }
};

migrateToOrganization();
