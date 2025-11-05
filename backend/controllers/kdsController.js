// backend/controllers/kdsController.js
const Order = require("../models/Order");
const KDSStation = require("../models/KDSStation");
const MenuItem = require("../models/MenuItem");

exports.getKDSOrders = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { status, showCompleted } = req.query;
    console.log(
      "Fetching KDS Orders for station:",
      stationId,
      "with showCompleted:",
      showCompleted,
      "and status: ",
      status
    ); // Debug log

    let station = null;
    let categoryFilter = {};

    if (stationId !== "all") {
      station = await KDSStation.findById(stationId);
      if (!station) {
        return res.status(404).json({
          success: false,
          message: "Station not found",
        });
      }

      if (station.categories && station.categories.length > 0) {
        categoryFilter = { "orderItems.category": { $in: station.categories } };
      }
    }

    // Build query - show active orders or completed if requested
    let orderStatuses;
    if (showCompleted === "true") {
      orderStatuses = ["ready"]; // Only show completed (ready) orders
    } else {
      orderStatuses = ["pending", "preparing"]; // Show active orders
    }

    const query = {
      orderStatus: { $in: orderStatuses },
      ...categoryFilter,
    };

    console.log("KDS Query:", JSON.stringify(query)); // Debug log

    const orders = await Order.find(query)
      .populate("orderItems.menuItemId", "name category preparationTime")
      .populate("servedBy", "fullname")
      .sort({ createdAt: 1 });

    console.log("Orders found:", orders.length); // Debug log

    // Filter items by station categories if applicable
    const filteredOrders = orders
      .map((order) => {
        if (station && station.categories && station.categories.length > 0) {
          const filteredItems = order.orderItems.filter((item) =>
            station.categories.includes(item.menuItemId?.category)
          );

          if (filteredItems.length === 0) return null;

          return {
            ...order.toObject(),
            orderItems: filteredItems,
          };
        }
        return order;
      })
      .filter(Boolean);

    res.json({
      success: true,
      data: filteredOrders,
      station: station || { name: "All Stations", type: "all" },
    });
  } catch (error) {
    console.error("Error fetching KDS orders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status in KDS (Start = preparing, Complete = ready)
exports.updateKDSOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body; // action: 'start' or 'complete'

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (action === "start") {
      order.orderStatus = "preparing";
      order.lastAction = {
        action: "update",
        performedBy: req.user.id,
        createdAt: new Date(),
        reason: "Order started in kitchen",
      };
    } else if (action === "complete") {
      order.orderStatus = "ready";
      order.actualReadyTime = new Date();
      order.orderItems.forEach((item) => {
        item.itemStatus = "ready";
      });
      order.lastAction = {
        action: "update",
        performedBy: req.user.id,
        createdAt: new Date(),
        reason: "Order completed in kitchen",
      };
    }

    await order.save();

    await order.populate(
      "orderItems.menuItemId",
      "name category preparationTime"
    );
    await order.populate("servedBy", "fullname");

    res.json({
      success: true,
      message: `Order ${
        action === "start" ? "started" : "completed"
      } successfully`,
      data: order,
    });
  } catch (error) {
    console.error("Error updating KDS order status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Recall order (move from ready back to preparing)
exports.recallOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Can only recall ready orders
    if (order.orderStatus !== "ready") {
      return res.status(400).json({
        success: false,
        message: "Can only recall orders that are marked as ready",
      });
    }

    order.orderStatus = "preparing";
    order.orderItems.forEach((item) => {
      if (item.itemStatus === "ready") {
        item.itemStatus = "preparing";
      }
    });

    order.lastAction = {
      action: "recall",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || "Order recalled from ready",
    };

    await order.save();

    await order.populate(
      "orderItems.menuItemId",
      "name category preparationTime"
    );
    await order.populate("servedBy", "fullname");

    res.json({
      success: true,
      message: "Order recalled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error recalling order:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
