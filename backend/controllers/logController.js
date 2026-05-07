const AuditLog = require("../models/AuditLog");
const User = require("../models/User");

// Get paginated audit logs with filters
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      userId,
      entityType,
      action,
      search,
    } = req.query;

    // Base filter: Scoped to Store (and Organization implicitly via store ownership, but explicit storeId is safer/standard)
    // Assuming req.storeId is set by auth/store middleware
    const query = { storeId: req.storeId };

    // Date Range Filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Specific Filters
    if (userId) query.userId = userId;
    if (entityType) query.entityType = entityType;
    if (action) query.action = action;

    // Search (Reason or Entity ID)
    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: "i" } },
        // If search looks like an ObjectId, allow searching by Entity ID
        ...(search.match(/^[0-9a-fA-F]{24}$/) ? [{ entityId: search }] : []),
      ];
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("userId", "fullname email role") // Show who did it
      .lean();

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

// Get filter options (distinct values for dropdowns)
exports.getLogFilters = async (req, res) => {
  try {
    const storeId = req.storeId;

    // Get unique actions and entity types that have actually occurred in this store
    const [actions, entityTypes, users] = await Promise.all([
      AuditLog.distinct("action", { storeId }),
      AuditLog.distinct("entityType", { storeId }),
      User.find({ storeId }).select("_id fullname role").sort({ fullname: 1 }), // Get potential actors
    ]);

    res.status(200).json({
      success: true,
      data: {
        actions,
        entityTypes,
        users,
      },
    });
  } catch (error) {
    console.error("Error fetching log filters:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filter options",
      error: error.message,
    });
  }
};


