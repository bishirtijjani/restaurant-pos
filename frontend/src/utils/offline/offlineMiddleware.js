// frontend/src/utils/offline/offlineMiddleware.js
import offlineStorage from "./storage";

// Map action types to store names
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

  "inventory/fetchAll/fulfilled": "inventory",
  "inventory/create/fulfilled": "inventory",
  "inventory/update/fulfilled": "inventory",
  "inventory/delete/fulfilled": "inventory",
};

export const offlineMiddleware = (store) => (next) => async (action) => {
  const { type, payload } = action;

  // ONLY HANDLE FULFILLED ACTIONS FOR CACHING
  // Do NOT create queue entries here - that's handled by offlineAxios

  if (type.endsWith("/fulfilled")) {
    const storeName = actionToStore[type];

    if (storeName && payload) {
      try {
        const data = payload.data || payload;

        // Handle temp ID replacement when syncing completes
        if (action.meta?.tempId && !action.meta?.offline) {
          await offlineStorage.remove(storeName, action.meta.tempId);
          if (data._id) {
            await offlineStorage.set(storeName, data._id, {
              ...data,
              _synced: true,
              _offline: false,
            });
          }
        }
        // Cache array data
        else if (Array.isArray(data)) {
          await offlineStorage.bulkSet(storeName, data);
        }
        // Cache single object data
        else if (data && typeof data === "object") {
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

  // Handle rejected actions - try serving from cache
  if (type.endsWith("/rejected")) {
    const baseType = type.replace("/rejected", "");
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
          },
        });
      } catch (error) {
        console.error("Failed to load offline data:", error);
      }
    }
  }

  return next(action);
};

export default offlineMiddleware;
