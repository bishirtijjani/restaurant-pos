const mongoose = require("mongoose");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const InventoryItem = require("../models/InventoryItem");
const OrderModificationLog = require("../models/OrderModificationLog");
const Store = require("../models/Store");
const Table = require("../models/Table"); // Added Table import
const { notifyKDS } = require("../utils/webSocket");

// Helper to get effective settings
const getEffectiveSettings = async (storeId) => {
  const store = await Store.findById(storeId).select("settings");
  return store?.settings || {};
};

// Helper: Recalculate Order Totals
const recalculateOrderTotals = async (order, settings) => {
  let subtotal = 0;
  let addOnsTotal = 0;
  let itemTaxes = [];

  // 1. Calculate items subtotal and add-ons
  for (const item of order.orderItems) {
    if (item.voidInfo?.isVoided) continue; // Skip voided items for total

    // Ensure item numbers are valid
    item.price = Number(item.price) || 0;
    item.quantity = Number(item.quantity) || 0;
    item.addOnsTotal = Number(item.addOnsTotal) || 0;

    // Recalculate item add-ons total just in case
    let currentAddOnsTotal = 0;
    if (item.addOns && item.addOns.length > 0) {
      item.addOns.forEach((group) => {
        group.addOnSubtotal = group.selectedItems.reduce(
          (sum, i) => sum + i.price * (i.quantityUsed || 1),
          0
        );
        currentAddOnsTotal += group.addOnSubtotal;
      });
      // Safety check if we want to enforce calculated vs stored
      // item.addOnsTotal = currentAddOnsTotal;
    }

    // Recalculate item subtotal
    item.subtotal = item.price * item.quantity + item.addOnsTotal;

    subtotal += item.price * item.quantity;
    addOnsTotal += item.addOnsTotal;

    // Tax Calculation per item
    // Assuming settings.taxRate is global, or item has tax category.
    // Adapting to existing logic if available, else simple global tax.
    // For now, using global tax from settings if individual not specified.

    let taxRate = 0;
    if (settings?.taxPercentage) {
      taxRate = settings.taxPercentage / 100;
    }
    // If item specific tax exists (future proofing), usage would go here.

    const itemTaxAmount = item.subtotal * taxRate;
    itemTaxes.push({
      menuItemId: item.menuItemId,
      name: item.name,
      taxRate: taxRate * 100,
      taxAmount: itemTaxAmount,
    });
  }

  // 2. Service Charge
  let serviceCharge = 0;
  // Use settings for service charge if applicable (e.g. dine-in only)
  if (settings?.serviceChargePercentage && order.orderType === "dine-in") {
    serviceCharge =
      (subtotal + addOnsTotal) * (settings.serviceChargePercentage / 100);
  }

  // 3. Discount Handling (Applied to Subtotal usually)
  // Logic usually handled by `discountController` but we need basic recalc here.
  // If order has `discountBreakdown`, we preserve the logic or re-apply?
  // For safety in modification, strictly speaking, we should probably REMOVE order-level discounts
  // because criteria might no longer be met (e.g. min spend).
  // The caller (modifyOrder) should handle removing invalid discounts.
  // Here we just use what's there if valid.
  // BUT for safety, `sanitizeOrderForModification` removes them. So we assume 0 discount here unless re-applied.

  const totalTax = itemTaxes.reduce((sum, t) => sum + t.taxAmount, 0);
  const total =
    subtotal +
    addOnsTotal +
    totalTax +
    serviceCharge +
    (order.packagingFee || 0) +
    (order.deliveryFee || 0);

  return {
    subtotal,
    addOnsTotal,
    itemTaxes,
    totalTax,
    serviceCharge,
    total,
  };
};

// Helper: Sanitize (Remove discounts)
const sanitizeOrderForModification = (order) => {
  // Remove order-level discounts to prevent calc errors
  if (order.discountBreakdown?.hasDiscount) {
    order.discountBreakdown = {
      hasDiscount: false,
      originalSubtotal: 0,
      totalDiscountAmount: 0,
      discountedSubtotal: 0,
      appliedDiscounts: [],
      itemDiscounts: [],
    };
    order.promoCodeUsed = null;
  }
};

// --------------------------------------------------------------------------
// ORDER MODIFICATION ENDPOINTS
// --------------------------------------------------------------------------

