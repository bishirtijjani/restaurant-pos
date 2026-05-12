// backend/controllers/orderController.js
const mongoose = require("mongoose");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const AddOnGroup = require("../models/AddOnGroup");
const InventoryItem = require("../models/InventoryItem");
const Store = require("../models/Store"); // Replaces GeneralSettings
const { getEffectiveSettings } = require("../utils/settingsManager");
const logAction = require("../utils/logAction");
const { notifyKDS } = require("../utils/webSocket");
const {
  calculateOrderDiscounts,
  incrementPromoCodeUsage,
  validatePromoCode,
} = require("../utils/discountCalculator");
const CommManager = require("../utils/communicationManager");

// Function to generate unique order numbers
const generateOrderNumber = async (session, storeId) => {
  let orderNumber;
  let exists;

  do {
    orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
    // Scope uniqueness check to the store (optional, but safer to be global or store-unique)
    // For now, let's keep it global or store-scoped?
    // Usually order numbers are per store for customers "Order #55".
    // But this is a 6-digit ID. Let's make it store-scoped to avoid collisions in a massive SaaS.
    exists = await Order.exists({ orderNumber, storeId }).session(session);
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
  orderType,
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

// Create a new order (UPDATED for Session Injection)
const createOrder = async (req, res) => {
  const session = req.transactionSession || (await mongoose.startSession());
  const isExternalTransaction = !!req.transactionSession;
  if (!isExternalTransaction) session.startTransaction();
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
      payments, // Array of payment entries for split payments
      tip, // Tip object { amount, percentage }
      change, // Change amount
    } = req.body.order;

    // clientId may arrive at top level (frontend offlineAxios injects there)
    // OR nested under req.body.order. Accept both for flexibility.
    const clientId = req.body.clientId || req.body.order.clientId;

    // Store Context
    const storeId = req.storeId;

    // Natural dedup: if the same clientId arrives again (offline retry,
    // network drop after server commit, etc.), return the existing order
    // instead of creating a duplicate.
    if (clientId) {
      const existing = await Order.findOne({ storeId, clientId }).session(
        session,
      );
      if (existing) {
        if (!isExternalTransaction) await session.commitTransaction();
        return res.status(200).json({ data: existing });
      }
    }

    // VALIDATION: Dine-in requires a table
    if (orderType === "dine-in" && (!table || table === "Takeaway")) {
      throw Object.assign(
        new Error("Dine-in orders must have a table assigned"),
        {
          statusCode: 400,
        },
      );
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      throw Object.assign(new Error("Order must contain at least one item"), {
        statusCode: 400,
      });
    }

    // Fetch Effective Settings (Merges Store + Brand)
    const settings = await getEffectiveSettings(storeId);
    if (!settings) {
      throw Object.assign(new Error("Store settings not configured"), {
        statusCode: 500,
      });
    }

    const processedItems = [];
    const inventoryDeductions = [];

    for (const item of orderItems) {
      const menuItem = await MenuItem.findOne({
        _id: item.menuItemId,
        storeId,
      })
        .populate({
          path: "addOnGroups",
          match: { isActive: true },
        })
        .session(session);

      if (!menuItem) {
        throw Object.assign(
          new Error(`Menu item with ID ${item.menuItemId} not found`),
          { statusCode: 404 },
        );
      }

      if (!menuItem.isAvailable) {
        throw Object.assign(
          new Error(`${menuItem.name} is currently unavailable`),
          { statusCode: 400 },
        );
      }

      const quantity = item.quantity || 1;
      const preparationTime = menuItem.preparationTime || 15;

      // Process add-ons
      let addOnsTotal = 0;
      const processedAddOns = [];

      if (item.addOns && item.addOns.length > 0) {
        for (const addOn of item.addOns) {
          const addOnGroup = await AddOnGroup.findOne({
            _id: addOn.groupId,
            storeId,
          }).session(session);

          if (!addOnGroup || !addOnGroup.isActive) continue;

          // Validate required groups
          if (
            addOnGroup.isRequired &&
            (!addOn.selectedItemIds || addOn.selectedItemIds.length === 0)
          ) {
            throw Object.assign(
              new Error(`${addOnGroup.name} is required for ${menuItem.name}`),
              { statusCode: 400 },
            );
          }

          // Validate selection rules
          if (addOn.selectedItemIds) {
            if (
              addOnGroup.selectionType === "single" &&
              addOn.selectedItemIds.length > 1
            ) {
              throw Object.assign(
                new Error(`${addOnGroup.name} allows only single selection`),
                { statusCode: 400 },
              );
            }

            if (
              addOnGroup.minSelections &&
              addOn.selectedItemIds.length < addOnGroup.minSelections
            ) {
              throw Object.assign(
                new Error(
                  `${addOnGroup.name} requires at least ${addOnGroup.minSelections} selection(s)`,
                ),
                { statusCode: 400 },
              );
            }

            if (
              addOnGroup.maxSelections &&
              addOn.selectedItemIds.length > addOnGroup.maxSelections
            ) {
              throw Object.assign(
                new Error(
                  `${addOnGroup.name} allows maximum ${addOnGroup.maxSelections} selections`,
                ),
                { statusCode: 400 },
              );
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
                allergens: addOnItem.allergens || [],
                dietaryTags: addOnItem.dietaryTags || [],
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
        storeId,
      }).session(session);

      for (const invItem of linkedInventory) {
        const link = invItem.linkedMenuItems.find(
          (l) => l.menuItemId.toString() === menuItem._id.toString(),
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
      const inventoryItem = await InventoryItem.findOne({
        _id: deduction.inventoryItemId,
        storeId,
      }).session(session);

      if (inventoryItem) {
        if (inventoryItem.currentStock < deduction.quantityToDeduct) {
          const itemType = deduction.isMenuItem
            ? `ingredient "${deduction.name}" for "${deduction.menuItemName}"`
            : `add-on: ${deduction.name}`;
          throw Object.assign(
            new Error(
              `Insufficient stock for ${itemType}. Available: ${inventoryItem.currentStock} ${inventoryItem.unit}`,
            ),
            { statusCode: 400 },
          );
        }

        inventoryItem.currentStock -= deduction.quantityToDeduct;
        await inventoryItem.save({ session });

        // Trigger low stock alert if needed
        if (inventoryItem.currentStock <= inventoryItem.minStockLevel) {
          // Fetch store for contact phone
          const store = await Store.findById(storeId).session(session);
          CommManager.sendWhatsApp(storeId, {
            action: "low_stock",
            data: {
              itemName: inventoryItem.name,
              currentStock: inventoryItem.currentStock,
              unit: inventoryItem.unit,
            },
            to: store?.contactPhone || "", // Use store's contact phone
          });
        }
      }
    }

    // Calculate subtotal
    const rawSubtotal = processedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    // Process discount
    let orderDiscount = null;
    let promoCodeData = null;

    // Check for promo code
    if (req.body.order.promoCode) {
      const promoValidation = await validatePromoCode(
        req.storeId,
        req.body.order.promoCode,
        rawSubtotal,
        orderType || "dine-in",
        customerDetails?.customerId,
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
      storeId: req.storeId,
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
      orderType || "dine-in",
    );

    // Calculate final total
    const packagingAmount =
      orderType === "dine-in" ? 0 : parseFloat(packagingFee) || 0;
    const deliveryAmount =
      orderType === "delivery" ? parseFloat(deliveryFee) || 0 : 0;

    const totalAddOnsAmount = processedItems.reduce(
      (sum, item) => sum + (item.addOnsTotal || 0),
      0,
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
        0,
      );

      // Validate: total payments must equal or exceed bill total
      if (paidAmount < finalTotal) {
        throw Object.assign(
          new Error(
            `Insufficient payment. Total: ${finalTotal.toFixed(2)}, Paid: ${paidAmount.toFixed(2)}`,
          ),
          { statusCode: 400 },
        );
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
        transactionId: p.transactionId || null, // Store gateway transaction ID
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
            transactionId: req.body.transactionId || null, // Store gateway transaction ID
          },
        ];
      }
    }

    // Extract payment transaction IDs (for Stripe, etc.)
    let stripePaymentIntentId = null;
    if (payments && Array.isArray(payments)) {
      // Check for card payment with transaction ID
      const cardPayment = payments.find(
        (p) => p.method === "card" && p.transactionId,
      );
      if (cardPayment) {
        stripePaymentIntentId = cardPayment.transactionId;
      }
    } else if (paymentMethod === "card" && req.body.transactionId) {
      // Single payment scenario
      stripePaymentIntentId = req.body.transactionId;
    }

    const newOrder = new Order({
      orderNumber: await generateOrderNumber(session, storeId),
      clientId: clientId || undefined,
      // NEW: Scoped to Store
      storeId: storeId,
      organizationId: req.organizationId,
      // Snapshot store's currency on the order so historical totals stay
      // correct even if the store later switches currency.
      currency: settings.currency
        ? {
            code: settings.currency.code,
            symbol: settings.currency.symbol,
          }
        : undefined,
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
      stripePaymentIntentId, // Store for refund processing
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
        storeId,
        customerDetails?.customerId,
        session,
      );
    }

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Order",
      newOrder._id,
      "create",
      null,
      newOrder,
      `Created new order #${newOrder.orderNumber}`,
      session,
    );

    if (!isExternalTransaction) await session.commitTransaction();

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("servedBy", "fullname")
      .populate("orderItems.menuItemId", "name category allergens dietaryTags");

    // Notify KDS via WebSocket
    notifyKDS("order:created", populatedOrder, null, req.storeId);

    // Dynamic Notifications (Email/SMS/WhatsApp Confirmations)
    if (customerDetails?.email || customerDetails?.phone) {
      const recipient = customerDetails.email || customerDetails.phone;
      const tplData = {
        customerName: customerDetails.name || "Customer",
        orderNumber: newOrder.orderNumber,
        totalAmount: finalTotal.toFixed(2),
      };

      if (customerDetails.email) {
        CommManager.sendEmail(req.storeId, {
          to: customerDetails.email,
          action: "order_confirmation",
          data: tplData,
        });
      }

      if (customerDetails.phone) {
        // Decide between SMS or WhatsApp based on store preference or always send both if enabled
        CommManager.sendSMS(req.storeId, {
          to: customerDetails.phone,
          action: "order_confirmation",
          data: tplData,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    if (!isExternalTransaction) await session.abortTransaction();
    console.error("Error creating order:", error);

    // IMPORTANT: If external transaction, rethrow to let orchestrator handle rollback
    if (isExternalTransaction) throw error;

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create order. Please try again.",
      error: error.message,
    });
  } finally {
    if (!isExternalTransaction) session.endSession();
  }
};

// Get all orders with simplified filtering
const getAllOrders = async (req, res) => {
  try {
    const { status, orderType, startDate, endDate, paymentStatus } = req.query;

    // Store Scoped Filter
    let filter = { storeId: req.storeId };

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
    // Enforce store scoping
    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    })
      .populate("orderItems.menuItemId", "name category price preparationTime allergens dietaryTags")
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
  const session = req.transactionSession || (await mongoose.startSession());
  const isExternalTransaction = !!req.transactionSession;
  if (!isExternalTransaction) session.startTransaction();
  try {
    const { orderStatus, reason } = req.body;

    if (!orderStatus) {
      throw Object.assign(new Error("Order status is required"), {
        statusCode: 400,
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    }).session(session);

    if (!order) {
      throw Object.assign(new Error("Order not found"), { statusCode: 404 });
    }

    if (req.body.version !== undefined && order.version !== req.body.version) {
      throw Object.assign(
        new Error("Details have been updated by another user. Please refresh."),
        {
          statusCode: 409,
          body: {
            success: false,
            message:
              "Details have been updated by another user. Please refresh.",
            currentVersion: order.version,
            updatedOrder: order,
          },
        },
      );
    }

    // Increment version
    order.version = (order.version || 0) + 1;

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
      throw Object.assign(
        new Error(
          `Invalid status transition: Cannot change from "${currentStatus}" to "${orderStatus}"`,
        ),
        { statusCode: 400 },
      );
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
      req.storeId,
      req.organizationId,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Updated order #${order.orderNumber} status to ${orderStatus}`,
      session,
    );

    if (!isExternalTransaction) await session.commitTransaction();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category allergens dietaryTags");

    // Notify KDS via WebSocket
    notifyKDS("order:updated", order, null, req.storeId);

    // Dynamic Notifications for Customer (Status Updates)
    if (
      ["ready", "served", "cancelled"].includes(orderStatus) &&
      (order.customerDetails?.phone || order.customerDetails?.email)
    ) {
      const tplData = {
        customerName: order.customerDetails?.name || "Customer",
        orderNumber: order.orderNumber,
        orderStatus: orderStatus,
      };

      if (order.customerDetails.phone) {
        CommManager.sendSMS(req.storeId, {
          to: order.customerDetails.phone,
          action: "order_status_update",
          data: tplData,
          body: `Hi ${tplData.customerName}, your order #${tplData.orderNumber} is now ${tplData.orderStatus}!`,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (!isExternalTransaction) await session.abortTransaction();
    console.error("Error updating order status:", error);
    if (isExternalTransaction) throw error;
    // Return 409 body directly if it was a conflict
    if (error.body) return res.status(error.statusCode).json(error.body);
    const statusCode =
      error.statusCode || (error.kind === "ObjectId" ? 400 : 500);
    return res.status(statusCode).json({
      success: false,
      message:
        error.message || "Failed to update order status. Please try again.",
    });
  } finally {
    if (!isExternalTransaction) session.endSession();
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

    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    }).session(session);

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
      req.storeId,
      req.organizationId,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Updated payment for order #${order.orderNumber}`,
      session,
    );

    await session.commitTransaction();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category allergens dietaryTags");

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
  const session = req.transactionSession || (await mongoose.startSession());
  const isExternalTransaction = !!req.transactionSession;
  if (!isExternalTransaction) session.startTransaction();

  try {
    const { reason } = req.body;

    if (!reason) {
      throw Object.assign(new Error("Cancellation reason is required"), {
        statusCode: 400,
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    }).session(session);

    if (!order) {
      throw Object.assign(new Error("Order not found"), { statusCode: 404 });
    }

    if (order.orderStatus === "completed") {
      throw Object.assign(new Error("Cannot cancel a completed order"), {
        statusCode: 400,
      });
    }

    const oldOrder = { ...order.toObject() };

    // Restore inventory before cancelling
    const InventoryManager = require("../utils/inventoryManager");
    const inventoryRestoration = await InventoryManager.restoreOrderInventory(
      order,
      session,
    );

    if (!inventoryRestoration.success) {
      console.warn(
        "Inventory restoration had errors:",
        inventoryRestoration.errors,
      );
      // Continue with cancellation even if inventory restoration fails
      // Log the errors for manual review
    }

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

    await order.save({ session });

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Order",
      order._id,
      "delete",
      oldOrder,
      order,
      `Cancelled order #${order.orderNumber}: ${reason}. Inventory restored: ${inventoryRestoration.totalItemsRestored} items`,
      session,
    );

    if (!isExternalTransaction) await session.commitTransaction();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category allergens dietaryTags");

    // Notify KDS via WebSocket
    notifyKDS("order:cancelled", order, null, req.storeId);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
      inventoryRestored: inventoryRestoration.totalItemsRestored,
    });
  } catch (error) {
    if (!isExternalTransaction) await session.abortTransaction();
    console.error("Error cancelling order:", error);
    if (isExternalTransaction) throw error;
    const statusCode =
      error.statusCode || (error.kind === "ObjectId" ? 400 : 500);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to cancel order. Please try again.",
    });
  } finally {
    if (!isExternalTransaction) session.endSession();
  }
};

