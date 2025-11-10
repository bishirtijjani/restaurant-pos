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

// Simple permission map - who can do what
export const CAN = {
  // Users
  manageUsers: [ROLES.ADMIN],

  // Menu & Categories
  viewMenu: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.STAFF,
    ROLES.CASHIER,
    ROLES.WAITER,
  ],
  editMenu: [ROLES.ADMIN, ROLES.MANAGER],
  deleteMenu: [ROLES.ADMIN],

  // Orders
  viewOrders: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  createOrders: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  cancelOrders: [ROLES.ADMIN, ROLES.MANAGER],

  // Inventory & Stock
  viewInventory: [ROLES.ADMIN, ROLES.MANAGER, ROLES.KITCHEN],
  editInventory: [ROLES.ADMIN, ROLES.MANAGER],

  // Financial
  viewExpenses: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT],
  editExpenses: [ROLES.ADMIN, ROLES.MANAGER],
  viewAnalytics: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT],

  // Settings
  editSettings: [ROLES.ADMIN],
};

// Simple permission check
export const can = (action, userRole) => {
  if (!userRole) return false; // Add this safety check
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
