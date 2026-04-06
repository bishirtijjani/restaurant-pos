const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const logAction = require("../utils/logAction");

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ storeId: req.storeId })
      .populate("addOnGroups")
      .sort({
        category: 1,
        name: 1,
      });
    res.status(200).json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch menu items. Please try again later." });
  }
};

// Get a single menu item by ID
const getMenuItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const menuItem = await MenuItem.findOne({
      _id: id,
      storeId: req.storeId,
    }).populate("addOnGroups");
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }
    res.status(200).json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid menu item ID." });
    }
    res.status(500).json({
      message: "Failed to fetch the menu item. Please try again later.",
    });
  }
};

// Add a new menu item
const addNewMenuItem = async (req, res) => {
  const {
    name,
    category,
    price,
    costPrice,
    itemCode,
    preparationTime,
    description,
    isAvailable,
    image,
    addOnGroups,
  } = req.body;

  if (!name || !category || !price) {
    return res
      .status(400)
      .json({ message: "Name, category, and price are required." });
  }

  try {
    // Only check for duplicates if itemCode is provided (within the same store)
    if (itemCode) {
      const duplicateMenuItem = await MenuItem.findOne({
        itemCode,
        storeId: req.storeId,
      });
      if (duplicateMenuItem) {
        return res.status(409).json({
          message: "A menu item with the same item code already exists.",
        });
      }
    }

    const itemCategory = await Category.findById(category);

    if (!itemCategory) {
      return res.status(404).json({
        message: "Category not found. Please create the category first.",
      });
    }

    const newMenuItem = new MenuItem({
      name,
      category: itemCategory.name,
      price,
      costPrice: costPrice || 0,
      description,
      preparationTime: preparationTime || 15,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      storeId: req.storeId,
      organizationId: req.organizationId,
      // Only set itemCode if it's not an empty string
      ...(itemCode ? { itemCode } : {}),
      // Only add image if provided
      ...(image ? { image } : {}),
      addOnGroups: addOnGroups || [],
    });

    const savedMenuItem = await newMenuItem.save();
    const populatedMenuItem = await MenuItem.findById(
      savedMenuItem._id,
    ).populate("addOnGroups");

    // Log the creation action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "MenuItem",
      savedMenuItem._id,
      "create",
      null,
      savedMenuItem,
      `Created new menu item: ${name}`,
    );

    res.status(201).json(populatedMenuItem);
  } catch (error) {
    console.error("Error adding menu item:", error.message);
    res.status(500).json({
      message: "Failed to add the menu item. Please try again later.",
    });
  }
};

