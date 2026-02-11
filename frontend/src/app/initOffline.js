// frontend/src/app/initOffline.js
import { registerSW } from "virtual:pwa-register";
import { syncManager } from "../utils/offline/syncManager";
import { connectionMonitor } from "../utils/offline/connectionMonitor";
import store from "./store";
import { isTokenExpired } from "../utils/Helpers";
import { showNotification } from "../features/common/headerSlice";

export const initializeOfflineSupport = () => {
  console.log("Initializing offline support...");

  // Register service worker via vite-plugin-pwa
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log("New content available, click on reload button to update.");
      store.dispatch(
        showNotification({
          message: "New Version Available! 🚀 Refresh to update.",
          status: 1,
          action: () => updateSW(true), // Trigger update
        }),
      );
    },
    onOfflineReady() {
      console.log("App is ready to work offline.");
      store.dispatch(
        showNotification({
          message: "App is ready for offline use 📶",
          status: 1,
        }),
      );
    },
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  // Listen for service worker messages (if supported by plugin or custom logic)
  if ("serviceWorker" in navigator) {
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
  if (currentToken && !isTokenExpired(currentToken)) {
    syncManager.startAutoSync(30000);
  }

  // Subscribe to store changes
  store.subscribe(() => {
    const previousToken = currentToken;
    const state = store.getState();
    currentToken = state.auth.token;

    if (currentToken && !previousToken) {
      console.log("User logged in, starting sync...");
      // Retry any operations that failed due to auth/network issues
      syncManager.retryFailedOperations();
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
