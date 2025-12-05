const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const InventoryItem = require("../models/InventoryItem");
const Customer = require("../models/Customer");
const StockAdjustment = require("../models/StockAdjustment");
// Import other models as needed

// @desc    Get Analytics Overview (Snapshot)
// @route   GET /api/analytics/overview
// @access  Private
const getOverviewData = asyncHandler(async (req, res) => {
  const { branchId } = req.query;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const matchStage = {
    createdAt: { $gte: todayStart, $lte: todayEnd },
    status: { $ne: "cancelled" },
    ...(branchId && { branch: branchId }),
  };

  // 1. KPIs: Revenue & Orders
  const kpiStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $count: {} },
        avgOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);

  const stats = kpiStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

  // 2. Hourly Trend
  const hourlyTrend = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        revenue: { $sum: "$totalAmount" },
        orders: { $count: {} },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Format hourly trend for frontend (ensure all hours 0-23 are present or handle in frontend)
  // For now, sending raw data, frontend chart handles gaps usually, but let's map it cleanly
  const formattedHourly = Array.from({ length: 24 }, (_, i) => {
    const found = hourlyTrend.find((h) => h._id === i);
    return {
      hour: `${i}:00`,
      revenue: found ? found.revenue : 0,
      orders: found ? found.orders : 0,
    };
  });

  // 3. Recent Activity (Last 5 orders)
  const recentActivity = await Order.find(matchStage)
    .sort({ createdAt: -1 })
    .limit(5)
    .select("orderNumber totalAmount status createdAt tableId")
    .populate("tableId", "name");

  // 4. Active Staff (Staff who have logged in or created orders today - simplified to just count of staff with orders today for now)
  // A better metric might be "Clocked In" users if we had a timeclock feature.
  // We'll count unique staff who handled orders today.
  const activeStaffCount = await Order.distinct("server", matchStage);

  res.status(200).json({
    kpis: {
      totalRevenue: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      avgOrderValue: stats.avgOrderValue,
      activeStaff: activeStaffCount.length,
    },
    hourlyTrend: formattedHourly,
    recentActivity,
  });
});

// @desc    Get Sales Analytics
// @route   GET /api/analytics/sales
// @access  Private
const getSalesData = asyncHandler(async (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const matchStage = {
    createdAt: { $gte: start, $lte: end },
    status: { $ne: "cancelled" },
    ...(branchId && { branch: branchId }),
  };

  // 1. Overview KPIs
  const kpiStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $count: {} },
        avgOrderValue: { $avg: "$totalAmount" },
        // Net Profit approximation (Revenue - 30% Cost - Discounts) - Mock logic for cost
        totalDiscount: { $sum: "$discountAmount" },
      },
    },
  ]);

  const stats = kpiStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalDiscount: 0 };
  const netProfit = stats.totalRevenue * 0.7 - stats.totalDiscount; // Assuming 30% COGS

  // 2. Sales Trends (Daily)
  const salesTrends = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $count: {} },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const formattedTrends = salesTrends.map((t) => ({
    date: t._id,
    revenue: t.revenue,
    orders: t.orders,
  }));

  // 3. Sales by Order Type
  const byOrderType = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$orderType",
        value: { $sum: "$totalAmount" },
        count: { $count: {} },
      },
    },
  ]);

  const formattedOrderType = byOrderType.map((t) => ({
    name: t._id || "Unknown",
    value: t.value,
  }));

  // 4. Top Selling Items
  const topItems = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menuItem",
        name: { $first: "$items.name" }, // Assuming name is stored in items array
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({
    overview: {
      totalRevenue: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      avgOrderValue: stats.avgOrderValue,
      netProfit,
    },
    trends: formattedTrends,
    byOrderType: formattedOrderType,
    topItems,
  });
});

