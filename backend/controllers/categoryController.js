const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const logAction = require("../utils/logAction");

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  const duplicateCategory = await Category.findOne({ name: req.body.name });
  if (duplicateCategory) {
    return res.status(400).json({ message: "This category already exists" });
  }
  try {
    const { name, description } = req.body;
    const category = new Category({
      name,
      description,
    });

    const savedCategory = await category.save();

    // Log the category creation
    await logAction(
      req.user.id,
      "Category",
      savedCategory._id,
      "create",
      null,
      savedCategory,
      `Created new category: ${name}`
    );

    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Get the old category data for logging
    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );

    // Log the category update
    await logAction(
      req.user.id,
      "Category",
      req.params.id,
      "edit",
      oldCategory,
      updatedCategory,
      `Updated category: ${oldCategory.name} to ${name}`
    );

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category and disassociate menuItems
exports.deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const categoryToDelete = await Category.findById(categoryId);
    if (!categoryToDelete) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get affected menuItems for logging
    const affectedMenuItems = await MenuItem.find({ category: categoryId });

    // Update menuItems to disassociate from the deleted category
    await MenuItem.updateMany(
      { category: categoryId },
      { $set: { category: null } }
    );

    // Delete the category
    await Category.findByIdAndDelete(categoryId);

    // Log the category deletion with additional context about affected menuItems
    await logAction(
      req.user.id,
      "Category",
      categoryId,
      "delete",
      categoryToDelete,
      null,
      `Deleted category: ${categoryToDelete.name}. ${affectedMenuItems.length} menuItems disassociated`
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
