const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Organization = require("../models/Organization");

/**
 * Middleware to populate req.organizationId and check global permissions.
 * Must be placed AFTER authMiddleware.
 */
const organizationMiddleware = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Fetch full user with context
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  // Use currentOrganizationId from user state
  const organizationId = user.currentOrganizationId;
  if (!organizationId) {
    return res
      .status(400)
      .json({ message: "No active organization context found" });
  }

  req.organizationId = organizationId;
  req.user.activeOrganizationId = organizationId;

  // Check if User is the Organization Owner
  const org = await Organization.findById(organizationId);
  if (!org) {
    return res.status(404).json({ message: "Organization not found" });
  }

  const isOwner = org.ownerId.toString() === user._id.toString();

  if (isOwner) {
    // Owners have all permissions
    req.user.permissions = ["all"];
    req.user.role = "admin"; // pseudo-role
  } else {
    // For staff, aggregate permissions from all stores in this organization
    // OR check if they have 'admin' role in ANY store of this org (for simplicty)
    // A more granular approach: Use a "Headquarters" store or specific Org-Admin flag.
    // For now, we allow any 'admin' of a store within the org to access brand settings ??
    // Safer: Only Owner can do brand stuff? Or Admins too?
    // Let's go with: Admins in at least one active store get high-level access,
    // but better to rely on specific 'permissions' array if possible.

    // Aggregate unique permissions from all active stores in this org
    const orgStores = user.stores.filter(
      (s) =>
        s.organizationId?.toString() === organizationId.toString() &&
        s.status === "active"
    );

    const aggregatedPermissions = new Set();
    let isOrgAdmin = false;

    orgStores.forEach((s) => {
      if (s.role === "admin") isOrgAdmin = true;
      if (s.permissions) {
        s.permissions.forEach((p) => aggregatedPermissions.add(p));
      }
    });

    req.user.permissions = Array.from(aggregatedPermissions);

    // If user is Admin in any store, maybe give them extra rights?
    // For now, rely on permissions.js constants like BRAND_MENU_EDIT
  }

  next();
});

module.exports = organizationMiddleware;
