const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
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
    storeId: new mongoose.Types.ObjectId(req.storeId),
    createdAt: { $gte: todayStart, $lte: todayEnd },
    orderStatus: { $ne: "cancelled" },
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

  const stats = kpiStats[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  };

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
  const activeStaffCount = await Order.distinct("servedBy", matchStage);

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
    storeId: new mongoose.Types.ObjectId(req.storeId),
    createdAt: { $gte: start, $lte: end },
    orderStatus: { $ne: "cancelled" },
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

  const stats = kpiStats[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalDiscount: 0,
  };
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
    storeId: new mongoose.Types.ObjectId(req.storeId),
    createdAt: { $gte: start, $lte: end },
    orderStatus: { $ne: "cancelled" },
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
  const totalProfit = itemPerformance.reduce(
    (acc, item) => acc + item.profit,
    0
  );
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
      categoryMap[catId] = {
        category: catId,
        revenue: 0,
        profit: 0,
        itemsSold: 0,
      };
    }
    categoryMap[catId].revenue += item.revenue;
    categoryMap[catId].profit += item.profit;
    categoryMap[catId].itemsSold += item.sold;
  });

  const categoryPerformance = Object.values(categoryMap);

  // 3. Top & Under Performers
  const sortedByProfit = [...itemPerformance].sort(
    (a, b) => b.profit - a.profit
  );
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
    storeId: new mongoose.Types.ObjectId(req.storeId),
    createdAt: { $gte: start, $lte: end },
    orderStatus: { $ne: "cancelled" },
  };

  // 1. Staff Performance
  const staffStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$servedBy", // Use servedBy instead of server (User ID)
        sales: { $sum: "$totalAmount" },
        orders: { $count: {} },
        // Calculate average duration if completedAt exists
        avgTime: {
          $avg: {
            $cond: [
              {
                $and: [
                  { $ne: ["$completedAt", null] },
                  { $ne: ["$createdAt", null] },
                ],
              },
              {
                $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 60000],
              }, // mins
              null,
            ],
          },
        },
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
        name: "$userInfo.fullname", // Use fullname from User model
        sales: 1,
        orders: 1,
        avgTime: { $ifNull: [{ $round: ["$avgTime", 0] }, 0] }, // Default to 0 if no data
      },
    },
    { $sort: { sales: -1 } },
  ]);

  // 2. Labor Cost - Not tracking wages yet, so return empty or specific error state
  // Frontend has been updated to use "Revenue per Staff" derived from performance stats
  const laborCost = [];

  res.status(200).json({
    performance: staffStats,
    laborCost,
    staffList: staffStats,
  });
});

// @desc    Get Customer Insights
// @route   GET /api/analytics/customers
// @access  Private
const getCustomerData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 1. Top Customers (By Spend)
  const topCustomers = await Order.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(req.storeId),
        createdAt: { $gte: start, $lte: end },
        orderStatus: { $ne: "cancelled" },
        "customerDetails.customerId": { $ne: null }, // Only registered customers
      },
    },
    {
      $group: {
        _id: "$customerDetails.customerId",
        totalSpent: { $sum: "$totalAmount" },
        visits: { $count: {} },
        lastVisit: { $max: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "info",
      },
    },
    { $unwind: "$info" },
    {
      $project: {
        name: "$info.fullname",
        totalSpent: 1,
        visits: 1,
        lastVisit: 1,
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 20 },
  ]);

  const totalCustomersInRange = topCustomers.length;
  const totalRevenue = topCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgLTV =
    totalCustomersInRange > 0 ? totalRevenue / totalCustomersInRange : 0;

  // 2. New vs Returning Logic (Real)
  // New = Created in this range AND first order is in this range?
  // Simplified: If Customer.createdAt is in range => New. Else => Returning (if they ordered).
  let newCount = 0;
  let returningCount = 0;

  // We need to fetch the customer docs to check creation date
  // Optimization: In a huge DB, do this via aggregation. For now, we iterate the top list (limited result)
  // BUT we need accurate counts for KPIs, so let's do a separate count query.

  // Count unique customers who ordered in range
  const uniqueCustomerIds = await Order.distinct("customerDetails.customerId", {
    storeId: req.storeId,
    createdAt: { $gte: start, $lte: end },
    orderStatus: { $ne: "cancelled" },
    "customerDetails.customerId": { $ne: null },
  });

  // Check how many were created in this range
  newCount = await Customer.countDocuments({
    _id: { $in: uniqueCustomerIds },
    storeId: req.storeId,
    createdAt: { $gte: start, $lte: end },
  });

  returningCount = uniqueCustomerIds.length - newCount;
  const repeatRate =
    uniqueCustomerIds.length > 0
      ? ((returningCount / uniqueCustomerIds.length) * 100).toFixed(1) + "%"
      : "0%";

  // 3. Simple Segmentation (Real)
  // VIP = > $500 spend (example threshold) or Top 10%
  // Regular = > 3 visits
  const vipCount = topCustomers.filter((c) => c.totalSpent > 200).length; // Threshold example
  const regularCount = topCustomers.filter((c) => c.visits > 3).length;

  const segmentation = [
    { name: "New", value: newCount },
    { name: "Returning", value: returningCount },
    { name: "VIP (> $200)", value: vipCount },
    { name: "Regular (> 3 visits)", value: regularCount },
  ];

  // 4. Retention (Mock for graph - hard to do real cohort in one go without heavy query)
  // Providing a flat line for now or empty
  const retention = [];

  res.status(200).json({
    overview: {
      totalCustomers: uniqueCustomerIds.length,
      newCustomers: newCount,
      repeatRate,
      avgLTV: Math.round(avgLTV),
    },
    retention, // Keeping empty for now
    segmentation,
    topCustomers,
  });
});

