/**
 * Base class for all communication providers.
 * Each provider implementation (SendGrid, Twilio, etc.) must inherit from this.
 */
class BaseProvider {
  /**
   * @param {Object} config - Provider-specific configuration (keys, etc.)
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Send a message. Must be implemented by subclasses.
   * @param {Object} options - Sending options (to, subject, body, etc.)
   */
  async send(options) {
    throw new Error('Method "send" must be implemented by subclass');
  }

  /**
   * Validate the provider configuration.
   * @returns {boolean}
   */
  validateConfig() {
    return true;
  }
}

module.exports = BaseProvider;
