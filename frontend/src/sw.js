/// <reference lib="webworker" />
/* eslint-env serviceworker */

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { createHandlerBoundToURL } from "workbox-precaching";

// Workbox injects the precache manifest here at build time.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// SPA navigation fallback so the app shell loads offline.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html")),
);

// Background Sync.
// When the browser detects connectivity (even with the tab closed), it fires
// the 'sync' event for tags registered while offline. We message any open
// client so syncManager can flush the queue. If no client is open, the
// queue stays in IndexedDB and flushes the next time the app opens.
self.addEventListener("sync", (event) => {
  if (event.tag === "offline-sync") {
    event.waitUntil(notifyClientsToSync("offline-sync"));
  }
});

// Periodic Sync (where supported) — proactive freshness check.
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "periodic-refresh") {
    event.waitUntil(notifyClientsToSync("periodic-refresh"));
  }
});

async function notifyClientsToSync(tag) {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  for (const client of clients) {
    client.postMessage({ type: "BACKGROUND_SYNC", tag });
  }
}

// Activate new SW versions immediately so users don't run on stale code
// after a deploy. Combined with registerType: 'autoUpdate' in vite config.
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
