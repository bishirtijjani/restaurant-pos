const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const logAction = require("../utils/logAction");

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ storeId: req.storeId }).sort({
      createdAt: -1,
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  const duplicateCategory = await Category.findOne({
    name: req.body.name,
    storeId: req.storeId,
  });
  if (duplicateCategory) {
    return res.status(400).json({ message: "This category already exists" });
  }
  try {
    const { name, description } = req.body;
    const category = new Category({
      name,
      description,
      storeId: req.storeId,
      organizationId: req.organizationId,
    });

    const savedCategory = await category.save();

    // Log the category creation
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Category",
      savedCategory._id,
      "create",
      null,
      savedCategory,
      `Created new category: ${name}`,
    );

    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This category already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Get the old category data for logging
    const oldCategory = await Category.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!oldCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // FIELD LOCKING: Prevent store-level editing of brand-synced categories
    if (oldCategory.masterId) {
      return res.status(403).json({
        message:
          "Cannot modify a brand-controlled category. Edit it from the Master Menu in the Brand Dashboard.",
      });
    }

    if (name && name !== oldCategory.name) {
      const duplicateCategory = await Category.findOne({
        name,
        storeId: req.storeId,
        _id: { $ne: req.params.id },
      });
      if (duplicateCategory) {
        return res
          .status(400)
          .json({ message: "This category already exists" });
      }
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      { name, description },
      { new: true },
    );

    // Log the category update
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Category",
      req.params.id,
      "edit",
      oldCategory,
      updatedCategory,
      `Updated category: ${oldCategory.name} to ${name}`,
    );

    res.status(200).json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This category already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete a category and disassociate menuItems
exports.deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const categoryToDelete = await Category.findOne({
      _id: categoryId,
      storeId: req.storeId,
    });
    if (!categoryToDelete) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get affected menuItems for logging (scoped to store)
    const affectedMenuItems = await MenuItem.find({
      category: categoryId,
      storeId: req.storeId,
    });

    // Update menuItems to disassociate from the deleted category (scoped to store)
    await MenuItem.updateMany(
      { category: categoryId, storeId: req.storeId },
      { $set: { category: null } },
    );

    // Delete the category
    await Category.findOneAndDelete({ _id: categoryId, storeId: req.storeId });

    // Log the category deletion with additional context about affected menuItems
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Category",
      categoryId,
      "delete",
      categoryToDelete,
      null,
      `Deleted category: ${categoryToDelete.name}. ${affectedMenuItems.length} menuItems disassociated`,
    );

    res.status(200).json({
      message: "Category deleted and menuItems disassociated successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ message: "Failed to delete the category" });
  }
};

module.exports = exports;


