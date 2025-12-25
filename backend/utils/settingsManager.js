const Store = require("../models/Store");
const Organization = require("../models/Organization");

/**
 * Merges Brand and Store settings, with Store settings taking precedence.
 * @param {string} storeId - The ID of the store
 * @param {Object} options - Options including { includeSecrets: boolean }
 * @returns {Object} The merged settings object
 */
const getEffectiveSettings = async (storeId, options = {}) => {
  const { includeSecrets = false } = options;

  let storeQuery = Store.findById(storeId);
  if (includeSecrets) {
    storeQuery = storeQuery.select(
      "+settings.communication.email.config +settings.communication.sms.config +settings.communication.whatsapp.config +settings.paymentGateways.stripe.secretKey"
    );
  }

  const store = await storeQuery.lean();
  if (!store) return null;

  if (!store.organizationId) {
    return store.settings || {};
  }

  let orgQuery = Organization.findById(store.organizationId);
  if (includeSecrets) {
    orgQuery = orgQuery.select(
      "+brandSettings.communication.email.config +brandSettings.communication.sms.config +brandSettings.communication.whatsapp.config +brandSettings.paymentGateways.stripe.secretKey"
    );
  }

  const org = await orgQuery.lean();
  if (!org || !org.brandSettings) {
    return store.settings || {};
  }

  const brandSettings = org.brandSettings;
  const storeSettings = store.settings || {};

  // Map branding fields from Organization to the structure expected by Store
  // Organization uses brandSettings.branding (restaurantName, etc.)
  // Store uses settings.restaurantName directly
  const mergedSettings = {
    ...brandSettings,
    ...brandSettings.branding, // Flatten branding fields for parity with Store structure
    ...storeSettings,
  };

  // Deep merge specific nested objects if they exist in both
  const nestedKeys = [
    "currency",
    "communication",
    "taxSettings",
    "serviceCharge",
    "globalDiscount",
    "printerSettings",
    "paymentGateways",
    "menuSettings",
  ];

  nestedKeys.forEach((key) => {
    if (brandSettings[key] && storeSettings[key]) {
      mergedSettings[key] = {
        ...brandSettings[key],
        ...storeSettings[key],
      };

      // Handle Map/Object configs in communication
      if (key === "communication") {
        ["email", "sms", "whatsapp"].forEach((provider) => {
          if (
            brandSettings.communication[provider] &&
            storeSettings.communication[provider]
          ) {
            mergedSettings.communication[provider] = {
              ...brandSettings.communication[provider],
              ...storeSettings.communication[provider],
            };
          }
        });
      }
    } else if (brandSettings[key]) {
      mergedSettings[key] = brandSettings[key];
    } else if (storeSettings[key]) {
      mergedSettings[key] = storeSettings[key];
    }
  });

  return mergedSettings;
};

module.exports = {
  getEffectiveSettings,
};
