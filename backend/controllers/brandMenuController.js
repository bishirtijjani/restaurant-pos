const { enqueuePublish, getSyncJobStatus } = require("../utils/syncEngine");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const AddOnGroup = require("../models/AddOnGroup");

/**
 * Get all master menu items for the brand
 */
const getBrandMenu = async (req, res) => {
  try {
    const { status, category } = req.query;

    const filter = {
      organizationId: req.organizationId,
      isMaster: true,
    };

    if (status) filter.publishStatus = status;
    if (category) filter.category = category;

    const items = await MenuItem.find(filter)
      .populate("addOnGroups", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching brand menu:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand menu",
      error: error.message,
    });
  }
};

/**
 * Create a new master menu item
 */
const createMasterItem = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      description,
      image,
      preparationTime,
      addOnGroups,
    } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required",
      });
    }

    // Create master item (draft by default)
    const masterItem = await MenuItem.create({
      name,
      category,
      price: price || 0,
      description,
      image,
      preparationTime: preparationTime || 15,
      addOnGroups: addOnGroups || [],
      organizationId: req.organizationId,
      storeId: null, // Master items have no storeId
      isMaster: true,
      publishStatus: "draft",
      version: 1,
    });

    res.status(201).json({
      success: true,
      message: "Master item created (draft)",
      data: masterItem,
    });
  } catch (error) {
    console.error("Error creating master item:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An item with this name already exists in your brand catalog",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create master item",
      error: error.message,
    });
  }
};

/**
 * Update a master menu item (stays in draft)
 */
const updateMasterItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find master item
    const masterItem = await MenuItem.findOne({
      _id: id,
      organizationId: req.organizationId,
      isMaster: true,
    });

    if (!masterItem) {
      return res.status(404).json({
        success: false,
        message: "Master item not found",
      });
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        masterItem[key] = updates[key];
      }
    });

    // Keep as draft (publish is separate action)
    masterItem.publishStatus = "draft";

    await masterItem.save();

    res.status(200).json({
      success: true,
      message: "Master item updated (draft)",
      data: masterItem,
    });
  } catch (error) {
    console.error("Error updating master item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update master item",
      error: error.message,
    });
  }
};

/**
 * Publish a master item (triggers async sync)
 */
const publishMasterItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find master item
    const masterItem = await MenuItem.findOne({
      _id: id,
      organizationId: req.organizationId,
      isMaster: true,
    });

    if (!masterItem) {
      return res.status(404).json({
        success: false,
        message: "Master item not found",
      });
    }

    // Update publish status and version
    masterItem.publishStatus = "published";
    masterItem.version += 1;
    masterItem.lastPublishedAt = new Date();
    await masterItem.save();

    // Enqueue sync job
    const syncJob = await enqueuePublish(
      masterItem._id,
      "MenuItem",
      req.organizationId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Item published. Syncing to stores...",
      data: {
        item: masterItem,
        syncJob: {
          jobId: syncJob.jobId,
          status: syncJob.status,
          affectedStores: syncJob.affectedStores.length,
        },
      },
    });
  } catch (error) {
    console.error("Error publishing master item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish master item",
      error: error.message,
    });
  }
};

/**
 * Get sync job status
 */
const getSyncStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await getSyncJobStatus(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Sync job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sync status",
      error: error.message,
    });
  }
};

/**
 * Delete a master item
 */
const deleteMasterItem = async (req, res) => {
  try {
    const { id } = req.params;

    const masterItem = await MenuItem.findOneAndDelete({
      _id: id,
      organizationId: req.organizationId,
      isMaster: true,
    });

    if (!masterItem) {
      return res.status(404).json({
        success: false,
        message: "Master item not found",
      });
    }

    // TODO: Optionally delete all linked store items
    // await MenuItem.deleteMany({ masterId: id });

    res.status(200).json({
      success: true,
      message: "Master item deleted",
    });
  } catch (error) {
    console.error("Error deleting master item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete master item",
      error: error.message,
    });
  }
};

module.exports = {
  getBrandMenu,
  createMasterItem,
  updateMasterItem,
  publishMasterItem,
  getSyncStatus,
  deleteMasterItem,
};
