const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const InventoryItem = require("../models/InventoryItem");
const Supplier = require("../models/Supplier");
const logAction = require("../utils/logAction");

// Get all purchase orders
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const { status, supplier, startDate, endDate } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;

    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }

    const orders = await PurchaseOrder.find(filter)
      .populate("supplier", "name phone email")
      .populate("items.inventoryItem", "name unit")
      .populate("createdBy", "fullname")
      .populate("lastAction.performedBy", "fullname")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders",
      error: error.message,
    });
  }
};

// Get single purchase order
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate("supplier", "name phone email address")
      .populate("items.inventoryItem", "name unit sku")
      .populate("createdBy", "fullname email")
      .populate("lastAction.performedBy", "fullname");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase order",
      error: error.message,
    });
  }
};

// Create purchase order with SERVER-SIDE calculation
exports.createPurchaseOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { supplier, expectedDeliveryDate, items, notes, invoiceNumber } =
      req.body;

    // Validate required fields
    if (!supplier || !items || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Supplier and at least one item are required",
      });
    }

    // Verify supplier exists
    const supplierExists = await Supplier.findById(supplier).session(session);
    if (!supplierExists) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Process items and calculate total SERVER-SIDE
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      // Validate inventory item exists
      const inventoryItem = await InventoryItem.findById(
        item.inventoryItem
      ).session(session);
      if (!inventoryItem) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Inventory item not found`,
        });
      }

      // Parse and validate quantities
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unitPrice);

      if (isNaN(quantity) || quantity <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${inventoryItem.name}`,
        });
      }

      if (isNaN(unitPrice) || unitPrice < 0) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Invalid unit price for ${inventoryItem.name}`,
        });
      }

      // Calculate subtotal on SERVER
      const subtotal = Math.round(quantity * unitPrice * 100) / 100;
      totalAmount += subtotal;

      processedItems.push({
        inventoryItem: item.inventoryItem,
        name: inventoryItem.name,
        quantity,
        unit: inventoryItem.unit,
        unitPrice,
        subtotal,
        receivedQuantity: 0,
      });
    }

    // Round total to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;

    const purchaseOrder = new PurchaseOrder({
      supplier,
      expectedDeliveryDate,
      items: processedItems,
      totalAmount,
      notes,
      invoiceNumber,
      createdBy: req.user.id,
      status: "draft",
    });

    await purchaseOrder.save({ session });

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      purchaseOrder._id,
      "create",
      null,
      purchaseOrder,
      `Created purchase order: ${purchaseOrder.orderNumber}`,
      session
    );

    await session.commitTransaction();

    const populatedOrder = await PurchaseOrder.findById(purchaseOrder._id)
      .populate("supplier", "name phone email")
      .populate("items.inventoryItem", "name unit")
      .populate("createdBy", "fullname");

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create purchase order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Update purchase order with SERVER-SIDE calculation
exports.updatePurchaseOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await PurchaseOrder.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    // Prevent editing received or cancelled orders
    if (["received", "cancelled"].includes(order.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot edit ${order.status} purchase order`,
      });
    }

    const oldOrder = { ...order.toObject() };

    // If items are being updated, recalculate total SERVER-SIDE
    if (req.body.items) {
      let totalAmount = 0;
      const processedItems = [];

      for (const item of req.body.items) {
        const inventoryItem = await InventoryItem.findById(
          item.inventoryItem
        ).session(session);
        if (!inventoryItem) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            message: `Inventory item not found`,
          });
        }

        const quantity = parseFloat(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);

        if (isNaN(quantity) || quantity <= 0) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Invalid quantity for ${inventoryItem.name}`,
          });
        }

        if (isNaN(unitPrice) || unitPrice < 0) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Invalid unit price for ${inventoryItem.name}`,
          });
        }

        const subtotal = Math.round(quantity * unitPrice * 100) / 100;
        totalAmount += subtotal;

        processedItems.push({
          inventoryItem: item.inventoryItem,
          name: inventoryItem.name,
          quantity,
          unit: inventoryItem.unit,
          unitPrice,
          subtotal,
          receivedQuantity: item.receivedQuantity || 0,
        });
      }

      totalAmount = Math.round(totalAmount * 100) / 100;
      req.body.items = processedItems;
      req.body.totalAmount = totalAmount;
    }

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, session }
    );

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "update",
      oldOrder,
      updatedOrder,
      req.body.reason || `Updated purchase order: ${updatedOrder.orderNumber}`,
      session
    );

    await session.commitTransaction();

    await updatedOrder.populate("supplier", "name phone email");
    await updatedOrder.populate("items.inventoryItem", "name unit");
    await updatedOrder.populate("createdBy", "fullname");

    res.status(200).json({
      success: true,
      message: "Purchase order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update purchase order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Approve purchase order
exports.approvePurchaseOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await PurchaseOrder.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (order.status !== "draft") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Only draft orders can be approved",
      });
    }

    const oldOrder = { ...order.toObject() };

    order.status = "approved";
    await order.save({ session });

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "approve",
      oldOrder,
      order,
      `Approved purchase order: ${order.orderNumber}`,
      session
    );

    await session.commitTransaction();

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate("supplier", "name phone email")
      .populate("items.inventoryItem", "name unit")
      .populate("createdBy", "fullname");

    res.status(200).json({
      success: true,
      message: "Purchase order approved successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error approving purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve purchase order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Receive purchase order
exports.receivePurchaseOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { receivedItems, actualDeliveryDate, paymentStatus, amountPaid } =
      req.body;

    const order = await PurchaseOrder.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (order.status !== "approved") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Only approved orders can be received",
      });
    }

    const oldOrder = { ...order.toObject() };

    // Update received quantities and inventory stock
    for (const receivedItem of receivedItems) {
      const orderItem = order.items.find(
        (item) => item._id.toString() === receivedItem.itemId
      );

      if (orderItem) {
        const receivedQty = parseFloat(receivedItem.receivedQuantity);

        if (isNaN(receivedQty) || receivedQty < 0) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: "Invalid received quantity",
          });
        }

        if (receivedQty > orderItem.quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Received quantity cannot exceed ordered quantity for ${orderItem.name}`,
          });
        }

        orderItem.receivedQuantity = receivedQty;

        // Update inventory stock
        const inventoryItem = await InventoryItem.findById(
          orderItem.inventoryItem
        ).session(session);
        if (inventoryItem) {
          inventoryItem.currentStock += receivedQty;
          inventoryItem.lastRestockDate = new Date();
          await inventoryItem.save({ session });
        }
      }
    }

    order.status = "received";
    order.actualDeliveryDate = actualDeliveryDate || new Date();
    order.paymentStatus = paymentStatus || order.paymentStatus;

    const paidAmount = parseFloat(amountPaid);
    if (!isNaN(paidAmount) && paidAmount >= 0) {
      order.amountPaid = paidAmount;
    }

    await order.save({ session });

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "receive",
      oldOrder,
      order,
      `Received purchase order: ${order.orderNumber}`,
      session
    );

    await session.commitTransaction();

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate("supplier", "name phone email")
      .populate("items.inventoryItem", "name unit")
      .populate("createdBy", "fullname");

    res.status(200).json({
      success: true,
      message: "Purchase order received successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error receiving purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to receive purchase order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Cancel purchase order
exports.cancelPurchaseOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const order = await PurchaseOrder.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (order.status === "received") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a received purchase order",
      });
    }

    const oldOrder = { ...order.toObject() };

    order.status = "cancelled";
    await order.save({ session });

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "cancel",
      oldOrder,
      order,
      reason || `Cancelled purchase order: ${order.orderNumber}`,
      session
    );

    await session.commitTransaction();

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate("supplier", "name phone email")
      .populate("items.inventoryItem", "name unit")
      .populate("createdBy", "fullname");

    res.status(200).json({
      success: true,
      message: "Purchase order cancelled successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error cancelling purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel purchase order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { paymentStatus, amountPaid, paymentMethod } = req.body;

    const order = await PurchaseOrder.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    const oldOrder = { ...order.toObject() };

    if (paymentStatus) order.paymentStatus = paymentStatus;

    if (amountPaid !== undefined) {
      const paidAmount = parseFloat(amountPaid);
      if (isNaN(paidAmount) || paidAmount < 0) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Invalid amount paid",
        });
      }
      if (paidAmount > order.totalAmount) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Amount paid cannot exceed total amount",
        });
      }
      order.amountPaid = paidAmount;
    }

    if (paymentMethod) order.paymentMethod = paymentMethod;

    await order.save({ session });

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "update",
      oldOrder,
      order,
      `Updated payment for purchase order: ${order.orderNumber}`,
      session
    );

    await session.commitTransaction();

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate("supplier", "name phone email")
      .populate("items.inventoryItem", "name unit");

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports = exports;
