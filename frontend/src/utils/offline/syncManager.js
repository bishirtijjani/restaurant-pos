// frontend/src/utils/offline/syncManager.js
import axios from "axios";
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";
import store from "../../app/store";
import { isTokenExpired } from "../../utils/Helpers";

export class SyncManager {
  constructor() {
    this.syncing = false;
    this.syncInterval = null;
    this.listeners = new Set();
  }

  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncAll();
      }
    }, intervalMs);

    if (navigator.onLine) {
      this.syncAll();
    }
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncAll() {
    // Check if user is logged in
    const state = store.getState();
    const token = state.auth?.token;
    
    if (!token || isTokenExpired(token)) {
      // console.log("Sync skipped: Not logged in or token expired");
      return;
    }

    if (this.syncing) {
      console.log("Sync already in progress");
      return;
    }

    this.syncing = true;
    this.notifyListeners({ type: "sync:start" });

    try {
      // Push queued operations first
      await this.pushToServer();

      // Then pull latest data
      await this.pullFromServer();

      this.notifyListeners({ type: "sync:complete", success: true });
    } catch (error) {
      console.error("Sync failed:", error);
      this.notifyListeners({
        type: "sync:complete",
        success: false,
        error: error.message,
      });
    } finally {
      this.syncing = false;
    }
  }

  async pullFromServer() {
    const stores = [
      "categories",
      "menuItems",
      "orders",
      "customers",
      "suppliers",
      "expenses",
      "inventory",
      "purchaseOrders",
      "users",
      "settings",
    ];

    for (const storeName of stores) {
      try {
        await this.pullStore(storeName);
      } catch (error) {
        console.error(`Failed to pull ${storeName}:`, error);
        
        // If we get a 401, stop the loop immediately to prevent request storm
        if (error.response?.status === 401) {
             console.log("Aborting sync loop due to authentication failure");
             throw error; // Re-throw to stop syncAll
        }
      }
    }
  }

  async pullStore(storeName) {
    const endpoint = this.getEndpoint(storeName);
    if (!endpoint) return;

    const lastSync = await offlineStorage.getLastSync(storeName);

    try {
      const response = await axios.get(endpoint, {
        params: lastSync ? { since: lastSync } : {},
      });

      const items = response.data.data || response.data;

      if (Array.isArray(items)) {
        await offlineStorage.bulkSet(storeName, items);
        await offlineStorage.setLastSync(storeName);

        for (const item of items) {
          await offlineStorage.markSynced(storeName, item._id || item.id);
        }

        // Dispatch to Redux to update UI
        this.dispatchToRedux(storeName, items);
      }

      this.notifyListeners({
        type: "pull:complete",
        store: storeName,
        count: items.length,
      });
    } catch (error) {
      console.error(`Pull failed for ${storeName}:`, error);
      throw error;
    }
  }

  async pushToServer() {
    const pending = await syncQueue.getPending();

    for (const operation of pending) {
      try {
        const result = await this.processOperation(operation);
        await syncQueue.markCompleted(operation.id);

        // If it was a create operation, replace temp ID with real ID
        if (operation.type === "create" && operation.tempId && result.data) {
          const realData = result.data.data || result.data;
          await this.replaceTempId(operation, realData);
        }

        this.notifyListeners({
          type: "push:success",
          operation: operation.type,
        });
      } catch (error) {
        console.error("Operation failed:", operation, error);

        operation.attempts += 1;

        if (operation.attempts >= 3) {
          await syncQueue.markFailed(operation.id, error);
        }

        this.notifyListeners({
          type: "push:error",
          operation: operation.type,
          error: error.message,
        });
      }
    }
  }

  async processOperation(operation) {
    const { type, method, endpoint, data, storeName, itemId } = operation;

    let response;

    switch (method) {
      case "POST":
        response = await axios.post(endpoint, data);
        break;
      case "PUT":
        response = await axios.put(endpoint, data);
        break;
      case "PATCH":
        response = await axios.patch(endpoint, data);
        break;
      case "DELETE":
        response = await axios.delete(endpoint);

        // For DELETE, manually set response data
        response.data = { success: true, id: itemId };
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // Update local storage with server response
    if (response.data) {
      const serverData = response.data.data || response.data;

      if (method === "DELETE") {
        await offlineStorage.remove(storeName, itemId);
      } else {
        const id = serverData._id || serverData.id || itemId;
        await offlineStorage.set(storeName, id, {
          ...serverData,
          _synced: true,
          _offline: false,
        });
      }
    }

    return response;
  }

  async replaceTempId(operation, realData) {
    const { storeName, tempId } = operation;

    try {
      // Remove temp item from storage
      await offlineStorage.remove(storeName, tempId);

      // Add real item
      if (realData._id) {
        await offlineStorage.set(storeName, realData._id, {
          ...realData,
          _synced: true,
          _offline: false,
        });
      }

      // Dispatch update to Redux
      this.dispatchTempIdReplacement(storeName, tempId, realData);
    } catch (error) {
      console.error("Failed to replace temp ID:", error);
    }
  }

  dispatchToRedux(storeName, items) {
    const actionMap = {
      categories: "categories/fetchAll/fulfilled",
      menuItems: "menuItems/fetchAllMenuItems/fulfilled",
      orders: "orders/fetchAllOrders/fulfilled",
      customers: "customers/fetchAllCustomers/fulfilled",
      suppliers: "suppliers/fetchAll/fulfilled",
      expenses: "expenses/fetchAll/fulfilled",
      inventory: "inventory/fetchAll/fulfilled",
      purchaseOrders: "purchaseOrders/fetchAll/fulfilled",
      users: "users/fetchAll/fulfilled",
    };

    const actionType = actionMap[storeName];
    if (actionType) {
      store.dispatch({
        type: actionType,
        payload: items,
        meta: { synced: true },
      });
    }
  }

  dispatchTempIdReplacement(storeName, tempId, realData) {
    const updateActionMap = {
      categories: "categories/replaceTempId",
      menuItems: "menuItems/replaceTempId",
      orders: "orders/replaceTempId",
      customers: "customers/replaceTempId",
      suppliers: "suppliers/replaceTempId",
      expenses: "expenses/replaceTempId",
      inventory: "inventory/replaceTempId",
      purchaseOrders: "purchaseOrders/replaceTempId",
      users: "users/replaceTempId",
    };

    const actionType = updateActionMap[storeName];
    if (actionType) {
      store.dispatch({
        type: actionType,
        payload: { tempId, realData },
      });
    }
  }

  getEndpoint(storeName) {
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
      settings: "/api/general-settings",
    };

    return endpoints[storeName];
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach((callback) => callback(event));
  }
}

export const syncManager = new SyncManager();
