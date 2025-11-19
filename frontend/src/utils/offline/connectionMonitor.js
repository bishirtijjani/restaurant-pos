export class ConnectionMonitor {
  constructor() {
    this.online = navigator.onLine;
    this.listeners = new Set();
    this.checkInterval = null;
  }

  setupListeners() {
    // Listen to browser online/offline events
    window.addEventListener("online", () => {
      console.log("🟢 Browser detected: ONLINE");
      this.handleOnline();
    });

    window.addEventListener("offline", () => {
      console.log("🔴 Browser detected: OFFLINE");
      this.handleOffline();
    });

    // Periodic connectivity check (every 10 seconds)
    this.checkInterval = setInterval(() => {
      this.checkConnectivity().then((isConnected) => {
        if (isConnected && !this.online) {
          console.log("🟢 Periodic check: ONLINE");
          this.handleOnline();
        } else if (!isConnected && this.online) {
          console.log("🔴 Periodic check: OFFLINE");
          this.handleOffline();
        }
      });
    }, 10000);

    // Initial check
    this.checkConnectivity().then((isConnected) => {
      this.online = isConnected;
      console.log(
        "🔍 Initial connectivity check:",
        isConnected ? "ONLINE" : "OFFLINE"
      );
    });
  }

  handleOnline() {
    this.online = true;
    this.notifyListeners({ online: true, timestamp: Date.now() });
  }

  handleOffline() {
    this.online = false;
    this.notifyListeners({ online: false, timestamp: Date.now() });
  }

  isOnline() {
    return this.online;
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(status) {
    this.listeners.forEach((callback) => callback(status));
  }

  // Check actual connectivity with ping
  async checkConnectivity() {
    // First check browser's navigator.onLine
    if (!navigator.onLine) {
      return false;
    }

    // Then verify with actual network request
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/categories?limit=1", {
        method: "HEAD",
        cache: "no-cache",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners.clear();
  }
}

export const connectionMonitor = new ConnectionMonitor();
