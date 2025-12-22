const BaseProvider = require("../BaseProvider");
const axios = require("axios");

/**
 * Twilio SMS Provider
 * Requirements in config: accountSid, authToken, fromNumber
 */
class TwilioSmsProvider extends BaseProvider {
  async send(options) {
    const { to, body } = options;
    const { accountSid, authToken, fromNumber } = this.config;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error(
        "Twilio missing configuration (accountSid, authToken, or fromNumber)"
      );
    }

    if (!to) {
      throw new Error("Twilio missing recipient (to)");
    }

    try {
      const isWhatsApp = options.channel === "whatsapp";
      const cleanTo =
        isWhatsApp && !to.startsWith("whatsapp:") ? `whatsapp:${to}` : to;
      const cleanFrom =
        isWhatsApp && !fromNumber.startsWith("whatsapp:")
          ? `whatsapp:${fromNumber}`
          : fromNumber;

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const params = new URLSearchParams();
      params.append("To", cleanTo);
      params.append("From", cleanFrom);
      params.append("Body", body);

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        params,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return {
        success: true,
        messageId: response.data.sid,
        provider: "twilio",
      };
    } catch (error) {
      console.error("[Twilio] Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        provider: "twilio",
      };
    }
  }
}

module.exports = TwilioSmsProvider;