// @desc    Get Inventory Analytics
// @route   GET /api/analytics/inventory
// @access  Private
const getInventoryData = asyncHandler(async (req, res) => {
  const { branchId, startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();

  // 1. Inventory Value & Low Stock from InventoryItem model
  const inventoryItems = await InventoryItem.find({
    isActive: true,
    storeId: req.storeId,
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
        storeId: new mongoose.Types.ObjectId(req.storeId),
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
        storeId: new mongoose.Types.ObjectId(req.storeId),
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
        storeId: new mongoose.Types.ObjectId(req.storeId),
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
            $cond: [
              { $lt: ["$quantityChange", 0] },
              { $abs: "$quantityChange" },
              0,
            ],
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
        storeId: new mongoose.Types.ObjectId(req.storeId),
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
  const foodCostPercentage =
    totalRevenue > 0 ? ((totalWaste / totalRevenue) * 100).toFixed(1) : 0;

  res.status(200).json({
    overview: {
      totalValue,
      foodCostPercentage: parseFloat(foodCostPercentage),
      turnoverRate:
        inventoryItems.length > 0
          ? (totalRevenue / totalValue).toFixed(1) + "x"
          : "0x",
      totalWaste,
      lowStockCount: lowStock.length,
    },
    trends: trends.map((t) => ({
      date: t._id,
      stockIn: t.totalIn,
      stockOut: t.totalOut,
    })),
    wasteByReason:
      wasteByReason.length > 0
        ? wasteByReason
        : [{ name: "No waste data", value: 0 }],
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
    storeId: new mongoose.Types.ObjectId(req.storeId),
    createdAt: { $gte: start, $lte: end },
    orderStatus: { $ne: "cancelled" },
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
        storeId: new mongoose.Types.ObjectId(req.storeId),
        createdAt: { $gte: start, $lte: end },
        "refunds.0": { $exists: true }, // Only orders with refunds
      },
    },
    { $unwind: "$refunds" },
    {
      $project: {
        date: {
          $dateToString: { format: "%Y-%m-%d", date: "$refunds.refundedAt" },
        },
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
  const totalTransactions = formattedMethods.reduce(
    (acc, m) => acc + m.count,
    0
  );
  const avgTransaction =
    totalTransactions > 0 ? totalCollected / totalTransactions : 0;

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
    storeId: new mongoose.Types.ObjectId(req.storeId),
    createdAt: { $gte: start, $lte: end },
    orderStatus: { $ne: "cancelled" },
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

  // 2. Forecasting (Same-Day Averaging)
  // Logic: For the next 7 days, look at the ANY order from the last 30 days that matches the weekday
  const forecasting = [];
  const today = new Date();
  const insights = []; // Rule-based insights

  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + i);
    const dayOfWeek = futureDate.getDay() + 1; // Mongo 1-7

    // Aggregate average sales for this specific day of week over last 90 days
    const pastStats = await Order.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(req.storeId),
          createdAt: {
            $gte: new Date(new Date().setDate(today.getDate() - 90)), // Last 90 days
            $lte: today,
          },
          orderStatus: { $ne: "cancelled" },
          $expr: { $eq: [{ $dayOfWeek: "$createdAt" }, dayOfWeek] }, // Same day of week
        },
      },
      {
        $group: {
          _id: null,
          avgTotal: { $avg: "$totalAmount" },
        },
      },
    ]);

    const predicted = pastStats[0]?.avgTotal || 0;
    forecasting.push({
      date: futureDate.toISOString().split("T")[0],
      predicted: Math.round(predicted),
      actual: null, // It's future
    });
  }

  // 3. Rule-Based Insights Generation
  const totalRev = formattedHeatmap.reduce((acc, h) => acc + h.value, 0);

  // Insight: Busiest Day
  if (formattedHeatmap.length > 0) {
    // Group by day
    const dayTotals = {};
    formattedHeatmap.forEach((h) => {
      if (!dayTotals[h.day]) dayTotals[h.day] = 0;
      dayTotals[h.day] += h.value;
    });
    const busiestDayIndex = Object.keys(dayTotals).reduce((a, b) =>
      dayTotals[a] > dayTotals[b] ? a : b
    );
    const days = [
      "Unknown",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    insights.push(`Your busiest day is usually ${days[busiestDayIndex]}.`);
  }

  // Insight: Busiest Hour
  if (formattedHeatmap.length > 0) {
    const hourTotals = {};
    formattedHeatmap.forEach((h) => {
      if (!hourTotals[h.hour]) hourTotals[h.hour] = 0;
      hourTotals[h.hour] += h.value;
    });
    const busiestHour = Object.keys(hourTotals).reduce((a, b) =>
      hourTotals[a] > hourTotals[b] ? a : b
    );
    insights.push(`Peak hours are around ${busiestHour}:00.`);
  }

  // Insight: Forecast Trend
  const nextDayForecast = forecasting[0];
  if (nextDayForecast && nextDayForecast.predicted > 0) {
    insights.push(
      `Forecast for tomorrow: ~$${nextDayForecast.predicted.toLocaleString()} in sales.`
    );
  }

  res.status(200).json({
    heatmap: formattedHeatmap,
    forecasting,
    anomalyDetection: [], // Cleared mocks
    insights, // New field
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
