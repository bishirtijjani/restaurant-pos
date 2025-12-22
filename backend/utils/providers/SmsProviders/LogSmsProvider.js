const BaseProvider = require("../BaseProvider");

/**
 * Mock SMS Provider that logs to console.
 */
class LogSmsProvider extends BaseProvider {
  async send(options) {
    const { to, body, storeId } = options;

    console.log(`[SMS LOG] [Store: ${storeId || "N/A"}]`);
    console.log(`To: ${to}`);
    console.log(`Body: ${body}`);
    console.log(`-----------------------------------`);

    return {
      success: true,
      messageId: `log-sms-${Date.now()}`,
      provider: "log",
    };
  }
}

module.exports = LogSmsProvider;
