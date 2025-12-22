/**
 * Utility to process message templates with dynamic data.
 * Supports simple placeholder replacement for white-labeling.
 */
class TemplateProcessor {
  /**
   * Process a template string with provided data.
   * @param {string} template - The template string with {{placeholders}}
   * @param {Object} data - Data object for replacements
   * @returns {string} - Processed string
   */
  process(template, data = {}) {
    if (!template) return "";

    return template.replace(/\{\{(.+?)\}\}/g, (match, key) => {
      const value = key
        .trim()
        .split(".")
        .reduce((obj, i) => obj?.[i], data);
      return value !== undefined ? value : match;
    });
  }

  /**
   * Get a default template for a specific action.
   * In a full white-label setup, these could be loaded from the DB or a file system per store.
   * @param {string} action - 'order_confirmation', 'low_stock', etc.
   * @param {string} channel - 'email', 'sms', 'whatsapp'
   */
  getDefaultTemplate(action, channel) {
    const templates = {
      order_confirmation: {
        email: {
          subject: "Order Confirmation - {{restaurantName}}",
          body: "Hello {{customerName}},\n\nYour order #{{orderNumber}} has been received and is being prepared.\n\nTotal: {{currency}}{{totalAmount}}\n\nThank you for choosing {{restaurantName}}!",
        },
        sms: "Order #{{orderNumber}} confirmed at {{restaurantName}}. Total: {{currency}}{{totalAmount}}. We are preparing your meal!",
        whatsapp:
          "Hello {{customerName}}! 🍽️ Your order #{{orderNumber}} at *{{restaurantName}}* is confirmed. Total: {{currency}}{{totalAmount}}.",
      },
      low_stock: {
        sms: "ALERT: Low stock for {{itemName}} at {{restaurantName}}. Current stock: {{currentStock}} {{unit}}.",
        whatsapp:
          "⚠️ *Low Stock Alert* ⚠️\nItem: {{itemName}}\nStore: {{restaurantName}}\nRemaining: {{currentStock}} {{unit}}",
      },
      reservation_confirmation: {
        email: {
          subject: "Reservation Confirmed - {{restaurantName}}",
          body: "Hello {{customerName}},\n\nYour reservation at {{restaurantName}} is confirmed for {{reservationDate}} at {{reservationTime}} for {{partySize}} guests.\n\nWe look forward to seeing you!",
        },
        sms: "Confirmed: Reservation at {{restaurantName}} for {{partySize}} on {{reservationDate}} @ {{reservationTime}}.",
        whatsapp:
          "Hi {{customerName}}! 🙋‍♂️ Your reservation at *{{restaurantName}}* is confirmed for {{reservationDate}} at {{reservationTime}} ({{partySize}} guests).",
      },
      order_status_update: {
        sms: "Order #{{orderNumber}} at {{restaurantName}} is now {{orderStatus}}!",
        whatsapp:
          "Order #{{orderNumber}} update: Your meal is now *{{orderStatus}}*! 🚀",
      },
    };

    return templates[action]?.[channel] || templates[action] || "";
  }
}

module.exports = new TemplateProcessor();
