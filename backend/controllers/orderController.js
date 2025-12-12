// backend/controllers/orderController.js
const mongoose = require("mongoose");
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
const generateOrderNumber = async (session) => {
  let orderNumber;
  let exists;

  do {
    orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Order.exists({ orderNumber }).session(session);
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
  const session = await mongoose.startSession();
  session.startTransaction();
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
      // NEW: Payment system fields
      payments, // Array of payment entries for split payments
      tip, // Tip object { amount, percentage }
      change, // Change amount
    } = req.body.order;

    // VALIDATION: Dine-in requires a table
    if (orderType === "dine-in" && (!table || table === "Takeaway")) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Dine-in orders must have a table assigned",
      });
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    const settings = await GeneralSettings.findOne().session(session);
    if (!settings) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: "Restaurant settings not configured",
      });
    }

    const processedItems = [];
    const inventoryDeductions = [];

    for (const item of orderItems) {
      const menuItem = await MenuItem.findById(item.menuItemId)
        .populate({
          path: "addOnGroups",
          match: { isActive: true },
        })
        .session(session);

      if (!menuItem) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Menu item with ID ${item.menuItemId} not found`,
        });
      }

      if (!menuItem.isAvailable) {
        await session.abortTransaction();
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
          const addOnGroup = await AddOnGroup.findById(addOn.groupId).session(
            session
          );

          if (!addOnGroup || !addOnGroup.isActive) continue;

          // Validate required groups
          if (
            addOnGroup.isRequired &&
            (!addOn.selectedItemIds || addOn.selectedItemIds.length === 0)
          ) {
            await session.abortTransaction();
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
              await session.abortTransaction();
              return res.status(400).json({
                success: false,
                message: `${addOnGroup.name} allows only single selection`,
              });
            }

            if (
              addOnGroup.minSelections &&
              addOn.selectedItemIds.length < addOnGroup.minSelections
            ) {
              await session.abortTransaction();
              return res.status(400).json({
                success: false,
                message: `${addOnGroup.name} requires at least ${addOnGroup.minSelections} selection(s)`,
              });
            }

            if (
              addOnGroup.maxSelections &&
              addOn.selectedItemIds.length > addOnGroup.maxSelections
            ) {
              await session.abortTransaction();
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

      // NEW: Track inventory deductions for menu item ingredients
      const linkedInventory = await InventoryItem.find({
        "linkedMenuItems.menuItemId": menuItem._id,
        isActive: true,
      }).session(session);

      for (const invItem of linkedInventory) {
        const link = invItem.linkedMenuItems.find(
          (l) => l.menuItemId.toString() === menuItem._id.toString()
        );
        if (link) {
          inventoryDeductions.push({
            inventoryItemId: invItem._id,
            name: invItem.name,
            quantityToDeduct: link.quantityUsed * quantity,
            isMenuItem: true, // Flag to distinguish from add-on deductions
            menuItemName: menuItem.name,
          });
        }
      }

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

    // Verify and deduct inventory for add-ons and menu item ingredients
    for (const deduction of inventoryDeductions) {
      const inventoryItem = await InventoryItem.findById(
        deduction.inventoryItemId
      ).session(session);

      if (inventoryItem) {
        if (inventoryItem.currentStock < deduction.quantityToDeduct) {
          await session.abortTransaction();
          const itemType = deduction.isMenuItem
            ? `ingredient "${deduction.name}" for "${deduction.menuItemName}"`
            : `add-on: ${deduction.name}`;
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${itemType}. Available: ${inventoryItem.currentStock} ${inventoryItem.unit}`,
          });
        }

        inventoryItem.currentStock -= deduction.quantityToDeduct;
        await inventoryItem.save({ session });
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
          stackable: promoValidation.promoCode.stackable,
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

    // Calculate final total (including tip if provided)
    const tipAmount = tip?.amount || 0;
    const finalTotal =
      discountResult.discountedSubtotal +
      taxCalculation.totalTax +
      taxCalculation.serviceCharge +
      packagingAmount +
      deliveryAmount +
      tipAmount;

    // Handle split payments or single payment
    let paymentStatus = "pending";
    let balance = finalTotal;
    let paidAmount = 0;
    let changeAmount = 0;
    let paymentsArray = [];
    let paymentHistoryArray = [];
    let primaryPaymentMethod = paymentMethod || "cash";

    if (payments && Array.isArray(payments) && payments.length > 0) {
      // Split payment scenario
      paidAmount = payments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );

      // Validate: total payments must equal or exceed bill total
      if (paidAmount < finalTotal) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient payment. Total: ${finalTotal.toFixed(
            2
          )}, Paid: ${paidAmount.toFixed(2)}`,
        });
      }

      // Store payments array
      paymentsArray = payments.map((p) => ({
        method: p.method,
        amount: parseFloat(p.amount),
        timestamp: new Date(),
      }));

      // Initialize payment history with all payment entries
      paymentHistoryArray = payments.map((p) => ({
        type: "payment",
        method: p.method,
        amount: parseFloat(p.amount),
        timestamp: new Date(),
        performedBy: req.user.id,
        note: "Initial payment",
      }));

      // Set primary payment method as the first one
      primaryPaymentMethod = payments[0].method;

      // Calculate change
      changeAmount = paidAmount - finalTotal;
      paymentStatus = "paid";
      balance = 0;
    } else {
      // Single payment scenario (legacy)
      paidAmount = parseFloat(amountPaid) || 0;
      changeAmount = parseFloat(change) || 0;

      if (paidAmount >= finalTotal) {
        paymentStatus = "paid";
        balance = 0;
        // Calculate change if not provided
        if (!change) {
          changeAmount = paidAmount - finalTotal;
        }
      } else if (paidAmount > 0) {
        paymentStatus = "partial";
        balance = finalTotal - paidAmount;
        changeAmount = 0; // No change for partial payments
      }

      // Create single payment entry
      if (paidAmount > 0) {
        paymentsArray = [
          {
            method: paymentMethod || "cash",
            amount: paidAmount,
            timestamp: new Date(),
          },
        ];

        paymentHistoryArray = [
          {
            type: "payment",
            method: paymentMethod || "cash",
            amount: paidAmount,
            timestamp: new Date(),
            performedBy: req.user.id,
            note: "Initial payment",
          },
        ];
      }
    }

    const newOrder = new Order({
      orderNumber: await generateOrderNumber(session),
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
      change: changeAmount,
      tip: tip || { amount: 0, percentage: 0 },
      payments: paymentsArray,
      paymentHistory: paymentHistoryArray,
      paymentMethod: primaryPaymentMethod,
      paymentStatus,
      lastAction: {
        action: "create",
        performedBy: req.user.id,
        createdAt: new Date(),
      },
    });

    await newOrder.save({ session });

    // After saving order, increment promo code usage
    if (promoCodeData) {
      await incrementPromoCodeUsage(
        promoCodeData.code,
        customerDetails?.customerId,
        session
      );
    }

    await logAction(
      req.user.id,
      "Order",
      newOrder._id,
      "create",
      null,
      newOrder,
      `Created new order #${newOrder.orderNumber}`,
      session
    );

    await session.commitTransaction();

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
    await session.abortTransaction();
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order. Please try again.",
      error: error.message,
    });
  } finally {
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderStatus, reason } = req.body;

    if (!orderStatus) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Define valid status transitions
    const validTransitions = {
      pending: ["preparing", "cancelled"],
      preparing: ["ready", "pending", "cancelled"],
      ready: ["served", "preparing", "cancelled"], // preparing for recall
      served: ["completed", "cancelled"],
      completed: [], // Terminal state - no transitions allowed
      cancelled: [], // Terminal state - no transitions allowed
    };

    const currentStatus = order.orderStatus;
    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(orderStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: Cannot change from "${currentStatus}" to "${orderStatus}"`,
        allowedTransitions:
          allowedTransitions.length > 0
            ? allowedTransitions
            : "No transitions allowed from this state",
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

    await order.save({ session });

    await logAction(
      req.user.id,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Updated order #${order.orderNumber} status to ${orderStatus}`,
      session
    );

    await session.commitTransaction();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

    // Notify KDS via WebSocket
    notifyKDS("order:updated", order);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
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
  } finally {
    session.endSession();
  }
};