// Add Items to Order
exports.addItemsToOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const { items, reason } = req.body; // items: [{ menuItemId, quantity, customizations, addOns: [...] }]

    if (!items || items.length === 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    const order = await Order.findOne({
      _id: orderId,
      storeId: req.storeId,
    }).session(session);
    if (!order) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (["completed", "cancelled"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Cannot modify completed order" });
    }

    const store = await Store.findById(req.storeId).session(session);
    const settings = store?.settings;
    const addedItemsLog = [];
    const inventoryAdjustments = [];

    // Process each new item
    for (const itemData of items) {
      const menuItem = await MenuItem.findById(itemData.menuItemId).session(
        session
      );
      if (!menuItem) continue;

      // Inventory Check & Deduction
      if (menuItem.inventoryItem) {
        const invItem = await InventoryItem.findOne({
          _id: menuItem.inventoryItem,
          storeId: req.storeId,
        }).session(session);
        if (invItem) {
          const qtyNeeded = itemData.quantity * 1; // 1 unit per item
          if (invItem.currentStock < qtyNeeded) {
            await session.abortTransaction();
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for ${menuItem.name}`,
            });
          }
          invItem.currentStock -= qtyNeeded;
          await invItem.save({ session });
          inventoryAdjustments.push({
            inventoryItemId: invItem._id,
            name: invItem.name,
            quantityChange: -qtyNeeded,
          });
        }
      }

      // Add-ons Processing
      let itemAddOnsTotal = 0;
      const processedAddOns = [];
      if (itemData.addOns && itemData.addOns.length > 0) {
        // Logic to process add-ons and deduct their inventory
        // Simplified for brevity, assuming structure matches Schema
        processedAddOns.push(...itemData.addOns); // Deep validation would occur here
        itemData.addOns.forEach((group) => {
          itemAddOnsTotal += group.addOnSubtotal || 0;
        });
      }

      const newItem = {
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: itemData.quantity,
        customizations: itemData.customizations,
        itemNote: itemData.itemNote,
        addOns: processedAddOns,
        addOnsTotal: itemAddOnsTotal,
        subtotal: menuItem.price * itemData.quantity + itemAddOnsTotal,
        itemStatus: "pending",
      };

      order.orderItems.push(newItem);
      addedItemsLog.push(`${itemData.quantity}x ${menuItem.name}`);
    }

    // Recalculate
    sanitizeOrderForModification(order);
    const totals = await recalculateOrderTotals(order, settings);

    order.taxBreakdown = {
      items: totals.itemTaxes,
      totalTax: totals.totalTax,
      serviceCharge: totals.serviceCharge,
      subtotal: totals.subtotal,
    };
    order.addOnsTotal = totals.addOnsTotal;
    order.totalAmount = totals.total;

    // Update Balance
    order.balance = Math.max(0, order.totalAmount - order.amountPaid);
    if (order.amountPaid > 0 && order.amountPaid < order.totalAmount) {
      order.paymentStatus = "partial";
    } else if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = "paid";
      order.balance = 0;
    }

    // Meta updates
    order.hasModifications = true;
    order.modificationCount = (order.modificationCount || 0) + 1;
    order.lastModifiedAt = new Date();
    order.lastModifiedBy = req.user.id;
    order.version += 1;
    order.lastAction = {
      action: "modify",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || "Added items",
    };

    await order.save({ session });

    // Audit Log
    await OrderModificationLog.create(
      [
        {
          orderId: order._id,
          orderNumber: order.orderNumber,
          modificationType: "item_added",
          reason: reason || "Added items",
          modifiedBy: req.user.id,
          storeId: req.storeId,
          inventoryAdjustments,
          changes: addedItemsLog.map((name) => ({ name, change: "added" })),
        },
      ],
      { session }
    );

    notifyKDS("order:updated", order, null, req.storeId);

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order._id)
      .populate("servedBy", "fullname")
      .populate("orderItems.menuItemId", "name category");

    res
      .status(200)
      .json({ success: true, message: "Items added", data: populatedOrder });
  } catch (error) {
    await session.abortTransaction();
    console.error("Add Items Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add items",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Remove Items (Voiding/Removing before prep)
exports.removeItemsFromOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const { itemIds, reason } = req.body; // itemIds: [itemId, itemId...]

    if (!itemIds || itemIds.length === 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "No items selected" });
    }

    const order = await Order.findOne({
      _id: orderId,
      storeId: req.storeId,
    }).session(session);
    if (!order) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (["completed", "cancelled"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Cannot modify completed order" });
    }

    const store = await Store.findById(req.storeId).session(session);
    const settings = store?.settings;
    const removedItems = [];
    const inventoryAdjustments = [];

    for (const targetId of itemIds) {
      const itemIndex = order.orderItems.findIndex(
        (i) => i._id.toString() === targetId
      );
      if (itemIndex === -1) continue;

      const item = order.orderItems[itemIndex];

      // If item is already preparing/served, maybe we should VOID instead of remove?
      // For simplistic "Remove" (e.g. mistake correction before kitchen), we allow remove.
      // Real "Void" features might set a flag instead. Here we physically remove for simplicity or use void flag logic
      // if implemented. Let's assume physical removal for "correction".

      // Restore Inventory
      // Check if item had inventory linked
      // (Requires looking up MenuItem again or storing inv ID on item - Schema has inventoryItem on AddOns, usually on Item too?)
      // OrderItem schema has menuItemId.
      const menuItem = await MenuItem.findById(item.menuItemId).session(
        session
      );
      if (menuItem && menuItem.inventoryItem) {
        const invItem = await InventoryItem.findOne({
          _id: menuItem.inventoryItem,
        }).session(session);
        if (invItem) {
          invItem.currentStock += item.quantity;
          await invItem.save({ session });
          inventoryAdjustments.push({
            inventoryItemId: invItem._id,
            name: invItem.name,
            quantityChange: item.quantity,
          });
        }
      }

      removedItems.push(item.name);
      order.orderItems.splice(itemIndex, 1);
    }

    // Recalculate
    sanitizeOrderForModification(order);
    const totals = await recalculateOrderTotals(order, settings);

    order.taxBreakdown = {
      items: totals.itemTaxes,
      totalTax: totals.totalTax,
      serviceCharge: totals.serviceCharge,
      subtotal: totals.subtotal,
    };
    order.addOnsTotal = totals.addOnsTotal;
    order.totalAmount = totals.total;

    order.balance = Math.max(0, order.totalAmount - order.amountPaid);
    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = "paid";
      order.balance = 0;
    } else if (order.amountPaid > 0) {
      order.paymentStatus = "partial";
    } else {
      order.paymentStatus = "pending";
    }

    order.hasModifications = true;
    order.modificationCount = (order.modificationCount || 0) + 1;
    order.lastModifiedAt = new Date();
    order.lastModifiedBy = req.user.id;
    order.version += 1;
    order.lastAction = {
      action: "modify",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || "Removed items",
    };

    if (order.orderItems.length === 0) {
      order.orderStatus = "cancelled";
    }

    await order.save({ session });

    await OrderModificationLog.create(
      [
        {
          orderId: order._id,
          orderNumber: order.orderNumber,
          modificationType: "item_removed",
          reason: reason || "Removed items",
          modifiedBy: req.user.id,
          storeId: req.storeId,
          inventoryAdjustments,
          changes: removedItems.map((name) => ({ name, change: "removed" })),
        },
      ],
      { session }
    );

    notifyKDS("order:updated", order, null, req.storeId);

    await session.commitTransaction();

    res
      .status(200)
      .json({ success: true, message: "Items removed", data: order });
  } catch (error) {
    await session.abortTransaction();
    console.error("Remove Items Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Remove failed", error: error.message });
  } finally {
    session.endSession();
  }
};

exports.updateItemQuantity = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { quantity, reason } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity (>= 1) is required",
      });
    }

    const order = await Order.findOne({ _id: orderId, storeId: req.storeId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (["completed", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify ${order.orderStatus} order`,
      });
    }

    const orderItem = order.orderItems.id(itemId);

    if (!orderItem || orderItem.voidInfo?.isVoided) {
      return res.status(404).json({
        success: false,
        message: "Order item not found or already voided",
      });
    }

    const store = await Store.findById(req.storeId);
    const settings = store?.settings;
    const inventoryAdjustments = [];

    const oldQuantity = orderItem.quantity;
    const quantityDiff = quantity - oldQuantity;

    // Handle inventory adjustments for add-ons logic skipped for brevity, similar to Add Items

    // Update quantity and recalculate subtotal
    orderItem.quantity = quantity;
    const perItemAddOns =
      orderItem.addOnsTotal > 0 ? orderItem.addOnsTotal / oldQuantity : 0;
    orderItem.addOnsTotal = perItemAddOns * quantity;
    orderItem.subtotal = orderItem.price * quantity + orderItem.addOnsTotal;

    // Recalculate order totals
    sanitizeOrderForModification(order);
    const totals = await recalculateOrderTotals(order, settings);

    order.taxBreakdown = {
      items: totals.itemTaxes,
      totalTax: totals.totalTax,
      serviceCharge: totals.serviceCharge,
      subtotal: totals.subtotal,
    };
    order.addOnsTotal = totals.addOnsTotal;
    order.totalAmount = totals.total;

    // Update payment status
    order.balance = Math.max(0, order.totalAmount - order.amountPaid);
    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = "paid";
      order.balance = 0;
    } else if (order.amountPaid > 0) {
      order.paymentStatus = "partial";
    }

    order.hasModifications = true;
    order.modificationCount = (order.modificationCount || 0) + 1;
    order.lastModifiedAt = new Date();
    order.lastModifiedBy = req.user.id;
    order.version += 1;

    order.lastAction = {
      action: "modify",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason:
        reason ||
        `Changed ${orderItem.name} quantity from ${oldQuantity} to ${quantity}`,
    };

    await order.save();

    await OrderModificationLog.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      modificationType: "quantity_changed",
      previousState: { itemId, oldQuantity },
      newState: { itemId, newQuantity: quantity },
      reason:
        reason ||
        `Changed ${orderItem.name} quantity from ${oldQuantity} to ${quantity}`,
      modifiedBy: req.user.id,
      inventoryAdjustments,
      storeId: req.storeId,
    });

    notifyKDS("order:updated", order, null, req.storeId);

    res.status(200).json({
      success: true,
      message: "Item quantity updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item quantity",
      error: error.message,
    });
  }
};

