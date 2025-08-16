const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");
const Supplier = require("../models/Supplier");
const MenuItem = require("../models/MenuItem");
const logAction = require("../utils/logAction"); // Import log function

// Create a new purchase
exports.createPurchase = async (req, res) => {
  // Validate the user's role
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res
      .status(403)
      .json({ message: "Unauthorized to perform this action." });
  }
  try {
    const { purchaseDate, supplier, menuItems } = req.body;
    const createdBy = req.user.id;
    console.log(req.body);
    // Validate required fields
    if (!supplier || !menuItems || menuItems.length === 0 || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate supplier
    const existingSupplier = await Supplier.findById(supplier);
    if (!existingSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    let calculatedTotalCost = 0;
    const formattedMenuItems = [];

    for (const [index, item] of menuItems.entries()) {
      // Validate menuItem existence
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          message: `MenuItem with ID ${item.menuItemId} not found at index ${index}`,
        });
      }

      // Validate batch info
      if (
        !item.batchNumber ||
        item.quantity <= 0 ||
        item.packPurchasePrice <= 0 ||
        item.unitPurchasePrice <= 0 ||
        item.packSellingPrice <= 0 ||
        item.unitSellingPrice <= 0
      ) {
        return res.status(400).json({
          message: `Invalid menuItem details for menuItem ${menuItem.name} at index ${index}`,
        });
      }

      // Check for duplicate batch numbers
      const existingBatch = menuItem.batches.find(
        (batch) => batch.batchNumber === item.batchNumber
      );
      if (existingBatch) {
        return res.status(400).json({
          message: `Batch number ${item.batchNumber} already exists for menuItem ${menuItem.name}`,
        });
      }

      // Add batch to menuItem
      const batch = {
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        packPurchasePrice: item.packPurchasePrice,
        unitSellingPrice: item.unitSellingPrice,
        packSellingPrice: item.packSellingPrice,
        expiryDate: item.expiryDate,
      };
      menuItem.batches.push(batch);
      await menuItem.save();

      // Calculate total cost
      calculatedTotalCost += item.packPurchasePrice * item.quantity;

      // Add to formatted menuItems
      formattedMenuItems.push({
        menuItem: item.menuItemId,
        category: menuItem.category,
        batchInfo: {
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          totalCost: item.totalCost,
          unitPurchasePrice: item.unitPurchasePrice,
          packPurchasePrice: item.packPurchasePrice,
          PackSellingPrice: item.packSellingPrice,
          unitSellingPrice: item.unitSellingPrice,
          expiryDate: item.expiryDate,
        },
      });
    }

    // Create purchase record
    const newPurchase = new Purchase({
      purchaseDate,
      supplier,
      menuItems: formattedMenuItems,
      createdBy,
    });
    await newPurchase.save();

    // Log the action
    await logAction(
      req.user.id,
      "Purchase",
      newPurchase._id,
      "create",
      null,
      newPurchase,
      `Created new Purchase`
    );

    res.status(201).json({
      message: "Purchase created successfully",
      purchase: newPurchase,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while creating the purchase",
      error: error.message,
    });
  }
};

// Get all purchases
exports.getAllPurchases = async (req, res) => {
  // Validate the user's role
  if (
    req.user.role !== "admin" &&
    req.user.role !== "manager" &&
    req.user.role !== "staff"
  ) {
    return res
      .status(403)
      .json({ message: "Unauthorized to perform this action." });
  }

  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate("supplier", "name phone email")
      .populate("menuItems.menuItem", "name category")
      .populate("createdBy", "fullname role");

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ message: "No purchases found" });
    }

    res.status(200).json({ purchases });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while fetching purchases",
      error: error.message,
    });
  }
};

// Get a purchase by ID
exports.getPurchaseById = async (req, res) => {
  // Validate the user's role
  if (
    req.user.role !== "admin" &&
    req.user.role !== "manager" &&
    req.user.role !== "staff"
  ) {
    return res
      .status(403)
      .json({ message: "Unauthorized to perform this action." });
  }

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid purchase ID format" });
    }

    const purchase = await Purchase.findById(id)
      .populate("supplier", "name phone email")
      .populate("menuItems.menuItemId", "name category");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.status(200).json({ purchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while fetching the purchase",
      error: error.message,
    });
  }
};

