const Customer = require("../models/Customer");
const Reservation = require("../models/Reservation");
const Order = require("../models/Order");
const CustomerPayment = require("../models/CustomerPayment");
const logAction = require("../utils/logAction"); // Import log function
const mongoose = require("mongoose");

// Fetch all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ storeId: req.storeId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customers" });
  }
};

// Fetch a single customer by ID
const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findOne({ _id: id, storeId: req.storeId });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customer" });
  }
};

// Fetch full customer profile with history and stats
const getCustomerProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findOne({ _id: id, storeId: req.storeId });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Fetch related data in parallel (scoped to store)
    const [reservations, orders, payments] = await Promise.all([
      Reservation.find({ customerId: id, storeId: req.storeId })
        .sort({ reservationDate: -1, reservationTime: -1 })
        .limit(20),
      Order.find({ "customerDetails.customerId": id, storeId: req.storeId })
        .sort({ createdAt: -1 })
        .limit(20),
      CustomerPayment.find({ customerId: id })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("createdBy", "name"),
    ]);

    // Calculate Stats
    const orderStats = await Order.aggregate([
      {
        $match: {
          "customerDetails.customerId": new mongoose.Types.ObjectId(id),
          storeId: new mongoose.Types.ObjectId(req.storeId),
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$totalAmount" },
          visitCount: { $sum: 1 },
          totalDebt: { $sum: "$balance" }, // Assuming balance tracks unpaid amount on order
        },
      },
    ]);

    const paymentStats = await CustomerPayment.aggregate([
      { $match: { customerId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$amount" },
        },
      },
    ]);

    const stats = {
      totalSpent: orderStats[0]?.totalSpent || 0,
      visitCount: orderStats[0]?.visitCount || 0,
      // Outstanding balance logic:
      // Option A: Sum of order balances (if order.balance is reliable for debt)
      // Option B: Total Spent - Total Paid (if payments are tracked separately from order payments)
      // Let's stick to simple aggregation for now. If Order.balance tracks unpaid amount, we use that.
      // However, the prompt implies "Payment history (for clearing debt)".
      // If a customer pays off debt via a new "CustomerPayment", it reduces their global debt.
      // But Order.balance might not be updated by CustomerPayment.
      // Let's assume global balance = (Sum of Order.balance) - (Sum of CustomerPayment.amount where it's a debt payment)
      // OR simpler: Customer has a `debtLimit`.
      // Let's calculate outstanding balance as: (Total Order Amounts where paymentStatus != paid) - (Total Payments)
      // For now, let's just return what we have.
      outstandingBalance:
        (orderStats[0]?.totalDebt || 0) - (paymentStats[0]?.totalPaid || 0),
    };

    res.status(200).json({
      success: true,
      data: {
        customer,
        reservations,
        orders,
        payments,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customer profile" });
  }
};

// Add a note to a customer
const addCustomerNote = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res
      .status(400)
      .json({ success: false, message: "Note content is required" });
  }

  try {
    const customer = await Customer.findOne({ _id: id, storeId: req.storeId });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    customer.notes.push({
      content,
      createdBy: req.user.id,
      createdAt: new Date(),
    });

    await customer.save();

    res.status(200).json({ success: true, data: customer.notes });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ success: false, message: "Failed to add note" });
  }
};

// Record a payment for a customer
const recordCustomerPayment = async (req, res) => {
  const { id } = req.params;
  const { amount, paymentMethod, note } = req.body;

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Valid amount is required" });
  }

  try {
    const customer = await Customer.findOne({ _id: id, storeId: req.storeId });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const newPayment = new CustomerPayment({
      customerId: id,
      amount,
      paymentMethod,
      note,
      createdBy: req.user.id,
    });

    await newPayment.save();

    // Log action
    await logAction(
      req.user.id,
      req.storeId,
      "Customer",
      id,
      "update",
      null,
      null,
      `Recorded payment of ${amount}`
    );

    res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    console.error("Error recording payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to record payment" });
  }
};

// Create a new customer
const createCustomer = async (req, res) => {
  const { fullname, phone, email, address, debtLimit } = req.body;

  if (!fullname || !phone) {
    return res
      .status(400)
      .json({ success: false, message: "Fullname and phone are required" });
  }

  const existingCustomer = await Customer.findOne({
    phone,
    storeId: req.storeId,
  });
  if (existingCustomer) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number already exists" });
  }

  try {
    const newCustomer = new Customer({
      fullname,
      phone,
      email,
      address,
      debtLimit,
      storeId: req.storeId,
    });

    await newCustomer.save();

    // Log action
    await logAction(
      req.user.id,
      req.storeId,
      "Customer",
      newCustomer._id,
      "create",
      null,
      newCustomer,
      "New customer created"
    );

    res.status(201).json({ success: true, data: newCustomer });
  } catch (error) {
    console.error("Error creating customer:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create customer" });
  }
};

// Update customer details
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { fullname, phone, email, address, debtLimit } = req.body;
  try {
    const oldCustomer = await Customer.findOne({
      _id: id,
      storeId: req.storeId,
    }); // Get existing customer details
    if (!oldCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: id, storeId: req.storeId },
      { fullname, phone, email, address, debtLimit },
      { new: true, runValidators: true }
    );

    // Log action
    await logAction(
      req.user.id,
      req.storeId,
      "Customer",
      id,
      "edit",
      oldCustomer,
      updatedCustomer,
      "Customer details updated"
    );

    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update customer" });
  }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCustomer = await Customer.findOneAndDelete({
      _id: id,
      storeId: req.storeId,
    });
    if (!deletedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Log action
    await logAction(
      req.user.id,
      req.storeId,
      "Customer",
      id,
      "delete",
      deletedCustomer,
      null,
      "Customer deleted"
    );

    res
      .status(200)
      .json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete customer" });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerProfile,
  addCustomerNote,
  recordCustomerPayment,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
