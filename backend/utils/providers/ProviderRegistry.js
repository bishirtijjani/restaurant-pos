/**
 * Registry of all available communication providers.
 * Maps provider names to their respective classes.
 */

// Email Providers
const LogEmailProvider = require("./EmailProviders/LogEmailProvider");
const SendGridProvider = require("./EmailProviders/SendGridProvider");

// SMS Providers
const LogSmsProvider = require("./SmsProviders/LogSmsProvider");
const TwilioSmsProvider = require("./SmsProviders/TwilioSmsProvider");

// WhatsApp Providers
const LogWhatsAppProvider = require("./WhatsAppProviders/LogWhatsAppProvider");
const TwilioWhatsAppProvider = require("./SmsProviders/TwilioSmsProvider"); // Reuse Twilio for WA

const registry = {
  email: {
    log: LogEmailProvider,
    sendgrid: SendGridProvider,
  },
  sms: {
    log: LogSmsProvider,
    twilio: TwilioSmsProvider,
  },
  whatsapp: {
    log: LogWhatsAppProvider,
    twilio: TwilioWhatsAppProvider,
  },
};

/**
 * Get a provider instance by channel and provider name.
 * @param {string} channel - 'email', 'sms', or 'whatsapp'
 * @param {string} providerName - The name of the provider (e.g., 'sendgrid', 'log')
 * @param {Object} config - Provider-specific configuration
 * @returns {BaseProvider}
 */
const getProvider = (channel, providerName, config = {}) => {
  const providers = registry[channel];
  if (!providers) {
    throw new Error(`Invalid communication channel: ${channel}`);
  }

  const ProviderClass = providers[providerName] || providers.log;
  return new ProviderClass(config);
};

module.exports = {
  getProvider,
  registry,
};