// @desc    Get Menu Intelligence
// @route   GET /api/analytics/menu
// @access  Private
const getMenuData = asyncHandler(async (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const matchStage = {
    createdAt: { $gte: start, $lte: end },
    status: { $ne: "cancelled" },
    ...(branchId && { branch: branchId }),
  };

  // 1. Item Performance (Matrix Data)
  const itemPerformance = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menuItem",
        name: { $first: "$items.name" },
        sold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    // Lookup to get cost price and category from MenuItem model
    {
      $lookup: {
        from: "menuitems",
        localField: "_id",
        foreignField: "_id",
        as: "details",
      },
    },
    { $unwind: "$details" },
    {
      $project: {
        name: 1,
        sold: 1,
        revenue: 1,
        category: "$details.category", // Assuming category is an ID or name
        cost: { $multiply: ["$details.costPrice", "$sold"] },
        profit: {
          $subtract: [
            "$revenue",
            { $multiply: ["$details.costPrice", "$sold"] },
          ],
        },
      },
    },
  ]);

  // Calculate Averages for Matrix Quadrants
  const totalSold = itemPerformance.reduce((acc, item) => acc + item.sold, 0);
  const avgSold = totalSold / (itemPerformance.length || 1);
  const totalProfit = itemPerformance.reduce((acc, item) => acc + item.profit, 0);
  const avgProfit = totalProfit / (itemPerformance.length || 1);

  const matrix = itemPerformance.map((item) => ({
    name: item.name,
    popularity: item.sold, // x-axis
    profitability: item.profit, // y-axis
    category: item.category,
    quadrant:
      item.sold >= avgSold
        ? item.profit >= avgProfit
          ? "Star"
          : "Plowhorse"
        : item.profit >= avgProfit
        ? "Puzzle"
        : "Dog",
  }));

  // 2. Category Performance
  // We can aggregate the itemPerformance array in memory since we already fetched it
  const categoryMap = {};
  itemPerformance.forEach((item) => {
    const catId = item.category ? item.category.toString() : "Uncategorized";
    if (!categoryMap[catId]) {
      categoryMap[catId] = { category: catId, revenue: 0, profit: 0, itemsSold: 0 };
    }
    categoryMap[catId].revenue += item.revenue;
    categoryMap[catId].profit += item.profit;
    categoryMap[catId].itemsSold += item.sold;
  });

  const categoryPerformance = Object.values(categoryMap);

  // 3. Top & Under Performers
  const sortedByProfit = [...itemPerformance].sort((a, b) => b.profit - a.profit);
  const topPerformers = sortedByProfit.slice(0, 5);
  const underPerformers = sortedByProfit.slice(-5).reverse();

  res.status(200).json({
    matrix,
    categoryPerformance,
    topPerformers,
    underPerformers,
  });
});

// @desc    Get Staff Analytics
// @route   GET /api/analytics/staff
// @access  Private
const getStaffData = asyncHandler(async (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const matchStage = {
    createdAt: { $gte: start, $lte: end },
    status: { $ne: "cancelled" },
    ...(branchId && { branch: branchId }),
  };

  // 1. Staff Performance
  const staffStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$server", // Assuming 'server' field stores User ID
        sales: { $sum: "$totalAmount" },
        orders: { $count: {} },
        // avgTime: { $avg: "$duration" } // If we tracked duration
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $project: {
        name: "$userInfo.name",
        sales: 1,
        orders: 1,
        avgTime: { $literal: 25 }, // Mock avg time in mins
      },
    },
    { $sort: { sales: -1 } },
  ]);

  // 2. Labor Cost (Mock Data for now)
  // In a real system, we'd query a 'Shifts' or 'Payroll' collection
  const laborCost = [
    { date: "Week 1", cost: 1200, sales: 5000, percentage: 24 },
    { date: "Week 2", cost: 1150, sales: 4800, percentage: 23.9 },
    { date: "Week 3", cost: 1300, sales: 5500, percentage: 23.6 },
    { date: "Week 4", cost: 1250, sales: 5200, percentage: 24.0 },
  ];

  res.status(200).json({
    performance: staffStats,
    laborCost,
    staffList: staffStats, // Reusing stats for the list view
  });
});

