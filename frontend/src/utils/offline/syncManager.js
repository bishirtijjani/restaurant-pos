// frontend/src/utils/offline/syncManager.js
import axios from "axios";
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";

export class SyncManager {
  constructor() {
    this.syncing = false;
    this.syncInterval = null;
    this.listeners = new Set();
  }

  // Start automatic sync
  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncAll();
      }
    }, intervalMs);

    // Initial sync
    if (navigator.onLine) {
      this.syncAll();
    }
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sync all data
  async syncAll() {
    if (this.syncing) {
      console.log("Sync already in progress");
      return;
    }

    this.syncing = true;
    this.notifyListeners({ type: "sync:start" });

    try {
      // 1. Pull latest data from server
      await this.pullFromServer();

      // 2. Push queued operations to server
      await this.pushToServer();

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

  // Pull latest data from server
  async pullFromServer() {
    const stores = [
      "menuItems",
      "categories",
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
      }
    }
  }

  // Pull specific store data
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

        // Mark all as synced
        for (const item of items) {
          await offlineStorage.markSynced(storeName, item._id || item.id);
        }
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

  // Push queued operations to server
  async pushToServer() {
    const pending = await syncQueue.getPending();

    for (const operation of pending) {
      try {
        await this.processOperation(operation);
        await syncQueue.markCompleted(operation.id);

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

  // Process individual operation
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
        await offlineStorage.set(storeName, id, serverData);
        await offlineStorage.markSynced(storeName, id);
      }
    }

    return response;
  }

  // Get API endpoint for store
  getEndpoint(storeName) {
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
      settings: "/api/general-settings",
    };

    return endpoints[storeName];
  }

  // Add sync listener
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify listeners
  notifyListeners(event) {
    this.listeners.forEach((callback) => callback(event));
  }
}

export const syncManager = new SyncManager();
