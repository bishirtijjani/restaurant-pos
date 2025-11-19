// frontend/src/utils/offline/offlineAxios.js
import axios from "axios";
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";
import { connectionMonitor } from "./connectionMonitor";

// Generate temporary ID for offline items
const generateTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

  for (const [path, store] of Object.entries(urlMap)) {
    if (url.includes(path)) {
      return store;
    }
  }

  return null;
}

// Request interceptor - intercept and handle offline operations
axios.interceptors.request.use(
  async (config) => {
    // If online, proceed normally
    if (connectionMonitor.isOnline()) {
      return config;
    }

    console.log(
      "🔴 OFFLINE - Intercepting request:",
      config.method,
      config.url
    );

    const storeName = getStoreNameFromUrl(config.url);
    const method = config.method.toLowerCase();

    // Handle GET requests - serve from cache
    if (method === "get") {
      if (storeName) {
        try {
          // Check if it's a single item request (has ID in URL)
          const urlParts = config.url.split("/");
          const lastPart = urlParts[urlParts.length - 1];
          const isIdRequest = lastPart && lastPart.length === 24; // MongoDB ID length

          let cachedData;

          if (isIdRequest) {
            cachedData = await offlineStorage.get(storeName, lastPart);
          } else {
            cachedData = await offlineStorage.getAll(storeName);
          }

          if (cachedData) {
            console.log("✅ Serving from cache:", storeName);

            // Create a fake successful response
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

            // Return a resolved promise that axios will treat as a successful response
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

      // Queue the operation
      const operation = {
        type: "create",
        method: "POST",
        endpoint: config.url,
        data: config.data,
        storeName: storeName,
        tempId: tempId,
        headers: config.headers,
      };

      await syncQueue.enqueue(operation);

      // Cache optimistically
      await offlineStorage.set(storeName, tempId, optimisticData);

      console.log("✅ CREATE queued:", storeName, tempId);

      // Create a fake successful response
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
      const urlParts = config.url.split("/");
      const itemId = urlParts[urlParts.length - 1];

      const optimisticData = {
        ...config.data,
        _id: itemId,
        _offline: true,
        _synced: false,
        updatedAt: new Date().toISOString(),
      };

      // Queue the operation
      const operation = {
        type: "update",
        method: method.toUpperCase(),
        endpoint: config.url,
        data: config.data,
        storeName: storeName,
        itemId: itemId,
        headers: config.headers,
      };

      await syncQueue.enqueue(operation);

      // Update cache
      await offlineStorage.set(storeName, itemId, optimisticData);

      console.log("✅ UPDATE queued:", storeName, itemId);

      // Create a fake successful response
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
      const urlParts = config.url.split("/");
      const itemId = urlParts[urlParts.length - 1];

      // Queue the operation
      const operation = {
        type: "delete",
        method: "DELETE",
        endpoint: config.url,
        storeName: storeName,
        itemId: itemId,
        headers: config.headers,
      };

      await syncQueue.enqueue(operation);

      // Remove from cache
      await offlineStorage.remove(storeName, itemId);

      console.log("✅ DELETE queued:", storeName, itemId);

      // Create a fake successful response
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

    // For any other offline request, return an error
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

// Response interceptor - cache successful responses
axios.interceptors.response.use(
  async (response) => {
    // Don't cache offline/fake responses
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
    // Handle offline errors
    if (error.isOffline) {
      console.log("🔴 Request blocked - offline mode");

      // Try to serve from cache for GET requests
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
