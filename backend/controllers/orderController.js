// backend/controllers/orderController.js
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const AddOnGroup = require("../models/AddOnGroup");
const InventoryItem = require("../models/InventoryItem");
const GeneralSettings = require("../models/GeneralSettings");
const logAction = require("../utils/logAction");
const { notifyKDS } = require("../utils/webSocket");
const {
  calculateOrderDiscounts,
  incrementPromoCodeUsage,
  validatePromoCode,
} = require("../utils/discountCalculator");

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

// Helper to calculate add-ons total for an item
const calculateItemAddOnsTotal = (addOns, quantity = 1) => {
  if (!addOns || addOns.length === 0) return 0;
  const perItemAddOns = addOns.reduce((total, group) => {
    return (
      total +
      group.selectedItems.reduce((sum, item) => sum + (item.price || 0), 0)
    );
  }, 0);
  return perItemAddOns * quantity;
};

// Updated tax calculation to work with discounted subtotal
const calculateOrderTax = (
  discountedSubtotal,
  orderItems,
  settings,
  orderType
) => {
  const { taxSettings, serviceCharge } = settings;

  let totalTax = 0;
  const itemTaxes = [];

  if (taxSettings?.enabled) {
    if (taxSettings.mode === "per-item") {
      // Per-item tax on original item prices (before discount)
      orderItems.forEach((item) => {
        const itemSubtotal =
          item.price * item.quantity + (item.addOnsTotal || 0);
        const taxRate = item.customTax?.enabled
          ? item.customTax.rate
          : taxSettings.globalRate;

        const taxAmount = (itemSubtotal * taxRate) / 100;
        totalTax += taxAmount;

        itemTaxes.push({
          menuItemId: item.menuItemId,
          name: item.name,
          taxRate,
          taxAmount,
        });
      });
    } else {
      // Per-order tax on discounted subtotal
      totalTax = (discountedSubtotal * taxSettings.globalRate) / 100;
    }
  }

  let serviceChargeAmount = 0;
  if (serviceCharge?.enabled) {
    const shouldApply =
      serviceCharge.applyTo === "all" || serviceCharge.applyTo === orderType;

    if (shouldApply) {
      serviceChargeAmount = (discountedSubtotal * serviceCharge.rate) / 100;
    }
  }

  return {
    subtotal: discountedSubtotal,
    totalTax,
    serviceCharge: serviceChargeAmount,
    total: discountedSubtotal + totalTax + serviceChargeAmount,
    itemTaxes,
  };
};

