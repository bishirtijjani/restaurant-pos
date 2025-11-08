const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const GeneralSettings = require("../models/GeneralSettings");
const logAction = require("../utils/logAction");
const { notifyKDS } = require("../utils/webSocket");

// Function to generate unique order numbers
const generateOrderNumber = async () => {
  let orderNumber;
  let exists;

  do {
    orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Order.exists({ orderNumber });
  } while (exists);

  return orderNumber;
};

// Tax calculation utility
const calculateOrderTax = (orderItems, settings, orderType) => {
  const { taxSettings, serviceCharge } = settings;

  let subtotal = 0;
  let totalTax = 0;
  const itemTaxes = [];

  orderItems.forEach((item) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    if (taxSettings?.enabled) {
      const taxRate = item.customTax?.enabled
        ? item.customTax.rate
        : taxSettings.globalRate;

      if (taxSettings.mode === "per-item") {
        const taxAmount = (itemSubtotal * taxRate) / 100;
        totalTax += taxAmount;

        itemTaxes.push({
          menuItemId: item.menuItemId,
          name: item.name,
          taxRate,
          taxAmount,
        });
      }
    }
  });

  if (taxSettings?.enabled && taxSettings.mode === "per-order") {
    totalTax = (subtotal * taxSettings.globalRate) / 100;
  }

  let serviceChargeAmount = 0;
  if (serviceCharge?.enabled) {
    const shouldApply =
      serviceCharge.applyTo === "all" || serviceCharge.applyTo === orderType;

    if (shouldApply) {
      serviceChargeAmount = (subtotal * serviceCharge.rate) / 100;
    }
  }

  return {
    subtotal,
    totalTax,
    serviceCharge: serviceChargeAmount,
    total: subtotal + totalTax + serviceChargeAmount,
    itemTaxes,
  };
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      table,
      customerDetails,
      orderType,
      orderItems,
      amountPaid,
      paymentMethod,
      packagingFee,
      deliveryFee,
      note,
    } = req.body.order;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    const settings = await GeneralSettings.findOne();
    if (!settings) {
      return res.status(500).json({
        success: false,
        message: "Restaurant settings not configured",
      });
    }

    const processedItems = [];

    for (const item of orderItems) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item with ID ${item.menuItemId} not found`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`,
        });
      }

      const quantity = item.quantity || 1;
      const subtotal = menuItem.price * quantity;
      const preparationTime = menuItem.preparationTime || 15;

      processedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        customizations: item.customizations || "",
        subtotal,
        preparationTime,
        customTax: menuItem.customTax || { enabled: false, rate: 0 },
      });
    }

    const taxCalculation = calculateOrderTax(
      processedItems,
      settings,
      orderType || "dine-in"
    );

    const packagingAmount =
      orderType === "dine-in" ? 0 : parseFloat(packagingFee) || 0;

    const deliveryAmount =
      orderType === "delivery" ? parseFloat(deliveryFee) || 0 : 0;

    const finalTotal = taxCalculation.total + packagingAmount + deliveryAmount;

    let paymentStatus = "pending";
    let balance = finalTotal;
    const paidAmount = parseFloat(amountPaid) || 0;

    if (paidAmount >= finalTotal) {
      paymentStatus = "paid";
      balance = 0;
    } else if (paidAmount > 0) {
      paymentStatus = "partial";
      balance = finalTotal - paidAmount;
    }

    const newOrder = new Order({
      orderNumber: await generateOrderNumber(),
      table: table || "Takeaway",
      customerDetails: customerDetails || { name: "Walk-in" },
      orderType: orderType || "dine-in",
      orderItems: processedItems.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations,
        subtotal: item.subtotal,
        itemStatus: "pending",
      })),
      servedBy: req.user.id,
      orderStatus: "pending",
      taxBreakdown: {
        items: taxCalculation.itemTaxes,
        totalTax: taxCalculation.totalTax,
        serviceCharge: taxCalculation.serviceCharge,
        subtotal: taxCalculation.subtotal,
      },
      packagingFee: packagingAmount,
      deliveryFee: deliveryAmount,
      totalAmount: finalTotal,
      amountPaid: paidAmount,
      balance,
      paymentMethod: paymentMethod || "cash",
      paymentStatus,
      note: note || "",
      lastAction: {
        action: "create",
        performedBy: req.user.id,
        createdAt: new Date(),
      },
    });

    await newOrder.save();

    await logAction(
      req.user.id,
      "Order",
      newOrder._id,
      "create",
      null,
      newOrder,
      `Created new order #${newOrder.orderNumber}`
    );

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("servedBy", "fullname")
      .populate("orderItems.menuItemId", "name category");

    // Notify KDS via WebSocket
    notifyKDS("order:created", populatedOrder);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order. Please try again.",
      error: error.message,
    });
  }
};

// Get all orders with simplified filtering
const getAllOrders = async (req, res) => {
  try {
    const { status, orderType, startDate, endDate, paymentStatus } = req.query;

    let filter = {};

    if (status) filter.orderStatus = status;
    if (orderType) filter.orderType = orderType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate("servedBy", "fullname")
      .populate("lastAction.performedBy", "fullname")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders. Please try again.",
      error: error.message,
    });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("orderItems.menuItemId", "name category price preparationTime")
      .populate("servedBy", "fullname")
      .populate("lastAction.performedBy", "fullname");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order. Please try again.",
      error: error.message,
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, reason } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldOrder = { ...order.toObject() };

    order.orderStatus = orderStatus;

    if (orderStatus === "ready") {
      order.actualReadyTime = new Date();
    } else if (orderStatus === "completed" || orderStatus === "served") {
      order.completedAt = new Date();
    }

    order.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || `Updated order status to ${orderStatus}`,
    };

    await order.save();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

    await logAction(
      req.user.id,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Updated order #${order.orderNumber} status to ${orderStatus}`
    );

    // Notify KDS via WebSocket
    notifyKDS("order:updated", order);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update order status. Please try again.",
      error: error.message,
    });
  }
};

// Update payment information
const updatePayment = async (req, res) => {
  try {
    const { amountPaid, paymentMethod, reason } = req.body;

    if (amountPaid === undefined) {
      return res.status(400).json({
        success: false,
        message: "Amount paid is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldOrder = { ...order.toObject() };

    const newAmountPaid = parseFloat(amountPaid);
    order.amountPaid = newAmountPaid;
    if (paymentMethod) order.paymentMethod = paymentMethod;

    const totalDue = order.totalAmount;

    if (newAmountPaid >= totalDue) {
      order.balance = 0;
      order.paymentStatus = "paid";
    } else if (newAmountPaid > 0) {
      order.balance = totalDue - newAmountPaid;
      order.paymentStatus = "partial";
    } else {
      order.balance = totalDue;
      order.paymentStatus = "pending";
    }

    order.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || "Updated payment information",
    };

    await order.save();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

    await logAction(
      req.user.id,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Updated payment for order #${order.orderNumber}`
    );

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update payment information. Please try again.",
      error: error.message,
    });
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed order",
      });
    }

    const oldOrder = { ...order.toObject() };

    order.orderStatus = "cancelled";

    order.orderItems.forEach((item) => {
      item.itemStatus = "cancelled";
    });

    order.lastAction = {
      action: "cancel",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason,
    };

    await order.save();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

    await logAction(
      req.user.id,
      "Order",
      order._id,
      "delete",
      oldOrder,
      order,
      `Cancelled order #${order.orderNumber}: ${reason}`
    );

    // Notify KDS via WebSocket
    notifyKDS("order:cancelled", order);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order. Please try again.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePayment,
  cancelOrder,
};
