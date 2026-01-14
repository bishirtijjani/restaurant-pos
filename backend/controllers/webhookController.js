const Order = require("../models/Order");
const { getEffectiveSettings } = require("../utils/settingsManager");
const logAction = require("../utils/logAction");
const Stripe = require("stripe");

/**
 * Stripe Webhook Handler (Multi-Tenant)
 * Handles async events from Stripe for specific stores
 * Webhooks are OPTIONAL - system works without them
 */
exports.handleStripeWebhook = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID is required",
      });
    }

    // Fetch store-specific Stripe configuration
    const settings = await getEffectiveSettings(storeId, {
      includeSecrets: true,
    });

    if (!settings || !settings.paymentGateways?.stripe) {
      return res.status(200).json({
        received: true,
        message: "Stripe not configured for this store",
      });
    }

    const stripeConfig = settings.paymentGateways.stripe;

    // Check if webhook is configured (OPTIONAL)
    if (!stripeConfig.webhookSecret) {
      // Webhook not configured - that's OK!
      // System works without webhooks
      return res.status(200).json({
        received: true,
        message: "Webhook not configured for this store (optional feature)",
      });
    }

    if (!stripeConfig.enabled) {
      return res.status(200).json({
        received: true,
        message: "Stripe is disabled for this store",
      });
    }

    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res.status(400).json({
        success: false,
        message: "Missing Stripe signature",
      });
    }

    let event;

    try {
      // Verify webhook signature with store-specific secret
      const stripe = Stripe(stripeConfig.secretKey);
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        stripeConfig.webhookSecret
      );
    } catch (err) {
      console.error(
        `Webhook signature verification failed for store ${storeId}:`,
        err.message
      );
      return res.status(400).json({
        success: false,
        message: `Webhook Error: ${err.message}`,
      });
    }

    // Handle the event
    try {
      switch (event.type) {
        case "charge.refund.updated":
          await handleRefundUpdated(event.data.object, storeId);
          break;

        case "charge.refunded":
          await handleRefundCompleted(event.data.object, storeId);
          break;

        case "payment_intent.succeeded":
          // Could update order payment status if needed
          console.log(
            `Payment intent succeeded for store ${storeId}:`,
            event.data.object.id
          );
          break;

        default:
          console.log(
            `Unhandled event type for store ${storeId}: ${event.type}`
          );
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error(`Error processing webhook for store ${storeId}:`, error);
      return res.status(500).json({
        success: false,
        message: "Error processing webhook",
      });
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Handle refund status update
 */
async function handleRefundUpdated(refund, storeId) {
  try {
    const refundId = refund.id;
    const status = refund.status; // 'pending', 'succeeded', 'failed', 'canceled'

    // Find order with this refund ID in the specific store
    const order = await Order.findOne({
      "refunds.gatewayRefundId": refundId,
      storeId: storeId,
    });

    if (!order) {
      console.log(
        `Order not found for refund ID: ${refundId} in store: ${storeId}`
      );
      return;
    }

    // Update refund status
    const refundEntry = order.refunds.find(
      (r) => r.gatewayRefundId === refundId
    );

    if (refundEntry) {
      const oldStatus = refundEntry.gatewayStatus;
      refundEntry.gatewayStatus = status;

      if (status === "failed") {
        refundEntry.failureReason = refund.failure_reason;
      }

      // If refund succeeded and payment status wasn't updated before
      if (status === "succeeded" && oldStatus === "pending") {
        const refundAmount = refundEntry.amount;
        const newAmountPaid = order.amountPaid - refundAmount;
        order.amountPaid = newAmountPaid;

        if (newAmountPaid === 0) {
          order.paymentStatus = "pending";
          order.balance = order.totalAmount;
        } else if (newAmountPaid < order.totalAmount) {
          order.paymentStatus = "partial";
          order.balance = order.totalAmount - newAmountPaid;
        } else {
          order.paymentStatus = "paid";
          order.balance = 0;
        }
      }

      await order.save();

      await logAction(
        null, // System action - no user
        storeId,
        null, // organizationId - could fetch from order or store if needed
        "Order",
        order._id,
        "update",
        null,
        { paymentStatus: order.paymentStatus, balance: order.balance },
        `Stripe Webhook: Refund ${status} (Refund ID: ${refundId})`
      );

      console.log(
        `Updated refund status for order #${order.orderNumber} in store ${storeId}: ${oldStatus} -> ${status}`
      );
    }
  } catch (error) {
    console.error("Error handling refund update:", error);
    throw error;
  }
}

/**
 * Handle refund completion
 */
async function handleRefundCompleted(charge, storeId) {
  try {
    // Extract refund information from charge
    const refunds = charge.refunds?.data || [];

    for (const refund of refunds) {
      await handleRefundUpdated(refund, storeId);
    }
  } catch (error) {
    console.error("Error handling refund completion:", error);
    throw error;
  }
}

/**
 * Test webhook endpoint (for store setup)
 * Allows stores to verify their webhook configuration
 */
exports.testWebhook = async (req, res) => {
  try {
    const { storeId } = req.params;

    const settings = await getEffectiveSettings(storeId, {
      includeSecrets: true,
    });

    if (!settings?.paymentGateways?.stripe?.webhookSecret) {
      return res.status(200).json({
        success: true,
        configured: false,
        message: "Webhook not configured (optional - system works without it)",
      });
    }

    return res.status(200).json({
      success: true,
      configured: true,
      message: "Webhook is configured and ready",
      webhookUrl: `/api/webhooks/stripe/${storeId}`,
    });
  } catch (error) {
    console.error("Test webhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Error testing webhook configuration",
    });
  }
};
