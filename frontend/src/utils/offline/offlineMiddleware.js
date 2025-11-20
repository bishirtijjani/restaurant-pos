// frontend/src/utils/offline/offlineMiddleware.js
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";
import { connectionMonitor } from "./connectionMonitor";

const actionToStore = {
  "categories/fetchAll/fulfilled": "categories",
  "categories/create/fulfilled": "categories",
  "categories/update/fulfilled": "categories",
  "categories/delete/fulfilled": "categories",
  "menuItems/fetchAllMenuItems/fulfilled": "menuItems",
  "menuItems/addMenuItem/fulfilled": "menuItems",
  "menuItems/updateMenuItem/fulfilled": "menuItems",
  "menuItems/deleteMenuItem/fulfilled": "menuItems",
  "expenses/fetchAll/fulfilled": "expenses",
  "expenses/addExpense/fulfilled": "expenses",
  "expenses/updateExpense/fulfilled": "expenses",
  "expenses/deleteExpense/fulfilled": "expenses",
};

const generateTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const offlineMiddleware = (store) => (next) => async (action) => {
  const { type, payload, meta } = action;

  // CRITICAL: Skip if already processed by middleware
  if (meta?.middlewareProcessed) {
    return next(action);
  }

  // CRITICAL: Only process PENDING actions when offline
  if (type.endsWith("/pending") && !connectionMonitor.isOnline()) {
    return handleOfflinePending(action, next, store);
  }

  // Handle fulfilled actions for caching (online or offline)
  if (type.endsWith("/fulfilled")) {
    return handleFulfilled(action, next);
  }

  // Handle rejected actions - serve from cache if offline
  if (type.endsWith("/rejected") && !connectionMonitor.isOnline()) {
    return handleOfflineRejected(action, next);
  }

  return next(action);
};

async function handleOfflinePending(action, next, store) {
  const { type, meta } = action;
  const baseType = type.replace("/pending", "");
  const [domain, method] = baseType.split("/");

  // CREATE operations
  if (isCreateOperation(method)) {
    return handleOfflineCreate(action, baseType, domain, next);
  }

  // UPDATE operations
  if (isUpdateOperation(method)) {
    return handleOfflineUpdate(action, baseType, domain, next);
  }

  // DELETE operations
  if (isDeleteOperation(method)) {
    return handleOfflineDelete(action, baseType, domain, next);
  }

  // Unknown operation - pass through
  return next(action);
}

async function handleOfflineCreate(action, baseType, domain, next) {
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

  // Queue the operation ONCE
  const operation = {
    id: tempId, // Use tempId as operation ID
    type: "create",
    method: "POST",
    endpoint: getEndpointForDomain(domain),
    data: action.meta.arg,
    storeName: domain,
    tempId: tempId,
    timestamp: Date.now(),
    attempts: 0,
    status: "pending",
  };

  await syncQueue.enqueue(operation);
  await offlineStorage.set(domain.toLowerCase(), tempId, optimisticData);

  console.log(`✅ CREATE queued (${domain}):`, tempId);

  // Dispatch fulfilled action ONCE
  return next({
    type: `${baseType}/fulfilled`,
    payload: optimisticData,
    meta: {
      ...action.meta,
      arg: action.meta.arg,
      requestId: action.meta.requestId,
      offline: true,
      tempId,
      middlewareProcessed: true,
    },
  });
}

async function handleOfflineUpdate(action, baseType, domain, next) {
  const itemId = action.meta.arg.id || action.meta.arg._id;
  const updatedData = action.meta.arg.updatedData || action.meta.arg;

  // Get current item from store to merge with updates
  const state = store.getState();
  const storeName = domain.toLowerCase();
  const stateSlice = state[storeName];

  let currentItem;
  if (Array.isArray(stateSlice[storeName])) {
    currentItem = stateSlice[storeName].find((item) => item._id === itemId);
  } else {
    currentItem = await offlineStorage.get(storeName, itemId);
  }

  const optimisticData = {
    ...(currentItem || {}),
    ...updatedData,
    _id: itemId,
    _offline: true,
    _synced: false,
    updatedAt: new Date().toISOString(),
  };

  const operation = {
    id: `update_${itemId}_${Date.now()}`,
    type: "update",
    method: "PUT",
    endpoint: `${getEndpointForDomain(domain)}/${itemId}`,
    data: updatedData,
    storeName: domain,
    itemId: itemId,
    timestamp: Date.now(),
    attempts: 0,
    status: "pending",
  };

  await syncQueue.enqueue(operation);
  await offlineStorage.set(storeName, itemId, optimisticData);

  console.log(`✅ UPDATE queued (${domain}):`, itemId);

  return next({
    type: `${baseType}/fulfilled`,
    payload: optimisticData,
    meta: {
      ...action.meta,
      arg: action.meta.arg,
      requestId: action.meta.requestId,
      offline: true,
      middlewareProcessed: true,
    },
  });
}

async function handleOfflineDelete(action, baseType, domain, next) {
  const itemId = action.meta.arg.id || action.meta.arg;

  const operation = {
    id: `delete_${itemId}_${Date.now()}`,
    type: "delete",
    method: "DELETE",
    endpoint: `${getEndpointForDomain(domain)}/${itemId}`,
    storeName: domain,
    itemId: itemId,
    timestamp: Date.now(),
    attempts: 0,
    status: "pending",
  };

  await syncQueue.enqueue(operation);
  await offlineStorage.remove(domain.toLowerCase(), itemId);

  console.log(`✅ DELETE queued (${domain}):`, itemId);

  return next({
    type: `${baseType}/fulfilled`,
    payload: itemId,
    meta: {
      ...action.meta,
      arg: itemId,
      requestId: action.meta.requestId,
      offline: true,
      middlewareProcessed: true,
    },
  });
}

async function handleFulfilled(action, next) {
  const storeName = actionToStore[action.type];

  if (storeName && action.payload && !action.meta?.middlewareProcessed) {
    try {
      const data = action.payload.data || action.payload;

      // Handle temp ID replacement
      if (action.meta?.tempId && !action.meta?.offline) {
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
      } else if (data && typeof data === "object" && data._id) {
        await offlineStorage.set(storeName, data._id, data);
      }
    } catch (error) {
      console.error("Failed to cache data:", error);
    }
  }

  return next(action);
}

async function handleOfflineRejected(action, next) {
  const baseType = action.type.replace("/rejected", "");
  const storeName = actionToStore[`${baseType}/fulfilled`];

  if (storeName) {
    try {
      const cachedData = await offlineStorage.getAll(storeName);
      return next({
        type: `${baseType}/fulfilled`,
        payload: cachedData,
        meta: {
          ...action.meta,
          offline: true,
          cached: true,
          middlewareProcessed: true,
        },
      });
    } catch (error) {
      console.error("Failed to load offline data:", error);
    }
  }

  return next(action);
}

// Helper functions
function isCreateOperation(method) {
  return ["create", "addMenuItem", "createCategory", "addExpense"].includes(
    method
  );
}

function isUpdateOperation(method) {
  return [
    "update",
    "updateMenuItem",
    "updateCategory",
    "updateExpense",
  ].includes(method);
}

function isDeleteOperation(method) {
  return [
    "delete",
    "deleteMenuItem",
    "deleteCategory",
    "deleteExpense",
  ].includes(method);
}

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
