const Stripe = require("stripe");

/**
 * Base Payment Provider Interface
 * All payment providers should extend this class
 */
class PaymentProvider {
  constructor(config) {
    this.config = config;
  }

  async createPaymentIntent(amount, currency, metadata = {}) {
    throw new Error("Method 'createPaymentIntent' must be implemented");
  }

  async verifyPayment(paymentId) {
    throw new Error("Method 'verifyPayment' must be implemented");
  }

  async refundPayment(paymentId, amount, reason, metadata = {}) {
    throw new Error("Method 'refundPayment' must be implemented");
  }

  async getRefundStatus(refundId) {
    throw new Error("Method 'getRefundStatus' must be implemented");
  }
}

/**
 * Stripe Payment Provider
 */
class StripeProvider extends PaymentProvider {
  constructor(config) {
    super(config);
    if (!config.secretKey) {
      throw new Error("Stripe secret key is missing");
    }
    this.stripe = Stripe(config.secretKey);
  }

  async createPaymentIntent(amount, currency, metadata = {}) {
    try {
      // Stripe expects amount in smallest currency unit (e.g., cents)
      // Assuming 'amount' passed in is standard unit (e.g., Dollars/Naira)
      // Check if currency is zero-decimal or not. For simplicity, x100 (cents/kobo)
      // You might need a more robust currency map for JPY etc.
      const amountInSmallestUnit = Math.round(amount * 100);

      const params = {
        amount: amountInSmallestUnit,
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (this.config.accountId) {
        // If using Stripe Connect
        // params.transfer_data = { destination: this.config.accountId };
      }

      const paymentIntent = await this.stripe.paymentIntents.create(params);

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        transactionId: paymentIntent.id,
        provider: "stripe",
      };
    } catch (error) {
      console.error("Stripe createPaymentIntent Error:", error);
      throw error;
    }
  }

  async verifyPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      let status = "pending";
      if (paymentIntent.status === "succeeded") {
        status = "paid";
      } else if (paymentIntent.status === "canceled") {
        status = "failed";
      }

      return {
        success: true,
        status: status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error("Stripe verifyPayment Error:", error);
      throw error;
    }
  }

  async refundPayment(paymentIntentId, amount, reason, metadata = {}) {
    try {
      // Validate payment intent exists and is refundable
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status !== "succeeded") {
        throw new Error("Payment must be succeeded to refund");
      }

      // Create refund
      const refundParams = {
        payment_intent: paymentIntentId,
        metadata: {
          reason,
          ...metadata,
        },
      };

      // Add amount if partial refund (otherwise full refund)
      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        success: true,
        refundId: refund.id,
        status: refund.status, // 'pending', 'succeeded', 'failed', 'canceled'
        amount: refund.amount / 100,
        currency: refund.currency,
        created: refund.created,
        reason: refund.reason,
        paymentIntentId: refund.payment_intent,
      };
    } catch (error) {
      console.error("Stripe refund error:", error);
      return {
        success: false,
        error: error.message,
        code: error.code,
        type: error.type,
      };
    }
  }

  async getRefundStatus(refundId) {
    try {
      const refund = await this.stripe.refunds.retrieve(refundId);
      return {
        success: true,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency,
        failureReason: refund.failure_reason,
        created: refund.created,
      };
    } catch (error) {
      console.error("Stripe refund status error:", error);
      throw error;
    }
  }
}

/**
 * Factory to get the correct provider
 */
class PaymentProviderFactory {
  static getProvider(providerName, config) {
    switch (providerName) {
      case "stripe":
        return new StripeProvider(config);
      default:
        throw new Error(`Payment provider '${providerName}' not supported`);
    }
  }
}

module.exports = {
  PaymentProviderFactory,
  StripeProvider,
};
