const BaseProvider = require("../BaseProvider");

/**
 * Mock Email Provider that logs to console.
 * Useful for development and stores without configured providers.
 */
class LogEmailProvider extends BaseProvider {
  async send(options) {
    const { to, subject, html, text, storeId } = options;

    console.log(`[EMAIL LOG] [Store: ${storeId || "N/A"}]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (Text): ${text || "N/A"}`);
    console.log(`-----------------------------------`);

    return {
      success: true,
      messageId: `log-${Date.now()}`,
      provider: "log",
    };
  }
}

module.exports = LogEmailProvider;
