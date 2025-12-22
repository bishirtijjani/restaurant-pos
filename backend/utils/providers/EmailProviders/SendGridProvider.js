const BaseProvider = require("../BaseProvider");
const axios = require("axios");

/**
 * SendGrid Email Provider
 * Requirements in config: apiKey, fromEmail, fromName
 */
class SendGridProvider extends BaseProvider {
  async send(options) {
    const { to, subject, html, text } = options;
    const { apiKey, fromEmail, fromName } = this.config;

    if (!apiKey || !fromEmail) {
      throw new Error("SendGrid missing configuration (apiKey or fromEmail)");
    }

    if (!to) {
      throw new Error("SendGrid missing recipient (to)");
    }

    try {
      const response = await axios.post(
        "https://api.sendgrid.com/v3/mail/send",
        {
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail, name: fromName || "Restaurant" },
          subject: subject,
          content: [
            { type: "text/plain", value: text || "Message content" },
            { type: "text/html", value: html || "" },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        messageId: response.headers["x-message-id"],
        provider: "sendgrid",
      };
    } catch (error) {
      console.error("[SendGrid] Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message,
        provider: "sendgrid",
      };
    }
  }
}

module.exports = SendGridProvider;
