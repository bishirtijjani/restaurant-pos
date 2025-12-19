// frontend/src/utils/offline/storage.js
import localforage from "localforage";

/**
 * Create store-scoped offline storage instances
 * Each store gets its own isolated IndexedDB databases
 * @param {string} storeId - The active store ID
 * @returns {object} Store instances scoped to the storeId
 */
export const createOfflineStorage = (storeId) => {
  if (!storeId) {
    console.warn("createOfflineStorage called without storeId");
    return null;
  }

  return {
    // Main data stores
    menuItems: localforage.createInstance({
      name: "restaurant-app",
      storeName: `menuItems_${storeId}`,
    }),

    categories: localforage.createInstance({
      name: "restaurant-app",
      storeName: `categories_${storeId}`,
    }),

    orders: localforage.createInstance({
      name: "restaurant-app",
      storeName: `orders_${storeId}`,
    }),

    customers: localforage.createInstance({
      name: "restaurant-app",
      storeName: `customers_${storeId}`,
    }),

    suppliers: localforage.createInstance({
      name: "restaurant-app",
      storeName: `suppliers_${storeId}`,
    }),

    expenses: localforage.createInstance({
      name: "restaurant-app",
      storeName: `expenses_${storeId}`,
    }),

    inventory: localforage.createInstance({
      name: "restaurant-app",
      storeName: `inventory_${storeId}`,
    }),

    purchaseOrders: localforage.createInstance({
      name: "restaurant-app",
      storeName: `purchaseOrders_${storeId}`,
    }),

    users: localforage.createInstance({
      name: "restaurant-app",
      storeName: `users_${storeId}`,
    }),

    // Queue stores (also scoped per store)
    syncQueue: localforage.createInstance({
      name: "restaurant-app",
      storeName: `syncQueue_${storeId}`,
    }),

    failedQueue: localforage.createInstance({
      name: "restaurant-app",
      storeName: `failedQueue_${storeId}`,
    }),

    // Metadata store (scoped per store)
    metadata: localforage.createInstance({
      name: "restaurant-app",
      storeName: `metadata_${storeId}`,
    }),

    // Settings cache (scoped per store)
    settings: localforage.createInstance({
      name: "restaurant-app",
      storeName: `settings_${storeId}`,
    }),
  };
};

// Helper to get current storeId from localStorage
const getActiveStoreId = () => {
  try {
    return localStorage.getItem("activeStoreId");
  } catch (e) {
    console.error("Failed to get activeStoreId:", e);
    return null;
  }
};

// Storage helper functions
export const offlineStorage = {
  // Get store-scoped storage instance
  _getStores() {
    const storeId = getActiveStoreId();
    if (!storeId) {
      console.warn("No active storeId - offline operations skipped");
      return null;
    }
    return createOfflineStorage(storeId);
  },

  // Generic CRUD operations
  async set(storeName, key, value) {
    const stores = this._getStores();
    if (!stores) return null;

    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    return await store.setItem(key, {
      data: value,
      timestamp: Date.now(),
      synced: false,
    });
  },

  async get(storeName, key) {
    const stores = this._getStores();
    if (!stores) return null;

    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    const item = await store.getItem(key);
    return item ? item.data : null;
  },

  async getAll(storeName) {
    const stores = this._getStores();
    if (!stores) return [];

    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    const items = [];
    await store.iterate((value) => {
      items.push(value.data);
    });
    return items;
  },

  async remove(storeName, key) {
    const stores = this._getStores();
    if (!stores) return null;

    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    return await store.removeItem(key);
  },

  async clear(storeName) {
    const stores = this._getStores();
    if (!stores) return null;

    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    return await store.clear();
  },

  async keys(storeName) {
    const stores = this._getStores();
    if (!stores) return [];

    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    return await store.keys();
  },

  // Bulk operations
  async bulkSet(storeName, items) {
    const stores = this._getStores();
    if (!stores) return [];

    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    const promises = items.map((item) =>
      this.set(storeName, item._id || item.id, item)
    );
    return await Promise.all(promises);
  },

  async bulkRemove(storeName, keys) {
    const stores = this._getStores();
    if (!stores) return [];

    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    const promises = keys.map((key) => this.remove(storeName, key));
    return await Promise.all(promises);
  },

  // Metadata operations
  async setLastSync(storeName, timestamp = Date.now()) {
    const stores = this._getStores();
    if (!stores) return null;

    return await stores.metadata.setItem(`${storeName}_lastSync`, timestamp);
  },

  async getLastSync(storeName) {
    const stores = this._getStores();
    if (!stores) return null;

    return await stores.metadata.getItem(`${storeName}_lastSync`);
  },

  // Mark item as synced
  async markSynced(storeName, key) {
    const stores = this._getStores();
    if (!stores) return;

    const store = stores[storeName];
    const item = await store.getItem(key);
    if (item) {
      item.synced = true;
      item.syncedAt = Date.now();
      await store.setItem(key, item);
    }
  },

  // Get unsynced items
  async getUnsynced(storeName) {
    const stores = this._getStores();
    if (!stores) return [];

    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    const unsynced = [];
    await store.iterate((value) => {
      if (!value.synced) {
        unsynced.push(value.data);
      }
    });
    return unsynced;
  },

  // Clear all data for a specific store
  async clearStoreData(storeId) {
    const stores = createOfflineStorage(storeId);
    if (!stores) return;

    const storeNames = Object.keys(stores);
    const clearPromises = storeNames.map((name) => stores[name].clear());
    await Promise.all(clearPromises);
    console.log(`Cleared all offline data for store: ${storeId}`);
  },
};

export default offlineStorage;
