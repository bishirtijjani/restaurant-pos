// frontend/src/utils/offline/storage.js
import localforage from "localforage";

// Configure separate stores for different data types
const stores = {
  // Main data stores
  menuItems: localforage.createInstance({
    name: "restaurant-app",
    storeName: "menuItems",
  }),

  categories: localforage.createInstance({
    name: "restaurant-app",
    storeName: "categories",
  }),

  orders: localforage.createInstance({
    name: "restaurant-app",
    storeName: "orders",
  }),

  customers: localforage.createInstance({
    name: "restaurant-app",
    storeName: "customers",
  }),

  suppliers: localforage.createInstance({
    name: "restaurant-app",
    storeName: "suppliers",
  }),

  expenses: localforage.createInstance({
    name: "restaurant-app",
    storeName: "expenses",
  }),

  inventory: localforage.createInstance({
    name: "restaurant-app",
    storeName: "inventory",
  }),

  purchaseOrders: localforage.createInstance({
    name: "restaurant-app",
    storeName: "purchaseOrders",
  }),

  users: localforage.createInstance({
    name: "restaurant-app",
    storeName: "users",
  }),

  // Queue stores
  syncQueue: localforage.createInstance({
    name: "restaurant-app",
    storeName: "syncQueue",
  }),

  failedQueue: localforage.createInstance({
    name: "restaurant-app",
    storeName: "failedQueue",
  }),

  // Metadata store
  metadata: localforage.createInstance({
    name: "restaurant-app",
    storeName: "metadata",
  }),

  // Settings cache
  settings: localforage.createInstance({
    name: "restaurant-app",
    storeName: "settings",
  }),
};

// Storage helper functions
export const offlineStorage = {
  // Generic CRUD operations
  async set(storeName, key, value) {
    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    return await store.setItem(key, {
      data: value,
      timestamp: Date.now(),
      synced: false,
    });
  },

  async get(storeName, key) {
    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    const item = await store.getItem(key);
    return item ? item.data : null;
  },

  async getAll(storeName) {
    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    const items = [];
    await store.iterate((value) => {
      items.push(value.data);
    });
    return items;
  },

  async remove(storeName, key) {
    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    return await store.removeItem(key);
  },

  async clear(storeName) {
    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    return await store.clear();
  },

  async keys(storeName) {
    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    return await store.keys();
  },

  // Bulk operations
  async bulkSet(storeName, items) {
    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    const promises = items.map((item) =>
      this.set(storeName, item._id || item.id, item)
    );
    return await Promise.all(promises);
  },

  async bulkRemove(storeName, keys) {
    const store = stores[storeName];
    if (!store) throw new Error(`Store ${storeName} not found`);

    const promises = keys.map((key) => this.remove(storeName, key));
    return await Promise.all(promises);
  },

  // Metadata operations
  async setLastSync(storeName, timestamp = Date.now()) {
    return await stores.metadata.setItem(`${storeName}_lastSync`, timestamp);
  },

  async getLastSync(storeName) {
    return await stores.metadata.getItem(`${storeName}_lastSync`);
  },

  // Mark item as synced
  async markSynced(storeName, key) {
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
};

export default offlineStorage;
