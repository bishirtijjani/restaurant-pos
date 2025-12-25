const InventoryItem = require("../models/InventoryItem");
const MenuItem = require("../models/MenuItem");

/**
 * Inventory Manager Utility
 * Handles inventory deduction and restoration for orders
 */
class InventoryManager {
  /**
   * Restore inventory for a cancelled or refunded order
   * @param {Object} order - The order document
   * @param {Object} session - Mongoose session for transaction
   * @param {Array} itemsToRestore - Specific items to restore (for partial refunds)
   * @returns {Object} Restoration summary
   */
  static async restoreOrderInventory(order, session, itemsToRestore = null) {
    const restorations = [];
    const errors = [];

    // Determine which items to restore
    const itemsForRestoration = itemsToRestore || order.orderItems;

    // Only restore if order was in early stages (not prepared/served)
    const restorableStatuses = ["pending", "preparing"];

    for (const orderItem of itemsForRestoration) {
      // Skip if item was already prepared/served/completed
      if (!restorableStatuses.includes(orderItem.itemStatus)) {
        continue;
      }

      // Skip voided items
      if (orderItem.voidInfo?.isVoided) {
        continue;
      }

      try {
        // Restore menu item ingredients
        const menuItemRestoration = await this.restoreMenuItemInventory(
          orderItem.menuItemId,
          orderItem.quantity,
          order.storeId,
          session
        );
        restorations.push(...menuItemRestoration);

        // Restore add-on inventory
        if (orderItem.addOns && orderItem.addOns.length > 0) {
          const addOnRestoration = await this.restoreAddOnInventory(
            orderItem.addOns,
            orderItem.quantity,
            order.storeId,
            session
          );
          restorations.push(...addOnRestoration);
        }
      } catch (error) {
        errors.push({
          item: orderItem.name,
          itemId: orderItem._id,
          error: error.message,
        });
      }
    }

    return {
      success: errors.length === 0,
      restorations,
      errors,
      totalItemsRestored: restorations.length,
    };
  }

  /**
   * Restore inventory for menu item ingredients
   */
  static async restoreMenuItemInventory(
    menuItemId,
    quantity,
    storeId,
    session
  ) {
    const restorations = [];

    const linkedInventory = await InventoryItem.find({
      "linkedMenuItems.menuItemId": menuItemId,
      isActive: true,
      storeId,
    }).session(session);

    for (const invItem of linkedInventory) {
      const link = invItem.linkedMenuItems.find(
        (l) => l.menuItemId.toString() === menuItemId.toString()
      );

      if (link) {
        const quantityToRestore = link.quantityUsed * quantity;
        const oldStock = invItem.currentStock;

        invItem.currentStock += quantityToRestore;
        await invItem.save({ session });

        restorations.push({
          inventoryItemId: invItem._id,
          name: invItem.name,
          quantityRestored: quantityToRestore,
          oldStock,
          newStock: invItem.currentStock,
          unit: invItem.unit,
        });
      }
    }

    return restorations;
  }

  /**
   * Restore inventory for add-ons
   */
  static async restoreAddOnInventory(addOns, quantity, storeId, session) {
    const restorations = [];

    for (const addOn of addOns) {
      for (const selectedItem of addOn.selectedItems) {
        if (selectedItem.inventoryItem) {
          const invItem = await InventoryItem.findOne({
            _id: selectedItem.inventoryItem,
            storeId,
          }).session(session);

          if (invItem) {
            const quantityToRestore =
              (selectedItem.quantityUsed || 1) * quantity;
            const oldStock = invItem.currentStock;

            invItem.currentStock += quantityToRestore;
            await invItem.save({ session });

            restorations.push({
              inventoryItemId: invItem._id,
              name: selectedItem.name,
              quantityRestored: quantityToRestore,
              oldStock,
              newStock: invItem.currentStock,
              unit: invItem.unit,
              isAddOn: true,
            });
          }
        }
      }
    }

    return restorations;
  }

  /**
   * Deduct inventory for an order (used during order creation)
   * Returns array of deductions with validation
   */
  static async deductOrderInventory(orderItems, storeId, session) {
    const deductions = [];

    for (const item of orderItems) {
      // Deduct menu item ingredients
      const menuItemDeductions = await this.deductMenuItemInventory(
        item.menuItemId,
        item.quantity,
        storeId,
        session
      );
      deductions.push(...menuItemDeductions);

      // Deduct add-on inventory
      if (item.addOns && item.addOns.length > 0) {
        const addOnDeductions = await this.deductAddOnInventory(
          item.addOns,
          item.quantity,
          storeId,
          session
        );
        deductions.push(...addOnDeductions);
      }
    }

    return deductions;
  }

  /**
   * Deduct inventory for menu item ingredients
   */
  static async deductMenuItemInventory(menuItemId, quantity, storeId, session) {
    const deductions = [];

    const linkedInventory = await InventoryItem.find({
      "linkedMenuItems.menuItemId": menuItemId,
      isActive: true,
      storeId,
    }).session(session);

    for (const invItem of linkedInventory) {
      const link = invItem.linkedMenuItems.find(
        (l) => l.menuItemId.toString() === menuItemId.toString()
      );

      if (link) {
        const quantityToDeduct = link.quantityUsed * quantity;

        // Validate stock availability
        if (invItem.currentStock < quantityToDeduct) {
          throw new Error(
            `Insufficient stock for ${invItem.name}. Available: ${invItem.currentStock} ${invItem.unit}, Required: ${quantityToDeduct} ${invItem.unit}`
          );
        }

        deductions.push({
          inventoryItemId: invItem._id,
          name: invItem.name,
          quantityToDeduct,
          currentStock: invItem.currentStock,
          unit: invItem.unit,
        });
      }
    }

    return deductions;
  }

  /**
   * Deduct inventory for add-ons
   */
  static async deductAddOnInventory(addOns, quantity, storeId, session) {
    const deductions = [];

    for (const addOn of addOns) {
      for (const selectedItem of addOn.selectedItems) {
        if (selectedItem.inventoryItem) {
          const invItem = await InventoryItem.findOne({
            _id: selectedItem.inventoryItem,
            storeId,
          }).session(session);

          if (invItem) {
            const quantityToDeduct =
              (selectedItem.quantityUsed || 1) * quantity;

            // Validate stock availability
            if (invItem.currentStock < quantityToDeduct) {
              throw new Error(
                `Insufficient stock for add-on ${selectedItem.name}. Available: ${invItem.currentStock} ${invItem.unit}, Required: ${quantityToDeduct} ${invItem.unit}`
              );
            }

            deductions.push({
              inventoryItemId: invItem._id,
              name: selectedItem.name,
              quantityToDeduct,
              currentStock: invItem.currentStock,
              unit: invItem.unit,
              isAddOn: true,
            });
          }
        }
      }
    }

    return deductions;
  }

  /**
   * Apply inventory deductions (call after validation)
   */
  static async applyDeductions(deductions, session) {
    for (const deduction of deductions) {
      const invItem = await InventoryItem.findById(
        deduction.inventoryItemId
      ).session(session);

      if (invItem) {
        invItem.currentStock -= deduction.quantityToDeduct;
        await invItem.save({ session });
      }
    }
  }
}

module.exports = InventoryManager;
