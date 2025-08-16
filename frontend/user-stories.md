const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const logAction = require("../utils/logAction");

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
} = req.body;

    // Validate that we have order items
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Process each order item, fetching current details from the database
    const processedItems = [];
    let totalAmount = 0;

    for (const item of orderItems) {
      // Fetch the current menu item details from the database
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item with ID ${item.menuItemId} not found`,
        });
      }

      // Check if item is available
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`,
        });
      }

      // Calculate subtotal for this item
      const quantity = item.quantity || 1;
      const subtotal = menuItem.price * quantity;

      // Add preparation time if available from the menu item
      const preparationTime = menuItem.preparationTime || 15;

      // Add to processed items
      processedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        customizations: item.customizations || "",
        subtotal,
        preparationTime, // Store this for estimating ready time
      });

      totalAmount += subtotal;
    }



    // Determine payment status
    let paymentStatus = "pending";
    let balance = totalAmount;

    if (amountPaid >= finalAmount) {
      paymentStatus = "paid";
      balance = 0;
    } else if (amountPaid > 0) {
      paymentStatus = "partial";
      balance = finalAmount - amountPaid;
    }

    // Create the order
    const newOrder = new Order({
      table: table || "Takeaway",
      customerDetails: customerDetails || { name: "Walk-in" },
      orderType: orderType || "dine-in",
      orderItems: processedItems,
      servedBy: req.user.id,
      totalAmount: finalAmount,
      discount: discountAmount,
      amountPaid: amountPaid || 0,
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

    // Log the action
    await logAction(
      req.user.id,
      "Order",
      newOrder._id,
      "create",
      null,
      newOrder,
      `Created new order #${newOrder.orderNumber}`
    );

    return res.status(201).json({
      success: true,
      data: newOrder,
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

    // Simple filter object
    let filter = {};

    // Add filters conditionally
    if (status) filter.orderStatus = status;
    if (orderType) filter.orderType = orderType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Simple find without pagination
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
const { orderStatus } = req.body;

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

    // Store old state for logging
    const oldOrder = { ...order.toObject() };

    order.orderStatus = orderStatus;

    // Handle status-specific updates
    if (orderStatus === "ready") {
      order.actualReadyTime = new Date();
    } else if (orderStatus === "completed") {
      order.completedAt = new Date();
    }

    order.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: req.body.reason || `Updated order status to ${orderStatus}`,
    };

    await order.save();

    // Log the action
    await logAction(
      req.user.id,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Updated order #${order.orderNumber} status to ${orderStatus}`
    );

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

// Update order item status
const updateOrderItemStatus = async (req, res) => {
try {
const { itemId, itemStatus } = req.body;

    if (!itemId || !itemStatus) {
      return res.status(400).json({
        success: false,
        message: "Item ID and status are required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find the item to update
    const itemIndex = order.orderItems.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Order item not found",
      });
    }

    // Store old state for logging
    const oldOrder = { ...order.toObject() };

    // Update the item status
    order.orderItems[itemIndex].itemStatus = itemStatus;

    // Check if all items are in the same status
    const allItemsStatus = order.orderItems.map((item) => item.itemStatus);

    // If all items have the same status, update the order status
    if (allItemsStatus.every((status) => status === "ready")) {
      order.orderStatus = "ready";
      order.actualReadyTime = new Date();
    } else if (allItemsStatus.every((status) => status === "served")) {
      order.orderStatus = "served";
    } else if (allItemsStatus.some((status) => status === "preparing")) {
      order.orderStatus = "preparing";
    }

    order.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: req.body.reason || `Updated item status to ${itemStatus}`,
    };

    await order.save();

    // Log the action
    await logAction(
      req.user.id,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Updated item status in order #${order.orderNumber}`
    );

    return res.status(200).json({
      success: true,
      data: order,
    });

} catch (error) {
console.error("Error updating order item status:", error);
if (error.kind === "ObjectId") {
return res.status(400).json({
success: false,
message: "Invalid order ID or item ID",
});
}
return res.status(500).json({
success: false,
message: "Failed to update order item status. Please try again.",
error: error.message,
});
}
};

// Update payment information
const updatePayment = async (req, res) => {
try {
const { amountPaid, paymentMethod, tip } = req.body;

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

    // Store old state for logging
    const oldOrder = { ...order.toObject() };

    // Update payment details
    order.amountPaid = amountPaid;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (tip !== undefined) order.tip = tip;

    // Recalculate balance and update payment status
    const totalDue = order.totalAmount;

    if (amountPaid >= totalDue) {
      order.balance = 0;
      order.paymentStatus = "paid";
    } else if (amountPaid > 0) {
      order.balance = totalDue - amountPaid;
      order.paymentStatus = "partial";
    } else {
      order.balance = totalDue;
      order.paymentStatus = "pending";
    }

    order.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: req.body.reason || "Updated payment information",
    };

    await order.save();

    // Log the action
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

// Add items to an existing order
const addOrderItems = async (req, res) => {
try {
const { orderItems } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Cannot add items to completed or cancelled orders
    if (["completed", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot add items to ${order.orderStatus} orders`,
      });
    }

    // Store old state for logging
    const oldOrder = { ...order.toObject() };

    // Process each new order item
    const newProcessedItems = [];
    let additionalAmount = 0;

    for (const item of orderItems) {
      // Fetch the current menu item
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item with ID ${item.menuItemId} not found`,
        });
      }

      // Check if item is available
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`,
        });
      }

      // Calculate subtotal
      const quantity = item.quantity || 1;
      const subtotal = menuItem.price * quantity;

      // Add to processed items
      const newItem = {
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        customizations: item.customizations || "",
        subtotal,
        itemStatus: "pending",
        preparationTime: menuItem.preparationTime || 15,
      };

      newProcessedItems.push(newItem);
      additionalAmount += subtotal;
    }

    // Add the new items
    order.orderItems.push(...newProcessedItems);

    // Update order totals
    order.totalAmount += additionalAmount;
    order.balance = order.totalAmount - order.amountPaid;

    // Update payment status if needed
    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = "paid";
      order.balance = 0;
    } else if (order.amountPaid > 0) {
      order.paymentStatus = "partial";
    } else {
      order.paymentStatus = "pending";
    }

    // Update order status
    order.orderStatus = "preparing";

    // Update last action
    order.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: req.body.reason || "Added items to order",
    };

    await order.save();

    // Log the action
    await logAction(
      req.user.id,
      "Order",
      order._id,
      "edit",
      oldOrder,
      order,
      `Added items to order #${order.orderNumber}`
    );

    return res.status(200).json({
      success: true,
      data: order,
    });

} catch (error) {
console.error("Error adding items to order:", error);
if (error.kind === "ObjectId") {
return res.status(400).json({
success: false,
message: "Invalid order ID",
});
}
return res.status(500).json({
success: false,
message: "Failed to add items to order. Please try again.",
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

    // Only allow cancellation of orders that haven't been completed
    if (order.orderStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed order",
      });
    }

    // Store old state for logging
    const oldOrder = { ...order.toObject() };

    // Update order status
    order.orderStatus = "cancelled";

    // Update all items to cancelled
    order.orderItems.forEach((item) => {
      item.itemStatus = "cancelled";
    });

    // Update last action
    order.lastAction = {
      action: "cancel",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason,
    };

    await order.save();

    // Log the action
    await logAction(
      req.user.id,
      "Order",
      order._id,
      "delete",
      oldOrder,
      order,
      `Cancelled order #${order.orderNumber}: ${reason}`
    );

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

// Get orders dashboard statistics (simplified)
const getOrderStats = async (req, res) => {
try {
const { startDate, endDate } = req.query;

    // Set default date range to today if not provided
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setHours(0, 0, 0, 0));

    const end = endDate
      ? new Date(endDate)
      : new Date(new Date().setHours(23, 59, 59, 999));

    // Get counts by status
    const statusCounts = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    // Get revenue data
    const revenue = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          paidRevenue: { $sum: "$amountPaid" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
          totalTips: { $sum: "$tip" },
        },
      },
    ]);

    // Get popular items
    const popularItems = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.name",
          totalQuantity: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: "$orderItems.subtotal" },
          averagePrice: { $avg: "$orderItems.price" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // Get orders by type
    const ordersByType = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$orderType", count: { $sum: 1 } } },
    ]);

    // Format status counts into an object
    const formattedStatusCounts = {};
    statusCounts.forEach((status) => {
      formattedStatusCounts[status._id] = status.count;
    });

    // Format order types into an object
    const formattedOrderTypes = {};
    ordersByType.forEach((type) => {
      formattedOrderTypes[type._id] = type.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        orderCounts: {
          total: statusCounts.reduce((sum, status) => sum + status.count, 0),
          byStatus: formattedStatusCounts,
          byType: formattedOrderTypes,
        },
        revenue:
          revenue.length > 0
            ? {
                total: revenue[0].totalRevenue,
                collected: revenue[0].paidRevenue,
                pending: revenue[0].totalRevenue - revenue[0].paidRevenue,
                average: revenue[0].averageOrderValue,
                tips: revenue[0].totalTips,
              }
            : {
                total: 0,
                collected: 0,
                pending: 0,
                average: 0,
                tips: 0,
              },
        popularItems,
      },
    });

} catch (error) {
console.error("Error fetching order statistics:", error);
return res.status(500).json({
success: false,
message: "Failed to fetch order statistics. Please try again.",
error: error.message,
});
}
};

module.exports = {
createOrder,
getAllOrders,
getOrderById,
updateOrderStatus,
updateOrderItemStatus,
updatePayment,
addOrderItems,
cancelOrder,
getOrderStats,
};
