// backend/controllers/orderModificationController.js
const mongoose = require("mongoose");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const AddOnGroup = require("../models/AddOnGroup");
const InventoryItem = require("../models/InventoryItem");
const OrderModificationLog = require("../models/OrderModificationLog");
const GeneralSettings = require("../models/GeneralSettings"); // Keeping for legacy reference, but should use Store
const Store = require("../models/Store");
const logAction = require("../utils/logAction");
const { notifyKDS } = require("../utils/webSocket");

// Helper function to calculate add-ons total
const calculateAddOnsTotal = (addOns) => {
  if (!addOns || addOns.length === 0) return 0;
  return addOns.reduce((total, group) => {
    const groupTotal = group.selectedItems.reduce(
      (sum, item) => sum + (item.price || 0),
      0
    );
    return total + groupTotal;
  }, 0);
};

// Helper function to recalculate order totals
const recalculateOrderTotals = async (order, settings) => {
  const activeItems = order.orderItems.filter(
    (item) => !item.voidInfo?.isVoided
  );

  let subtotal = 0;
  let totalAddOns = 0;
  let totalTax = 0;
  const itemTaxes = [];

  for (const item of activeItems) {
    const itemSubtotal = item.price * item.quantity;
    const itemAddOns = item.addOnsTotal || 0;
    subtotal += itemSubtotal + itemAddOns;
    totalAddOns += itemAddOns;

    if (settings?.taxSettings?.enabled) {
      const taxRate = item.customTax?.enabled
        ? item.customTax.rate
        : settings.taxSettings.globalRate;

      if (settings.taxSettings.mode === "per-item") {
        const taxAmount = ((itemSubtotal + itemAddOns) * taxRate) / 100;
        totalTax += taxAmount;
        itemTaxes.push({
          menuItemId: item.menuItemId,
          name: item.name,
          taxRate,
          taxAmount,
        });
      }
    }
  }

  // Per-order tax calculation
  if (
    settings?.taxSettings?.enabled &&
    settings.taxSettings.mode === "per-order"
  ) {
    totalTax = (subtotal * settings.taxSettings.globalRate) / 100;
  }

  // Service charge
  let serviceCharge = 0;
  if (settings?.serviceCharge?.enabled) {
    const shouldApply =
      settings.serviceCharge.applyTo === "all" ||
      settings.serviceCharge.applyTo === order.orderType;
    if (shouldApply) {
      serviceCharge = (subtotal * settings.serviceCharge.rate) / 100;
    }
  }

  const packagingFee =
    order.orderType === "dine-in" ? 0 : order.packagingFee || 0;
  const deliveryFee =
    order.orderType === "delivery" ? order.deliveryFee || 0 : 0;

  const total =
    subtotal + totalTax + serviceCharge + packagingFee + deliveryFee;

  return {
    subtotal,
    totalTax,
    serviceCharge,
    itemTaxes,
    addOnsTotal: totalAddOns,
    total,
    packagingFee,
    deliveryFee,
  };
};

// [Legacy modifyOrder method removed to enforce transaction safety and store scoping]

