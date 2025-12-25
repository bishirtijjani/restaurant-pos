const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

/**
 * Stripe Webhook Endpoints (Multi-Tenant)
 * Note: These routes use raw body parser for signature verification
 * Each store has its own webhook URL with store-specific configuration
 */

// Store-specific webhook endpoint
// URL format: /api/webhooks/stripe/:storeId
router.post(
  "/stripe/:storeId",
  express.raw({ type: "application/json" }),
  webhookController.handleStripeWebhook
);

// Test webhook configuration (for store setup)
router.get("/stripe/:storeId/test", webhookController.testWebhook);

module.exports = router;