// Update a purchase
exports.updatePurchase = async (req, res) => {
  // Validate the user's role
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res
      .status(403)
      .json({ message: "Unauthorized to perform this action." });
  }

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid purchase ID format" });
    }

    const purchase = await Purchase.findById(id);
    const oldPurchase = purchase;
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    const { purchaseDate, supplier, menuItems } = req.body;

    // Validate required fields
    if (!supplier || !menuItems || menuItems.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate supplier
    const existingSupplier = await Supplier.findById(supplier);
    if (!existingSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    let calculatedTotalCost = 0;
    const formattedMenuItems = [];

    for (const [index, item] of menuItems.entries()) {
      // Validate menuItem existence
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          message: `MenuItem with ID ${item.menuItemId} not found at index ${index}`,
        });
      }

      // Validate batch info
      if (
        !item.batchNumber ||
        item.quantity <= 0 ||
        item.packPurchasePrice <= 0 ||
        item.unitPurchasePrice <= 0 ||
        item.packSellingPrice <= 0 ||
        item.unitSellingPrice <= 0
      ) {
        return res.status(400).json({
          message: `Invalid menuItem details for menuItem ${menuItem.name} at index ${index}`,
        });
      }

      // Check for duplicate batch numbers
      const existingBatch = menuItem.batches.find(
        (batch) => batch.batchNumber === item.batchNumber
      );
      if (existingBatch) {
        return res.status(400).json({
          message: `Batch number ${item.batchNumber} already exists for menuItem ${menuItem.name}`,
        });
      }

      // Update batch in menuItem
      const batchIndex = menuItem.batches.findIndex(
        (batch) => batch.batchNumber === item.batchNumber
      );
      if (batchIndex !== -1) {
        menuItem.batches[batchIndex] = {
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          packPurchasePrice: item.packPurchasePrice,
          unitSellingPrice: item.unitSellingPrice,
          packSellingPrice: item.packSellingPrice,
          expiryDate: item.expiryDate,
        };
      } else {
        menuItem.batches.push({
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          packPurchasePrice: item.packPurchasePrice,
          unitSellingPrice: item.unitSellingPrice,
          packSellingPrice: item.packSellingPrice,
          expiryDate: item.expiryDate,
        });
      }
      await menuItem.save();

      // Calculate total cost
      calculatedTotalCost += item.packPurchasePrice * item.quantity;

      // Add to formatted menuItems
      formattedMenuItems.push({
        menuItem: item.menuItemId,
        category: menuItem.category,
        batchInfo: {
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          totalCost: item.totalCost,
          unitPurchasePrice: item.unitPurchasePrice,
          packPurchasePrice: item.packPurchasePrice,
          PackSellingPrice: item.packSellingPrice,
          unitSellingPrice: item.unitSellingPrice,
          expiryDate: item.expiryDate,
        },
      });
    }

    // Update purchase record
    purchase.purchaseDate = purchaseDate;
    purchase.supplier = supplier;
    purchase.menuItems = formattedMenuItems;
    await purchase.save();

    // Log the action
    await logAction(
      req.user.id,
      "Purchase",
      id,
      "update",
      oldPurchase,
      purchase,
      "Updated purchase details"
    );
    res.status(200).json({
      message: "Purchase updated successfully",
      purchase,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the purchase",
      error: error.message,
    });
  }
};

// Delete a purchase
exports.deletePurchase = async (req, res) => {
  // Validate the user's role
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized to perform this action." });
  }
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid purchase ID format" });
    }

    const deletedPurchase = await Purchase.findByIdAndDelete(id);

    if (!deletedPurchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Log the action
    await logAction(
      req.user.id,
      "Purchase",
      id,
      "delete",
      deletedPurchase,
      null,
      "Deleted Purchase"
    );

    res
      .status(200)
      .json({ message: "Purchase deleted successfully", purchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while deleting the purchase",
      error: error.message,
    });
  }
};
