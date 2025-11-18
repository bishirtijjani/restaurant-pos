// frontend/src/utils/offline/testHelpers.js
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";

export const offlineTestHelpers = {
  // Simulate offline mode
  async goOffline() {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });
    window.dispatchEvent(new Event("offline"));
  },

  // Simulate online mode
  async goOnline() {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
    window.dispatchEvent(new Event("online"));
  },

  // Clear all offline data
  async clearAllData() {
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
      "syncQueue",
      "failedQueue",
      "metadata",
    ];

    for (const store of stores) {
      await offlineStorage.clear(store);
    }
  },

  // Get sync queue status
  async getQueueStatus() {
    return await syncQueue.getStats();
  },

  // Add test data
  async addTestData(storeName, data) {
    await offlineStorage.bulkSet(storeName, data);
  },
};

// Expose to window for console testing
if (typeof window !== "undefined") {
  window.offlineTest = offlineTestHelpers;
}
