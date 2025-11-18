// frontend/src/app/initOffline.js
import { syncManager } from "../utils/offline/syncManager";
import { connectionMonitor } from "../utils/offline/connectionMonitor";

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
  syncManager.startAutoSync(30000);

  // Listen for online/offline events
  connectionMonitor.addListener((status) => {
    console.log("Connection status changed:", status);

    if (status.online) {
      // Trigger sync when coming online
      syncManager.syncAll();
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