// Create a new order (UPDATED)
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
      orderNote,
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
    const inventoryDeductions = [];

    for (const item of orderItems) {
      const menuItem = await MenuItem.findById(item.menuItemId).populate({
        path: "addOnGroups",
        match: { isActive: true },
      });

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
      const preparationTime = menuItem.preparationTime || 15;

      // Process add-ons
      let addOnsTotal = 0;
      const processedAddOns = [];

      if (item.addOns && item.addOns.length > 0) {
        for (const addOn of item.addOns) {
          const addOnGroup = await AddOnGroup.findById(addOn.groupId);

          if (!addOnGroup || !addOnGroup.isActive) continue;

          // Validate required groups
          if (
            addOnGroup.isRequired &&
            (!addOn.selectedItemIds || addOn.selectedItemIds.length === 0)
          ) {
            return res.status(400).json({
              success: false,
              message: `${addOnGroup.name} is required for ${menuItem.name}`,
            });
          }

          // Validate selection rules
          if (addOn.selectedItemIds) {
            if (
              addOnGroup.selectionType === "single" &&
              addOn.selectedItemIds.length > 1
            ) {
              return res.status(400).json({
                success: false,
                message: `${addOnGroup.name} allows only single selection`,
              });
            }

            if (
              addOnGroup.minSelections &&
              addOn.selectedItemIds.length < addOnGroup.minSelections
            ) {
              return res.status(400).json({
                success: false,
                message: `${addOnGroup.name} requires at least ${addOnGroup.minSelections} selection(s)`,
              });
            }

            if (
              addOnGroup.maxSelections &&
              addOn.selectedItemIds.length > addOnGroup.maxSelections
            ) {
              return res.status(400).json({
                success: false,
                message: `${addOnGroup.name} allows maximum ${addOnGroup.maxSelections} selections`,
              });
            }
          }

          const selectedItems = [];

          for (const selectedItemId of addOn.selectedItemIds || []) {
            const addOnItem = addOnGroup.items.id(selectedItemId);

            if (addOnItem && addOnItem.isAvailable) {
              selectedItems.push({
                itemId: addOnItem._id,
                name: addOnItem.name,
                price: addOnItem.price,
                inventoryItem: addOnItem.inventoryItem,
                quantityUsed: addOnItem.quantityUsed || 1,
              });

              addOnsTotal += addOnItem.price;

              // Track inventory deduction for add-on
              if (addOnItem.inventoryItem) {
                inventoryDeductions.push({
                  inventoryItemId: addOnItem.inventoryItem,
                  name: addOnItem.name,
                  quantityToDeduct: (addOnItem.quantityUsed || 1) * quantity,
                });
              }
            }
          }

          if (selectedItems.length > 0) {
            processedAddOns.push({
              groupId: addOnGroup._id,
              groupName: addOnGroup.name,
              selectedItems,
              addOnSubtotal: selectedItems.reduce((sum, i) => sum + i.price, 0),
            });
          }
        }
      }

      const itemAddOnsTotal = addOnsTotal * quantity;
      const subtotal = menuItem.price * quantity + itemAddOnsTotal;

      processedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        customizations: item.customizations || "",
        itemNote: item.itemNote || "",
        addOns: processedAddOns,
        addOnsTotal: itemAddOnsTotal,
        subtotal,
        preparationTime,
        customTax: menuItem.customTax || { enabled: false, rate: 0 },
      });
    }

    // Verify and deduct inventory for add-ons
    for (const deduction of inventoryDeductions) {
      const inventoryItem = await InventoryItem.findById(
        deduction.inventoryItemId
      );

      if (inventoryItem) {
        if (inventoryItem.currentStock < deduction.quantityToDeduct) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for add-on: ${deduction.name}`,
          });
        }

        inventoryItem.currentStock -= deduction.quantityToDeduct;
        await inventoryItem.save();
      }
    }

    // Calculate subtotal
    const rawSubtotal = processedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    // Process discount
    let orderDiscount = null;
    let promoCodeData = null;

    // Check for promo code
    if (req.body.order.promoCode) {
      const promoValidation = await validatePromoCode(
        req.body.order.promoCode,
        rawSubtotal,
        orderType || "dine-in",
        customerDetails?.customerId
      );

      if (promoValidation.valid) {
        orderDiscount = {
          enabled: true,
          type: promoValidation.discountType,
          value: promoValidation.discountValue,
          maxDiscount: promoValidation.promoCode.maximumDiscountAmount,
          name: `Promo: ${promoValidation.promoCode.code}`,
          promoCode: promoValidation.promoCode.code,
        };
        promoCodeData = {
          code: promoValidation.promoCode.code,
          discountType: promoValidation.discountType,
          discountValue: promoValidation.discountValue,
          discountAmount: promoValidation.discountAmount,
        };
      }
    }

    // Check for manual order discount
    if (!orderDiscount && req.body.order.orderDiscount?.enabled) {
      orderDiscount = req.body.order.orderDiscount;
    }

    // Calculate discounts
    const discountResult = await calculateOrderDiscounts({
      orderItems: processedItems,
      globalDiscount: settings.globalDiscount,
      orderDiscount,
      orderType: orderType || "dine-in",
      subtotal: rawSubtotal,
    });

    // Calculate tax on discounted subtotal
    const taxCalculation = calculateOrderTax(
      discountResult.discountedSubtotal,
      processedItems,
      settings,
      orderType || "dine-in"
    );

    // Calculate final total
    const packagingAmount =
      orderType === "dine-in" ? 0 : parseFloat(packagingFee) || 0;
    const deliveryAmount =
      orderType === "delivery" ? parseFloat(deliveryFee) || 0 : 0;

    const totalAddOnsAmount = processedItems.reduce(
      (sum, item) => sum + (item.addOnsTotal || 0),
      0
    );

    const finalTotal =
      discountResult.discountedSubtotal +
      taxCalculation.totalTax +
      taxCalculation.serviceCharge +
      packagingAmount +
      deliveryAmount;

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
        itemNote: item.itemNote,
        addOns: item.addOns,
        addOnsTotal: item.addOnsTotal,
        subtotal: item.subtotal,
        itemStatus: "pending",
      })),
      servedBy: req.user.id,
      orderStatus: "pending",
      orderNote: orderNote || note || "",
      note: orderNote || note || "",
      taxBreakdown: {
        items: taxCalculation.itemTaxes,
        totalTax: taxCalculation.totalTax,
        serviceCharge: taxCalculation.serviceCharge,
        subtotal: taxCalculation.subtotal,
      },
      discountBreakdown: {
        hasDiscount: discountResult.totalDiscountAmount > 0,
        originalSubtotal: rawSubtotal,
        totalDiscountAmount: discountResult.totalDiscountAmount,
        discountedSubtotal: discountResult.discountedSubtotal,
        appliedDiscounts: discountResult.appliedDiscounts,
        itemDiscounts: discountResult.itemDiscounts,
      },
      promoCodeUsed: promoCodeData,
      addOnsTotal: totalAddOnsAmount,
      packagingFee: packagingAmount,
      deliveryFee: deliveryAmount,
      totalAmount: finalTotal,
      amountPaid: paidAmount,
      balance,
      paymentMethod: paymentMethod || "cash",
      paymentStatus,
      lastAction: {
        action: "create",
        performedBy: req.user.id,
        createdAt: new Date(),
      },
    });

    await newOrder.save();

    // After saving order, increment promo code usage
    if (promoCodeData) {
      await incrementPromoCodeUsage(
        promoCodeData.code,
        customerDetails?.customerId
      );
    }

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
