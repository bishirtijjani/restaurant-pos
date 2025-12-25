const asyncHandler = require("express-async-handler");
const Store = require("../models/Store");
const User = require("../models/User");
const logAction = require("../utils/logAction");
const Organization = require("../models/Organization");

// @desc    Create a new store (branch)
// @route   POST /api/stores
// @access  Private
const createStore = asyncHandler(async (req, res) => {
  const { name, location, contactPhone, settings } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Store name is required");
  }

  // 1. Manage Organization (Shadow Onboarding)
  let orgId = req.user.currentOrganizationId;
  const user = await User.findById(req.user.id);

  if (!orgId) {
    // Check if they already have an org they own (security fallback)
    const existingOrg = await Organization.findOne({ ownerId: req.user.id });
    if (existingOrg) {
      orgId = existingOrg._id;
    } else {
      // Create new "Shadow Organization"
      const newOrg = await Organization.create({
        name: settings?.brandName || name,
        ownerId: req.user.id,
        brandSettings: {
          branding: {
            restaurantName: settings?.brandName || name,
            restaurantPhone: contactPhone || "",
            restaurantAddress: location || "",
          },
          currency: {
            code: settings?.currency || "NGN",
            symbol: settings?.currencySymbol || "₦",
            name: settings?.currencyName || "Nigerian Naira",
          },
          taxSettings: {
            enabled: true,
            globalRate: 7.5,
            name: "VAT",
          },
        },
      });
      orgId = newOrg._id;
      user.currentOrganizationId = orgId;
    }
  }

  // 2. Create the new Store
  const newStore = await Store.create({
    name,
    organizationId: orgId,
    location,
    contactPhone,
    ownerId: req.user.id,
    settings: {
      // For the first store, we can keep settings minimal to use inheritance
      restaurantName: name,
    },
    status: "active",
  });

  // 3. Add Store to User's access list as 'admin'
  user.stores.push({
    storeId: newStore._id,
    organizationId: orgId,
    role: "admin",
    permissions: ["all"],
    status: "active",
    isDefault: user.stores.length === 0,
  });

  await user.save();

  // Log action
  await logAction(
    req.user.id,
    newStore._id,
    orgId,
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
  let storeId = req.params.id;

  // Handle 'my-store' alias using context from middleware
  if (storeId === "my-store") {
    if (!req.storeId) {
      res.status(400);
      throw new Error("Store context required for 'my-store' alias");
    }
    storeId = req.storeId;
  }

  // Fetch complete user to check permissions (req.user from JWT is partial)
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Check authorization
  const userStoreLink = user.stores.find(
    (s) => s.storeId.toString() === storeId.toString()
  );

  if (!userStoreLink || userStoreLink.role !== "admin") {
    res.status(403);
    throw new Error("Only admins can update store details");
  }

  const store = await Store.findById(storeId);

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
    store.organizationId,
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
