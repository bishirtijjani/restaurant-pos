// frontend/src/utils/offline/offlineMiddleware.js
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";

// Map action types to store names
const actionToStore = {
  // Menu Items
  "menuItems/fetchAllMenuItems/fulfilled": "menuItems",
  "menuItems/createMenuItem/fulfilled": "menuItems",
  "menuItems/updateMenuItem/fulfilled": "menuItems",
  "menuItems/deleteMenuItem/fulfilled": "menuItems",

  // Categories
  "categories/fetchAll/fulfilled": "categories",
  "categories/create/fulfilled": "categories",
  "categories/update/fulfilled": "categories",
  "categories/delete/fulfilled": "categories",

  // Orders
  "orders/fetchAllOrders/fulfilled": "orders",
  "orders/createOrder/fulfilled": "orders",
  "orders/updateOrder/fulfilled": "orders",
  "orders/cancelOrder/fulfilled": "orders",

  // Customers
  "customers/fetchAllCustomers/fulfilled": "customers",
  "customers/addCustomer/fulfilled": "customers",
  "customers/updateCustomer/fulfilled": "customers",
  "customers/deleteCustomer/fulfilled": "customers",

  // Suppliers
  "suppliers/fetchAll/fulfilled": "suppliers",
  "suppliers/create/fulfilled": "suppliers",
  "suppliers/update/fulfilled": "suppliers",
  "suppliers/delete/fulfilled": "suppliers",

  // Expenses
  "expenses/fetchAll/fulfilled": "expenses",
  "expenses/create/fulfilled": "expenses",
  "expenses/update/fulfilled": "expenses",
  "expenses/delete/fulfilled": "expenses",

  // Inventory
  "inventory/fetchAll/fulfilled": "inventory",
  "inventory/create/fulfilled": "inventory",
  "inventory/update/fulfilled": "inventory",
  "inventory/delete/fulfilled": "inventory",

  // Purchase Orders
  "purchaseOrders/fetchAll/fulfilled": "purchaseOrders",
  "purchaseOrders/create/fulfilled": "purchaseOrders",
  "purchaseOrders/update/fulfilled": "purchaseOrders",

  // Users
  "users/fetchAll/fulfilled": "users",
  "users/create/fulfilled": "users",
  "users/update/fulfilled": "users",
  "users/delete/fulfilled": "users",

  // Settings
  "generalSettings/fetchSettings/fulfilled": "settings",
};

export const offlineMiddleware = (store) => (next) => async (action) => {
  const { type } = action;

  // Handle fulfilled actions - cache data
  if (type.endsWith("/fulfilled")) {
    const storeName = actionToStore[type];

    if (storeName && action.payload) {
      try {
        const data = action.payload.data || action.payload;

        if (Array.isArray(data)) {
          await offlineStorage.bulkSet(storeName, data);
        } else if (data && typeof data === "object") {
          const id = data._id || data.id;
          if (id) {
            await offlineStorage.set(storeName, id, data);
          }
        }
      } catch (error) {
        console.error("Failed to cache data:", error);
      }
    }
  }

  // Handle rejected actions - try offline
  if (type.endsWith("/rejected") && !navigator.onLine) {
    const baseType = type.replace("/rejected", "");
    const storeName = actionToStore[`${baseType}/fulfilled`];

    if (storeName && action.meta?.arg) {
      try {
        // Try to serve from cache
        const cachedData = await offlineStorage.getAll(storeName);

        // Create a new fulfilled action with cached data
        return next({
          type: `${baseType}/fulfilled`,
          payload: cachedData,
          meta: { ...action.meta, offline: true },
        });
      } catch (error) {
        console.error("Failed to load offline data:", error);
      }
    }
  }

  // Handle pending actions - queue operations
  if (type.endsWith("/pending") && !navigator.onLine) {
    const baseType = type.replace("/pending", "");

    // Queue create/update/delete operations
    if (
      baseType.includes("create") ||
      baseType.includes("update") ||
      baseType.includes("delete")
    ) {
      const operation = await createQueueOperation(action);
      if (operation) {
        await syncQueue.enqueue(operation);
      }
    }
  }

  return next(action);
};

// Create queue operation from action
async function createQueueOperation(action) {
  const { type, meta } = action;
  const baseType = type.replace("/pending", "");
  const [domain, method] = baseType.split("/");

  const storeName = domain.toLowerCase();
  const data = meta?.arg;

  if (!data) return null;

  let httpMethod, endpoint;

  if (method === "create") {
    httpMethod = "POST";
    endpoint = getEndpointForDomain(domain);
  } else if (method === "update") {
    httpMethod = "PUT";
    endpoint = `${getEndpointForDomain(domain)}/${data.id || data._id}`;
  } else if (method === "delete") {
    httpMethod = "DELETE";
    endpoint = `${getEndpointForDomain(domain)}/${data.id || data._id || data}`;
  }

  return {
    type: method,
    method: httpMethod,
    endpoint,
    data,
    storeName,
    itemId: data._id || data.id,
  };
}

function getEndpointForDomain(domain) {
  const endpoints = {
    menuItems: "/api/menu-items",
    categories: "/api/categories",
    orders: "/api/orders",
    customers: "/api/customers",
    suppliers: "/api/suppliers",
    expenses: "/api/expenses",
    inventory: "/api/inventory",
    purchaseOrders: "/api/purchase-orders",
    users: "/api/users",
  };

  return endpoints[domain] || `/api/${domain.toLowerCase()}`;
}

export default offlineMiddleware;
