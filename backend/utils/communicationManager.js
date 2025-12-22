const Store = require("../models/Store");
const NotificationLog = require("../models/NotificationLog");
const TemplateProcessor = require("./templateProcessor");
const { getProvider } = require("./providers/ProviderRegistry");

/**
 * CommunicationManager
 * Orchestrates sending messages across different channels (Email, SMS, WhatsApp)
 * Handling multi-tenant (per-store) provider configurations with automatic auditing.
 */
class CommunicationManager {
  /**
   * Internal helper to log notifications.
   */
  async _logNotification(data) {
    try {
      await NotificationLog.create({
        ...data,
        sentAt: data.status === "sent" ? new Date() : null,
      });
    } catch (err) {
      console.error("[CommManager] Failed to log notification:", err);
    }
  }

  /**
   * Process and send a message.
   */
  async _send(storeId, channel, options) {
    try {
      const store = await Store.findById(storeId).select(
        "+settings.communication.email.config +settings.communication.sms.config +settings.communication.whatsapp.config"
      );
      if (!store) throw new Error(`Store not found: ${storeId}`);

      const config = store.settings.communication?.[channel] || {
        provider: "log",
        enabled: true,
      };

      if (config.enabled === false) {
        return { success: false, reason: "Disabled" };
      }

      if (!options.to) {
        return { success: false, reason: "Missing recipient (to)" };
      }

      const providerName = config.provider || "log";

      // Convert Mongoose Map to POJO for provider safety
      const providerConfig =
        config.config instanceof Map
          ? Object.fromEntries(config.config)
          : config.config || {};

      const provider = getProvider(channel, providerName, providerConfig);

      // Process templates if action provided
      let { subject, body, html } = options;
      if (options.action) {
        const defaultTpl = TemplateProcessor.getDefaultTemplate(
          options.action,
          channel
        );
        const tplData = {
          ...options.data,
          restaurantName: store.settings.restaurantName || store.name,
          currency: store.settings.currency?.symbol || "$",
        };

        if (channel === "email" && typeof defaultTpl === "object") {
          subject =
            subject || TemplateProcessor.process(defaultTpl.subject, tplData);
          html = html || TemplateProcessor.process(defaultTpl.body, tplData);
        } else if (typeof defaultTpl === "string") {
          body = body || TemplateProcessor.process(defaultTpl, tplData);
        }
      }

      const enrichedOptions = {
        ...options,
        subject,
        body,
        html,
        storeId,
        channel,
      };

      const result = await provider.send(enrichedOptions);

      // Async logging (don't await to avoid blocking response)
      this._logNotification({
        storeId,
        channel,
        recipient: options.to,
        subject,
        content: channel === "email" ? html || body : body,
        status: result.success ? "sent" : "failed",
        provider: providerName,
        providerMessageId: result.messageId,
        error: result.error,
        metadata: options.data,
      });

      return result;
    } catch (error) {
      console.error(
        `[CommManager] Internal error in _send (${channel}):`,
        error
      );
      return { success: false, error: error.message };
    }
  }

  async sendEmail(storeId, options) {
    return this._send(storeId, "email", options);
  }

  async sendSMS(storeId, options) {
    return this._send(storeId, "sms", options);
  }

  async sendWhatsApp(storeId, options) {
    return this._send(storeId, "whatsapp", options);
  }
}

module.exports = new CommunicationManager();