// Update an existing menu item
const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    price,
    costPrice,
    itemCode,
    preparationTime,
    description,
    isAvailable,
    image,
    addOnGroups,
  } = req.body;

  try {
    const menuItem = await MenuItem.findOne({
      _id: id,
      storeId: req.storeId,
    }).session(req.transactionSession || null);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    // OPTIMISTIC LOCKING CHECK
    if (
      req.body.version !== undefined &&
      menuItem.version !== req.body.version
    ) {
      // MUST throw (not return) so that pushChanges detects the 409 in batch mode
      const err = Object.assign(
        new Error(
          "Menu item has been updated by another user. Please refresh.",
        ),
        {
          statusCode: 409,
          body: {
            success: false,
            message:
              "Menu item has been updated by another user. Please refresh.",
            currentVersion: menuItem.version,
            updatedMenuItem: menuItem,
          },
        },
      );
      throw err;
    }

    // Increment version
    menuItem.version = (menuItem.version || 0) + 1;

    // FIELD LOCKING: Prevent editing master-owned fields for synced items
    if (menuItem.masterId) {
      const MASTER_OWNED_FIELDS = [
        "name",
        "description",
        "image",
        "category",
        "preparationTime",
      ];
      const OPERATIONAL_FIELDS = [
        "price",
        "isAvailable",
        "customTax",
        "itemCode",
      ];

      const attemptedFields = Object.keys(req.body);
      const forbiddenFields = attemptedFields.filter((field) =>
        MASTER_OWNED_FIELDS.includes(field),
      );

      if (forbiddenFields.length > 0) {
        // Must throw (not return) so pushChanges aborts the transaction in batch mode
        throw Object.assign(
          new Error(
            `Cannot modify brand-controlled fields: ${forbiddenFields.join(", ")}. Only ${OPERATIONAL_FIELDS.join(", ")} can be edited.`,
          ),
          { statusCode: 403 },
        );
      }

      // Track overrides
      attemptedFields.forEach((field) => {
        if (OPERATIONAL_FIELDS.includes(field)) {
          menuItem.syncOverrides.set(field, true);
        }
      });
    }

    const itemCategory = await Category.findById(category).session(
      req.transactionSession || null,
    );

    if (!itemCategory) {
      // Must throw (not return) in batch mode
      throw Object.assign(
        new Error("Category not found. Please create the category first."),
        { statusCode: 404 },
      );
    }

    // Store old menu item state for logging
    const oldMenuItem = { ...menuItem.toObject() };

    let itemCodeConflict = false;
    let nameConflict = false;

    if (itemCode && itemCode !== menuItem.itemCode) {
      const existingMenuItemWithCode = await MenuItem.findOne({
        itemCode,
        storeId: req.storeId,
        _id: { $ne: id },
      }).session(req.transactionSession || null);
      if (existingMenuItemWithCode) {
        itemCodeConflict = true;
      }
    }

    if (name && name !== menuItem.name) {
      const existingMenuItemWithName = await MenuItem.findOne({
        name,
        storeId: req.storeId,
        _id: { $ne: id },
      }).session(req.transactionSession || null);
      if (existingMenuItemWithName) {
        nameConflict = true;
      }
    }

    if (itemCodeConflict) {
      // Must throw (not return) in batch mode
      throw Object.assign(
        new Error("A menu item with the same item code already exists."),
        { statusCode: 400 },
      );
    }

    if (nameConflict) {
      // Must throw (not return) in batch mode
      throw Object.assign(
        new Error("A menu item with the same name already exists."),
        { statusCode: 400 },
      );
    }

    menuItem.name = name || menuItem.name;
    menuItem.category = itemCategory.name || menuItem.category;
    menuItem.price = price !== undefined ? price : menuItem.price;
    menuItem.costPrice =
      costPrice !== undefined ? costPrice : menuItem.costPrice;
    menuItem.itemCode = itemCode || menuItem.itemCode;
    menuItem.preparationTime =
      preparationTime !== undefined
        ? preparationTime
        : menuItem.preparationTime;
    menuItem.description = description || menuItem.description;
    menuItem.isAvailable =
      isAvailable !== undefined ? isAvailable : menuItem.isAvailable;
    menuItem.addOnGroups = addOnGroups || menuItem.addOnGroups;

    // Handle image update
    if (image !== undefined) {
      menuItem.image = image; // Set to new image or null if image was removed
    }

    const updatedMenuItem = await menuItem.save({
      session: req.transactionSession,
    });
    const populatedMenuItem = await MenuItem.findById(
      updatedMenuItem._id,
    ).populate("addOnGroups");

    // Log the update action (pass session so log is rolled back on transaction failure)
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "MenuItem",
      id,
      "edit",
      oldMenuItem,
      updatedMenuItem,
      `Updated menu item: ${menuItem.name}`,
      req.transactionSession || null,
    );

    res.status(200).json(populatedMenuItem);
  } catch (error) {
    console.error("Error updating menu item:", error.message);
    // In batch mode, rethrow so the orchestrator can abort the transaction
    if (req.transactionSession) throw error;
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid menu item ID." });
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message:
        error.message ||
        "Failed to update the menu item. Please try again later.",
    });
  }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const menuItem = await MenuItem.findOne({ _id: id, storeId: req.storeId });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    // Store menu item info for logging before deletion
    const deletedMenuItem = { ...menuItem.toObject() };

    await MenuItem.deleteOne({ _id: id, storeId: req.storeId });

    // Log the deletion action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "MenuItem",
      id,
      "delete",
      deletedMenuItem,
      null,
      `Deleted menu item: ${menuItem.name}`,
    );

    res.status(200).json({ message: "Menu item deleted successfully." });
  } catch (error) {
    console.error("Error deleting menu item:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid menu item ID." });
    }
    res.status(500).json({
      message: "Failed to delete the menu item. Please try again later.",
    });
  }
};

// Toggle menu item availability
const toggleAvailability = async (req, res) => {
  const { id } = req.params;

  try {
    const menuItem = await MenuItem.findOne({ _id: id, storeId: req.storeId });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    // Toggle the availability
    menuItem.isAvailable = !menuItem.isAvailable;

    const updatedMenuItem = await menuItem.save();

    // Log the action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "MenuItem",
      id,
      "edit",
      { ...menuItem.toObject(), isAvailable: !menuItem.isAvailable },
      updatedMenuItem,
      `${menuItem.isAvailable ? "Enabled" : "Disabled"} menu item: ${
        menuItem.name
      }`,
    );

    res.status(200).json(updatedMenuItem);
  } catch (error) {
    console.error("Error toggling menu item availability:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid menu item ID." });
    }
    res.status(500).json({
      message: "Failed to update the menu item. Please try again later.",
    });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  addNewMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
