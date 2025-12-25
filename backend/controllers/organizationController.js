const asyncHandler = require("express-async-handler");
const Organization = require("../models/Organization");
const User = require("../models/User");

// @desc    Get Organization details
// @route   GET /api/organizations/:id
// @access  Private (Owner/Admin only)
const getOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);

  if (!org) {
    res.status(404);
    throw new Error("Organization not found");
  }

  // Check if user has access (either owner or admin in one of the stores)
  const isOwner = org.ownerId.toString() === req.user.id;
  const user = await User.findById(req.user.id);
  const hasManagementRole = user.stores.some(
    (s) =>
      s.organizationId?.toString() === org._id.toString() &&
      ["admin", "manager"].includes(s.role)
  );

  if (!isOwner && !hasManagementRole) {
    res.status(403);
    throw new Error("Not authorized to view this organization");
  }

  res.status(200).json({
    success: true,
    data: org,
  });
});

// @desc    Update Organization details
// @route   PUT /api/organizations/:id
// @access  Private (Owner only)
const updateOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);

  if (!org) {
    res.status(404);
    throw new Error("Organization not found");
  }

  if (org.ownerId.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Only the brand owner can update organization settings");
  }

  const { name, logo, brandSettings } = req.body;

  if (name) org.name = name;
  if (logo !== undefined) org.logo = logo;

  if (brandSettings) {
    const sections = Object.keys(brandSettings);

    for (const section of sections) {
      if (
        section === "communication" ||
        section === "paymentGateways" ||
        section === "branding" ||
        section === "taxSettings" ||
        section === "serviceCharge"
      ) {
        // Deep merge for known nested objects
        if (!org.brandSettings[section]) org.brandSettings[section] = {};

        // Special handling for Communication Maps
        if (section === "communication") {
          ["email", "sms", "whatsapp"].forEach((provider) => {
            if (brandSettings.communication?.[provider]) {
              // Update scalar fields
              if (brandSettings.communication[provider].enabled !== undefined) {
                org.brandSettings.communication[provider].enabled =
                  brandSettings.communication[provider].enabled;
              }
              if (brandSettings.communication[provider].provider) {
                org.brandSettings.communication[provider].provider =
                  brandSettings.communication[provider].provider;
              }
              // Update Config Map
              if (brandSettings.communication[provider].config) {
                const configUpdates =
                  brandSettings.communication[provider].config;
                // If it's a Map in schema, we need to set keys individually or overwrite
                // Since input is POJO, Mongoose casts POJO to Map.
                // Best to merge keys if we want to preserve old keys (but usually we overwrite config)
                org.brandSettings.communication[provider].config =
                  configUpdates;
              }
            }
          });
        } else {
          // General deep merge for other sections
          org.brandSettings[section] = {
            ...org.brandSettings[section], // Spread Mongoose object (converts to POJO? No, accessing .toObject() implicitly?)
            // Mongoose subdocs spread fine usually
            ...brandSettings[section],
          };
        }
      } else {
        // Direct assignment for scalar/simple sections
        org.brandSettings[section] = brandSettings[section];
      }
    }
  }

  const updatedOrg = await org.save();

  res.status(200).json({
    success: true,
    data: updatedOrg,
    message: "Brand settings updated successfully",
  });
});

module.exports = {
  getOrganization,
  updateOrganization,
};
