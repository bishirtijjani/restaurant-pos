const Queue = require("bull");
const SyncJob = require("../models/SyncJob");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const AddOnGroup = require("../models/AddOnGroup");
const Store = require("../models/Store");
const { v4: uuidv4 } = require("uuid");

// Create queue instance
const menuSyncQueue = new Queue("menu-sync", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
});

/**
 * Enqueue a publish job
 */
async function enqueuePublish(masterId, masterType, organizationId, userId) {
  const jobId = uuidv4();

  // Get all stores in organization
  const stores = await Store.find({ organizationId, status: "active" });
  const storeIds = stores.map((s) => s._id);

  // Create sync job record
  const syncJob = await SyncJob.create({
    jobId,
    type: `${masterType.toLowerCase()}_publish`,
    masterId,
    masterType,
    organizationId,
    affectedStores: storeIds,
    progress: { completed: 0, total: storeIds.length, failed: 0 },
    createdBy: userId,
  });

  // Add to queue
  await menuSyncQueue.add(
    {
      jobId,
      masterId,
      masterType,
      organizationId,
      storeIds,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );

  return syncJob;
}

/**
 * Process sync jobs
 */
menuSyncQueue.process(5, async (job) => {
  const { jobId, masterId, masterType, organizationId, storeIds } = job.data;

  try {
    // Update job status
    await SyncJob.findOneAndUpdate({ jobId }, { status: "processing" });

    // Get master item
    const Model = getModel(masterType);
    const masterItem = await Model.findById(masterId);

    if (!masterItem) {
      throw new Error(`Master ${masterType} not found: ${masterId}`);
    }

    let completed = 0;
    let failed = 0;

    // Propagate to each store
    for (const storeId of storeIds) {
      try {
        await propagateToStore(masterItem, masterType, storeId, organizationId);
        completed++;

        // Update progress
        await SyncJob.findOneAndUpdate(
          { jobId },
          { "progress.completed": completed }
        );

        // Report progress
        job.progress((completed / storeIds.length) * 100);
      } catch (error) {
        console.error(`Failed to sync to store ${storeId}:`, error);
        failed++;
        await SyncJob.findOneAndUpdate(
          { jobId },
          { "progress.failed": failed }
        );
      }
    }

    // Mark job as completed
    await SyncJob.findOneAndUpdate(
      { jobId },
      {
        status: "completed",
        completedAt: new Date(),
      }
    );

    return { completed, failed };
  } catch (error) {
    // Mark job as failed
    await SyncJob.findOneAndUpdate(
      { jobId },
      {
        status: "failed",
        error: error.message,
        completedAt: new Date(),
      }
    );

    throw error;
  }
});

/**
 * Propagate master item to a specific store
 */
async function propagateToStore(
  masterItem,
  masterType,
  storeId,
  organizationId
) {
  const Model = getModel(masterType);

  // Find existing synced item
  let storeItem = await Model.findOne({
    storeId,
    masterId: masterItem._id,
  });

  if (storeItem) {
    // Update existing item - only update non-overridden fields
    const updates = {};

    // Master-owned fields (always sync)
    if (masterType === "MenuItem") {
      if (!storeItem.syncOverrides?.get("name")) updates.name = masterItem.name;
      if (!storeItem.syncOverrides?.get("description"))
        updates.description = masterItem.description;
      if (!storeItem.syncOverrides?.get("image"))
        updates.image = masterItem.image;
      if (!storeItem.syncOverrides?.get("category"))
        updates.category = masterItem.category;
      if (!storeItem.syncOverrides?.get("preparationTime"))
        updates.preparationTime = masterItem.preparationTime;
      if (!storeItem.syncOverrides?.get("addOnGroups"))
        updates.addOnGroups = masterItem.addOnGroups;
      if (!storeItem.syncOverrides?.get("allergens"))
        updates.allergens = masterItem.allergens;
      if (!storeItem.syncOverrides?.get("dietaryTags"))
        updates.dietaryTags = masterItem.dietaryTags;
    } else if (masterType === "Category") {
      if (!storeItem.syncOverrides?.get("name")) updates.name = masterItem.name;
      if (!storeItem.syncOverrides?.get("description"))
        updates.description = masterItem.description;
    } else if (masterType === "AddOnGroup") {
      if (!storeItem.syncOverrides?.get("name")) updates.name = masterItem.name;
      if (!storeItem.syncOverrides?.get("description"))
        updates.description = masterItem.description;
      if (!storeItem.syncOverrides?.get("selectionType"))
        updates.selectionType = masterItem.selectionType;
      if (!storeItem.syncOverrides?.get("isRequired"))
        updates.isRequired = masterItem.isRequired;
      if (!storeItem.syncOverrides?.get("minSelections"))
        updates.minSelections = masterItem.minSelections;
      if (!storeItem.syncOverrides?.get("maxSelections"))
        updates.maxSelections = masterItem.maxSelections;
    }

    // Update version tracking
    updates.masterVersion = masterItem.version;

    await Model.findByIdAndUpdate(storeItem._id, updates);
  } else {
    // Create new synced item
    const newItem = {
      ...masterItem.toObject(),
      _id: undefined,
      storeId,
      organizationId, // Ensure SaaS scoping
      masterId: masterItem._id,
      isMaster: false,
      masterVersion: masterItem.version,
      createdAt: undefined,
      updatedAt: undefined,
    };

    await Model.create(newItem);
  }
}

/**
 * Get model by type
 */
function getModel(masterType) {
  switch (masterType) {
    case "MenuItem":
      return MenuItem;
    case "Category":
      return Category;
    case "AddOnGroup":
      return AddOnGroup;
    default:
      throw new Error(`Unknown master type: ${masterType}`);
  }
}

/**
 * Get sync job status
 */
async function getSyncJobStatus(jobId) {
  return await SyncJob.findOne({ jobId });
}

module.exports = {
  enqueuePublish,
  getSyncJobStatus,
  menuSyncQueue,
};