exports.updateItemNote = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { itemNote } = req.body;

    const order = await Order.findOne({ _id: orderId, storeId: req.storeId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (["completed", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify ${order.orderStatus} order`,
      });
    }

    const orderItem = order.orderItems.id(itemId);

    if (!orderItem || orderItem.voidInfo?.isVoided) {
      return res.status(404).json({
        success: false,
        message: "Order item not found or already voided",
      });
    }

    const oldNote = orderItem.itemNote;
    orderItem.itemNote = itemNote || "";

    order.hasModifications = true;
    order.lastModifiedAt = new Date();
    order.lastModifiedBy = req.user.id;
    order.version += 1;

    await order.save();

    await OrderModificationLog.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      modificationType: "note_updated",
      previousState: { itemId, oldNote },
      newState: { itemId, newNote: itemNote },
      reason: `Updated note for ${orderItem.name}`,
      modifiedBy: req.user.id,
      storeId: req.storeId,
    });

    notifyKDS("order:updated", order, null, req.storeId);

    res.status(200).json({
      success: true,
      message: "Item note updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating item note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item note",
      error: error.message,
    });
  }
};

exports.getOrderModificationHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    const logs = await OrderModificationLog.find({
      orderId,
      storeId: req.storeId,
    })
      .sort({ createdAt: -1 })
      .populate("modifiedBy", "fullname role");

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching modification history:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch history" });
  }
};

// --------------------------------------------------------------------------
// SPLIT ORDER LOGIC
// --------------------------------------------------------------------------
exports.splitOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const { itemsToSplit, targetTableNumber, createNewOrder, version } =
      req.body;
    // itemsToSplit: [{ itemId, quantity }]

    if (!itemsToSplit || itemsToSplit.length === 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "No items selected to split" });
    }

    const sourceOrder = await Order.findOne({
      _id: orderId,
      storeId: req.storeId,
    }).session(session);
    if (!sourceOrder) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Source order not found" });
    }

    // Version Check (Optimistic Locking)
    if (version !== undefined && sourceOrder.version !== version) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Order has been modified by another user. Please refresh.",
      });
    }

    if (["completed", "cancelled"].includes(sourceOrder.orderStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cannot split completed or cancelled orders",
      });
    }

    // Payment Check
    if (sourceOrder.amountPaid > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message:
          "Cannot split an order with existing payments. Please void payments first.",
      });
    }

    const store = await Store.findById(req.storeId).session(session);
    const settings = store?.settings;

    // 1. Prepare Target Order
    let targetOrder;

    if (createNewOrder) {
      const OrderModel = mongoose.model("Order");
      targetOrder = new OrderModel({
        storeId: req.storeId,
        organizationId: req.organizationId,
        table: targetTableNumber ? targetTableNumber : "Takeaway",
        customerDetails: {
          ...sourceOrder.customerDetails,
          name: sourceOrder.customerDetails.name + " (Split)",
        },
        orderType: targetTableNumber ? "dine-in" : "takeaway",
        servedBy: req.user.id,
        orderStatus: sourceOrder.orderStatus,
        orderItems: [],
        payments: [],
        amountPaid: 0,
        balance: 0,
        lastAction: {
          action: "create",
          performedBy: req.user.id,
          createdAt: new Date(),
          reason: "Split from Order #" + sourceOrder.orderNumber,
        },
      });

      if (targetTableNumber && targetTableNumber !== "Takeaway") {
        const targetTableDoc = await Table.findOne({
          tableNumber: targetTableNumber,
          storeId: req.storeId,
        }).session(session);
        if (targetTableDoc) {
          targetTableDoc.status = "occupied";
          targetTableDoc.currentOrder = targetOrder._id;
          await targetTableDoc.save({ session });
        }
      }
    } else {
      if (targetTableNumber) {
        const existingTarget = await Order.findOne({
          storeId: req.storeId,
          table: targetTableNumber,
          orderStatus: { $in: ["pending", "preparing", "ready", "served"] },
        }).session(session);

        if (existingTarget) {
          targetOrder = existingTarget;
        } else {
          const OrderModel = mongoose.model("Order");
          targetOrder = new OrderModel({
            storeId: req.storeId,
            organizationId: req.organizationId,
            table: targetTableNumber,
            customerDetails: { name: "Walk-in" },
            orderType: "dine-in",
            servedBy: req.user.id,
            orderStatus: "pending",
            orderItems: [],
            lastAction: {
              action: "create",
              performedBy: req.user.id,
              reason: "Split from Order #" + sourceOrder.orderNumber,
            },
          });

          if (targetTableNumber && targetTableNumber !== "Takeaway") {
            const targetTableDoc = await Table.findOne({
              tableNumber: targetTableNumber,
              storeId: req.storeId,
            }).session(session);
            if (targetTableDoc) {
              targetTableDoc.status = "occupied";
              targetTableDoc.currentOrder = targetOrder._id;
              await targetTableDoc.save({ session });
            }
          }
        }
      } else {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Target destination required (New Order or Table)",
        });
      }
    }

    // 2. Move Items
    const movedItemsLog = [];

    for (const splitItem of itemsToSplit) {
      const sourceItemIndex = sourceOrder.orderItems.findIndex(
        (i) => i._id.toString() === splitItem.itemId
      );
      if (sourceItemIndex === -1) continue;

      const sourceItem = sourceOrder.orderItems[sourceItemIndex];
      const splitQty = Number(splitItem.quantity);

      if (splitQty > sourceItem.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Cannot split more than available quantity for ${sourceItem.name}`,
        });
      }

      // Safe Clone
      const itemClone = JSON.parse(
        JSON.stringify(sourceItem.toObject ? sourceItem.toObject() : sourceItem)
      );
      itemClone._id = new mongoose.Types.ObjectId();
      itemClone.quantity = splitQty;

      const perItemAddOns = sourceItem.addOnsTotal / sourceItem.quantity;
      itemClone.addOnsTotal = perItemAddOns * splitQty;
      itemClone.subtotal = itemClone.price * splitQty + itemClone.addOnsTotal;

      targetOrder.orderItems.push(itemClone);
      movedItemsLog.push(`${splitQty}x ${sourceItem.name}`);

      if (sourceItem.quantity === splitQty) {
        sourceOrder.orderItems.splice(sourceItemIndex, 1);
      } else {
        sourceItem.quantity -= splitQty;
        sourceItem.addOnsTotal -= itemClone.addOnsTotal;
        sourceItem.subtotal =
          sourceItem.price * sourceItem.quantity + sourceItem.addOnsTotal;
      }
    }

    if (sourceOrder.orderItems.length === 0) {
      sourceOrder.orderStatus = "cancelled";
      sourceOrder.lastAction.reason = "Fully split to new order";

      if (sourceOrder.table && sourceOrder.table !== "Takeaway") {
        const sourceTableDoc = await Table.findOne({
          tableNumber: sourceOrder.table,
          storeId: req.storeId,
        }).session(session);
        if (
          sourceTableDoc &&
          String(sourceTableDoc.currentOrder) === String(sourceOrder._id)
        ) {
          sourceTableDoc.status = "available";
          sourceTableDoc.currentOrder = null;
          await sourceTableDoc.save({ session });
        }
      }
    }

    // 3. Recalculate Totals
    sanitizeOrderForModification(sourceOrder);
    if (targetOrder.isNew || !targetOrder.discountBreakdown?.hasDiscount) {
      sanitizeOrderForModification(targetOrder);
    }

    const sourceTotals = await recalculateOrderTotals(sourceOrder, settings);
    sourceOrder.taxBreakdown = {
      items: sourceTotals.itemTaxes,
      totalTax: sourceTotals.totalTax,
      serviceCharge: sourceTotals.serviceCharge,
      subtotal: sourceTotals.subtotal,
    };
    sourceOrder.addOnsTotal = sourceTotals.addOnsTotal;
    sourceOrder.totalAmount = sourceTotals.total;
    sourceOrder.balance = Math.max(
      0,
      sourceOrder.totalAmount - sourceOrder.amountPaid
    );

    const targetTotals = await recalculateOrderTotals(targetOrder, settings);
    targetOrder.taxBreakdown = {
      items: targetTotals.itemTaxes,
      totalTax: targetTotals.totalTax,
      serviceCharge: targetTotals.serviceCharge,
      subtotal: targetTotals.subtotal,
    };
    targetOrder.addOnsTotal = targetTotals.addOnsTotal;
    targetOrder.totalAmount = targetTotals.total;
    targetOrder.balance = Math.max(
      0,
      targetOrder.totalAmount - targetOrder.amountPaid
    );

    // 4. Save
    sourceOrder.modificationCount = (sourceOrder.modificationCount || 0) + 1;
    sourceOrder.version += 1;

    await sourceOrder.save({ session });
    await targetOrder.save({ session });

    // 5. Audit Log (Source)
    await OrderModificationLog.create(
      [
        {
          orderId: sourceOrder._id,
          orderNumber: sourceOrder.orderNumber,
          modificationType: "split_from",
          reason: `Items split to new/other order`,
          modifiedBy: req.user.id,
          storeId: req.storeId,
          changes: movedItemsLog.map((desc) => ({
            name: desc,
            change: "moved_out",
          })),
        },
      ],
      { session }
    );

    // 6. Audit Log (Target)
    await OrderModificationLog.create(
      [
        {
          orderId: targetOrder._id,
          orderNumber: targetOrder.orderNumber,
          modificationType: "split_to",
          reason: `Items received from Order #${sourceOrder.orderNumber}`,
          modifiedBy: req.user.id,
          storeId: req.storeId,
          changes: movedItemsLog.map((desc) => ({
            name: desc,
            change: "moved_in",
          })),
        },
      ],
      { session }
    );

    notifyKDS("order:updated", sourceOrder, null, req.storeId);
    notifyKDS("order:created", targetOrder, null, req.storeId);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Order split successfully",
      sourceOrder,
      targetOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Split Order Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Split failed", error: error.message });
  } finally {
    session.endSession();
  }
};

