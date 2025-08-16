const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const Category = require("../models/Category");

const getDashboardStats = async (req, res) => {
  try {
    // Get current date and date 6 months ago for trends
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Calculate total inventory value and menuItems near expiry
    const menuItems = await MenuItem.find();
    let totalInventoryValue = 0;
    let itemsNearExpiry = 0;

    // Calculate expiry threshold (date to report menuItems near expiry)
    const expiryThreshold = new Date();
    const daysToExpire = parseInt(req.query.days) || 30;
    expiryThreshold.setDate(expiryThreshold.getDate() + daysToExpire);

    menuItems.forEach((menuItem) => {
      menuItem.batches.forEach((batch) => {
        totalInventoryValue += batch.quantity * batch.packSellingPrice;
        if (new Date(batch.expiryDate) <= expiryThreshold) {
          itemsNearExpiry += batch.quantity;
        }
      });
    });

    // Get active orders
    const activeOrders = await Order.countDocuments({
      paymentStatus: "pending",
    });

    // Get today's sales data
    const todaysSales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.menuItemId",
          totalPackQuantity: { $sum: "$items.packQuantity" },
          totalUnitQuantity: { $sum: "$items.unitQuantity" },
          totalAmount: { $sum: "$items.subtotal" },
        },
      },
      {
        $lookup: {
          from: "menuItems",
          localField: "_id",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      {
        $unwind: "$menuItem",
      },
      {
        $project: {
          menuItemName: "$menuItem.name",
          totalPackQuantity: 1,
          totalUnitQuantity: 1,
          totalAmount: 1,
        },
      },
    ]);

    // Calculate monthly sales data
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get menuItems with low stock
    const lowStockThreshold = 30;
    const lowStockMenuItems = await MenuItem.aggregate([
      {
        $unwind: "$batches",
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          totalStock: { $sum: "$batches.quantity" },
        },
      },
      {
        $match: {
          totalStock: { $lt: lowStockThreshold },
        },
      },
    ]);

    // Get expiring menuItems with batch details - FIXED VERSION
    // const expiringMenuItems = await MenuItem.find({
    //   "batches.expiryDate": {
    //     $lte: expiryThreshold,
    //     $gte: today,
    //   },
    // }).then((menuItems) => {
    //   return menuItems
    //     .map((menuItem) => {
    //       // Filter only the batches that are expiring
    //       const expiringBatches = menuItem.batches.filter(
    //         (batch) =>
    //           batch.expiryDate <= expiryThreshold && batch.expiryDate >= today
    //       );

    //       return {
    //         _id: menuItem._id,
    //         name: menuItem.name,
    //         category: menuItem.category,
    //         expiringBatches: expiringBatches.map((batch) => ({
    //           batchNumber: batch.batchNumber,
    //           quantity: batch.quantity,
    //           expiryDate: batch.expiryDate,
    //           packSellingPrice: batch.packSellingPrice,
    //           unitSellingPrice: batch.unitSellingPrice,
    //         })),
    //       };
    //     })
    //     .filter((menuItem) => menuItem.expiringBatches.length > 0);
    // });

    const expiringMenuItems = await MenuItem.aggregate([
      {
        $project: {
          name: 1,
          category: 1,
          unitsInPack: 1,
          description: 1,
          expiringBatches: {
            $filter: {
              input: "$batches",
              as: "batch",
              cond: {
                $and: [
                  { $lt: ["$$batch.expiryDate", expiryThreshold] },
                  { $gte: ["$$batch.expiryDate", new Date()] },
                ],
              },
            },
          },
        },
      },
      // Remove menuItems with no expiring batches
      { $match: { "expiringBatches.0": { $exists: true } } },
      // Add calculated fields
      {
        $addFields: {
          totalExpiringQuantity: {
            $reduce: {
              input: "$expiringBatches",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.quantity"] },
            },
          },
        },
      },
    ]);

    // Get recent activity
    const recentActivity = await Order.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("items.menuItemId");

    // Get category stats
    const categoryCount = await Category.countDocuments();
    const menuItemCount = await MenuItem.countDocuments();

    return res.json({
      success: true,
      data: {
        totalInventoryValue,
        activeOrders,
        itemsNearExpiry,
        todaysSales,
        monthlyOrders,
        lowStockMenuItems,
        expiringMenuItems,
        recentActivity,
        categoryCount,
        menuItemCount,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
