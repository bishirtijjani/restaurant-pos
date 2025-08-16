const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Expense = require("../models/Expense");
const Category = require("../models/Category");

// Helper to get date range
const getDateRange = (range) => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const endDate = new Date(now.setHours(23, 59, 59, 999));
  let startDate;

  switch (range) {
    case "today":
      startDate = today;
      break;
    case "yesterday":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      break;
    case "week":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "year":
      startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = today;
  }

  return { startDate, endDate };
};

// Get overview stats (for dashboard cards)
exports.getOverviewStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query.dateRange
      ? {
          startDate: new Date(req.query.dateRange.startDate),
          endDate: new Date(req.query.dateRange.endDate),
        }
      : getDateRange(req.query.range || "today");

    // Total Sales
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          averageCheck: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Order types distribution
    const orderTypeDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: "$orderType",
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Total Expenses
    const expenseData = await Expense.aggregate([
      {
        $match: {
          $or: [
            { date: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
        },
      },
    ]);

    // Best-selling menu items
    const topItems = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.menuItemId",
          name: { $first: "$orderItems.name" },
          totalQuantity: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: "$orderItems.subtotal" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    const totalSales = salesData[0]?.totalSales || 0;
    const totalExpenses = expenseData[0]?.totalExpenses || 0;
    const grossProfit = totalSales - totalExpenses;
    const grossProfitMargin =
      totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalSales,
        totalExpenses,
        grossProfit,
        grossProfitMargin,
        orderCount: salesData[0]?.orderCount || 0,
        averageCheck: salesData[0]?.averageCheck || 0,
        orderTypeDistribution,
        topItems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get sales trends over time
exports.getSalesTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.query.dateRange
      ? {
          startDate: new Date(req.query.dateRange.startDate),
          endDate: new Date(req.query.dateRange.endDate),
        }
      : getDateRange(req.query.range || "month");

    // Calculate time interval based on date range
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let groupByFormat;
    let dateFormat;

    if (diffDays <= 2) {
      // Hours for single day or two days
      groupByFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        hour: { $hour: "$createdAt" },
      };
      dateFormat = "%Y-%m-%d %H:00";
    } else if (diffDays <= 31) {
      // Days for a month
      groupByFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      dateFormat = "%Y-%m-%d";
    } else if (diffDays <= 365) {
      // Weeks or months for a year
      groupByFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      dateFormat = "%Y-%m";
    } else {
      // Months for multiple years
      groupByFormat = {
        year: { $year: "$createdAt" },
      };
      dateFormat = "%Y";
    }

    const salesTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: groupByFormat,
          sales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          sales: 1,
          orderCount: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json({
      success: true,
      data: salesTrends,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get sales by category
exports.getSalesByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query.dateRange
      ? {
          startDate: new Date(req.query.dateRange.startDate),
          endDate: new Date(req.query.dateRange.endDate),
        }
      : getDateRange(req.query.range || "month");

    const categories = await Category.find({});
    const menuItems = await MenuItem.find({});

    // Create a map of menu items to categories
    const menuItemCategoryMap = {};
    menuItems.forEach((item) => {
      menuItemCategoryMap[item._id.toString()] = item.category;
    });

    const orderItems = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      { $unwind: "$orderItems" },
      {
        $project: {
          menuItemId: "$orderItems.menuItemId",
          quantity: "$orderItems.quantity",
          subtotal: "$orderItems.subtotal",
        },
      },
    ]);

    // Process data by category
    const categorySales = {};
    categories.forEach((cat) => {
      categorySales[cat.name] = { total: 0, quantity: 0 };
    });

    orderItems.forEach((item) => {
      const itemId = item.menuItemId.toString();
      const category = menuItemCategoryMap[itemId];

      if (category && categorySales[category]) {
        categorySales[category].total += item.subtotal;
        categorySales[category].quantity += item.quantity;
      } else {
        // Handle items with categories not in the Category collection
        if (!categorySales["Other"]) {
          categorySales["Other"] = { total: 0, quantity: 0 };
        }
        categorySales["Other"].total += item.subtotal;
        categorySales["Other"].quantity += item.quantity;
      }
    });

    // Convert to array for easier consumption by frontend
    const result = Object.keys(categorySales).map((name) => ({
      name,
      total: categorySales[name].total,
      quantity: categorySales[name].quantity,
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get menu item performance
exports.getMenuItemPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query.dateRange
      ? {
          startDate: new Date(req.query.dateRange.startDate),
          endDate: new Date(req.query.dateRange.endDate),
        }
      : getDateRange(req.query.range || "month");

    const itemPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.menuItemId",
          name: { $first: "$orderItems.name" },
          totalQuantity: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: "$orderItems.subtotal" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "_id",
          as: "menuItemDetails",
        },
      },
      {
        $addFields: {
          menuItem: { $arrayElemAt: ["$menuItemDetails", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: "$menuItem.category",
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          costPrice: { $ifNull: ["$menuItem.costPrice", 0] },
          price: { $ifNull: ["$menuItem.price", 0] },
        },
      },
      {
        $addFields: {
          totalCost: { $multiply: ["$costPrice", "$totalQuantity"] },
          profit: {
            $subtract: [
              "$totalRevenue",
              { $multiply: ["$costPrice", "$totalQuantity"] },
            ],
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    res.json({
      success: true,
      data: itemPerformance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get peak hours analysis
exports.getPeakHoursAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query.dateRange
      ? {
          startDate: new Date(req.query.dateRange.startDate),
          endDate: new Date(req.query.dateRange.endDate),
        }
      : getDateRange(req.query.range || "month");

    const hourlyAnalysis = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$createdAt" },
            dayOfWeek: { $dayOfWeek: "$createdAt" },
          },
          orderCount: { $sum: 1 },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          hour: "$_id.hour",
          dayOfWeek: "$_id.dayOfWeek",
          orderCount: 1,
          totalSales: 1,
        },
      },
      { $sort: { dayOfWeek: 1, hour: 1 } },
    ]);

    // Process for heatmap or other visualizations
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const formattedData = days.map((day) => {
      const dayData = hourlyAnalysis.filter(
        (item) => item.dayOfWeek === days.indexOf(day) + 1
      );
      return {
        day,
        hours: Array.from({ length: 24 }, (_, hour) => {
          const hourData = dayData.find((d) => d.hour === hour);
          return {
            hour,
            orderCount: hourData?.orderCount || 0,
            totalSales: hourData?.totalSales || 0,
          };
        }),
      };
    });

    res.json({
      success: true,
      data: {
        hourlyAnalysis,
        formattedData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get expense analysis
exports.getExpenseAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query.dateRange
      ? {
          startDate: new Date(req.query.dateRange.startDate),
          endDate: new Date(req.query.dateRange.endDate),
        }
      : getDateRange(req.query.range || "month");

    // Get expense data by category
    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          $or: [
            { date: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Get expense trend over time
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let groupByFormat;
    let dateFormat;

    if (diffDays <= 31) {
      groupByFormat = {
        year: { $year: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" },
      };
      dateFormat = "%Y-%m-%d";
    } else if (diffDays <= 365) {
      groupByFormat = {
        year: { $year: "$date" },
        month: { $month: "$date" },
      };
      dateFormat = "%Y-%m";
    } else {
      groupByFormat = {
        year: { $year: "$date" },
      };
      dateFormat = "%Y";
    }

    const expenseTrend = await Expense.aggregate([
      {
        $match: {
          $or: [
            { date: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      {
        $group: {
          _id: groupByFormat,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { format: dateFormat, date: "$date" } },
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Get total sales for profit margin calculation
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalExpenses = expensesByCategory.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );
    const totalSales = salesData[0]?.totalSales || 0;
    const netProfit = totalSales - totalExpenses;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    res.json({
      success: true,
      data: {
        expensesByCategory,
        expenseTrend,
        totalExpenses,
        totalSales,
        netProfit,
        profitMargin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get staff performance
exports.getStaffPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query.dateRange
      ? {
          startDate: new Date(req.query.dateRange.startDate),
          endDate: new Date(req.query.dateRange.endDate),
        }
      : getDateRange(req.query.range || "month");

    const staffPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: "$servedBy",
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "staffDetails",
        },
      },
      {
        $project: {
          _id: 1,
          staffName: { $arrayElemAt: ["$staffDetails.name", 0] },
          totalSales: 1,
          orderCount: 1,
          averageOrderValue: 1,
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    res.json({
      success: true,
      data: staffPerformance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get overall profitability report
exports.getProfitabilityReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query.dateRange
      ? {
          startDate: new Date(req.query.dateRange.startDate),
          endDate: new Date(req.query.dateRange.endDate),
        }
      : getDateRange(req.query.range || "month");

    // Get sales data
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    // Get detailed item sales with cost calculations
    const itemSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: ["cancelled"] },
        },
      },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "menuitems",
          localField: "orderItems.menuItemId",
          foreignField: "_id",
          as: "menuItemDetails",
        },
      },
      {
        $project: {
          menuItem: { $arrayElemAt: ["$menuItemDetails", 0] },
          quantity: "$orderItems.quantity",
          revenue: "$orderItems.subtotal",
        },
      },
      {
        $group: {
          _id: null,
          totalCostOfGoods: {
            $sum: {
              $multiply: [{ $ifNull: ["$menuItem.costPrice", 0] }, "$quantity"],
            },
          },
          totalRevenue: { $sum: "$revenue" },
        },
      },
    ]);

    // Get expense data
    const expenseData = await Expense.aggregate([
      {
        $match: {
          $or: [
            { date: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
        },
      },
    ]);

    // Calculate labor costs
    const laborCosts =
      expenseData.find((item) => item._id === "Salaries")?.amount || 0;

    // Calculate profitability metrics
    const totalSales = salesData[0]?.totalSales || 0;
    const totalExpenses = expenseData.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const costOfGoods = itemSales[0]?.totalCostOfGoods || 0;

    const grossProfit = totalSales - costOfGoods;
    const grossProfitMargin =
      totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    const netProfit = totalSales - totalExpenses;
    const netProfitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    const laborCostPercentage =
      totalSales > 0 ? (laborCosts / totalSales) * 100 : 0;

    // Format expense data for pie chart
    const expenseBreakdown = expenseData.map((item) => ({
      category: item._id,
      amount: item.amount,
      percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0,
    }));

    res.json({
      success: true,
      data: {
        totalSales,
        totalExpenses,
        costOfGoods,
        grossProfit,
        grossProfitMargin,
        netProfit,
        netProfitMargin,
        laborCosts,
        laborCostPercentage,
        expenseBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export data
exports.exportAnalyticsData = async (req, res) => {
  try {
    const { dataType, startDate, endDate } = req.query;

    const dateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    let data;

    switch (dataType) {
      case "sales":
        data = await Order.find({
          createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
          orderStatus: { $nin: ["cancelled"] },
        }).populate("servedBy", "name");
        break;
      case "menuItems":
        data = await MenuItem.find({});
        break;
      case "expenses":
        data = await Expense.find({
          $or: [
            { date: { $gte: dateRange.startDate, $lte: dateRange.endDate } },
            {
              createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
            },
          ],
        }).populate("createdBy", "name");
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid data type specified",
        });
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
