// frontend/src/utils/offline/backgroundSync.js
//
// Wrapper around the Background Sync API. Call requestBackgroundSync()
// after enqueuing an offline operation; the browser will fire the 'sync'
// event in our service worker the next time connectivity is available
// (even if the tab is closed). Our SW posts a BACKGROUND_SYNC message
// back to clients, which initOffline.js routes to syncManager.syncAll().
//
// Falls back silently if the API isn't supported (Safari, some browsers
// behind privacy modes). Polling-based sync continues to work as before
// in those environments.

const SYNC_TAG = "offline-sync";

let warnedUnsupported = false;

export const requestBackgroundSync = async () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (!("sync" in registration)) {
      if (!warnedUnsupported) {
        console.info(
          "Background Sync API unavailable; falling back to polling.",
        );
        warnedUnsupported = true;
      }
      return false;
    }
    await registration.sync.register(SYNC_TAG);
    return true;
  } catch (err) {
    // Permission denied, browser unsupported, etc. — non-fatal.
    console.warn("Background Sync registration failed:", err.message);
    return false;
  }
};

// Periodic Sync — proactive freshness check (Chrome PWA installed only).
// Best-effort; harmless no-op everywhere else.
export const requestPeriodicSync = async (
  minIntervalMs = 12 * 60 * 60 * 1000,
) => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    if (!("periodicSync" in registration)) return false;
    const status = await navigator.permissions.query({
      name: "periodic-background-sync",
    });
    if (status.state !== "granted") return false;
    await registration.periodicSync.register("periodic-refresh", {
      minInterval: minIntervalMs,
    });
    return true;
  } catch {
    return false;
  }
};