// --------------------------------------------------------------------------
// MERGE ORDER LOGIC
// --------------------------------------------------------------------------
exports.mergeOrders = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { sourceOrderIds, targetOrderId } = req.body;

    if (!sourceOrderIds || sourceOrderIds.length === 0 || !targetOrderId) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Source and Target orders required" });
    }

    const store = await Store.findById(req.storeId).session(session);
    const settings = store?.settings;

    const targetOrder = await Order.findOne({
      _id: targetOrderId,
      storeId: req.storeId,
    }).session(session);
    if (!targetOrder) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Target order not found" });
    }

    const sourceOrders = await Order.find({
      _id: { $in: sourceOrderIds },
      storeId: req.storeId,
    }).session(session);

    if (sourceOrders.length !== sourceOrderIds.length) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Some source orders not found" });
    }

    let mergeLog = [];

    for (const source of sourceOrders) {
      if (source._id.toString() === targetOrder._id.toString()) continue; // Skip self

      for (const item of source.orderItems) {
        const itemClone = JSON.parse(
          JSON.stringify(item.toObject ? item.toObject() : item)
        );
        itemClone._id = new mongoose.Types.ObjectId();
        targetOrder.orderItems.push(itemClone);
      }

      if (source.payments && source.payments.length > 0) {
        for (const p of source.payments) {
          const pClone = p.toObject ? p.toObject() : { ...p };
          if (pClone._id) delete pClone._id; // New ID
          targetOrder.payments.push(pClone);
          targetOrder.paymentHistory.push({
            ...pClone,
            type: "payment",
            note: `Transfer from Merged Order #${source.orderNumber}`,
            performedBy: req.user.id,
          });
          targetOrder.amountPaid += p.amount;
        }
      }

      mergeLog.push(`Merged Order #${source.orderNumber}`);

      source.orderStatus = "cancelled";
      source.lastAction = {
        action: "cancel",
        performedBy: req.user.id,
        reason: `Merged into Order #${targetOrder.orderNumber}`,
        createdAt: new Date(),
      };
      source.orderNote += ` [MERGED INTO #${targetOrder.orderNumber}]`;
      await source.save({ session });

      // Release Source Table
      if (source.table && source.table !== "Takeaway") {
        const sourceTableDoc = await Table.findOne({
          tableNumber: source.table,
          storeId: req.storeId,
        }).session(session);
        if (
          sourceTableDoc &&
          String(sourceTableDoc.currentOrder) === String(source._id)
        ) {
          sourceTableDoc.status = "available";
          sourceTableDoc.currentOrder = null;
          await sourceTableDoc.save({ session });
        }
      }
    }

    sanitizeOrderForModification(targetOrder);

    const totals = await recalculateOrderTotals(targetOrder, settings);
    targetOrder.taxBreakdown = {
      items: totals.itemTaxes,
      totalTax: totals.totalTax,
      serviceCharge: totals.serviceCharge,
      subtotal: totals.subtotal,
    };
    targetOrder.addOnsTotal = totals.addOnsTotal;
    targetOrder.totalAmount = totals.total;
    targetOrder.balance = Math.max(
      0,
      targetOrder.totalAmount - targetOrder.amountPaid
    );

    // Auto-update payment status
    if (targetOrder.amountPaid >= targetOrder.totalAmount) {
      targetOrder.paymentStatus = "paid";
      targetOrder.balance = 0;
    } else if (targetOrder.amountPaid > 0) {
      targetOrder.paymentStatus = "partial";
    }

    targetOrder.lastAction = {
      action: "update",
      performedBy: req.user.id,
      reason:
        "Merged with orders: " +
        sourceOrders.map((o) => o.orderNumber).join(", "),
      createdAt: new Date(),
    };

    await targetOrder.save({ session });

    await OrderModificationLog.create(
      [
        {
          orderId: targetOrder._id,
          orderNumber: targetOrder.orderNumber,
          modificationType: "merge",
          reason: "Merged source orders",
          modifiedBy: req.user.id,
          storeId: req.storeId,
          changes: mergeLog.map((l) => ({ name: l, change: "merged_in" })),
        },
      ],
      { session }
    );

    notifyKDS("order:updated", targetOrder, null, req.storeId);
    for (const s of sourceOrders) {
      notifyKDS("order:updated", s, null, req.storeId);
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Orders merged successfully",
      data: targetOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Merge Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Merge failed", error: error.message });
  } finally {
    session.endSession();
  }
};

