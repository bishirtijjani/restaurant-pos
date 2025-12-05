// backend/config/defaults.js
// Centralized configurable defaults - all hard-coded values in one place

module.exports = {
  // Order defaults
  order: {
    defaultOrderType: process.env.DEFAULT_ORDER_TYPE || "dine-in",
    defaultCustomerName: process.env.DEFAULT_CUSTOMER_NAME || "Walk-in",
    defaultTable: process.env.DEFAULT_TABLE || "Takeaway",
  },

  // Tax defaults
  tax: {
    defaultTaxRate: parseFloat(process.env.DEFAULT_TAX_RATE) || 0,
    defaultServiceChargeRate: parseFloat(process.env.DEFAULT_SERVICE_CHARGE_RATE) || 0,
    taxMode: process.env.TAX_MODE || "per-order", // "per-order" or "per-item"
  },

  // Reservation defaults
  reservation: {
    defaultDuration: parseInt(process.env.DEFAULT_RESERVATION_DURATION) || 120, // minutes
    bufferTime: parseInt(process.env.RESERVATION_BUFFER_TIME) || 15, // minutes
    maxPartySize: parseInt(process.env.MAX_PARTY_SIZE) || 20,
  },

  // Inventory defaults
  inventory: {
    defaultMinStockLevel: parseInt(process.env.DEFAULT_MIN_STOCK_LEVEL) || 10,
    lowStockAlert: parseInt(process.env.LOW_STOCK_ALERT) || 5,
    defaultUnit: process.env.DEFAULT_INVENTORY_UNIT || "units",
  },

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT) || 20,
    maxLimit: parseInt(process.env.MAX_PAGE_LIMIT) || 100,
  },

  // Authentication defaults
  auth: {
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 30, // minutes
  },

  // Kitchen Display System defaults
  kds: {
    orderAlertThreshold: parseInt(process.env.KDS_ALERT_THRESHOLD) || 10, // minutes
    priorityThreshold: parseInt(process.env.KDS_PRIORITY_THRESHOLD) || 15, // minutes
  },

  // Discount defaults
  discount: {
    maxDiscountPercent: parseInt(process.env.MAX_DISCOUNT_PERCENT) || 100,
    requireApprovalAbove: parseInt(process.env.DISCOUNT_APPROVAL_THRESHOLD) || 50, // percent
  },

  // Delivery defaults
  delivery: {
    defaultDeliveryFee: parseFloat(process.env.DEFAULT_DELIVERY_FEE) || 0,
    freeDeliveryThreshold: parseFloat(process.env.FREE_DELIVERY_THRESHOLD) || 0,
  },
};
