const asyncHandler = require("express-async-handler");
const Store = require("../models/Store");
const User = require("../models/User");
const logAction = require("../utils/logAction");

// @desc    Create a new store (branch)
// @route   POST /api/stores
// @access  Private
const createStore = asyncHandler(async (req, res) => {
  const { name, location, contactPhone, settings } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Store name is required");
  }

  // 1. Create the new Store
  const newStore = await Store.create({
    name,
    location,
    contactPhone,
    ownerId: req.user.id,
    settings: {
      ...settings,
      restaurantName: settings?.restaurantName || name, // Default to store name if not provided
    },
    status: "active",
  });

  // 2. Add Store to User's access list as 'admin'
  const user = await User.findById(req.user.id);
  user.stores.push({
    storeId: newStore._id,
    role: "admin", // Creator is admin
    permissions: ["all"],
    status: "active",
    isDefault: user.stores.length === 0, // Default if it's the only one
  });

  // Automatically switch user's lastActiveStore to this new one? Optional.
  // user.lastActiveStore = newStore._id;

  await user.save();

  // Log action
  await logAction(
    req.user.id,
    newStore._id,
    "Store",
    newStore._id,
    "create",
    null,
    newStore,
    `Created new store: ${name}`
  );

  res.status(201).json({
    success: true,
    data: newStore,
    message: "Store created successfully",
  });
});

// @desc    Get all stores the user has access to
// @route   GET /api/stores
// @access  Private
const getAllStores = asyncHandler(async (req, res) => {
  // We fetch stores based on the User's access list
  // The user might not be the owner, but has access
  const user = await User.findById(req.user.id).populate("stores.storeId");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Filter out any nulls (in case a store was deleted but remains in user array)
  // And map to a clean list
  const stores = user.stores
    .filter((s) => s.storeId)
    .map((s) => ({
      _id: s.storeId._id,
      name: s.storeId.name,
      location: s.storeId.location,
      role: s.role,
      status: s.status, // User's status in that store
      storeStatus: s.storeId.status, // Store's global status
      isDefault: s.isDefault,
    }));

  res.status(200).json({
    success: true,
    count: stores.length,
    data: stores,
  });
});

// @desc    Get single store details
// @route   GET /api/stores/:id
// @access  Private
const getStoreById = asyncHandler(async (req, res) => {
  // Verify access first (middleware handles context, but we might want explicit check for param ID)
  // If the requested ID is different from header context, we should check user.stores again
  // But generally, the frontend should switch context first.
  // For CRUD management, we allow fetching any store the user has access to.

  const hasAccess = req.user.stores.some(
    (s) => s.storeId.toString() === req.params.id
  );

  if (!hasAccess) {
    res.status(403);
    throw new Error("You do not have access to this store");
  }

  const store = await Store.findById(req.params.id);

  if (!store) {
    res.status(404);
    throw new Error("Store not found");
  }

  res.status(200).json({
    success: true,
    data: store,
  });
});

// @desc    Update store details (Core info)
// @route   PUT /api/stores/:id
// @access  Private (Admin only)
const updateStore = asyncHandler(async (req, res) => {
  // Check authorization
  const userStoreLink = req.user.stores.find(
    (s) => s.storeId.toString() === req.params.id
  );

  if (!userStoreLink || userStoreLink.role !== "admin") {
    res.status(403);
    throw new Error("Only admins can update store details");
  }

  const store = await Store.findById(req.params.id);

  if (!store) {
    res.status(404);
    throw new Error("Store not found");
  }

  const oldData = store.toObject();

  const { name, location, contactPhone, status } = req.body;

  if (name) store.name = name;
  if (location) store.location = location;
  if (contactPhone) store.contactPhone = contactPhone;
  if (status) store.status = status;

  // Sync with settings if name changed?
  if (name && store.settings) {
    store.settings.restaurantName = name;
  }

  const updatedStore = await store.save();

  await logAction(
    req.user.id,
    store._id,
    "Store",
    store._id,
    "update",
    oldData,
    updatedStore,
    `Updated store details: ${name || store.name}`
  );

  res.status(200).json({
    success: true,
    data: updatedStore,
    message: "Store updated successfully",
  });
});

module.exports = {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
};