exports.updateOrderNote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderNote } = req.body;

    const order = await Order.findOne({ _id: orderId, storeId: req.storeId });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.orderNote = orderNote;
    order.lastAction = {
      action: "update_note",
      performedBy: req.user.id,
      reason: "Updated order note",
      createdAt: new Date(),
    };

    await order.save();

    await OrderModificationLog.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      modificationType: "note_updated",
      reason: "Updated order note",
      modifiedBy: req.user.id,
      storeId: req.storeId,
    });

    notifyKDS("order:updated", order, null, req.storeId);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update note" });
  }
};

exports.modifyOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const { orderItems, orderNote, reason, expectedVersion } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      storeId: req.storeId,
    }).session(session);
    if (!order) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (expectedVersion !== undefined && order.version !== expectedVersion) {
      await session.abortTransaction();
      return res
        .status(409)
        .json({
          success: false,
          message: "Order modified by another user",
          currentVersion: order.version,
        });
    }

    if (["completed", "cancelled"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Cannot modify completed order" });
    }

    if (orderNote !== undefined) order.orderNote = orderNote;

    const currentItemMap = new Map(
      order.orderItems.map((i) => [i._id.toString(), i])
    );
    const targetItemIds = new Set(
      orderItems.filter((i) => !i.isNew && i._id).map((i) => i._id.toString())
    );

    const itemsToRemove = order.orderItems.filter(
      (i) => !targetItemIds.has(i._id.toString())
    );
    const itemsToAdd = orderItems.filter((i) => i.isNew);
    const itemsToUpdate = orderItems.filter(
      (i) => !i.isNew && i._id && currentItemMap.has(i._id.toString())
    );

    const store = await Store.findById(req.storeId).session(session);
    const settings = store?.settings;
    const changesLog = [];
    const inventoryAdjustments = [];

    // Removals
    for (const item of itemsToRemove) {
      // Restore stock logic
      const menuItem = await MenuItem.findById(item.menuItemId).session(
        session
      );
      if (menuItem && menuItem.inventoryItem) {
        const invItem = await InventoryItem.findOne({
          _id: menuItem.inventoryItem,
        }).session(session);
        if (invItem) {
          invItem.currentStock += item.quantity;
          await invItem.save({ session });
          inventoryAdjustments.push({
            inventoryItemId: invItem._id,
            name: invItem.name,
            quantityChange: item.quantity,
          });
        }
      }
      order.orderItems.pull(item._id);
      changesLog.push({ name: item.name, change: "removed" });
    }

    // Updates
    for (const updateData of itemsToUpdate) {
      const item = currentItemMap.get(updateData._id.toString());
      const qtyDiff = updateData.quantity - item.quantity;

      if (qtyDiff !== 0) {
        const menuItem = await MenuItem.findById(item.menuItemId).session(
          session
        );
        if (menuItem && menuItem.inventoryItem) {
          const invItem = await InventoryItem.findOne({
            _id: menuItem.inventoryItem,
          }).session(session);
          if (invItem) {
            if (invItem.currentStock < qtyDiff) {
              await session.abortTransaction();
              return res
                .status(400)
                .json({
                  success: false,
                  message: `Insufficient stock for ${menuItem.name}`,
                });
            }
            invItem.currentStock -= qtyDiff;
            await invItem.save({ session });
            inventoryAdjustments.push({
              inventoryItemId: invItem._id,
              name: invItem.name,
              quantityChange: -qtyDiff,
            });
          }
        }
        item.quantity = updateData.quantity;
        changesLog.push({
          name: item.name,
          change: "updated_qty",
          from: item.quantity - qtyDiff,
          to: item.quantity,
        });
      }
      if (updateData.itemNote !== undefined)
        item.itemNote = updateData.itemNote;

      // AddOns Logic here if needed
      // Assuming AddOns immutable in simplified logic
      const perItemAddOns = item.addOnsTotal / (item.quantity - qtyDiff); // Approximation
      item.addOnsTotal = perItemAddOns * item.quantity;
      item.subtotal = item.price * item.quantity + item.addOnsTotal;
    }

    // Additions
    for (const itemData of itemsToAdd) {
      const menuItem = await MenuItem.findById(itemData.menuItemId).session(
        session
      );
      if (!menuItem) continue;

      if (menuItem.inventoryItem) {
        const invItem = await InventoryItem.findOne({
          _id: menuItem.inventoryItem,
        }).session(session);
        if (invItem) {
          if (invItem.currentStock < itemData.quantity) {
            await session.abortTransaction();
            return res
              .status(400)
              .json({
                success: false,
                message: `Insufficient stock for ${menuItem.name}`,
              });
          }
          invItem.currentStock -= itemData.quantity;
          await invItem.save({ session });
          inventoryAdjustments.push({
            inventoryItemId: invItem._id,
            name: invItem.name,
            quantityChange: -itemData.quantity,
          });
        }
      }

      let addOnsTotal = 0;
      if (itemData.addOns) {
        itemData.addOns.forEach((g) => (addOnsTotal += g.addOnSubtotal || 0));
      }

      const newItem = {
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: itemData.quantity,
        itemNote: itemData.itemNote,
        addOns: itemData.addOns || [],
        addOnsTotal: addOnsTotal,
        subtotal: menuItem.price * itemData.quantity + addOnsTotal,
        itemStatus: "pending",
      };
      order.orderItems.push(newItem);
      changesLog.push({ name: menuItem.name, change: "added" });
    }

    sanitizeOrderForModification(order);
    const totals = await recalculateOrderTotals(order, settings);
    order.taxBreakdown = {
      items: totals.itemTaxes,
      totalTax: totals.totalTax,
      serviceCharge: totals.serviceCharge,
      subtotal: totals.subtotal,
    };
    order.addOnsTotal = totals.addOnsTotal;
    order.totalAmount = totals.total;
    order.balance = Math.max(0, order.totalAmount - order.amountPaid);

    order.modificationCount = (order.modificationCount || 0) + 1;
    order.version += 1;
    order.lastAction = {
      action: "modify",
      performedBy: req.user.id,
      reason: reason || "Bulk modification",
      createdAt: new Date(),
    };

    await order.save({ session });

    await OrderModificationLog.create(
      [
        {
          orderId: order._id,
          orderNumber: order.orderNumber,
          modificationType: "bulk_modify",
          reason: reason,
          modifiedBy: req.user.id,
          storeId: req.storeId,
          inventoryAdjustments,
          changes: changesLog,
        },
      ],
      { session }
    );

    notifyKDS("order:updated", order, null, req.storeId);
    await session.commitTransaction();

    res
      .status(200)
      .json({ success: true, message: "Order modified", data: order });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Modify failed", error: error.message });
  } finally {
    session.endSession();
  }
};
