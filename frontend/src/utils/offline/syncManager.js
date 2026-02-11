// frontend/src/utils/offline/syncManager.js
import axios from "../../utils/offline/offlineAxios"; // Use offlineAxios for interceptor magic
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";
import store from "../../app/store";
import { isTokenExpired } from "../../utils/Helpers";

export class SyncManager {
  constructor() {
    this.syncing = false;
    this.syncInterval = null;
    this.listeners = new Set();
    this.stores = [
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
      "tables",
      "floors",
      "reservations",
      "discounts",
      "promoCodes",
      "addOnGroups",
      "stockAdjustments",
      "kds",
      "kdsStations",
      "stores",
      "organization",
      "brandMenu",
      "ultraFastPOS",
    ];
  }

  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      // Basic online check, robust check happen in axios
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
    const state = store.getState();
    const token = state.auth?.token;

    if (!token || isTokenExpired(token)) {
      return;
    }

    if (this.syncing) {
      console.log("Sync already in progress");
      return;
    }

    this.syncing = true;
    this.notifyListeners({ type: "sync:start" });

    try {
      // 1. Push changes (up)
      await this.pushToServer();

      // 2. Pull changes (down) in clear, single batch
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

  // --- BATCH PULL IMPLEMENTATION ---
  async pullFromServer() {
    try {
      // 1. Collect last sync timestamps for all stores
      const lastSyncMap = {};
      for (const storeName of this.stores) {
        const lastSync = await offlineStorage.getLastSync(storeName);
        if (lastSync) {
          lastSyncMap[storeName] = lastSync;
        }
      }

      // 2. Single Batch Request
      // Uses offlineAxios but we might want to bypass the interceptor to avoid 2x logging?
      // No, we keep it for auth header injection
      const response = await axios.post("/api/sync/pull", {
        lastSync: lastSyncMap,
      });

      const { changes, timestamp } = response.data;

      // 3. Process changes for each store
      for (const [storeName, items] of Object.entries(changes)) {
        if (items && items.length > 0) {
          await this.processStoreUpdates(storeName, items, timestamp);
        } else {
          // Even if no items, update timestamp so we don't query old data next time
          await offlineStorage.setLastSync(storeName, timestamp);
        }
      }
    } catch (error) {
      console.error("Batch pull failed:", error);
      // If 401, it will be handled by axios interceptors eventually or UI
    }
  }

  async processStoreUpdates(storeName, items, newSyncTimestamp) {
    try {
      // Bulk update IndexedDB
      await offlineStorage.bulkSet(storeName, items);

      // Update sync timestamp
      await offlineStorage.setLastSync(storeName, newSyncTimestamp);

      // Mark all as synced
      for (const item of items) {
        await offlineStorage.markSynced(storeName, item._id || item.id);
      }

      // Serialize dates for Redux (Redux Toolkit warns about non-serializable data)
      const serializedItems = items.map((item) =>
        JSON.parse(JSON.stringify(item)),
      );

      // Dispatch to Redux
      this.dispatchToRedux(storeName, serializedItems);

      this.notifyListeners({
        type: "pull:complete",
        store: storeName,
        count: items.length,
      });
    } catch (e) {
      console.error(`Failed to process updates for ${storeName}`, e);
    }
  }
  // ---------------------------------

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
        // CONFLICT HANDLING (409)
        if (error.response?.status === 409) {
          console.warn("Conflict detected for operation:", operation);
          await syncQueue.markFailed(operation.id, error, "conflict");
          // We do NOT increment attempts for conflicts; they need manual resolution
          this.notifyListeners({
            type: "sync:conflict",
            operation: operation,
            error: "Data conflict detected",
          });
          continue;
        }

        // LOGIC ERRORS (4xx) - Fail immediately (except 409 handled above)
        // e.g. 400 Bad Request, 422 Validation Error
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          console.error("Logic error (no retry):", operation, error);
          await syncQueue.markFailed(operation.id, error, "logic_error");
          this.notifyListeners({
            type: "push:error",
            operation: operation.type,
            error: error.message || "Logic Error",
          });
          continue;
        }

        // NETWORK / SERVER ERRORS (5xx, or no response) - Retry
        console.error("Transient error (retrying):", operation, error);
        operation.attempts += 1;

        if (operation.attempts >= 3) {
          await syncQueue.markFailed(operation.id, error, "max_retries");
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
        response = await axios.post(endpoint, data, {
          headers: { "x-sync-request": "true" },
        });
        break;
      case "PUT":
        response = await axios.put(endpoint, data, {
          headers: { "x-sync-request": "true" },
        });
        break;
      case "PATCH":
        response = await axios.patch(endpoint, data, {
          headers: { "x-sync-request": "true" },
        });
        break;
      case "DELETE":
        response = await axios.delete(endpoint, {
          headers: { "x-sync-request": "true" },
        });
        response.data = { success: true, id: itemId };
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

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
      await offlineStorage.remove(storeName, tempId);
      if (realData._id) {
        await offlineStorage.set(storeName, realData._id, {
          ...realData,
          _synced: true,
          _offline: false,
        });
      }
      this.dispatchTempIdReplacement(storeName, tempId, realData);
    } catch (error) {
      console.error("Failed to replace temp ID:", error);
    }
  }

  dispatchToRedux(storeName, items) {
    const actionMap = {
      categories: "categories/fetchAll/fulfilled",
      menuItems: "menuItems/fetchAllMenuItems/fulfilled",
      orders: "orders/fetchOrders/fulfilled",
      customers: "customers/fetchAllCustomers/fulfilled",
      suppliers: "suppliers/fetchAllSuppliers/fulfilled",
      expenses: "expenses/fetchAll/fulfilled",
      inventory: "inventory/fetchAll/fulfilled",
      purchaseOrders: "purchaseOrders/fetchAll/fulfilled",
      users: "users/fetchAllUsers/fulfilled",
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

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach((callback) => callback(event));
  }
  async retryFailedOperations() {
    const failed = await syncQueue.getFailed();
    if (failed.length === 0) return;

    console.log(`Retrying ${failed.length} failed operations...`);

    // Move back to pending queue
    for (const op of failed) {
      // Reset attempts so it gets a fresh chance
      op.attempts = 0;
      await syncQueue.enqueue(op);
      // Remove from failed queue
      await syncQueue.removeFailed(op.id);
    }

    // Trigger sync immediately
    this.pushToServer();

    this.notifyListeners({
      type: "retry:started",
      count: failed.length,
    });
  }
}

export const syncManager = new SyncManager();
