const Supplier = require("../models/Supplier");
const User = require("../models/User");
const logAction = require("../utils/logAction"); // Import log function

// Create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const { storeId, organizationId } = req;

    if (!name || !address) {
      return res.status(400).json({ message: "Name and Address are required" });
    }

    const existingSupplier = await Supplier.findOne({
      $or: [{ email }, { phone }],
      storeId: req.storeId,
    });

    if (existingSupplier) {
      return res
        .status(409)
        .json({ message: "A supplier with this email already exists" });
    }

    const newSupplier = new Supplier({
      name,
      phone,
      email,
      address,
      storeId,
      organizationId,
    });
    await newSupplier.save();
    // Log the action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Supplier",
      newSupplier._id,
      "create",
      null,
      newSupplier,
      `Created new supplier`
    );

    res.status(201).json(newSupplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the supplier" });
  }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ storeId: req.storeId })
      .populate("lastAction.performedBy", "fullname")
      .sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching suppliers" });
  }
};

// Get a supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Supplier ID is required" });
    }

    const supplier = await Supplier.findOne({ _id: id, storeId: req.storeId });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (error) {
    console.error("Error fetching supplier by ID:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the supplier" });
  }
};

// Update a supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    if (!id || (!name && !phone && !email && !address)) {
      return res.status(400).json({
        message: "Supplier ID and at least one field to update are required",
      });
    }
    const oldSupplier = await Supplier.findOne({
      _id: id,
      storeId: req.storeId,
    });

    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: id, storeId: req.storeId },
      { name, phone, email, address },
      { new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Log the action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Supplier",
      id,
      "update",
      oldSupplier,
      updatedSupplier,
      "Updated supplier details"
    );

    res.status(200).json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the supplier" });
  }
};

// Delete a supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Supplier ID is required" });
    }

    const deletedSupplier = await Supplier.findOneAndDelete({
      _id: id,
      storeId: req.storeId,
    });
    if (!deletedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Log the action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Supplier",
      id,
      "delete",
      deletedSupplier,
      null,
      "Deleted supplier"
    );
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the supplier" });
  }
};
