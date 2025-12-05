const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const logAction = require("../utils/logAction");

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
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
    const menuItem = await MenuItem.findById(id);
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
  } = req.body;

  if (!name || !category || !price) {
    return res
      .status(400)
      .json({ message: "Name, category, and price are required." });
  }

  try {
    // Only check for duplicates if itemCode is provided
    if (itemCode) {
      const duplicateMenuItem = await MenuItem.findOne({ itemCode });
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
      // Only set itemCode if it's not an empty string
      ...(itemCode ? { itemCode } : {}),
      // Only add image if provided
      ...(image ? { image } : {}),
    });

    const savedMenuItem = await newMenuItem.save();

    // Log the creation action
    await logAction(
      req.user.id,
      "MenuItem",
      savedMenuItem._id,
      "create",
      null,
      savedMenuItem,
      `Created new menu item: ${name}`
    );

    res.status(201).json(savedMenuItem);
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
  } = req.body;

  try {
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    const itemCategory = await Category.findById(category);

    if (!itemCategory) {
      return res.status(404).json({
        message: "Category not found. Please create the category first.",
      });
    }

    // Store old menu item state for logging
    const oldMenuItem = { ...menuItem.toObject() };

    let itemCodeConflict = false;
    let nameConflict = false;

    if (itemCode && itemCode !== menuItem.itemCode) {
      const existingMenuItemWithCode = await MenuItem.findOne({
        itemCode,
        _id: { $ne: id }, // Exclude the current item from the check
      });
      if (existingMenuItemWithCode) {
        itemCodeConflict = true;
      }
    }

    if (name && name !== menuItem.name) {
      const existingMenuItemWithName = await MenuItem.findOne({
        name,
        _id: { $ne: id }, // Exclude the current item from the check
      });
      if (existingMenuItemWithName) {
        nameConflict = true;
      }
    }

    if (itemCodeConflict) {
      return res.status(400).json({
        message: "A menu item with the same item code already exists.",
      });
    }

    if (nameConflict) {
      return res.status(400).json({
        message: "A menu item with the same name already exists.",
      });
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

    // Handle image update
    if (image !== undefined) {
      menuItem.image = image; // Set to new image or null if image was removed
    }

    const updatedMenuItem = await menuItem.save();

    // Log the update action
    await logAction(
      req.user.id,
      "MenuItem",
      id,
      "edit",
      oldMenuItem,
      updatedMenuItem,
      `Updated menu item: ${menuItem.name}`
    );

    res.status(200).json(updatedMenuItem);
  } catch (error) {
    console.error("Error updating menu item:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid menu item ID." });
    }
    res.status(500).json({
      message: "Failed to update the menu item. Please try again later.",
    });
  }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    // Store menu item info for logging before deletion
    const deletedMenuItem = { ...menuItem.toObject() };

    await MenuItem.deleteOne({ _id: id });

    // Log the deletion action
    await logAction(
      req.user.id,
      "MenuItem",
      id,
      "delete",
      deletedMenuItem,
      null,
      `Deleted menu item: ${menuItem.name}`
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
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    // Toggle the availability
    menuItem.isAvailable = !menuItem.isAvailable;

    const updatedMenuItem = await menuItem.save();

    // Log the action
    await logAction(
      req.user.id,
      "MenuItem",
      id,
      "edit",
      { ...menuItem.toObject(), isAvailable: !menuItem.isAvailable },
      updatedMenuItem,
      `${menuItem.isAvailable ? "Enabled" : "Disabled"} menu item: ${
        menuItem.name
      }`
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
