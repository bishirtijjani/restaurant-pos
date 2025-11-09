// frontend/src/utils/authorization.js
import { jwtDecode } from "jwt-decode";
import { getToken } from "./Helpers";

/**
 * All available roles in the system
 */
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
  WAITER: "waiter",
  KITCHEN: "kitchen",
  ACCOUNTANT: "accountant",
  STAFF: "staff",
};

/**
 * Get current user's role from token
 */
export const getUserRole = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const { role } = jwtDecode(token);
    return role;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (...roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

/**
 * Quick role checks
 */
export const isAdmin = () => hasRole(ROLES.ADMIN);
export const isManager = () => hasRole(ROLES.MANAGER);
export const isCashier = () => hasRole(ROLES.CASHIER);
export const isWaiter = () => hasRole(ROLES.WAITER);
export const isKitchen = () => hasRole(ROLES.KITCHEN);
export const isAccountant = () => hasRole(ROLES.ACCOUNTANT);
export const isStaff = () => hasRole(ROLES.STAFF);

/**
 * Common role group checks
 */
export const isAdminOrManager = () => hasAnyRole(ROLES.ADMIN, ROLES.MANAGER);
export const canManageOrders = () =>
  hasAnyRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER);
export const canViewKitchen = () =>
  hasAnyRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.KITCHEN, ROLES.WAITER);
export const canManageFinances = () =>
  hasAnyRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT);
export const canManageInventory = () => hasAnyRole(ROLES.ADMIN, ROLES.MANAGER);
export const canManageUsers = () => hasRole(ROLES.ADMIN);
