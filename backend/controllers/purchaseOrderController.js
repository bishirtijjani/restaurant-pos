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

// Create purchase order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, expectedDeliveryDate, items, notes, invoiceNumber } =
      req.body;

    // Validate required fields
    if (!supplier || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Supplier and items are required",
      });
    }

    // Verify supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Process items and calculate total
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const inventoryItem = await InventoryItem.findById(item.inventoryItem);
      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          message: `Inventory item ${item.inventoryItem} not found`,
        });
      }

      const subtotal = item.quantity * item.unitPrice;
      totalAmount += subtotal;

      processedItems.push({
        inventoryItem: item.inventoryItem,
        name: inventoryItem.name,
        quantity: item.quantity,
        unit: inventoryItem.unit,
        unitPrice: item.unitPrice,
        subtotal,
        receivedQuantity: 0,
      });
    }

    const purchaseOrder = await PurchaseOrder.create({
      supplier,
      expectedDeliveryDate,
      items: processedItems,
      totalAmount,
      notes,
      invoiceNumber,
      createdBy: req.user.id,
      status: "draft",
    });

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      purchaseOrder._id,
      "create",
      null,
      purchaseOrder,
      `Created purchase order: ${purchaseOrder.orderNumber}`
    );

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
    console.error("Error creating purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create purchase order",
      error: error.message,
    });
  }
};

// Update purchase order
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    // Prevent editing received or cancelled orders
    if (["received", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit ${order.status} purchase order`,
      });
    }

    const oldOrder = { ...order.toObject() };

    // If items are being updated, recalculate total
    if (req.body.items) {
      let totalAmount = 0;
      const processedItems = [];

      for (const item of req.body.items) {
        const inventoryItem = await InventoryItem.findById(item.inventoryItem);
        if (!inventoryItem) {
          return res.status(404).json({
            success: false,
            message: `Inventory item ${item.inventoryItem} not found`,
          });
        }

        const subtotal = item.quantity * item.unitPrice;
        totalAmount += subtotal;

        processedItems.push({
          inventoryItem: item.inventoryItem,
          name: inventoryItem.name,
          quantity: item.quantity,
          unit: inventoryItem.unit,
          unitPrice: item.unitPrice,
          subtotal,
          receivedQuantity: item.receivedQuantity || 0,
        });
      }

      req.body.items = processedItems;
      req.body.totalAmount = totalAmount;
    }

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("supplier", "name phone email")
      .populate("items.inventoryItem", "name unit")
      .populate("createdBy", "fullname");

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "update",
      oldOrder,
      updatedOrder,
      req.body.reason || `Updated purchase order: ${updatedOrder.orderNumber}`
    );

    res.status(200).json({
      success: true,
      message: "Purchase order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update purchase order",
      error: error.message,
    });
  }
};

// Approve purchase order
exports.approvePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (order.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft orders can be approved",
      });
    }

    const oldOrder = { ...order.toObject() };

    order.status = "approved";
    await order.save();

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "approve",
      oldOrder,
      order,
      `Approved purchase order: ${order.orderNumber}`
    );

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
    console.error("Error approving purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve purchase order",
      error: error.message,
    });
  }
};

// Receive purchase order
exports.receivePurchaseOrder = async (req, res) => {
  try {
    const { receivedItems, actualDeliveryDate, paymentStatus, amountPaid } =
      req.body;

    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (order.status !== "approved") {
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
        orderItem.receivedQuantity = receivedItem.receivedQuantity;

        // Update inventory stock
        const inventoryItem = await InventoryItem.findById(
          orderItem.inventoryItem
        );
        if (inventoryItem) {
          inventoryItem.currentStock += receivedItem.receivedQuantity;
          inventoryItem.lastRestockDate = new Date();
          await inventoryItem.save();
        }
      }
    }

    order.status = "received";
    order.actualDeliveryDate = actualDeliveryDate || new Date();
    order.paymentStatus = paymentStatus || order.paymentStatus;
    order.amountPaid = amountPaid || order.amountPaid;

    await order.save();

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "receive",
      oldOrder,
      order,
      `Received purchase order: ${order.orderNumber}`
    );

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
    console.error("Error receiving purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to receive purchase order",
      error: error.message,
    });
  }
};

// Cancel purchase order
exports.cancelPurchaseOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (order.status === "received") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a received purchase order",
      });
    }

    const oldOrder = { ...order.toObject() };

    order.status = "cancelled";
    await order.save();

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "cancel",
      oldOrder,
      order,
      reason || `Cancelled purchase order: ${order.orderNumber}`
    );

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
    console.error("Error cancelling purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel purchase order",
      error: error.message,
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, amountPaid, paymentMethod } = req.body;

    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    const oldOrder = { ...order.toObject() };

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (amountPaid !== undefined) order.amountPaid = amountPaid;
    if (paymentMethod) order.paymentMethod = paymentMethod;

    await order.save();

    // Log the action
    await logAction(
      req.user.id,
      "PurchaseOrder",
      req.params.id,
      "update",
      oldOrder,
      order,
      `Updated payment for purchase order: ${order.orderNumber}`
    );

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate("supplier", "name phone email")
      .populate("items.inventoryItem", "name unit");

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

module.exports = exports;
