const Order = require("../models/Order");
const KDSStation = require("../models/KDSStation");
const MenuItem = require("../models/MenuItem");
const { notifyKDS } = require("../utils/webSocket");

exports.getKDSOrders = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { showCompleted } = req.query;

    let station = null;
    let categoryFilter = {};

    if (stationId !== "all") {
      station = await KDSStation.findOne({
        _id: stationId,
        storeId: req.storeId,
      });
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

    let orderStatuses;
    if (showCompleted === "true") {
      orderStatuses = ["ready"];
    } else {
      orderStatuses = ["pending", "preparing"];
    }

    const query = {
      orderStatus: { $in: orderStatuses },
      storeId: req.storeId,
      ...categoryFilter,
    };

    const orders = await Order.find(query)
      .populate("orderItems.menuItemId", "name category preparationTime")
      .populate("servedBy", "fullname")
      .sort({ createdAt: 1 });

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

exports.updateKDSOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body;

    const order = await Order.findOne({ _id: orderId, storeId: req.storeId });
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

    // Notify KDS via WebSocket
    notifyKDS("order:statusChanged", order, null, req.storeId);

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

exports.recallOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, storeId: req.storeId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

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

    // Notify KDS via WebSocket
    notifyKDS("order:recalled", order, null, req.storeId);

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
