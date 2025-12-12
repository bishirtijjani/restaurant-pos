// backend/controllers/voidController.js
const mongoose = require("mongoose");
const Order = require("../models/Order");
const VoidLog = require("../models/VoidLog");
const InventoryItem = require("../models/InventoryItem");
const logAction = require("../utils/logAction");

// Void specific items from an order
exports.voidOrderItems = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const { itemIds, reason } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Item IDs array is required",
      });
    }

    if (!reason || reason.trim() === "") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Void reason is required",
      });
    }

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Cannot void items from completed or cancelled orders
    if (["completed", "cancelled"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot void items from ${order.orderStatus} order`,
      });
    }

    const oldOrder = { ...order.toObject() };
    const voidedItems = [];
    const restoredInventoryItems = [];
    let totalVoidedAmount = 0;

    // Process each item to void
    for (const itemId of itemIds) {
      const orderItem = order.orderItems.id(itemId);

      if (!orderItem) {
        continue; // Skip if item not found
      }

      if (orderItem.voidInfo?.isVoided) {
        continue; // Skip already voided items
      }

      // Calculate item total including add-ons
      const itemTotal = orderItem.subtotal;
      totalVoidedAmount += itemTotal;

      // Store voided item info
      voidedItems.push({
        menuItemId: orderItem.menuItemId,
        name: orderItem.name,
        price: orderItem.price,
        quantity: orderItem.quantity,
        subtotal: orderItem.subtotal,
        addOns: orderItem.addOns,
        itemNote: orderItem.itemNote,
      });

      // Mark item as voided
      orderItem.voidInfo = {
        isVoided: true,
        voidedAt: new Date(),
        voidedBy: req.user.id,
        voidReason: reason,
      };
      orderItem.itemStatus = "voided";

      // Restore inventory for main item (if linked)
      // Note: This would require menu item to have inventory links
      // For now, we handle add-on inventory restoration

      // Restore inventory for add-ons
      if (orderItem.addOns && orderItem.addOns.length > 0) {
        for (const addOnGroup of orderItem.addOns) {
          for (const selectedItem of addOnGroup.selectedItems) {
            if (selectedItem.inventoryItem) {
              const quantityToRestore =
                (selectedItem.quantityUsed || 1) * orderItem.quantity;

              const inventoryItem = await InventoryItem.findById(
                selectedItem.inventoryItem
              ).session(session);

              if (inventoryItem) {
                inventoryItem.currentStock += quantityToRestore;
                await inventoryItem.save({ session });

                restoredInventoryItems.push({
                  inventoryItemId: inventoryItem._id,
                  name: inventoryItem.name,
                  quantityRestored: quantityToRestore,
                });
              }
            }
          }
        }
      }
    }

    if (voidedItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "No valid items to void",
      });
    }

    // Update order totals
    order.hasVoidedItems = true;
    order.voidedItemsCount = (order.voidedItemsCount || 0) + voidedItems.length;
    order.totalVoidedAmount =
      (order.totalVoidedAmount || 0) + totalVoidedAmount;

    // Recalculate order total (excluding voided items)
    const activeItems = order.orderItems.filter(
      (item) => !item.voidInfo?.isVoided
    );
    const newSubtotal = activeItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const newAddOnsTotal = activeItems.reduce(
      (sum, item) => sum + (item.addOnsTotal || 0),
      0
    );

    // Recalculate tax on new subtotal
    const taxRate = order.taxBreakdown?.totalTax
      ? (order.taxBreakdown.totalTax / order.taxBreakdown.subtotal) * 100
      : 0;
    const newTax = (newSubtotal * taxRate) / 100;

    // Update order totals
    order.taxBreakdown.subtotal = newSubtotal;
    order.taxBreakdown.totalTax = newTax;
    order.addOnsTotal = newAddOnsTotal;
    order.totalAmount =
      newSubtotal +
      newTax +
      (order.taxBreakdown.serviceCharge || 0) +
      (order.packagingFee || 0) +
      (order.deliveryFee || 0);

    // Update balance
    order.balance = Math.max(0, order.totalAmount - order.amountPaid);
    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = "paid";
      order.balance = 0;
    } else if (order.amountPaid > 0) {
      order.paymentStatus = "partial";
    }

    order.lastAction = {
      action: "void_item",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason,
    };

    order.version += 1;

    await order.save({ session });

    // Create void log entry
    // Use create with array for session support, or new VoidLog + save
    const voidLog = new VoidLog({
      orderId: order._id,
      orderNumber: order.orderNumber,
      voidedItems,
      reason,
      totalVoidedAmount,
      voidedBy: req.user.id,
      inventoryRestored: restoredInventoryItems.length > 0,
      restoredItems: restoredInventoryItems,
    });
    await voidLog.save({ session });

    // Log the action
    await logAction(
      req.user.id,
      "Order",
      order._id,
      "void_item",
      oldOrder,
      order,
      `Voided ${voidedItems.length} items from order #${order.orderNumber}: ${reason}`,
      session
    );

    await session.commitTransaction();

    // Populate for response
    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

    res.status(200).json({
      success: true,
      message: `Successfully voided ${voidedItems.length} item(s)`,
      data: {
        order,
        voidLog,
        totalVoidedAmount,
        restoredInventory: restoredInventoryItems,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error voiding order items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to void order items",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Get void logs for an order
exports.getVoidLogsForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const voidLogs = await VoidLog.find({ orderId })
      .populate("voidedBy", "fullname email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: voidLogs.length,
      data: voidLogs,
    });
  } catch (error) {
    console.error("Error fetching void logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch void logs",
      error: error.message,
    });
  }
};

// Get all void logs (with filters)
exports.getAllVoidLogs = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    let filter = {};

    if (userId) filter.voidedBy = userId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const voidLogs = await VoidLog.find(filter)
      .populate("voidedBy", "fullname email")
      .populate("orderId", "orderNumber orderStatus")
      .sort({ createdAt: -1 });

    // Calculate summary
    const totalVoidedAmount = voidLogs.reduce(
      (sum, log) => sum + log.totalVoidedAmount,
      0
    );
    const totalVoidedItems = voidLogs.reduce(
      (sum, log) => sum + log.voidedItems.length,
      0
    );

    res.status(200).json({
      success: true,
      count: voidLogs.length,
      summary: {
        totalVoidedAmount,
        totalVoidedItems,
        totalVoidTransactions: voidLogs.length,
      },
      data: voidLogs,
    });
  } catch (error) {
    console.error("Error fetching void logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch void logs",
      error: error.message,
    });
  }
};

module.exports = exports;
