// backend/controllers/kdsController.js
const Order = require("../models/Order");
const KDSStation = require("../models/KDSStation");
const MenuItem = require("../models/MenuItem");

// Get orders for KDS station
exports.getKDSOrders = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { status } = req.query;

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

      // If station has specific categories, filter by them
      if (station.categories && station.categories.length > 0) {
        categoryFilter = { "orderItems.category": { $in: station.categories } };
      }
    }

    // Build query
    const query = {
      orderStatus: { $in: status ? [status] : ["new", "preparing", "ready"] },
      ...categoryFilter,
    };

    const orders = await Order.find(query)
      .populate("orderItems.menuItemId", "name category preparationTime")
      .populate("servedBy", "fullname")
      .sort({ createdAt: 1 });

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

// Update order item status
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { itemId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const item = order.orderItems.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Order item not found",
      });
    }

    item.itemStatus = status;

    // Check if all items are ready/completed
    const allReady = order.orderItems.every(
      (item) => item.itemStatus === "ready" || item.itemStatus === "completed"
    );

    if (allReady && order.orderStatus !== "ready") {
      order.orderStatus = "ready";
      order.actualReadyTime = new Date();
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order item status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Bump order (mark as complete)
exports.bumpOrder = async (req, res) => {
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

    // Mark all items as completed
    order.orderItems.forEach((item) => {
      item.itemStatus = "completed";
    });

    order.orderStatus = "ready";
    order.actualReadyTime = new Date();
    order.lastAction = {
      action: "bump",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || "Order completed in kitchen",
    };

    await order.save();

    res.json({
      success: true,
      message: "Order bumped successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error bumping order:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all KDS stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await KDSStation.find({ isActive: true })
      .populate("assignedUsers", "fullname email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: stations,
    });
  } catch (error) {
    console.error("Error fetching stations:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create KDS station
exports.createStation = async (req, res) => {
  try {
    const station = await KDSStation.create(req.body);

    res.status(201).json({
      success: true,
      message: "Station created successfully",
      data: station,
    });
  } catch (error) {
    console.error("Error creating station:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update KDS station
exports.updateStation = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await KDSStation.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.json({
      success: true,
      message: "Station updated successfully",
      data: station,
    });
  } catch (error) {
    console.error("Error updating station:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Recall order (move back to preparing)
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

    order.orderStatus = "preparing";
    order.orderItems.forEach((item) => {
      if (item.itemStatus === "completed") {
        item.itemStatus = "preparing";
      }
    });

    order.lastAction = {
      action: "recall",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || "Order recalled",
    };

    await order.save();

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

module.exports = exports;
