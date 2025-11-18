// frontend/public/service-worker.js
const CACHE_NAME = "restaurant-app-v1";
const RUNTIME_CACHE = "runtime-cache-v1";

// Assets to cache on install
const PRECACHE_URLS = ["/", "/index.html", "/manifest.json", "/icon.svg"];

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, falling back to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome extensions
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(cacheFirst(request));
});

// Network first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        success: false,
        offline: true,
        message:
          "You are offline. This data will sync when connection is restored.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return a generic offline page/response
    return new Response("Offline", { status: 503 });
  }
}

// Background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-operations") {
    event.waitUntil(syncOperations());
  }
});

async function syncOperations() {
  try {
    // Notify clients to start sync
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_SYNC",
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}
