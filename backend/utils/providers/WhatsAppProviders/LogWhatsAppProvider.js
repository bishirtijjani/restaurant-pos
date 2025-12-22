const BaseProvider = require("../BaseProvider");

/**
 * Mock WhatsApp Provider that logs to console.
 */
class LogWhatsAppProvider extends BaseProvider {
  async send(options) {
    const { to, body, storeId } = options;

    console.log(`[WHATSAPP LOG] [Store: ${storeId || "N/A"}]`);
    console.log(`To: ${to}`);
    console.log(`Body: ${body}`);
    console.log(`-----------------------------------`);

    return {
      success: true,
      messageId: `log-wa-${Date.now()}`,
      provider: "log",
    };
  }
}

module.exports = LogWhatsAppProvider;
