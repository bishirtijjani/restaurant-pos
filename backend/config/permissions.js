/**
 * Defined system-wide permissions for granular access control.
 * Format: 'resource:action'
 */
const PERMISSIONS = {
  // Menu Management
  MENU_VIEW: "menu:view",
  MENU_EDIT: "menu:edit",

  // Order Management
  ORDERS_VIEW: "orders:view",
  ORDERS_CREATE: "orders:create",
  ORDERS_VOID: "orders:void", // Critical: Allows deleting/voiding paid orders
  ORDERS_DISCOUNT: "orders:discount", // Allows applying discounts to orders
  ORDERS_REOPEN: "orders:reopen", // Critical: Allows reopening completed/cancelled orders

  // Inventory Management
  INVENTORY_VIEW: "inventory:view",
  INVENTORY_EDIT: "inventory:edit",
  INVENTORY_TRANSFER: "inventory:transfer", // Cross-store transfers

  // Financials & Reports
  REPORTS_VIEW: "reports:view",
  EXPENSES_MANAGE: "expenses:manage",

  // Store Management
  SETTINGS_EDIT: "settings:edit",
  STAFF_MANAGE: "staff:manage", // Add/Edit/Remove staff members

  // Customer Management
  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_EDIT: "customers:edit",

  // Brand Menu Management (Organization-level)
  BRAND_MENU_VIEW: "brand:menu:view",
  BRAND_MENU_EDIT: "brand:menu:edit",
  BRAND_MENU_PUBLISH: "brand:menu:publish",
  BRAND_PRICING_OVERRIDE: "brand:pricing:override", // For stores
};

/**
 * Default permissions assigned to roles if no granular permissions are specified.
 */
const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    "all",
    PERMISSIONS.BRAND_MENU_VIEW,
    PERMISSIONS.BRAND_MENU_EDIT,
    PERMISSIONS.BRAND_MENU_PUBLISH,
  ],
  manager: [
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_EDIT,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_DISCOUNT,
    PERMISSIONS.ORDERS_REOPEN,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.EXPENSES_MANAGE,
    PERMISSIONS.STAFF_MANAGE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_EDIT,
  ],
  cashier: [
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.CUSTOMERS_VIEW,
  ],
  waiter: [
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
  ],
  kitchen: [PERMISSIONS.MENU_VIEW, PERMISSIONS.ORDERS_VIEW],
};

module.exports = {
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
};
