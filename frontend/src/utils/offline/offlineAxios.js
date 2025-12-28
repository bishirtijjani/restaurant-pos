// frontend/src/utils/offline/offlineAxios.js
import axios from "axios";
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";
import { connectionMonitor } from "./connectionMonitor";
import store from "../../app/store"; // Import store to access state

// Generate temporary ID for offline items
const generateTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Track processed requests to prevent duplicates
const processedRequests = new Set();

// Helper to create request signature
function getRequestSignature(config) {
  return `${config.method}-${config.url}-${JSON.stringify(config.data)}`;
}

// Helper function to extract store name from URL
function getStoreNameFromUrl(url) {
  if (!url) return null;

  const urlMap = {
    "/api/menu-items": "menuItems",
    "/api/categories": "categories",
    "/api/orders": "orders",
    "/api/customers": "customers",
    "/api/suppliers": "suppliers",
    "/api/expenses": "expenses",
    "/api/inventory": "inventory",
    "/api/purchase-orders": "purchaseOrders",
    "/api/users": "users",
    "/api/general-settings": "settings",
  };

  for (const [path, storeName] of Object.entries(urlMap)) {
    if (url.includes(path)) {
      return storeName;
    }
  }

  return null;
}

// Request interceptor
axios.interceptors.request.use(
  async (config) => {
    // 1. Inject Authorization Token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }

    // 2. Inject Store ID (Context)
    // Try to get from Redux first, then localStorage
    const state = store.getState();
    const activeStoreId =
      state.commonStore?.activeStoreId || localStorage.getItem("activeStoreId");

    if (activeStoreId) {
      config.headers["x-store-id"] = activeStoreId;
    }

    // If online, proceed normally
    if (connectionMonitor.isOnline()) {
      return config;
    }

    console.log(
      "🔴 OFFLINE - Intercepting request:",
      config.method,
      config.url
    );

    const signature = getRequestSignature(config);

    // SKIP offline queue for sync manager requests
    if (config.headers["x-sync-request"]) {
      console.log(
        "⚠️ Sync request failed (offline) - rejecting without queueing"
      );
      return Promise.reject(new Error("Sync blocked - offline"));
    }

    const storeName = getStoreNameFromUrl(config.url);
    const method = config.method.toLowerCase();

    // Handle GET requests - serve from cache
    if (method === "get") {
      if (storeName) {
        try {
          const urlParts = config.url.split("/");
          const lastPart = urlParts[urlParts.length - 1];
          const isIdRequest = lastPart && lastPart.length === 24;

          let cachedData;
          if (isIdRequest) {
            cachedData = await offlineStorage.get(storeName, lastPart);
          } else {
            cachedData = await offlineStorage.getAll(storeName);
          }

          if (cachedData) {
            console.log("✅ Serving from cache:", storeName);
            const fakeResponse = {
              data: cachedData,
              status: 200,
              statusText: "OK (Cached)",
              headers: {},
              config: config,
              request: {},
              cached: true,
              offline: true,
            };
            config.adapter = () => Promise.resolve(fakeResponse);
            return config;
          }
        } catch (error) {
          console.error("Failed to load from cache:", error);
        }
      }
    }

    // Handle POST requests (CREATE)
    if (method === "post" && storeName) {
      // Mark as processed
      processedRequests.add(signature);
      setTimeout(() => processedRequests.delete(signature), 5000); // Clear after 5s

      const tempId = generateTempId();
      const optimisticData = {
        ...config.data,
        _id: tempId,
        _tempId: tempId,
        _offline: true,
        _synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Queue the operation - ONLY ONCE
      const operation = {
        type: "create",
        method: "POST",
        endpoint: config.url,
        data: config.data,
        storeName: storeName,
        tempId: tempId,
        headers: config.headers,
        signature: signature, // Add signature for tracking
      };

      await syncQueue.enqueue(operation);
      await offlineStorage.set(storeName, tempId, optimisticData);

      console.log("✅ CREATE queued ONCE:", storeName, tempId);

      const fakeResponse = {
        data: optimisticData,
        status: 201,
        statusText: "Created (Offline)",
        headers: {},
        config: config,
        request: {},
        offline: true,
        queued: true,
        tempId: tempId,
      };

      config.adapter = () => Promise.resolve(fakeResponse);
      return config;
    }

    // Handle PUT/PATCH requests (UPDATE)
    if ((method === "put" || method === "patch") && storeName) {
      // Mark as processed
      processedRequests.add(signature);
      setTimeout(() => processedRequests.delete(signature), 5000);

      const urlParts = config.url.split("/");
      const itemId = urlParts[urlParts.length - 1];

      const optimisticData = {
        ...config.data,
        _id: itemId,
        _offline: true,
        _synced: false,
        updatedAt: new Date().toISOString(),
      };

      const operation = {
        type: "update",
        method: method.toUpperCase(),
        endpoint: config.url,
        data: config.data,
        storeName: storeName,
        itemId: itemId,
        headers: config.headers,
        signature: signature,
      };

      await syncQueue.enqueue(operation);
      await offlineStorage.set(storeName, itemId, optimisticData);

      console.log("✅ UPDATE queued ONCE:", storeName, itemId);

      const fakeResponse = {
        data: optimisticData,
        status: 200,
        statusText: "Updated (Offline)",
        headers: {},
        config: config,
        request: {},
        offline: true,
        queued: true,
      };

      config.adapter = () => Promise.resolve(fakeResponse);
      return config;
    }

    // Handle DELETE requests
    if (method === "delete" && storeName) {
      // Mark as processed
      processedRequests.add(signature);
      setTimeout(() => processedRequests.delete(signature), 5000);

      const urlParts = config.url.split("/");
      const itemId = urlParts[urlParts.length - 1];

      const operation = {
        type: "delete",
        method: "DELETE",
        endpoint: config.url,
        storeName: storeName,
        itemId: itemId,
        headers: config.headers,
        signature: signature,
      };

      await syncQueue.enqueue(operation);
      await offlineStorage.remove(storeName, itemId);

      console.log("✅ DELETE queued ONCE:", storeName, itemId);

      const fakeResponse = {
        data: { success: true, message: "Deleted (Offline)" },
        status: 200,
        statusText: "Deleted (Offline)",
        headers: {},
        config: config,
        request: {},
        offline: true,
        queued: true,
      };

      config.adapter = () => Promise.resolve(fakeResponse);
      return config;
    }

    const offlineError = new Error("No internet connection");
    offlineError.isOffline = true;
    offlineError.config = config;
    config.adapter = () => Promise.reject(offlineError);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  async (response) => {
    if (response.offline || response.cached) {
      return response;
    }

    // Cache successful GET responses when online
    if (response.config.method === "get" && response.status === 200) {
      const storeName = getStoreNameFromUrl(response.config.url);

      if (storeName && response.data) {
        try {
          const data = response.data.data || response.data;

          if (Array.isArray(data)) {
            await offlineStorage.bulkSet(storeName, data);
          } else if (data && typeof data === "object") {
            const id = data._id || data.id;
            if (id) {
              await offlineStorage.set(storeName, id, data);
            }
          }
        } catch (error) {
          console.error("Failed to cache response:", error);
        }
      }
    }

    return response;
  },
  async (error) => {
    // Skip duplicate request errors
    if (error.isDuplicate) {
      console.log("Skipping duplicate request error");
      return Promise.reject(error);
    }

    if (error.isOffline) {
      console.log("🔴 Request blocked - offline mode");

      if (error.config?.method === "get") {
        const storeName = getStoreNameFromUrl(error.config.url);
        if (storeName) {
          try {
            const cachedData = await offlineStorage.getAll(storeName);
            return Promise.resolve({
              data: cachedData,
              status: 200,
              statusText: "OK (Cached)",
              headers: {},
              config: error.config,
              cached: true,
              offline: true,
            });
          } catch (cacheError) {
            console.error("Failed to load from cache:", cacheError);
          }
        }
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axios;
