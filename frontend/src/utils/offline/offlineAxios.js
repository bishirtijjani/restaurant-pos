// frontend/src/utils/offline/offlineAxios.js
import axios from "axios";
import offlineStorage from "./storage";
import { syncQueue } from "./syncQueue";
import { connectionMonitor } from "./connectionMonitor";

// Create axios instance with offline support
const offlineAxios = axios.create();

// Request interceptor - queue operations when offline
offlineAxios.interceptors.request.use(
  async (config) => {
    // If online, proceed normally
    if (connectionMonitor.isOnline()) {
      return config;
    }

    // If offline and it's a read operation (GET), try to serve from cache
    if (config.method === "get") {
      const storeName = getStoreNameFromUrl(config.url);

      if (storeName) {
        try {
          const cachedData = await offlineStorage.getAll(storeName);

          // Cancel the request and return cached data
          const cancelToken = axios.CancelToken.source();
          cancelToken.cancel(
            JSON.stringify({
              offline: true,
              data: cachedData,
              cached: true,
            })
          );

          config.cancelToken = cancelToken.token;
        } catch (error) {
          console.error("Failed to load from cache:", error);
        }
      }
    }

    // If offline and it's a write operation, queue it
    if (["post", "put", "patch", "delete"].includes(config.method)) {
      const operation = {
        method: config.method.toUpperCase(),
        endpoint: config.url,
        data: config.data,
        storeName: getStoreNameFromUrl(config.url),
        headers: config.headers,
      };

      await syncQueue.enqueue(operation);

      // Cancel the request
      const cancelToken = axios.CancelToken.source();
      cancelToken.cancel(
        JSON.stringify({
          offline: true,
          queued: true,
          message: "Operation queued for sync when online",
        })
      );

      config.cancelToken = cancelToken.token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - cache successful responses
offlineAxios.interceptors.response.use(
  async (response) => {
    // Cache successful GET responses
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
    // Handle canceled requests (offline mode)
    if (axios.isCancel(error)) {
      try {
        const cancelData = JSON.parse(error.message);

        if (cancelData.offline && cancelData.data) {
          // Return cached data as if it was a successful response
          return Promise.resolve({
            data: cancelData.data,
            status: 200,
            statusText: "OK",
            headers: {},
            config: error.config,
            cached: true,
            offline: true,
          });
        }

        if (cancelData.queued) {
          // Return a success response for queued operations
          return Promise.resolve({
            data: {
              success: true,
              queued: true,
              message: cancelData.message,
            },
            status: 202,
            statusText: "Accepted",
            headers: {},
            config: error.config,
            offline: true,
          });
        }
      } catch (parseError) {
        // If parsing fails, treat as normal cancel
      }
    }

    return Promise.reject(error);
  }
);

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

export default offlineAxios;