// Add items// Modify an existing order (Optimistic Locking + Transaction)
exports.modifyOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const { items, reason, version } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      storeId: req.storeId,
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check version for optimistic locking
    if (order.version !== version) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message:
          "Order has been modified by another user. Please refresh and try again.",
      });
    }

    if (["completed", "cancelled"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cannot modify completed or cancelled orders",
      });
    }

    const oldOrder = { ...order.toObject() };
    const modificationDetails = [];
    const inventoryUpdates = [];
    let modificationCost = 0;

    // Process item modifications
    const newOrderItems = [];
    const processedItemIds = new Set();

    for (const item of items) {
      // Find existing item in order
      const existingItem = order.orderItems.id(item.itemId);

      // If item logic is complex (adding new items vs modifying existing),
      // for now assume we are modifying quantities of existing items or skipping
      // complex structural changes in this simplified endpoint.
      // But typically restart creates a fresh list.
      // Let's assume 'items' contains the desired state of ALL items?
      // Or just modifications?
      // The snippet suggests it handles modifications.

      if (existingItem) {
        processedItemIds.add(item.itemId);

        const oldQuantity = existingItem.quantity;
        const newQuantity = item.quantity;
        const quantityDifference = newQuantity - oldQuantity;

        // If quantity changed
        if (quantityDifference !== 0) {
          // We need to check inventory for increments
          // And restore for decrements

          // We need the menu item to find linked inventory
          const menuItem = await MenuItem.findOne({
            _id: existingItem.menuItemId,
            storeId: req.storeId,
          })
            .populate("addOnGroups")
            .session(session);

          if (menuItem) {
            // Menu Item Inventory Links
            const linkedInventory = await InventoryItem.find({
              "linkedMenuItems.menuItemId": menuItem._id,
              isActive: true,
              storeId: req.storeId,
            }).session(session);

            for (const invItem of linkedInventory) {
              const link = invItem.linkedMenuItems.find(
                (l) => l.menuItemId.toString() === menuItem._id.toString()
              );
              if (link) {
                const inventoryChange = -(
                  quantityDifference * link.quantityUsed
                );

                if (inventoryChange < 0) {
                  // Deducting stock
                  if (invItem.currentStock + inventoryChange < 0) {
                    await session.abortTransaction();
                    return res.status(400).json({
                      success: false,
                      message: `Insufficient stock for ${invItem.name}`,
                    });
                  }
                }

                invItem.currentStock += inventoryChange;
                await invItem.save({ session });

                inventoryUpdates.push({
                  inventoryItemId: invItem._id,
                  name: invItem.name,
                  change: inventoryChange,
                });
              }
            }

            // Add-ons Inventory
            if (existingItem.addOns && existingItem.addOns.length > 0) {
              for (const group of existingItem.addOns) {
                for (const addOn of group.selectedItems) {
                  if (addOn.inventoryItem) {
                    const invItem = await InventoryItem.findOne({
                      _id: addOn.inventoryItem,
                      storeId: req.storeId,
                    }).session(session);
                    if (invItem) {
                      const inventoryChange = -(
                        quantityDifference * (addOn.quantityUsed || 1)
                      );

                      if (
                        inventoryChange < 0 &&
                        invItem.currentStock + inventoryChange < 0
                      ) {
                        await session.abortTransaction();
                        return res.status(400).json({
                          success: false,
                          message: `Insufficient stock for add-on ${invItem.name}`,
                        });
                      }

                      invItem.currentStock += inventoryChange;
                      await invItem.save({ session });

                      inventoryUpdates.push({
                        inventoryItemId: invItem._id,
                        name: invItem.name,
                        change: inventoryChange,
                      });
                    }
                  }
                }
              }
            }
          }

          modificationDetails.push({
            itemId: existingItem._id,
            name: existingItem.name,
            oldQuantity,
            newQuantity,
            change: quantityDifference,
          });

          // Update item quantity and prices
          existingItem.quantity = newQuantity;
          existingItem.addOnsTotal =
            (existingItem.addOnsTotal / oldQuantity) * newQuantity;
          existingItem.subtotal =
            existingItem.price * newQuantity + existingItem.addOnsTotal;

          modificationCost += existingItem.price * quantityDifference;
          // Note: Add-on cost difference is included in subtotal recalc but simplified here for cost tracking
        }

        newOrderItems.push(existingItem);
      }
    }

    // Keep items not mentioned in the update?
    // Or is this a partial update?
    // Assuming partial update of specific items, preserving others.
    const preservedItems = order.orderItems.filter(
      (i) => !processedItemIds.has(i._id.toString())
    );
    order.orderItems = [...newOrderItems, ...preservedItems];

    // Recalculate totals
    const newSubtotal = order.orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const newAddOnsTotal = order.orderItems.reduce(
      (sum, item) => sum + (item.addOnsTotal || 0),
      0
    );

    // Recalculate tax
    const taxRate = order.taxBreakdown?.totalTax
      ? (order.taxBreakdown.totalTax / order.taxBreakdown.subtotal) * 100
      : 0;
    const newTax = (newSubtotal * taxRate) / 100;

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
    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = "paid";
      order.balance = 0;
    } else if (order.amountPaid > 0) {
      order.paymentStatus = "partial";
      order.balance = order.totalAmount - order.amountPaid;
    } else {
      order.balance = order.totalAmount;
    }

    order.version += 1;
    order.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || "Order modified",
    };

    await order.save({ session });

    // Log modification
    const modLog = new OrderModificationLog({
      orderId: order._id,
      modifiedBy: req.user.id,
      reason,
      changes: modificationDetails,
      inventoryUpdates,
      costDifference: modificationCost,
      storeId: req.storeId,
    });
    await modLog.save({ session });

    await logAction(
      req.user.id,
      req.storeId,
      "Order",
      order._id,
      "modify",
      oldOrder,
      order,
      `Modified order #${order.orderNumber}: ${reason}`,
      session
    );

    await session.commitTransaction();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

    res.status(200).json({
      success: true,
      message: "Order modified successfully",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error modifying order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to modify order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Add items to an existing order
exports.addItemsToOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const { items, reason } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Items array is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      storeId: req.storeId,
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (["completed", "cancelled"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot add items to ${order.orderStatus} order`,
      });
    }

    const store = await Store.findById(req.storeId).session(session);
    const settings = store?.settings;
    const oldOrder = { ...order.toObject() };
    const inventoryAdjustments = [];
    const addedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findOne({
        _id: item.menuItemId,
        storeId: req.storeId,
      })
        .populate("addOnGroups")
        .session(session);

      if (!menuItem) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Menu item not found: ${item.menuItemId}`,
        });
      }

      if (!menuItem.isAvailable) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`,
        });
      }

      // Process add-ons
      let addOnsTotal = 0;
      const processedAddOns = [];

      if (item.addOns && item.addOns.length > 0) {
        for (const addOn of item.addOns) {
          const addOnGroup = await AddOnGroup.findOne({
            _id: addOn.groupId,
            storeId: req.storeId,
          }).session(session);
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

              // Deduct inventory
              if (selectedItem.inventoryItem) {
                const inventoryItem = await InventoryItem.findOne({
                  _id: selectedItem.inventoryItem,
                  storeId: req.storeId,
                }).session(session);
                if (inventoryItem) {
                  const deduction =
                    (addOnItem.quantityUsed || 1) * (item.quantity || 1);
                  if (inventoryItem.currentStock < deduction) {
                    await session.abortTransaction();
                    return res.status(400).json({
                      success: false,
                      message: `Insufficient stock for add-on: ${addOnItem.name}`,
                    });
                  }
                  inventoryItem.currentStock -= deduction;
                  await inventoryItem.save({ session });
                  inventoryAdjustments.push({
                    inventoryItemId: inventoryItem._id,
                    name: inventoryItem.name,
                    quantityChange: -deduction,
                  });
                }
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

      const quantity = item.quantity || 1;
      const itemAddOnsTotal = addOnsTotal * quantity;

      const newItem = {
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        customizations: item.customizations || "",
        itemNote: item.itemNote || "",
        addOns: processedAddOns,
        addOnsTotal: itemAddOnsTotal,
        subtotal: menuItem.price * quantity + itemAddOnsTotal,
        itemStatus: "pending",
        preparationTime: menuItem.preparationTime || 15,
      };

      order.orderItems.push(newItem);
      addedItems.push(newItem);
    }

    // Recalculate totals
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
    order.balance = order.totalAmount - order.amountPaid;
    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = "paid";
      order.balance = 0;
    } else if (order.amountPaid > 0) {
      order.paymentStatus = "partial";
    } else {
      order.paymentStatus = "pending";
    }

    // Update modification tracking
    order.hasModifications = true;
    order.modificationCount = (order.modificationCount || 0) + 1;
    order.lastModifiedAt = new Date();
    order.lastModifiedBy = req.user.id;
    order.version += 1;

    order.lastAction = {
      action: "modify",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || `Added ${addedItems.length} item(s)`,
    };

    await order.save({ session });

    // Create modification log
    await OrderModificationLog.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      modificationType: "item_added",
      previousState: oldOrder,
      newState: order.toObject(),
      reason: reason || `Added ${addedItems.length} item(s)`,
      modifiedBy: req.user.id,
      inventoryAdjustments,
    }).session(session);

    // Notify KDS
    notifyKDS("order:updated", order, null, req.storeId);

    await session.commitTransaction();

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

    res.status(200).json({
      success: true,
      message: `Added ${addedItems.length} item(s) to order`,
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding items to order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add items to order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Remove items from an order
exports.removeItemsFromOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const { itemIds, reason } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Item IDs array is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      storeId: req.storeId,
    }).session(session);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (["completed", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove items from ${order.orderStatus} order`,
      });
    }

    const store = await Store.findById(req.storeId).session(session);
    const settings = store?.settings;
    const oldOrder = { ...order.toObject() };
    const inventoryAdjustments = [];
    const removedItems = [];

    for (const itemId of itemIds) {
      const itemIndex = order.orderItems.findIndex(
        (item) => item._id.toString() === itemId && !item.voidInfo?.isVoided
      );

      if (itemIndex === -1) continue;

      const removedItem = order.orderItems[itemIndex];
      removedItems.push({ ...removedItem.toObject() });

      // Restore inventory for add-ons
      if (removedItem.addOns) {
        for (const addOnGroup of removedItem.addOns) {
          for (const selectedItem of addOnGroup.selectedItems) {
            if (selectedItem.inventoryItem) {
              const inventoryItem = await InventoryItem.findOne({
                _id: selectedItem.inventoryItem,
                storeId: req.storeId,
              }).session(session);
              if (inventoryItem) {
                const restoreAmount =
                  (selectedItem.quantityUsed || 1) * removedItem.quantity;
                inventoryItem.currentStock += restoreAmount;
                await inventoryItem.save();
                inventoryAdjustments.push({
                  inventoryItemId: inventoryItem._id,
                  name: inventoryItem.name,
                  quantityChange: restoreAmount,
                });
              }
            }
          }
        }
      }

      // backend/controllers/orderModificationController.js (continued)
      // Remove the item
      order.orderItems.splice(itemIndex, 1);
    }

    if (removedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid items to remove",
      });
    }

    // Check if order has any remaining active items
    const activeItems = order.orderItems.filter(
      (item) => !item.voidInfo?.isVoided
    );

    if (activeItems.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot remove all items. Use cancel order instead, or void items to keep record.",
      });
    }

    // Recalculate totals
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
    } else {
      order.paymentStatus = "pending";
    }

    // Update modification tracking
    order.hasModifications = true;
    order.modificationCount = (order.modificationCount || 0) + 1;
    order.lastModifiedAt = new Date();
    order.lastModifiedBy = req.user.id;
    order.version += 1;

    order.lastAction = {
      action: "modify",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || `Removed ${removedItems.length} item(s)`,
    };

    await order.save();

    // Create modification log
    const modLog = new OrderModificationLog({
      orderId: order._id,
      orderNumber: order.orderNumber,
      modificationType: "item_removed",
      previousState: oldOrder,
      newState: order.toObject(),
      reason: reason || `Removed ${removedItems.length} item(s)`,
      modifiedBy: req.user.id,
      inventoryAdjustments,
      storeId: req.storeId,
    });
    await modLog.save({ session });

    // Notify KDS
    notifyKDS("order:updated", order, null, req.storeId);

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Removed ${removedItems.length} item(s) from order`,
      data: order,
      removedItems,
      inventoryRestored: inventoryAdjustments,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error removing items from order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove items from order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Update item quantity
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
    const oldOrder = { ...order.toObject() };
    const inventoryAdjustments = [];

    const oldQuantity = orderItem.quantity;
    const quantityDiff = quantity - oldQuantity;

    // Handle inventory adjustments for add-ons
    if (quantityDiff !== 0 && orderItem.addOns) {
      for (const addOnGroup of orderItem.addOns) {
        for (const selectedItem of addOnGroup.selectedItems) {
          if (selectedItem.inventoryItem) {
            const inventoryItem = await InventoryItem.findOne({
              _id: selectedItem.inventoryItem,
              storeId: req.storeId,
            });
            if (inventoryItem) {
              const inventoryChange =
                -quantityDiff * (selectedItem.quantityUsed || 1);

              // Check stock if increasing quantity
              if (
                quantityDiff > 0 &&
                inventoryItem.currentStock < Math.abs(inventoryChange)
              ) {
                return res.status(400).json({
                  success: false,
                  message: `Insufficient stock for add-on: ${selectedItem.name}`,
                });
              }

              inventoryItem.currentStock += inventoryChange;
              await inventoryItem.save();
              inventoryAdjustments.push({
                inventoryItemId: inventoryItem._id,
                name: inventoryItem.name,
                quantityChange: inventoryChange,
              });
            }
          }
        }
      }
    }

    // Update quantity and recalculate subtotal
    orderItem.quantity = quantity;
    const perItemAddOns =
      orderItem.addOnsTotal > 0 ? orderItem.addOnsTotal / oldQuantity : 0;
    orderItem.addOnsTotal = perItemAddOns * quantity;
    orderItem.subtotal = orderItem.price * quantity + orderItem.addOnsTotal;

    // Recalculate order totals
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

    // Update modification tracking
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

    // Create modification log
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

    await order.populate("servedBy", "fullname");
    await order.populate("orderItems.menuItemId", "name category");

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

// Update item note
exports.updateItemNote = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { itemNote } = req.body;

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

    const oldNote = orderItem.itemNote;
    orderItem.itemNote = itemNote || "";

    order.hasModifications = true;
    order.lastModifiedAt = new Date();
    order.lastModifiedBy = req.user.id;
    order.version += 1;

    await order.save();

    // Create modification log
    await OrderModificationLog.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      modificationType: "note_updated",
      previousState: { itemId, oldNote },
      newState: { itemId, newNote: itemNote },
      reason: `Updated note for ${orderItem.name}`,
      modifiedBy: req.user.id,
      modifiedBy: req.user.id,
      inventoryAdjustments: [],
      storeId: req.storeId,
    });

    notifyKDS("order:updated", order, null, req.storeId);

    await order.populate("servedBy", "fullname");

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

// Update order note
exports.updateOrderNote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderNote } = req.body;

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

    const oldNote = order.orderNote;
    order.orderNote = orderNote || "";
    order.note = orderNote || ""; // Legacy field

    order.hasModifications = true;
    order.lastModifiedAt = new Date();
    order.lastModifiedBy = req.user.id;
    order.version += 1;

    await order.save();

    // Create modification log
    await OrderModificationLog.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      modificationType: "note_updated",
      previousState: { orderNote: oldNote },
      newState: { orderNote },
      reason: "Updated order note",
      modifiedBy: req.user.id,
      modifiedBy: req.user.id,
      inventoryAdjustments: [],
      storeId: req.storeId,
    });

    notifyKDS("order:updated", order, null, req.storeId);

    await order.populate("servedBy", "fullname");

    res.status(200).json({
      success: true,
      message: "Order note updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order note",
      error: error.message,
    });
  }
};

// Get modification history for an order
exports.getOrderModificationHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    const logs = await OrderModificationLog.find({
      orderId,
      storeId: req.storeId,
    })
      .populate("modifiedBy", "fullname email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching modification history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch modification history",
      error: error.message,
    });
  }
};

module.exports = exports;
