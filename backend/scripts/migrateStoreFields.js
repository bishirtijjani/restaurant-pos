/**
 * Data Migration Script: Remove Duplicate Store Fields
 *
 * This script migrates existing data to remove duplicate fields from:
 * 1. Store.settings (restaurantName, restaurantAddress, restaurantPhone)
 * 2. Organization.brandSettings.branding (restaurantName, restaurantAddress, restaurantPhone)
 *
 * Run this ONCE after deploying the schema changes.
 */

const mongoose = require("mongoose");
const Store = require("../models/Store");
const Organization = require("../models/Organization");
require("dotenv").config();

const migrateStoreFields = async () => {
  try {
    console.log("🚀 Starting store field migration...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // ========================================
    // PART 1: Migrate Store Documents
    // ========================================
    console.log("📦 Migrating Store documents...");

    const stores = await Store.find({});
    console.log(`Found ${stores.length} stores to process\n`);

    let storesMigrated = 0;
    let storesSkipped = 0;

    for (const store of stores) {
      let needsUpdate = false;
      const updates = [];

      // Check if settings has the duplicate fields
      if (store.settings) {
        // Migrate restaurantName to top-level name if needed
        if (store.settings.restaurantName && !store.name) {
          store.name = store.settings.restaurantName;
          needsUpdate = true;
          updates.push("name");
        }

        // Migrate restaurantAddress to top-level location if needed
        if (store.settings.restaurantAddress && !store.location) {
          store.location = store.settings.restaurantAddress;
          needsUpdate = true;
          updates.push("location");
        }

        // Migrate restaurantPhone to top-level contactPhone if needed
        if (store.settings.restaurantPhone && !store.contactPhone) {
          store.contactPhone = store.settings.restaurantPhone;
          needsUpdate = true;
          updates.push("contactPhone");
        }

        // Remove the duplicate fields from settings
        if (store.settings.restaurantName !== undefined) {
          delete store.settings.restaurantName;
          needsUpdate = true;
        }
        if (store.settings.restaurantAddress !== undefined) {
          delete store.settings.restaurantAddress;
          needsUpdate = true;
        }
        if (store.settings.restaurantPhone !== undefined) {
          delete store.settings.restaurantPhone;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await store.save();
        storesMigrated++;
        console.log(
          `  ✓ Migrated store: ${store.name} (${store._id})${
            updates.length > 0 ? ` - Updated: ${updates.join(", ")}` : ""
          }`,
        );
      } else {
        storesSkipped++;
      }
    }

    console.log(`\n✅ Store migration complete:`);
    console.log(`   - Migrated: ${storesMigrated}`);
    console.log(`   - Skipped: ${storesSkipped}\n`);

    // ========================================
    // PART 2: Migrate Organization Documents
    // ========================================
    console.log("🏢 Migrating Organization documents...");

    const organizations = await Organization.find({});
    console.log(`Found ${organizations.length} organizations to process\n`);

    let orgsMigrated = 0;
    let orgsSkipped = 0;

    for (const org of organizations) {
      let needsUpdate = false;

      if (org.brandSettings && org.brandSettings.branding) {
        // Remove the duplicate fields from branding
        if (org.brandSettings.branding.restaurantName !== undefined) {
          delete org.brandSettings.branding.restaurantName;
          needsUpdate = true;
        }
        if (org.brandSettings.branding.restaurantAddress !== undefined) {
          delete org.brandSettings.branding.restaurantAddress;
          needsUpdate = true;
        }
        if (org.brandSettings.branding.restaurantPhone !== undefined) {
          delete org.brandSettings.branding.restaurantPhone;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await org.save();
        orgsMigrated++;
        console.log(`  ✓ Migrated organization: ${org.name} (${org._id})`);
      } else {
        orgsSkipped++;
      }
    }

    console.log(`\n✅ Organization migration complete:`);
    console.log(`   - Migrated: ${orgsMigrated}`);
    console.log(`   - Skipped: ${orgsSkipped}\n`);

    // ========================================
    // Summary
    // ========================================
    console.log("🎉 Migration completed successfully!");
    console.log(`\nSummary:`);
    console.log(
      `  Stores: ${storesMigrated} migrated, ${storesSkipped} skipped`,
    );
    console.log(
      `  Organizations: ${orgsMigrated} migrated, ${orgsSkipped} skipped`,
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  }
};

// Run the migration
if (require.main === module) {
  migrateStoreFields();
}

module.exports = { migrateStoreFields };
