import { useSelector } from "react-redux";

// Role definitions
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
  WAITER: "waiter",
  KITCHEN: "kitchen",
  ACCOUNTANT: "accountant",
  STAFF: "staff",
};

// Complete permission map - who can do what
export const CAN = {
  // Users Management
  manageUsers: [ROLES.ADMIN],
  viewUsers: [ROLES.ADMIN, ROLES.MANAGER],
  createUsers: [ROLES.ADMIN],
  editUsers: [ROLES.ADMIN],
  deleteUsers: [ROLES.ADMIN],

  // Menu & Categories
  viewMenu: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.STAFF,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.KITCHEN,
  ],
  createMenu: [ROLES.ADMIN, ROLES.MANAGER],
  editMenu: [ROLES.ADMIN, ROLES.MANAGER],
  deleteMenu: [ROLES.ADMIN],

  viewCategories: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.KITCHEN,
  ],
  createCategories: [ROLES.ADMIN, ROLES.MANAGER],
  editCategories: [ROLES.ADMIN, ROLES.MANAGER],
  deleteCategories: [ROLES.ADMIN],

  // Orders Management
  viewOrders: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.STAFF,
    ROLES.KITCHEN,
  ],
  createOrders: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  editOrders: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  cancelOrders: [ROLES.ADMIN, ROLES.MANAGER],
  updateOrderStatus: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.KITCHEN],

  // Customers Management
  viewCustomers: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.ACCOUNTANT,
  ],
  createCustomers: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  editCustomers: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  deleteCustomers: [ROLES.ADMIN, ROLES.MANAGER],

  // Inventory & Stock Management
  viewInventory: [ROLES.ADMIN, ROLES.MANAGER, ROLES.KITCHEN, ROLES.ACCOUNTANT],
  createInventory: [ROLES.ADMIN, ROLES.MANAGER],
  editInventory: [ROLES.ADMIN, ROLES.MANAGER],
  deleteInventory: [ROLES.ADMIN],

  viewStockAdjustments: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT],
  createStockAdjustments: [ROLES.ADMIN, ROLES.MANAGER],
  editStockAdjustments: [ROLES.ADMIN, ROLES.MANAGER],
  deleteStockAdjustments: [ROLES.ADMIN],

  // Purchase Orders
  viewPurchaseOrders: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT],
  createPurchaseOrders: [ROLES.ADMIN, ROLES.MANAGER],
  editPurchaseOrders: [ROLES.ADMIN, ROLES.MANAGER],
  deletePurchaseOrders: [ROLES.ADMIN],
  approvePurchaseOrders: [ROLES.ADMIN, ROLES.MANAGER],
  receivePurchaseOrders: [ROLES.ADMIN, ROLES.MANAGER],

  // Suppliers Management
  viewSuppliers: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT],
  createSuppliers: [ROLES.ADMIN, ROLES.MANAGER],
  editSuppliers: [ROLES.ADMIN, ROLES.MANAGER],
  deleteSuppliers: [ROLES.ADMIN],

  // Expenses Management
  viewExpenses: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.CASHIER],
  createExpenses: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  editExpenses: [ROLES.ADMIN, ROLES.MANAGER],
  deleteExpenses: [ROLES.ADMIN, ROLES.MANAGER],

  // Financial & Analytics
  viewAnalytics: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT],
  viewFinancialReports: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT],

  // KDS (Kitchen Display System)
  viewKDS: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.KITCHEN,
    ROLES.CASHIER,
    ROLES.WAITER,
  ],
  manageKDS: [ROLES.ADMIN, ROLES.MANAGER],

  // KDS Stations Management
  viewKDSStations: [ROLES.ADMIN, ROLES.MANAGER, ROLES.KITCHEN],
  createKDSStations: [ROLES.ADMIN, ROLES.MANAGER],
  editKDSStations: [ROLES.ADMIN, ROLES.MANAGER],
  deleteKDSStations: [ROLES.ADMIN],

  // Settings Management
  viewSettings: [ROLES.ADMIN, ROLES.MANAGER],
  editSettings: [ROLES.ADMIN],
  editGeneralSettings: [ROLES.ADMIN],
  viewProfileSettings: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.KITCHEN,
    ROLES.ACCOUNTANT,
    ROLES.STAFF,
  ],
  editProfileSettings: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.KITCHEN,
    ROLES.ACCOUNTANT,
    ROLES.STAFF,
  ],

  // Dashboard Access
  viewDashboard: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.KITCHEN,
    ROLES.ACCOUNTANT,
    ROLES.STAFF,
  ],
};

// Simple permission check
export const can = (action, userRole) => {
  if (!userRole) return false;
  return CAN[action]?.includes(userRole) || false;
};

// Hook for easy access
export const useAuth = () => {
  const userRole = useSelector((state) => state.auth.user?.role);

  return {
    role: userRole,
    can: (action) => can(action, userRole),
    isAdmin: userRole === ROLES.ADMIN,
    isManager: userRole === ROLES.MANAGER,
    isCashier: userRole === ROLES.CASHIER,
    isWaiter: userRole === ROLES.WAITER,
    isKitchen: userRole === ROLES.KITCHEN,
    isAccountant: userRole === ROLES.ACCOUNTANT,
    isStaff: userRole === ROLES.STAFF,
  };
};

// ============ HOW TO USE ===========
// In any component that needs protection:
// import { useAuth } from "../../utils/permission";

// function MyComponent() {
//   const { can } = useAuth();

//   return (
//     <>
//       {can('editMenu') && (
//         <button>Edit Menu</button>
//       )}

//       {can('deleteMenu') && (
//         <button>Delete</button>
//       )}
//     </>
//   );
// }

// === OR USING THE Can COMPONENT === :
// import Can from "../../components/Auth/Can";

// <Can do="editMenu">
//   <button>Edit Menu</button>
// </Can>

// <Can do="deleteMenu">
//   <button>Delete</button>
// </Can>