// @desc    Get Customer Insights
// @route   GET /api/analytics/customers
// @access  Private
const getCustomerData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 1. Top Customers
  const topCustomers = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $ne: "cancelled" },
        // Ensure we only count orders with a linked customer/user
        // user: { $exists: true }
      },
    },
    {
      $group: {
        _id: "$user", // Assuming 'user' field links to Customer/User
        totalSpent: { $sum: "$totalAmount" },
        visits: { $count: {} },
        lastVisit: { $max: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "users", // or customers collection
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: { $ifNull: ["$userInfo.name", "Guest"] },
        totalSpent: 1,
        visits: 1,
        lastVisit: 1,
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 20 },
  ]);

  // 2. Overview KPIs
  const totalCustomers = topCustomers.length; // Approximation for this range
  const totalRevenue = topCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Mocking Retention & Segmentation for now as they require complex historical analysis
  const retention = [
    { month: "Jan", retentionRate: 85 },
    { month: "Feb", retentionRate: 82 },
    { month: "Mar", retentionRate: 88 },
  ];

  const segmentation = [
    { name: "New", value: 30 },
    { name: "Returning", value: 50 },
    { name: "VIP", value: 20 },
  ];

  res.status(200).json({
    overview: {
      totalCustomers,
      newCustomers: Math.floor(totalCustomers * 0.3), // Mock 30% new
      repeatRate: "70%",
      avgLTV,
    },
    retention,
    segmentation,
    topCustomers,
  });
});

// @desc    Get Inventory Analytics
// @route   GET /api/analytics/inventory
// @access  Private
const getInventoryData = asyncHandler(async (req, res) => {
  const { branchId, startDate, endDate } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();

  // 1. Inventory Value & Low Stock from InventoryItem model
  const inventoryItems = await InventoryItem.find({
    isActive: true,
  }).select("name currentStock costPrice minStockLevel unit category");

  let totalValue = 0;
  const lowStock = [];

  inventoryItems.forEach((item) => {
    const value = (item.currentStock || 0) * (item.costPrice || 0);
    totalValue += value;

    if (item.currentStock <= item.minStockLevel) {
      lowStock.push({
        id: item._id,
        name: item.name,
        current: item.currentStock,
        par: item.minStockLevel,
        unit: item.unit || "units",
        category: item.category,
      });
    }
  });

  // 2. Waste Analysis from StockAdjustment model
  const wasteAdjustments = await StockAdjustment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        adjustmentType: { $in: ["waste", "damage", "expired", "loss"] },
      },
    },
    {
      $group: {
        _id: "$adjustmentType",
        totalQuantity: { $sum: { $abs: "$quantityChange" } },
        totalCost: { $sum: { $abs: "$costImpact" } },
      },
    },
  ]);

  const wasteByReason = wasteAdjustments.map((w) => ({
    name: w._id.charAt(0).toUpperCase() + w._id.slice(1),
    value: w.totalCost || 0,
    quantity: w.totalQuantity || 0,
  }));

  const totalWaste = wasteByReason.reduce((acc, w) => acc + w.value, 0);

  // 3. Top Wasted Items
  const wasteTopItems = await StockAdjustment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        adjustmentType: { $in: ["waste", "damage", "expired", "loss"] },
      },
    },
    {
      $group: {
        _id: "$inventoryItem",
        qty: { $sum: { $abs: "$quantityChange" } },
        cost: { $sum: { $abs: "$costImpact" } },
        reason: { $first: "$adjustmentType" },
      },
    },
    {
      $lookup: {
        from: "inventoryitems",
        localField: "_id",
        foreignField: "_id",
        as: "itemInfo",
      },
    },
    { $unwind: { path: "$itemInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: "$_id",
        name: { $ifNull: ["$itemInfo.name", "Unknown Item"] },
        qty: 1,
        cost: 1,
        reason: 1,
      },
    },
    { $sort: { cost: -1 } },
    { $limit: 10 },
  ]);

  // 4. Inventory Trends (Stock adjustments over time)
  const trends = await StockAdjustment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalIn: {
          $sum: {
            $cond: [{ $gt: ["$quantityChange", 0] }, "$quantityChange", 0],
          },
        },
        totalOut: {
          $sum: {
            $cond: [{ $lt: ["$quantityChange", 0] }, { $abs: "$quantityChange" }, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Calculate food cost percentage (based on orders in period)
  const orderStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        orderStatus: { $nin: ["cancelled"] },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const totalRevenue = orderStats[0]?.totalRevenue || 0;
  const foodCostPercentage = totalRevenue > 0 ? ((totalWaste / totalRevenue) * 100).toFixed(1) : 0;

  res.status(200).json({
    overview: {
      totalValue,
      foodCostPercentage: parseFloat(foodCostPercentage),
      turnoverRate: inventoryItems.length > 0 ? (totalRevenue / totalValue).toFixed(1) + "x" : "0x",
      totalWaste,
      lowStockCount: lowStock.length,
    },
    trends: trends.map((t) => ({
      date: t._id,
      stockIn: t.totalIn,
      stockOut: t.totalOut,
    })),
    wasteByReason: wasteByReason.length > 0 ? wasteByReason : [{ name: "No waste data", value: 0 }],
    wasteTopItems: wasteTopItems.length > 0 ? wasteTopItems : [],
    lowStock,
  });
});

// @desc    Get Payment Analytics
// @route   GET /api/analytics/payments
// @access  Private
const getPaymentData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const matchStage = {
    createdAt: { $gte: start, $lte: end },
    status: { $ne: "cancelled" },
  };

  // 1. Payment Methods
  const paymentMethods = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$paymentMethod", // Assuming 'paymentMethod' field exists
        value: { $sum: "$totalAmount" },
        count: { $count: {} },
      },
    },
  ]);

  const formattedMethods = paymentMethods.map((p) => ({
    name: p._id || "Unknown",
    value: p.value,
    count: p.count,
  }));

  // 2. Refunds from Order.refunds array
  const refundData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        "refunds.0": { $exists: true }, // Only orders with refunds
      },
    },
    { $unwind: "$refunds" },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$refunds.refundedAt" } },
        amount: "$refunds.amount",
        reason: "$refunds.reason",
        orderNumber: 1,
      },
    },
    { $sort: { date: -1 } },
    { $limit: 20 },
  ]);

  const refunds = refundData.map((r) => ({
    date: r.date,
    amount: r.amount,
    reason: r.reason || "No reason provided",
    orderNumber: r.orderNumber,
  }));

  const totalCollected = formattedMethods.reduce((acc, m) => acc + m.value, 0);
  const totalRefunded = refunds.reduce((acc, r) => acc + r.amount, 0);
  const totalTransactions = formattedMethods.reduce((acc, m) => acc + m.count, 0);
  const avgTransaction = totalTransactions > 0 ? totalCollected / totalTransactions : 0;

  res.status(200).json({
    overview: {
      totalCollected,
      refunds: totalRefunded,
      netRevenue: totalCollected - totalRefunded,
      avgTransaction,
    },
    paymentMethods: formattedMethods,
    refunds,
  });
});

