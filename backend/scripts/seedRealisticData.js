const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Store = require("../models/Store");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const AddOnGroup = require("../models/AddOnGroup");
const Floor = require("../models/Floor");
const Table = require("../models/Table");

// Load env vars
dotenv.config({ path: ".env" });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("MongoDB Connected...");

    const args = process.argv.slice(2);
    const dropData = args.includes("--drop");

    if (dropData) {
      console.log("Dropping existing database...");
      await mongoose.connection.db.dropDatabase();
      console.log("Existing database dropped (including old indexes).");
    }

    console.log("Seeding realistic data...");

    // 1. Create Organization (Brand)
    const org = await Organization.create({
      name: "The Artisan Grill",
      plan: "pro",
      industry: "Restaurant",
      status: "active",
      ownerId: new mongoose.Types.ObjectId(), // Temporary, will update after user creation
      brandSettings: {
        currency: { code: "USD", symbol: "$", name: "US Dollar" },
        timezone: "America/New_York",
        taxSettings: { enabled: true, globalRate: 8.5, name: "Sales Tax", mode: "per-item", includeInPrice: false }
      }
    });

    // 2. Create Super Admin User
    const adminEmail = "admin@artisangrill.com";
    const password = "password123";
    const adminUser = new User({
      fullname: "John Smith (Owner)",
      email: adminEmail,
      password: password, // Will be hashed by pre-save hook
      isSuperAdmin: true,
      currentOrganizationId: org._id,
      stores: [],
      role: "admin"
    });
    
    // Assign proper ownerId now that we have the User object
    org.ownerId = adminUser._id;
    await org.save();

    // 3. Create Stores
    const storeDowntown = await Store.create({
      name: "The Artisan Grill - Downtown",
      organizationId: org._id,
      location: "123 Main St, Metro City",
      contactPhone: "555-0101",
      status: "active",
      ownerId: adminUser._id,
      settings: {
        timezone: "America/New_York"
      }
    });

    const storeWestside = await Store.create({
      name: "The Artisan Grill - Westside",
      organizationId: org._id,
      location: "456 West Ave, Metro City",
      contactPhone: "555-0102",
      status: "active",
      ownerId: adminUser._id,
      settings: {
        timezone: "America/New_York"
      }
    });

    // Assign Stores to Admin
    adminUser.stores.push(
      { storeId: storeDowntown._id, organizationId: org._id, role: "admin", isDefault: true, status: "active" },
      { storeId: storeWestside._id, organizationId: org._id, role: "admin", isDefault: false, status: "active" }
    );
    adminUser.lastActiveStore = storeDowntown._id;
    await adminUser.save();

    // 4. Create Staff Users for Downtown
    const managerUser = await User.create({
      fullname: "Sarah Jenkins",
      email: "manager@artisangrill.com",
      password: "password123",
      isSuperAdmin: false,
      currentOrganizationId: org._id,
      lastActiveStore: storeDowntown._id,
      stores: [{ storeId: storeDowntown._id, organizationId: org._id, role: "manager", isDefault: true, status: "active" }]
    });

    const cashierUser = await User.create({
      fullname: "Mike Ross",
      email: "cashier@artisangrill.com",
      password: "password123",
      isSuperAdmin: false,
      currentOrganizationId: org._id,
      lastActiveStore: storeDowntown._id,
      stores: [{ storeId: storeDowntown._id, organizationId: org._id, role: "cashier", isDefault: true, status: "active" }]
    });

    const waiterUser = await User.create({
      fullname: "Jessica Day",
      email: "waiter@artisangrill.com",
      password: "password123",
      isSuperAdmin: false,
      currentOrganizationId: org._id,
      lastActiveStore: storeDowntown._id,
      stores: [{ storeId: storeDowntown._id, organizationId: org._id, role: "waiter", isDefault: true, status: "active" }]
    });

    const kitchenUser = await User.create({
      fullname: "Gordon Chef",
      email: "kitchen@artisangrill.com",
      password: "password123",
      isSuperAdmin: false,
      currentOrganizationId: org._id,
      lastActiveStore: storeDowntown._id,
      stores: [{ storeId: storeDowntown._id, organizationId: org._id, role: "kitchen", isDefault: true, status: "active" }]
    });

    // 5. Master Menu Setup
    console.log("Creating Master Menu...");

    // Master Categories
    const catBurgers = await Category.create({ name: "Signature Burgers", organizationId: org._id, isMaster: true, description: "Our famous hand-crafted burgers." });
    const catSteaks = await Category.create({ name: "Wood-Fired Steaks", organizationId: org._id, isMaster: true, description: "Premium cuts grilled over oak wood." });
    const catSides = await Category.create({ name: "Sides & Shares", organizationId: org._id, isMaster: true, description: "Perfect companions to your main course." });
    const catDrinks = await Category.create({ name: "Craft Beverages", organizationId: org._id, isMaster: true, description: "Hand-spun shakes and craft sodas." });

    // Master AddOn Groups
    const addonMeatTemp = await AddOnGroup.create({
      name: "Meat Temperature",
      organizationId: org._id,
      isMaster: true,
      description: "How would you like it cooked?",
      selectionType: "single",
      isRequired: true,
      minSelections: 1,
      maxSelections: 1,
      items: [
        { name: "Rare", price: 0 },
        { name: "Medium Rare", price: 0 },
        { name: "Medium", price: 0 },
        { name: "Medium Well", price: 0 },
        { name: "Well Done", price: 0 }
      ]
    });

    const addonBurgerExtras = await AddOnGroup.create({
      name: "Burger Extras",
      organizationId: org._id,
      isMaster: true,
      description: "Enhance your burger",
      selectionType: "multiple",
      isRequired: false,
      minSelections: 0,
      maxSelections: null,
      items: [
        { name: "Extra Applewood Bacon", price: 2.50, allergens: ["Pork"] },
        { name: "Fried Egg", price: 1.50, allergens: ["Eggs"] },
        { name: "Avocado Slices", price: 2.00, dietaryTags: ["Vegan"] },
        { name: "Caramelized Onions", price: 1.00, dietaryTags: ["Vegan"] },
        { name: "Truffle Aioli", price: 1.50, allergens: ["Eggs", "Dairy"], dietaryTags: ["Vegetarian"] }
      ]
    });

    const addonAllergySubstitutions = await AddOnGroup.create({
      name: "Allergy Substitutions",
      organizationId: org._id,
      isMaster: true,
      description: "Dietary restrictions and swaps",
      selectionType: "multiple",
      isRequired: false,
      items: [
        { name: "Gluten-Free Bun", price: 2.00, dietaryTags: ["Gluten-Free"] },
        { name: "Lettuce Wrap (No Bun)", price: 0, dietaryTags: ["Gluten-Free", "Low-Carb"] },
        { name: "Vegan Cheese Swap", price: 1.50, dietaryTags: ["Vegan", "Dairy-Free"] }
      ]
    });

    const addonDrinkSizes = await AddOnGroup.create({
      name: "Drink Size",
      organizationId: org._id,
      isMaster: true,
      selectionType: "single",
      isRequired: true,
      minSelections: 1,
      maxSelections: 1,
      items: [
        { name: "Regular (16oz)", price: 0 },
        { name: "Large (24oz)", price: 1.50 }
      ]
    });

    // Master Menu Items
    const itemTruffleBurger = await MenuItem.create({
      name: "The Truffle Mushroom Burger",
      organizationId: org._id,
      category: catBurgers.name, // The app uses category name string
      price: 18.50,
      costPrice: 6.00,
      isAvailable: true,
      preparationTime: 15,
      description: "8oz Wagyu beef patty, roasted wild mushrooms, gruyere cheese, black truffle aioli, arugula on a brioche bun.",
      allergens: ["Gluten", "Dairy", "Eggs"],
      dietaryTags: [],
      addOnGroups: [addonMeatTemp._id, addonBurgerExtras._id, addonAllergySubstitutions._id],
      isMaster: true
    });

    const itemClassicBacon = await MenuItem.create({
      name: "Classic Bacon Cheeseburger",
      organizationId: org._id,
      category: catBurgers.name,
      price: 15.00,
      costPrice: 4.50,
      isAvailable: true,
      preparationTime: 12,
      description: "8oz Angus beef patty, thick-cut applewood smoked bacon, sharp cheddar, lettuce, tomato, house sauce.",
      allergens: ["Gluten", "Dairy", "Eggs"],
      dietaryTags: [],
      addOnGroups: [addonMeatTemp._id, addonBurgerExtras._id, addonAllergySubstitutions._id],
      isMaster: true
    });

    const itemRibeye = await MenuItem.create({
      name: "Oak-Fired Ribeye (14oz)",
      organizationId: org._id,
      category: catSteaks.name,
      price: 42.00,
      costPrice: 16.00,
      isAvailable: true,
      preparationTime: 25,
      description: "Prime bone-in ribeye, herb garlic butter, served with roasted root vegetables.",
      allergens: ["Dairy"],
      dietaryTags: ["Gluten-Free"],
      addOnGroups: [addonMeatTemp._id],
      isMaster: true
    });

    const itemTruffleFries = await MenuItem.create({
      name: "Parmesan Truffle Fries",
      organizationId: org._id,
      category: catSides.name,
      price: 8.50,
      costPrice: 2.00,
      isAvailable: true,
      preparationTime: 8,
      description: "Crispy shoestring fries tossed in white truffle oil, grated parmesan, and fresh parsley.",
      allergens: ["Dairy"],
      dietaryTags: ["Vegetarian", "Gluten-Free"],
      addOnGroups: [],
      isMaster: true
    });

    const itemVanillaShake = await MenuItem.create({
      name: "Madagascar Vanilla Bean Shake",
      organizationId: org._id,
      category: catDrinks.name,
      price: 7.00,
      costPrice: 2.50,
      isAvailable: true,
      preparationTime: 5,
      description: "Hand-spun milkshake made with premium vanilla bean ice cream and fresh milk, topped with whipped cream.",
      allergens: ["Dairy"],
      dietaryTags: ["Vegetarian", "Gluten-Free"],
      addOnGroups: [],
      isMaster: true
    });

    const itemCraftCola = await MenuItem.create({
      name: "Artisan Cane Cola",
      organizationId: org._id,
      category: catDrinks.name,
      price: 3.50,
      costPrice: 0.80,
      isAvailable: true,
      preparationTime: 2,
      description: "Small-batch cola sweetened with pure cane sugar.",
      allergens: [],
      dietaryTags: ["Vegan", "Gluten-Free"],
      addOnGroups: [addonDrinkSizes._id],
      isMaster: true
    });

    // 6. Sync/Publish Master Menu to Stores
    console.log("Publishing Master Menu to Stores...");
    const stores = [storeDowntown, storeWestside];
    const masterCategories = [catBurgers, catSteaks, catSides, catDrinks];
    const masterAddonGroups = [addonMeatTemp, addonBurgerExtras, addonAllergySubstitutions, addonDrinkSizes];
    const masterItems = [itemTruffleBurger, itemClassicBacon, itemRibeye, itemTruffleFries, itemVanillaShake, itemCraftCola];

    for (const store of stores) {
      // Sync Categories
      for (const mCat of masterCategories) {
        await Category.create({
          name: mCat.name,
          storeId: store._id,
          organizationId: org._id,
          description: mCat.description,
          isMaster: false,
          masterId: mCat._id,
          version: mCat.version,
          masterVersion: mCat.version
        });
      }

      // Sync AddOnGroups (Keep a map of old ID to new ID to remap for MenuItems)
      const addonIdMap = {};
      for (const mAddon of masterAddonGroups) {
        const localAddon = await AddOnGroup.create({
          name: mAddon.name,
          storeId: store._id,
          organizationId: org._id,
          description: mAddon.description,
          items: mAddon.items.map(item => ({
             name: item.name, price: item.price, isAvailable: item.isAvailable, 
             originalPrice: item.price, localPrice: item.price,
             allergens: item.allergens, dietaryTags: item.dietaryTags
          })),
          selectionType: mAddon.selectionType,
          isRequired: mAddon.isRequired,
          minSelections: mAddon.minSelections,
          maxSelections: mAddon.maxSelections,
          isActive: mAddon.isActive,
          isMaster: false,
          masterId: mAddon._id,
          version: mAddon.version,
          masterVersion: mAddon.version
        });
        addonIdMap[mAddon._id.toString()] = localAddon._id;
      }

      // Sync MenuItems
      for (const mItem of masterItems) {
        // Remap Addon IDs for the local store
        const localAddonGroups = mItem.addOnGroups.map(id => addonIdMap[id.toString()]);
        
        await MenuItem.create({
          name: mItem.name,
          storeId: store._id,
          organizationId: org._id,
          category: mItem.category,
          price: mItem.price,
          costPrice: mItem.costPrice,
          isAvailable: mItem.isAvailable,
          preparationTime: mItem.preparationTime,
          description: mItem.description,
          allergens: mItem.allergens,
          dietaryTags: mItem.dietaryTags,
          addOnGroups: localAddonGroups,
          isMaster: false,
          masterId: mItem._id,
          version: mItem.version,
          masterVersion: mItem.version
        });
      }
    }

    // 7. Store Infrastructure Setup (Floors and Tables for Downtown Store)
    console.log("Setting up Floor Plan and Tables for Downtown Store...");
    const mainFloor = await Floor.create({
      name: "Main Dining Hall",
      storeId: storeDowntown._id,
      organizationId: org._id,
      description: "Primary indoor seating area",
      order: 1,
      layout: { width: 1200, height: 800, gridSize: 20 }
    });

    const patioFloor = await Floor.create({
      name: "Outdoor Patio",
      storeId: storeDowntown._id,
      organizationId: org._id,
      description: "Outdoor seating with heaters",
      order: 2,
      layout: { width: 800, height: 600, gridSize: 20 }
    });

    // Tables for Main Floor
    const tableConfigs = [
      { num: "T1", cap: 2, pos: { x: 100, y: 100 }, shape: "square" },
      { num: "T2", cap: 2, pos: { x: 300, y: 100 }, shape: "square" },
      { num: "T3", cap: 4, pos: { x: 100, y: 300 }, shape: "rectangle" },
      { num: "T4", cap: 4, pos: { x: 300, y: 300 }, shape: "rectangle" },
      { num: "Booth-1", cap: 6, pos: { x: 600, y: 100 }, shape: "rectangle" },
      { num: "Booth-2", cap: 6, pos: { x: 600, y: 300 }, shape: "rectangle" },
      { num: "Large-1", cap: 8, pos: { x: 400, y: 500 }, shape: "circle" }
    ];

    for (const conf of tableConfigs) {
      await Table.create({
        floorId: mainFloor._id,
        storeId: storeDowntown._id,
        organizationId: org._id,
        tableNumber: conf.num,
        capacity: conf.cap,
        originalCapacity: conf.cap,
        status: "available",
        position: { x: conf.pos.x, y: conf.pos.y, width: 100, height: 100 },
        shape: conf.shape
      });
    }
    
    // Tables for Patio
    await Table.create({
      floorId: patioFloor._id,
      storeId: storeDowntown._id,
      organizationId: org._id,
      tableNumber: "P1",
      capacity: 4,
      originalCapacity: 4,
      status: "available",
      position: { x: 100, y: 100, width: 100, height: 100 },
      shape: "circle"
    });
    await Table.create({
      floorId: patioFloor._id,
      storeId: storeDowntown._id,
      organizationId: org._id,
      tableNumber: "P2",
      capacity: 4,
      originalCapacity: 4,
      status: "available",
      position: { x: 300, y: 100, width: 100, height: 100 },
      shape: "circle"
    });

    console.log("-----------------------------------------");
    console.log("🎉 Seeding Completed Successfully! 🎉");
    console.log("-----------------------------------------");
    console.log("Brand Name:", org.name);
    console.log("Stores:", "Downtown, Westside");
    console.log("");
    console.log("=== USER CREDENTIALS ===");
    console.log("Admin:   ", adminEmail, "| Password:", password);
    console.log("Manager: ", managerUser.email, "| Password:", password);
    console.log("Cashier: ", cashierUser.email, "| Password:", password);
    console.log("Waiter:  ", waiterUser.email, "| Password:", password);
    console.log("Kitchen: ", kitchenUser.email, "| Password:", password);
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding realistic data:", error);
    process.exit(1);
  }
};

seedData();