// Refund an order (full or partial)
const refundOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, reason, category = "other", isPartial } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Refund amount is required and must be greater than 0",
      });
    }

    if (!reason) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Refund reason is required",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate payment status
    if (order.paymentStatus !== "paid" && order.paymentStatus !== "partial") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Can only refund paid or partially paid orders",
      });
    }

    const refundAmount = parseFloat(amount);

    // Calculate total already refunded
    const totalRefunded = order.refunds
      .filter((r) => r.gatewayStatus === "succeeded")
      .reduce((sum, r) => sum + r.amount, 0);

    // Validate: refund amount cannot exceed remaining paid amount
    const remainingRefundable = order.amountPaid - totalRefunded;
    if (refundAmount > remainingRefundable) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Refund amount (${refundAmount.toFixed(
          2,
        )}) exceeds remaining refundable amount (${remainingRefundable.toFixed(
          2,
        )})`,
      });
    }

    // Duplicate refund detection (within last 60 seconds)
    const recentRefund = order.refunds.find(
      (r) =>
        r.amount === refundAmount &&
        r.reason === reason &&
        Date.now() - new Date(r.refundedAt).getTime() < 60000,
    );

    if (recentRefund) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message:
          "Duplicate refund detected. A refund with the same amount and reason was processed within the last minute.",
      });
    }

    const oldOrder = { ...order.toObject() };

    // Process gateway refund
    let gatewayRefundResult = null;
    const settings = await getEffectiveSettings(req.storeId);

    // Find the original payment transaction
    const originalPayment = order.paymentHistory.find(
      (p) => p.type === "payment" && p.method !== "cash",
    );

    if (originalPayment && originalPayment.method === "card") {
      // Process through payment gateway
      const gateways = settings.paymentGateways;

      if (gateways?.stripe?.enabled) {
        try {
          const {
            PaymentProviderFactory,
          } = require("../utils/paymentProvider");
          const provider = PaymentProviderFactory.getProvider(
            "stripe",
            gateways.stripe,
          );

          // Get payment intent ID from order
          const paymentIntentId =
            order.stripePaymentIntentId || originalPayment.transactionId;

          if (!paymentIntentId) {
            throw new Error("Payment intent ID not found for card refund");
          }

          gatewayRefundResult = await provider.refundPayment(
            paymentIntentId,
            refundAmount,
            reason,
            {
              orderId: order._id.toString(),
              orderNumber: order.orderNumber,
              refundedBy: req.user.id.toString(),
              category,
            },
          );

          if (!gatewayRefundResult.success) {
            await session.abortTransaction();
            return res.status(500).json({
              success: false,
              message: `Gateway refund failed: ${gatewayRefundResult.error}`,
              error: gatewayRefundResult.error,
            });
          }
        } catch (error) {
          await session.abortTransaction();
          console.error("Gateway refund error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to process refund through payment gateway",
            error: error.message,
          });
        }
      }
    }

    // Add refund entry
    const refundEntry = {
      amount: refundAmount,
      reason,
      category,
      refundedBy: req.user.id,
      refundedAt: new Date(),
      isPartial: isPartial !== false,
      originalPaymentMethod: originalPayment?.method || "cash",
      originalPaymentId: originalPayment?.transactionId,
    };

    // Add gateway information if available
    if (gatewayRefundResult) {
      refundEntry.gatewayRefundId = gatewayRefundResult.refundId;
      refundEntry.gatewayStatus = gatewayRefundResult.status;
      refundEntry.gatewayResponse = gatewayRefundResult;
    } else {
      // Cash refund - mark as succeeded immediately
      refundEntry.gatewayStatus = "succeeded";
    }

    order.refunds.push(refundEntry);

    // Add to payment history
    order.paymentHistory.push({
      type: "refund",
      method: refundEntry.originalPaymentMethod,
      amount: refundAmount,
      timestamp: new Date(),
      performedBy: req.user.id,
      note: reason,
      transactionId: gatewayRefundResult?.refundId,
    });

    // Update payment status only if gateway refund succeeded or was cash
    if (refundEntry.gatewayStatus === "succeeded") {
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

      // Restore inventory for refunded order (if not already prepared/served)
      const InventoryManager = require("../utils/inventoryManager");
      const inventoryRestoration = await InventoryManager.restoreOrderInventory(
        order,
        session,
      );

      if (!inventoryRestoration.success) {
        console.warn(
          "Inventory restoration had errors during refund:",
          inventoryRestoration.errors,
        );
        // Continue with refund even if inventory restoration fails
      }

      // Log inventory restoration in order metadata (optional)
      if (inventoryRestoration.totalItemsRestored > 0) {
        console.log(
          `Restored ${inventoryRestoration.totalItemsRestored} inventory items for refunded order #${order.orderNumber}`,
        );
      }
    }

    order.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: `Refunded ${refundAmount.toFixed(2)}: ${reason}`,
    };

    await order.save({ session });

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Refunded ${refundAmount.toFixed(2)} for order #${
        order.orderNumber
      }: ${reason}`,
      session,
    );

    await session.commitTransaction();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category allergens dietaryTags");
    await order.populate("refunds.refundedBy", "fullname");
    await order.populate("paymentHistory.performedBy", "fullname");

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: order,
      refundStatus: refundEntry.gatewayStatus,
    });
  } catch (error) {
    await session.abortTransaction();
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
  } finally {
    session.endSession();
  }
};

// Reopen a completed or cancelled order
const reopenOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reason, version } = req.body;

    if (!reason) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Reason for reopening is required",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // OPTIMISTIC LOCKING CHECK
    if (req.body.version !== undefined && order.version !== req.body.version) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Details have been updated by another user. Please refresh.",
        currentVersion: order.version,
        updatedOrder: order,
      });
    }

    // Increment version
    order.version = (order.version || 0) + 1;

    // Only allow reopening completed or cancelled orders
    if (!["completed", "cancelled"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot reopen order with status "${order.orderStatus}". Only completed or cancelled orders can be reopened.`,
      });
    }

    // CRITICAL: Check for refunds - prevent reopening refunded orders
    if (order.refunds && order.refunds.length > 0) {
      const successfulRefunds = order.refunds.filter(
        (r) => r.gatewayStatus === "succeeded",
      );
      if (successfulRefunds.length > 0) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message:
            "Cannot reopen an order that has been refunded. Please create a new order instead.",
          refundCount: successfulRefunds.length,
        });
      }
    }

    // Version check for optimistic locking
    if (version !== undefined && order.version !== version) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Order has been modified by another user. Please refresh.",
      });
    }

    const oldOrder = { ...order.toObject() };
    const wasCancelled = oldOrder.orderStatus === "cancelled";

    // If order was cancelled, we need to re-deduct inventory
    if (wasCancelled) {
      const InventoryManager = require("../utils/inventoryManager");
      const inventoryDeduction = await InventoryManager.deductOrderInventory(
        order,
        session,
      );

      if (!inventoryDeduction.success) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Insufficient inventory to reopen this order",
          errors: inventoryDeduction.errors,
        });
      }
    }

    // Update table status if dine-in order
    if (
      order.orderType === "dine-in" &&
      order.table &&
      order.table !== "Takeaway"
    ) {
      const Table = require("../models/Table");
      const table = await Table.findOne({
        tableNumber: order.table,
        storeId: req.storeId,
      }).session(session);

      if (table) {
        // Check if table is currently available
        if (
          table.status !== "available" &&
          table.currentOrder?.toString() !== order._id.toString()
        ) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Table ${order.table} is currently ${table.status}. Cannot reopen order.`,
          });
        }

        table.status = "occupied";
        table.currentOrder = order._id;
        table.timing.seatedAt = new Date();
        table.lastOccupiedAt = new Date();
        table.lastAction = {
          action: "state_change",
          performedBy: req.user.id,
          createdAt: new Date(),
          reason: `Reopened order #${order.orderNumber}`,
        };
        await table.save({ session });
      }
    }

    // Change status to pending
    order.orderStatus = "pending";

    // Reset completion timestamp if it was completed
    if (oldOrder.orderStatus === "completed") {
      order.completedAt = null;
    }

    // Reset item statuses
    order.orderItems.forEach((item) => {
      if (!item.voidInfo?.isVoided) {
        item.itemStatus = "pending";
      }
    });

    // Increment version for concurrency control
    order.version += 1;

    order.lastAction = {
      action: "reopen",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason,
    };

    await order.save({ session });

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Reopened order #${order.orderNumber}: ${reason}${
        wasCancelled ? " (inventory re-deducted)" : ""
      }`,
      session,
    );

    await session.commitTransaction();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category allergens dietaryTags");

    // Notify KDS via WebSocket
    notifyKDS("order:reopened", order, null, req.storeId);

    return res.status(200).json({
      success: true,
      message: "Order reopened successfully",
      data: order,
      inventoryRestored: wasCancelled,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error reopening order:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to reopen order. Please try again.",
      error: error.message,
    });
  } finally {
    session.endSession();
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
  reopenOrder,
};