// @desc    Get Advanced Insights
// @route   GET /api/analytics/advanced
// @access  Private
const getAdvancedData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const matchStage = {
    createdAt: { $gte: start, $lte: end },
    status: { $ne: "cancelled" },
  };

  // 1. Sales Heatmap (Day of Week x Hour)
  const heatmap = await Order.aggregate([
    { $match: matchStage },
    {
      $project: {
        dayOfWeek: { $dayOfWeek: "$createdAt" }, // 1 (Sun) - 7 (Sat)
        hour: { $hour: "$createdAt" },
        amount: "$totalAmount",
      },
    },
    {
      $group: {
        _id: { day: "$dayOfWeek", hour: "$hour" },
        value: { $sum: "$amount" },
      },
    },
  ]);

  const formattedHeatmap = heatmap.map((h) => ({
    day: h._id.day,
    hour: h._id.hour,
    value: h.value,
  }));

  // 2. Forecasting (Mock - Simple Linear Projection)
  const forecasting = [
    { date: "2023-11-01", actual: 1200, predicted: 1150 },
    { date: "2023-11-02", actual: 1350, predicted: 1300 },
    { date: "2023-11-03", actual: null, predicted: 1400 }, // Future
    { date: "2023-11-04", actual: null, predicted: 1600 }, // Future
  ];

  // 3. Anomalies (Mock)
  const anomalyDetection = [
    { date: "2023-10-25", type: "Low Sales", description: "Sales 30% below avg" },
  ];

  res.status(200).json({
    heatmap: formattedHeatmap,
    forecasting,
    anomalyDetection,
  });
});

module.exports = {
  getOverviewData,
  getSalesData,
  getMenuData,
  getStaffData,
  getCustomerData,
  getInventoryData,
  getPaymentData,
  getAdvancedData,
};
