const mongoose = require("mongoose");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const InventoryItem = require("../models/InventoryItem");
const Table = require("../models/Table");
const Reservation = require("../models/Reservation");
const asyncHandler = require("express-async-handler");

// @desc    Get Dashboard Command Center Data
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const storeId = new mongoose.Types.ObjectId(req.storeId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 1. KPIs: Revenue, Order Count, Active Orders
  const kpiStats = await Order.aggregate([
    {
      $match: {
        storeId,
        createdAt: { $gte: todayStart, $lte: todayEnd },
        orderStatus: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        todayRevenue: { $sum: "$totalAmount" },
        todayOrderCount: { $sum: 1 },
        avgOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);

  const kpis = kpiStats[0] || {
    todayRevenue: 0,
    todayOrderCount: 0,
    avgOrderValue: 0,
  };

  // Active Orders (In-progress: pending, preparing, ready)
  const activeOrdersCount = await Order.countDocuments({
    storeId,
    orderStatus: { $in: ["pending", "preparing", "ready"] },
  });

  // Long-waiting Orders (> 15 mins)
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60000);
  const longWaitingOrders = await Order.countDocuments({
    storeId,
    orderStatus: { $in: ["pending", "preparing"] },
    createdAt: { $lt: fifteenMinsAgo },
  });

  // 2. Operational Stats
  // Table Occupancy
  const totalTables = await Table.countDocuments({ storeId, isActive: true });
  const occupiedTables = await Table.countDocuments({
    storeId,
    status: { $in: ["occupied", "ordered"] },
    isActive: true,
  });
  const tableOccupancy =
    totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  // Active Staff (Unique staff who took orders today)
  const activeStaffIds = await Order.distinct("servedBy", {
    storeId,
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });
  const activeStaffCount = activeStaffIds.length;

  // Low Stock Items
  const lowStockCount = await InventoryItem.countDocuments({
    storeId,
    isActive: true,
    $expr: { $lte: ["$currentStock", "$minStockLevel"] },
  });

  // Pending Reservations for today
  const pendingReservations = await Reservation.countDocuments({
    storeId,
    reservationDate: { $gte: todayStart, $lte: todayEnd },
    status: { $in: ["pending", "confirmed"] },
  });

  // 3. Trends: Hourly Sales
  const hourlyTrend = await Order.aggregate([
    {
      $match: {
        storeId,
        createdAt: { $gte: todayStart, $lte: todayEnd },
        orderStatus: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        amount: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const formattedHourly = Array.from({ length: 24 }, (_, i) => {
    const found = hourlyTrend.find((h) => h._id === i);
    return {
      hour: `${i}:00`,
      revenue: found ? found.amount : 0,
    };
  });

  // 4. Recent Activity (Last 5 orders)
  const recentActivity = await Order.find({ storeId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select(
      "orderNumber totalAmount orderStatus createdAt customerDetails table"
    )
    .populate("servedBy", "fullname");

  // 5. Alerts (Synthesized from data)
  const alerts = [];
  if (lowStockCount > 0) {
    alerts.push({
      id: "low-stock",
      type: "critical",
      message: `${lowStockCount} items are below minimum stock level.`,
      actionLink: "/app/inventory",
    });
  }
  if (longWaitingOrders > 0) {
    alerts.push({
      id: "slow-orders",
      type: "critical",
      message: `${longWaitingOrders} orders have been waiting for more than 15 minutes.`,
      actionLink: "/app/kds",
    });
  }
  if (pendingReservations > 0) {
    alerts.push({
      id: "reservations",
      type: "info",
      message: `You have ${pendingReservations} reservations scheduled for today.`,
      actionLink: "/app/reservations",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      kpis: {
        ...kpis,
        activeOrders: activeOrdersCount,
        activeStaff: activeStaffCount,
      },
      opsStats: {
        tableOccupancy,
        lowStockCount,
        pendingReservations,
        longWaitingOrders,
      },
      trends: {
        hourlySales: formattedHourly,
      },
      recentActivity,
      alerts,
    },
  });
});

module.exports = {
  getDashboardStats,
};

