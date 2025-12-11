// frontend/src/app/initOffline.js
import { syncManager } from "../utils/offline/syncManager";
import { connectionMonitor } from "../utils/offline/connectionMonitor";
import store from "./store";

export const initializeOfflineSupport = () => {
  console.log("Initializing offline support...");

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              console.log("New service worker available. Please refresh.");
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data.type === "BACKGROUND_SYNC") {
        console.log("Background sync triggered");
        syncManager.syncAll();
      }
    });
  }

  // Start automatic sync (every 30 seconds)
  // Handle sync based on auth state
  let currentToken = store.getState().auth.token;

  // Initial check
  if (currentToken) {
    syncManager.startAutoSync(30000);
  }

  // Subscribe to store changes
  store.subscribe(() => {
    const previousToken = currentToken;
    const state = store.getState();
    currentToken = state.auth.token;

    if (currentToken && !previousToken) {
      console.log("User logged in, starting sync...");
      syncManager.startAutoSync(30000);
    } else if (!currentToken && previousToken) {
      console.log("User logged out, stopping sync...");
      syncManager.stopAutoSync();
    }
  });

  // Listen for online/offline events
  connectionMonitor.addListener((status) => {
    console.log("Connection status changed:", status);

    if (status.online) {
      // Trigger sync when coming online only if logged in
      const state = store.getState();
      if (state.auth?.token) {
        syncManager.syncAll();
      }
    }
  });

  // Request persistent storage
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then((persistent) => {
      console.log("Persistent storage:", persistent);
    });
  }

  console.log("Offline support initialized");
};
