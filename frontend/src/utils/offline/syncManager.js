// frontend/src/utils/offline/syncManager.js
import axios from "../../utils/offline/offlineAxios"; // Use offlineAxios for interceptor magic
import { v7 as uuidv7 } from "uuid";
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";
import store from "../../app/store";
import { isTokenExpired } from "../../utils/Helpers";

// Metadata key used to persist the in-flight sync batch.
// If a push crashes mid-flight (network drop, page reload, etc.), the next
// pushToServer() finds this record and replays the SAME idempotency key,
// so the backend can deduplicate at the request level instead of re-executing.
const IN_FLIGHT_BATCH_KEY = "__sync_in_flight_batch__";

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

  // --- BATCH PUSH: All pending operations sent atomically ---
  async pushToServer() {
    // Check for a previous batch that didn't complete cleanly.
    // If found, replay with the SAME idempotency key + SAME operation set
    // so the server dedups instead of double-executing.
    let inFlight = await offlineStorage.get(
      "metadata",
      IN_FLIGHT_BATCH_KEY,
    );

    let pending;
    let batchKey;

    if (inFlight && Array.isArray(inFlight.operationIds)) {
      const allPending = await syncQueue.getPending();
      pending = allPending.filter((op) =>
        inFlight.operationIds.includes(op.id),
      );
      batchKey = inFlight.batchKey;

      // The in-flight ops have all completed externally (or been cleared);
      // drop the stale record and proceed with a fresh batch.
      if (pending.length === 0) {
        await offlineStorage.remove("metadata", IN_FLIGHT_BATCH_KEY);
        inFlight = null;
      }
    }

    if (!inFlight) {
      pending = await syncQueue.getPending();
      if (pending.length === 0) return;
      batchKey = uuidv7();
      await offlineStorage.set("metadata", IN_FLIGHT_BATCH_KEY, {
        batchKey,
        operationIds: pending.map((op) => op.id),
        createdAt: Date.now(),
      });
    }

    // Build the operations array for the batch endpoint
    // Map each queue item to the operation schema the backend expects
    const operations = pending.map((op) => ({
      type: this._mapToOperationType(op),
      tempId: op.tempId || op.id,
      params: op.params || (op.itemId ? { id: op.itemId } : {}),
      data: op.data || {},
    }));

    try {
      const response = await axios.post(
        "/api/sync/push",
        { operations },
        {
          headers: {
            "x-sync-request": "true",
            "Idempotency-Key": batchKey,
          },
        },
      );

      const { results } = response.data;

      // Mark all as completed and update local storage
      for (let i = 0; i < pending.length; i++) {
        const op = pending[i];
        const result = results?.[i];

        await syncQueue.markCompleted(op.id);

        // Replace temp IDs if it was a create
        if (op.type === "create" && op.tempId && result?.data) {
          await this.replaceTempId(op, result.data);
        } else if (result?.data) {
          const serverData = result.data;
          const id = serverData._id || serverData.id || op.itemId;
          if (id && op.storeName) {
            await offlineStorage.set(op.storeName, id, {
              ...serverData,
              _synced: true,
              _offline: false,
            });
          }
        }
      }

      // Batch fully committed — clear the in-flight marker.
      await offlineStorage.remove("metadata", IN_FLIGHT_BATCH_KEY);

      this.notifyListeners({
        type: "push:success",
        count: pending.length,
      });
    } catch (error) {
      const status = error.response?.status;

      // CONFLICT — at least one operation had a version mismatch
      if (status === 409) {
        console.warn("Batch conflict detected:", error.response?.data);
        for (const op of pending) {
          await syncQueue.markFailed(op.id, error, "conflict");
        }
        // Conflict needs manual resolution; the same key+payload would just
        // get the same 409 back, so release the in-flight slot.
        await offlineStorage.remove("metadata", IN_FLIGHT_BATCH_KEY);
        this.notifyListeners({
          type: "sync:conflict",
          error: error.response?.data?.message || "Data conflict detected",
        });
        return;
      }

      // LOGIC ERROR (4xx) — bad request, fail without retry
      if (status >= 400 && status < 500) {
        console.error("Batch logic error (no retry):", error);
        for (const op of pending) {
          await syncQueue.markFailed(op.id, error, "logic_error");
        }
        await offlineStorage.remove("metadata", IN_FLIGHT_BATCH_KEY);
        this.notifyListeners({
          type: "push:error",
          error: error.response?.data?.message || "Logic error",
        });
        return;
      }

      // NETWORK / SERVER ERROR (5xx) — increment attempts, retry later.
      // Keep the in-flight record so the next pushToServer() replays with
      // the SAME idempotency key, letting the server dedup if it already
      // committed but the response was lost.
      console.error("Batch transient error (will retry):", error);
      for (const op of pending) {
        const newAttempts = (op.attempts || 0) + 1;
        if (newAttempts >= 3) {
          await syncQueue.markFailed(op.id, error, "max_retries");
        } else {
          // Persist attempt count so it survives across sync sessions
          op.attempts = newAttempts;
          await offlineStorage.set("syncQueue", op.id, op);
        }
      }
      this.notifyListeners({
        type: "push:error",
        error: error.message,
      });
    }
  }

  /**
   * Maps a sync queue operation to the backend operation type string.
   * Falls back to null if unknown (will cause batch to reject that op).
   */
  _mapToOperationType(op) {
    const { storeName, type, method } = op;
    if (storeName === "orders") {
      if (type === "create" || method === "POST") return "order:create";
      if (type === "updateStatus") return "order:updateStatus";
      if (type === "cancel") return "order:cancel";
    }
    if (storeName === "customers") {
      if (type === "create" || method === "POST") return "customer:create";
      return "customer:update";
    }
    if (storeName === "menuItems") {
      return "menuItem:update";
    }
    // For other stores not yet in the OPERATION_MAP, fall back to null
    // The backend will reject with "Unknown operation type"
    return op.operationType || null;
  }
  // --------------------------------------------------------

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
