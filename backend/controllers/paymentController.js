const Store = require("../models/Store");
const { getEffectiveSettings } = require("../utils/settingsManager");
const { PaymentProviderFactory } = require("../utils/paymentProvider");

// Get public payment configuration (e.g., publishable keys)
exports.getPaymentConfig = async (req, res) => {
  try {
    const settings = await getEffectiveSettings(req.storeId);

    if (!settings || !settings.paymentGateways) {
      return res.status(200).json({ success: true, providers: [] });
    }

    const gateways = settings.paymentGateways;
    const providers = [];

    // Stripe
    if (gateways.stripe && gateways.stripe.enabled) {
      providers.push({
        id: "stripe",
        name: "Credit/Debit Card (Stripe)",
        publishableKey: gateways.stripe.publishableKey,
      });
    }

    // Add other providers here...

    return res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    console.error("Error fetching payment config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment configuration",
    });
  }
};

// Create Payment Intent (Generic)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { provider, amount, currency, metadata } = req.body;

    if (!provider || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: provider, amount, currency",
      });
    }

    // Get Effective settings including secrets (Stripe Secret Key)
    const settings = await getEffectiveSettings(req.storeId, {
      includeSecrets: true,
    });

    if (!settings) {
      return res
        .status(404)
        .json({ success: false, message: "Store/Settings not found" });
    }

    const gateways = settings.paymentGateways;

    let providerConfig = null;

    if (provider === "stripe") {
      if (!gateways?.stripe?.enabled) {
        return res.status(400).json({
          success: false,
          message: "Stripe payments are disabled for this store",
        });
      }
      providerConfig = gateways.stripe;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment provider" });
    }

    // Initialize Provider
    const paymentService = PaymentProviderFactory.getProvider(
      provider,
      providerConfig
    );

    // Create Intent
    const result = await paymentService.createPaymentIntent(
      amount,
      currency,
      metadata
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Create Payment Intent Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment initialization failed",
    });
  }
};


