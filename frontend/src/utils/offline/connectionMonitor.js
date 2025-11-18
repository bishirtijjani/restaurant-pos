// frontend/src/utils/offline/connectionMonitor.js
export class ConnectionMonitor {
  constructor() {
    this.online = navigator.onLine;
    this.listeners = new Set();
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener("online", () => {
      this.online = true;
      this.notifyListeners({ online: true, timestamp: Date.now() });
    });

    window.addEventListener("offline", () => {
      this.online = false;
      this.notifyListeners({ online: false, timestamp: Date.now() });
    });
  }

  isOnline() {
    return this.online;
  }

  addListener(callback) {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  notifyListeners(status) {
    this.listeners.forEach((callback) => callback(status));
  }

  // Check actual connectivity with ping
  async checkConnectivity(url = "/api/health") {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        cache: "no-cache",
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const connectionMonitor = new ConnectionMonitor();
