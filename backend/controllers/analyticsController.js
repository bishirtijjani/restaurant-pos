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
    0,
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
    (a, b) => b.profit - a.profit,
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

  // 2. Waste Analysis (Negative adjustments except returns)
  const wasteAdjustments = await StockAdjustment.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(req.storeId),
        createdAt: { $gte: start, $lte: end },
        reason: {
          $in: ["wastage", "damage", "theft", "correction", "stock_take"],
        },
        type: { $in: ["subtraction", "correction"] },
      },
    },
    {
      $lookup: {
        from: "inventoryitems",
        localField: "inventoryItem",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: "$item" },
    {
      $project: {
        reason: 1,
        qty: {
          $cond: [
            { $eq: ["$type", "correction"] },
            { $abs: { $subtract: ["$newStock", "$previousStock"] } },
            "$quantity",
          ],
        },
        cost: {
          $multiply: [
            {
              $cond: [
                { $eq: ["$type", "correction"] },
                { $abs: { $subtract: ["$newStock", "$previousStock"] } },
                "$quantity",
              ],
            },
            "$item.costPrice",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$reason",
        totalQuantity: { $sum: "$qty" },
        totalCost: { $sum: "$cost" },
      },
    },
  ]);

  const wasteByReason = wasteAdjustments.map((w) => ({
    name: w._id.charAt(0).toUpperCase() + w._id.slice(1).replace("_", " "),
    value: Math.round((w.totalCost || 0) * 100) / 100,
    quantity: w.totalQuantity || 0,
  }));

  const totalWaste = wasteByReason.reduce((acc, w) => acc + w.value, 0);

  // 3. Top Wasted Items
  const wasteTopItems = await StockAdjustment.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(req.storeId),
        createdAt: { $gte: start, $lte: end },
        reason: {
          $in: ["wastage", "damage", "theft", "correction", "stock_take"],
        },
        type: { $in: ["subtraction", "correction"] },
      },
    },
    {
      $lookup: {
        from: "inventoryitems",
        localField: "inventoryItem",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: "$item" },
    {
      $group: {
        _id: "$inventoryItem",
        qty: {
          $sum: {
            $cond: [
              { $eq: ["$type", "correction"] },
              { $abs: { $subtract: ["$newStock", "$previousStock"] } },
              "$quantity",
            ],
          },
        },
        cost: {
          $sum: {
            $multiply: [
              {
                $cond: [
                  { $eq: ["$type", "correction"] },
                  { $abs: { $subtract: ["$newStock", "$previousStock"] } },
                  "$quantity",
                ],
              },
              "$item.costPrice",
            ],
          },
        },
        name: { $first: "$item.name" },
        reason: { $first: "$reason" },
      },
    },
    {
      $project: {
        id: "$_id",
        name: 1,
        qty: 1,
        cost: { $round: ["$cost", 2] },
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
            $cond: [{ $eq: ["$type", "addition"] }, "$quantity", 0],
          },
        },
        totalOut: {
          $sum: {
            $cond: [
              { $eq: ["$type", "subtraction"] },
              "$quantity",
              {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "correction"] },
                      { $lt: ["$newStock", "$previousStock"] },
                    ],
                  },
                  { $subtract: ["$previousStock", "$newStock"] },
                  0,
                ],
              },
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
    0,
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
      dayTotals[a] > dayTotals[b] ? a : b,
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
      hourTotals[a] > hourTotals[b] ? a : b,
    );
    insights.push(`Peak hours are around ${busiestHour}:00.`);
  }

  // Insight: Forecast Trend
  const nextDayForecast = forecasting[0];
  if (nextDayForecast && nextDayForecast.predicted > 0) {
    insights.push(
      `Forecast for tomorrow: ~$${nextDayForecast.predicted.toLocaleString()} in sales.`,
    );
  }

  res.status(200).json({
    heatmap: formattedHeatmap,
    forecasting,
    anomalyDetection: [], // Cleared mocks
    insights, // New field
  });
});