// Update payment information
const updatePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amountPaid, paymentMethod, reason } = req.body;

    if (amountPaid === undefined) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Amount paid is required",
      });
    }

    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
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

    await order.save({ session });

    await logAction(
      req.user.id,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Updated payment for order #${order.orderNumber}`,
      session
    );

    await session.commitTransaction();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
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
  } finally {
    session.endSession();
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

// Refund an order (full or partial)
const refundOrder = async (req, res) => {
  try {
    const { amount, reason, isPartial } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Refund amount is required and must be greater than 0",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Refund reason is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate: can only refund paid orders
    if (order.paymentStatus !== "paid" && order.paymentStatus !== "partial") {
      return res.status(400).json({
        success: false,
        message: "Can only refund paid or partially paid orders",
      });
    }

    const refundAmount = parseFloat(amount);

    // Validate: refund amount cannot exceed amount paid
    if (refundAmount > order.amountPaid) {
      return res.status(400).json({
        success: false,
        message: `Refund amount (${refundAmount.toFixed(
          2
        )}) cannot exceed amount paid (${order.amountPaid.toFixed(2)})`,
      });
    }

    const oldOrder = { ...order.toObject() };

    // Add refund entry
    order.refunds.push({
      amount: refundAmount,
      reason,
      refundedBy: req.user.id,
      refundedAt: new Date(),
      isPartial: isPartial !== false, // Default to true if not specified
    });

    // Add to payment history
    order.paymentHistory.push({
      type: "refund",
      amount: refundAmount,
      timestamp: new Date(),
      performedBy: req.user.id,
      note: reason,
    });

    // Update payment status
    const newAmountPaid = order.amountPaid - refundAmount;
    order.amountPaid = newAmountPaid;

    if (newAmountPaid === 0) {
      order.paymentStatus = "pending";
      order.balance = order.totalAmount;
    } else if (newAmountPaid < order.totalAmount) {
      order.paymentStatus = "partial";
      order.balance = order.totalAmount - newAmountPaid;
    } else {
      order.paymentStatus = "paid";
      order.balance = 0;
    }

    order.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: `Refunded ${refundAmount.toFixed(2)}: ${reason}`,
    };

    await order.save();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");
    await order.populate("refunds.refundedBy", "fullname");
    await order.populate("paymentHistory.performedBy", "fullname");

    await logAction(
      req.user.id,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Refunded ${refundAmount.toFixed(2)} for order #${
        order.orderNumber
      }: ${reason}`
    );

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to process refund. Please try again.",
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
  refundOrder,
};
