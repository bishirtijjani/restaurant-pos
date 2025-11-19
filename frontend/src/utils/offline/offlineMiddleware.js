// frontend/src/utils/offline/offlineMiddleware.js
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";
import { connectionMonitor } from "./connectionMonitor";

// Map action types to store names
const actionToStore = {
  // Categories
  "categories/fetchAll/fulfilled": "categories",
  "categories/create/fulfilled": "categories",
  "categories/update/fulfilled": "categories",
  "categories/delete/fulfilled": "categories",

  // Menu Items
  "menuItems/fetchAllMenuItems/fulfilled": "menuItems",
  "menuItems/addMenuItem/fulfilled": "menuItems",
  "menuItems/updateMenuItem/fulfilled": "menuItems",
  "menuItems/deleteMenuItem/fulfilled": "menuItems",

  // Add other mappings...
};

// Generate temporary ID for offline items
const generateTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const offlineMiddleware = (store) => (next) => async (action) => {
  const { type, payload } = action;

  // Handle pending actions (CREATE/UPDATE/DELETE while offline)
  if (type.endsWith("/pending") && !connectionMonitor.isOnline()) {
    const baseType = type.replace("/pending", "");
    const [domain, method] = baseType.split("/");

    // Handle CREATE operations
    if (
      method === "create" ||
      method === "addMenuItem" ||
      method === "createCategory"
    ) {
      const tempId = generateTempId();
      const optimisticData = {
        ...action.meta.arg,
        _id: tempId,
        _tempId: tempId,
        _offline: true,
        _synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Queue the operation
      const operation = {
        type: "create",
        method: "POST",
        endpoint: getEndpointForDomain(domain),
        data: action.meta.arg,
        storeName: domain,
        tempId: tempId,
        optimisticData: optimisticData,
      };

      await syncQueue.enqueue(operation);

      // Cache optimistically
      const storeName = domain.toLowerCase();
      await offlineStorage.set(storeName, tempId, optimisticData);

      // Dispatch fulfilled action with optimistic data
      const fulfilledAction = {
        type: `${baseType}/fulfilled`,
        payload: optimisticData,
        meta: { ...action.meta, offline: true, tempId },
      };

      return next(fulfilledAction);
    }

    // Handle UPDATE operations
    if (
      method === "update" ||
      method === "updateMenuItem" ||
      method === "updateCategory"
    ) {
      const itemId = action.meta.arg.id || action.meta.arg._id;
      const updatedData = action.meta.arg;

      const optimisticData = {
        ...updatedData,
        _id: itemId,
        _offline: true,
        _synced: false,
        updatedAt: new Date().toISOString(),
      };

      // Queue the operation
      const operation = {
        type: "update",
        method: "PUT",
        endpoint: `${getEndpointForDomain(domain)}/${itemId}`,
        data: updatedData,
        storeName: domain,
        itemId: itemId,
        optimisticData: optimisticData,
      };

      await syncQueue.enqueue(operation);

      // Update cache
      const storeName = domain.toLowerCase();
      await offlineStorage.set(storeName, itemId, optimisticData);

      // Dispatch fulfilled action with optimistic data
      const fulfilledAction = {
        type: `${baseType}/fulfilled`,
        payload: optimisticData,
        meta: { ...action.meta, offline: true },
      };

      return next(fulfilledAction);
    }

    // Handle DELETE operations
    if (
      method === "delete" ||
      method === "deleteMenuItem" ||
      method === "deleteCategory"
    ) {
      const itemId = action.meta.arg.id || action.meta.arg;

      // Queue the operation
      const operation = {
        type: "delete",
        method: "DELETE",
        endpoint: `${getEndpointForDomain(domain)}/${itemId}`,
        storeName: domain,
        itemId: itemId,
      };

      await syncQueue.enqueue(operation);

      // Remove from cache
      const storeName = domain.toLowerCase();
      await offlineStorage.remove(storeName, itemId);

      // Dispatch fulfilled action
      const fulfilledAction = {
        type: `${baseType}/fulfilled`,
        payload: itemId,
        meta: { ...action.meta, offline: true },
      };

      return next(fulfilledAction);
    }
  }

  // Handle fulfilled actions - cache data
  if (type.endsWith("/fulfilled")) {
    const storeName = actionToStore[type];

    if (storeName && action.payload) {
      try {
        const data = action.payload.data || action.payload;

        // Handle temp ID replacement when syncing completes
        if (action.meta?.tempId && !action.meta?.offline) {
          // This is a real server response for a previously offline item
          await offlineStorage.remove(storeName, action.meta.tempId);

          if (data._id) {
            await offlineStorage.set(storeName, data._id, {
              ...data,
              _synced: true,
              _offline: false,
            });
          }
        } else if (Array.isArray(data)) {
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
  if (type.endsWith("/rejected") && !connectionMonitor.isOnline()) {
    const baseType = type.replace("/rejected", "");
    const storeName = actionToStore[`${baseType}/fulfilled`];

    if (storeName) {
      try {
        // Try to serve from cache
        const cachedData = await offlineStorage.getAll(storeName);

        // Create a new fulfilled action with cached data
        return next({
          type: `${baseType}/fulfilled`,
          payload: cachedData,
          meta: { ...action.meta, offline: true, cached: true },
        });
      } catch (error) {
        console.error("Failed to load offline data:", error);
      }
    }
  }

  return next(action);
};

function getEndpointForDomain(domain) {
  const endpoints = {
    categories: "/api/categories",
    menuItems: "/api/menu-items",
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