/**
 * @desc    Get Multi-Store Overview (For Owners/Managers)
 * @route   GET /api/analytics/multi-store-overview
 * @access  Private (Admin/Manager only)
 */
const getMultiStoreOverview = asyncHandler(async (req, res) => {
  // 1. Get Authorized Stores
  const user = await User.findById(req.user.id).populate("stores.storeId");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Filter for stores where user has management role
  const managedStores = user.stores.filter(
    (s) => ["admin", "manager"].includes(s.role) && s.storeId,
  );

  if (managedStores.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        summary: { totalRevenue: 0, activeOrders: 0, lowStockTotal: 0 },
        stores: [],
        alerts: [],
      },
    });
  }

  const storeIds = managedStores.map((s) => s.storeId._id);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 2. Parallel Metrics Fetching
  const [revenueStats, activeOrders, lowStockItems, hourlySalesTrend] =
    await Promise.all([
      // Group Revenue & Order Count
      Order.aggregate([
        {
          $match: {
            storeId: { $in: storeIds },
            createdAt: { $gte: todayStart, $lte: todayEnd },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: "$storeId",
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
      // Active Orders per store
      Order.aggregate([
        {
          $match: {
            storeId: { $in: storeIds },
            orderStatus: { $in: ["pending", "preparing", "ready"] },
          },
        },
        { $group: { _id: "$storeId", count: { $sum: 1 } } },
      ]),
      // Low Stock Items per store
      InventoryItem.aggregate([
        {
          $match: {
            storeId: { $in: storeIds },
            isActive: true,
            $expr: { $lte: ["$currentStock", "$minStockLevel"] },
          },
        },
        { $group: { _id: "$storeId", count: { $sum: 1 } } },
      ]),
      // Hourly trend per store (for sparklines)
      Order.aggregate([
        {
          $match: {
            storeId: { $in: storeIds },
            createdAt: { $gte: todayStart, $lte: todayEnd },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: { storeId: "$storeId", hour: { $hour: "$createdAt" } },
            amount: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id.hour": 1 } },
      ]),
    ]);

  // 3. Format Data per Store
  const storeSnapshots = managedStores.map((s) => {
    const sId = s.storeId._id.toString();
    const rev = revenueStats.find((r) => r._id.toString() === sId);
    const act = activeOrders.find((a) => a._id.toString() === sId);
    const low = lowStockItems.find((l) => l._id.toString() === sId);

    // Format hourly sales for this store (filled with 0s)
    const storeHourly = hourlySalesTrend.filter(
      (h) => h._id.storeId.toString() === sId,
    );
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const found = storeHourly.find((h) => h._id.hour === i);
      return { hour: i, revenue: found ? found.amount : 0 };
    });

    return {
      storeId: sId,
      name: s.storeId.name,
      location: s.storeId.location,
      role: s.role,
      todayRevenue: rev ? rev.revenue : 0,
      todayOrderCount: rev ? rev.count : 0,
      activeOrders: act ? act.count : 0,
      lowStockCount: low ? low.count : 0,
      hourlyTrend: hourlyData,
    };
  });

  // 4. Global Summary
  const globalSummary = {
    totalRevenue: revenueStats.reduce((acc, curr) => acc + curr.revenue, 0),
    totalOrders: revenueStats.reduce((acc, curr) => acc + curr.count, 0),
    activeOrders: activeOrders.reduce((acc, curr) => acc + curr.count, 0),
    lowStockTotal: lowStockItems.reduce((acc, curr) => acc + curr.count, 0),
  };

  // 5. Synthesize Alerts
  const alerts = [];
  storeSnapshots.forEach((s) => {
    if (s.lowStockCount > 0) {
      alerts.push({
        storeName: s.name,
        type: "inventory",
        message: `${s.lowStockCount} items low in stock`,
        severity: "medium",
      });
    }
    if (s.activeOrders > 10) {
      // Example threshold
      alerts.push({
        storeName: s.name,
        type: "load",
        message: `High kitchen load: ${s.activeOrders} active orders`,
        severity: "high",
      });
    }
  });

  res.status(200).json({
    success: true,
    data: {
      summary: globalSummary,
      stores: storeSnapshots,
      alerts: alerts.sort((a, b) => (b.severity === "high" ? 1 : -1)),
    },
  });
});

/**
 * @desc    Get Tax Analytics
 * @route   GET /api/analytics/tax
 * @access  Private
 */
const getTaxData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Filter for realized revenue only (Completed or Paid)
  const matchStage = {
    storeId: new mongoose.Types.ObjectId(req.storeId),
    createdAt: { $gte: start, $lte: end },
    orderStatus: { $in: ["completed", "served"] },
    paymentStatus: { $in: ["paid", "partial"] },
  };

  // 1. Overview KPIs
  const kpiStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalGross: { $sum: "$totalAmount" },
        totalTax: { $sum: "$taxBreakdown.totalTax" },
        totalServiceCharge: { $sum: "$taxBreakdown.serviceCharge" },
        totalNet: { $sum: "$taxBreakdown.subtotal" },
        totalTips: { $sum: "$tip.amount" },
        totalRefunds: {
          $sum: {
            $reduce: {
              input: "$refunds",
              initialValue: 0,
              reduce: {
                $add: [
                  "$$value",
                  {
                    $cond: [
                      { $eq: ["$$this.gatewayStatus", "succeeded"] },
                      "$$this.amount",
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
        orderCount: { $count: {} },
      },
    },
    {
      $project: {
        _id: 0,
        totalGross: { $round: ["$totalGross", 2] },
        totalTax: { $round: ["$totalTax", 2] },
        totalServiceCharge: { $round: ["$totalServiceCharge", 2] },
        totalNet: { $round: ["$totalNet", 2] },
        totalTips: { $round: ["$totalTips", 2] },
        totalRefunds: { $round: ["$totalRefunds", 2] },
        // Revenue without tips is the actual base for tax reporting
        comparableRevenue: {
          $round: [{ $subtract: ["$totalGross", "$totalTips"] }, 2],
        },
        orderCount: 1,
      },
    },
  ]);

  const stats = kpiStats[0] || {
    totalGross: 0,
    totalTax: 0,
    totalServiceCharge: 0,
    totalNet: 0,
    totalTips: 0,
    totalRefunds: 0,
    comparableRevenue: 0,
    orderCount: 0,
  };

  // 2. Tax Breakdown by Rate (Only successful collections)
  const taxBreakdown = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$taxBreakdown.items" },
    {
      $group: {
        _id: "$taxBreakdown.items.taxRate",
        taxAmount: { $sum: "$taxBreakdown.items.taxAmount" },
        name: { $first: "$taxBreakdown.items.name" },
      },
    },
    {
      $project: {
        rate: "$_id",
        amount: { $round: ["$taxAmount", 2] },
        name: {
          $ifNull: ["$name", { $concat: [{ $toString: "$_id" }, "% Tax"] }],
        },
      },
    },
    { $sort: { rate: -1 } },
  ]);

  // 3. Daily Tax Trends
  const trends = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        tax: { $sum: "$taxBreakdown.totalTax" },
        serviceCharge: { $sum: "$taxBreakdown.serviceCharge" },
        revenue: { $sum: "$taxBreakdown.subtotal" },
      },
    },
    {
      $project: {
        date: "$_id",
        tax: { $round: ["$tax", 2] },
        serviceCharge: { $round: ["$serviceCharge", 2] },
        revenue: { $round: ["$revenue", 2] },
      },
    },
    { $sort: { date: 1 } },
  ]);

  res.status(200).json({
    overview: stats,
    breakdown: taxBreakdown,
    trends: trends,
  });
});

