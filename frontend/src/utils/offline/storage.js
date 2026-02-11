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

    // Restaurant Operations
    dashboard: localforage.createInstance({
      name: "restaurant-app",
      storeName: `dashboard_${storeId}`,
    }),

    tables: localforage.createInstance({
      name: "restaurant-app",
      storeName: `tables_${storeId}`,
    }),

    floors: localforage.createInstance({
      name: "restaurant-app",
      storeName: `floors_${storeId}`,
    }),

    reservations: localforage.createInstance({
      name: "restaurant-app",
      storeName: `reservations_${storeId}`,
    }),

    promoCodes: localforage.createInstance({
      name: "restaurant-app",
      storeName: `promoCodes_${storeId}`,
    }),

    discounts: localforage.createInstance({
      name: "restaurant-app",
      storeName: `discounts_${storeId}`,
    }),

    addOnGroups: localforage.createInstance({
      name: "restaurant-app",
      storeName: `addOnGroups_${storeId}`,
    }),

    stockAdjustments: localforage.createInstance({
      name: "restaurant-app",
      storeName: `stockAdjustments_${storeId}`,
    }),

    kds: localforage.createInstance({
      name: "restaurant-app",
      storeName: `kds_${storeId}`,
    }),

    kdsStations: localforage.createInstance({
      name: "restaurant-app",
      storeName: `kdsStations_${storeId}`,
    }),

    storeIdentity: localforage.createInstance({
      name: "restaurant-app",
      storeName: `storeIdentity_${storeId}`,
    }),

    stores: localforage.createInstance({
      name: "restaurant-app",
      storeName: `stores_${storeId}`,
    }),

    organization: localforage.createInstance({
      name: "restaurant-app",
      storeName: `organization_${storeId}`,
    }),

    brandMenu: localforage.createInstance({
      name: "restaurant-app",
      storeName: `brandMenu_${storeId}`,
    }),

    onboarding: localforage.createInstance({
      name: "restaurant-app",
      storeName: `onboarding_${storeId}`,
    }),

    ultraFastPOS: localforage.createInstance({
      name: "restaurant-app",
      storeName: `ultraFastPOS_${storeId}`,
    }),

    // Analytics (read-only cached reports)
    analyticsMultiStore: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsMultiStore_${storeId}`,
    }),

    analyticsOverview: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsOverview_${storeId}`,
    }),

    analyticsSales: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsSales_${storeId}`,
    }),

    analyticsCustomers: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsCustomers_${storeId}`,
    }),

    analyticsMenu: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsMenu_${storeId}`,
    }),

    analyticsStaff: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsStaff_${storeId}`,
    }),

    analyticsInventory: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsInventory_${storeId}`,
    }),

    analyticsPayments: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsPayments_${storeId}`,
    }),

    analyticsTax: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsTax_${storeId}`,
    }),

    analyticsVariance: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsVariance_${storeId}`,
    }),

    analyticsAdvanced: localforage.createInstance({
      name: "restaurant-app",
      storeName: `analyticsAdvanced_${storeId}`,
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
    const limit = 5000; // Safeguard against memory explosion
    let count = 0;

    await store.iterate((value) => {
      if (count < limit) {
        items.push(value.data);
        count++;
      } else {
        // Stop iteration - localforage iterate supports early exit by returning non-undefined
        return "LIMIT_REACHED";
      }
    });

    if (count >= limit) {
      console.warn(
        `Storage limit reached for ${storeName}. Only returning first ${limit} items.`,
      );
    }

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
      this.set(storeName, item._id || item.id, item),
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