/**
 * @desc    Get Stock Variance Data
 * @route   GET /api/analytics/inventory/variance
 * @access  Private
 */
const getVarianceData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Focus on adjustments that represent "Variance" (Stock Take, Theft, Wastage)
  const matchStage = {
    storeId: new mongoose.Types.ObjectId(req.storeId),
    createdAt: { $gte: start, $lte: end },
    reason: { $in: ["stock_take", "theft", "wastage", "damage", "correction"] },
  };

  const varianceStats = await StockAdjustment.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "inventoryitems",
        localField: "inventoryItem",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: "$item" },
    {
      $project: {
        reason: 1,
        inventoryItem: 1,
        itemName: "$item.name",
        category: "$item.category",
        costPrice: "$item.costPrice",
        unit: "$item.unit",
        varianceQty: {
          $cond: [
            { $eq: ["$type", "correction"] },
            { $subtract: ["$newStock", "$previousStock"] },
            {
              $cond: [
                { $eq: ["$type", "subtraction"] },
                { $multiply: ["$quantity", -1] },
                "$quantity",
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        reason: 1,
        inventoryItem: 1,
        itemName: 1,
        category: 1,
        varianceQty: 1,
        unit: 1,
        costImpact: {
          $round: [{ $multiply: ["$varianceQty", "$costPrice"] }, 2],
        },
      },
    },
  ]);

  // Group by Item
  const itemSummary = await StockAdjustment.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "inventoryitems",
        localField: "inventoryItem",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: "$item" },
    {
      $group: {
        _id: "$inventoryItem",
        name: { $first: "$item.name" },
        category: { $first: "$item.category" },
        totalVariance: {
          $sum: {
            $cond: [
              { $eq: ["$type", "correction"] },
              { $subtract: ["$newStock", "$previousStock"] },
              {
                $cond: [
                  { $eq: ["$type", "subtraction"] },
                  { $multiply: ["$quantity", -1] },
                  "$quantity",
                ],
              },
            ],
          },
        },
        totalLoss: {
          $sum: {
            $multiply: [
              {
                $cond: [
                  { $eq: ["$type", "correction"] },
                  { $subtract: ["$newStock", "$previousStock"] },
                  {
                    $cond: [
                      { $eq: ["$type", "subtraction"] },
                      { $multiply: ["$quantity", -1] },
                      "$quantity",
                    ],
                  },
                ],
              },
              "$item.costPrice",
            ],
          },
        },
      },
    },
    { $sort: { totalLoss: 1 } }, // Most negative first
    { $limit: 20 },
  ]);

  // Group by Reason
  const reasonSummary = await StockAdjustment.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "inventoryitems",
        localField: "inventoryItem",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: "$item" },
    {
      $group: {
        _id: "$reason",
        count: { $sum: 1 },
        totalImpact: {
          $sum: {
            $multiply: [
              {
                $cond: [
                  { $eq: ["$type", "correction"] },
                  { $subtract: ["$newStock", "$previousStock"] },
                  {
                    $cond: [
                      { $eq: ["$type", "subtraction"] },
                      { $multiply: ["$quantity", -1] },
                      "$quantity",
                    ],
                  },
                ],
              },
              "$item.costPrice",
            ],
          },
        },
      },
    },
  ]);

  res.status(200).json({
    summary: {
      totalAdjustments: varianceStats.length,
      totalLoss: varianceStats.reduce(
        (acc, curr) => acc + (curr.costImpact < 0 ? curr.costImpact : 0),
        0,
      ),
      totalGain: varianceStats.reduce(
        (acc, curr) => acc + (curr.costImpact > 0 ? curr.costImpact : 0),
        0,
      ),
      netImpact: varianceStats.reduce((acc, curr) => acc + curr.costImpact, 0),
    },
    items: itemSummary.map((i) => ({
      ...i,
      totalLoss: Math.round(i.totalLoss * 100) / 100,
    })),
    reasons: reasonSummary.map((r) => ({
      reason: r._id,
      count: r.count,
      impact: Math.round(r.totalImpact * 100) / 100,
    })),
    details: varianceStats,
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
  getMultiStoreOverview,
  getTaxData,
  getVarianceData,
};
