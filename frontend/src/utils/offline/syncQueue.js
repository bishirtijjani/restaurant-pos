// frontend/src/utils/offline/syncQueue.js
import offlineStorage from "./storage";
import { v4 as uuidv4 } from "uuid";

export class SyncQueue {
  constructor() {
    this.processing = false;
    this.listeners = new Set();
  }

  // Add operation to queue
  async enqueue(operation) {
    const queueItem = {
      id: uuidv4(),
      ...operation,
      timestamp: Date.now(),
      attempts: 0,
      status: "pending",
    };

    await offlineStorage.set("syncQueue", queueItem.id, queueItem);
    this.notifyListeners();

    return queueItem.id;
  }

  // Get all pending operations
  async getPending() {
    const items = await offlineStorage.getAll("syncQueue");
    return items
      .filter((item) => item.status === "pending")
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  // Get failed operations
  async getFailed() {
    return await offlineStorage.getAll("failedQueue");
  }

  // Mark operation as completed
  async markCompleted(id) {
    await offlineStorage.remove("syncQueue", id);
    this.notifyListeners();
  }

  // Move operation to failed queue
  async markFailed(id, error) {
    const item = await offlineStorage.get("syncQueue", id);
    if (item) {
      item.status = "failed";
      item.error = error.message;
      item.failedAt = Date.now();

      await offlineStorage.set("failedQueue", id, item);
      await offlineStorage.remove("syncQueue", id);
      this.notifyListeners();
    }
  }

  // Retry failed operation
  async retry(id) {
    const item = await offlineStorage.get("failedQueue", id);
    if (item) {
      item.status = "pending";
      item.attempts += 1;
      delete item.error;
      delete item.failedAt;

      await offlineStorage.set("syncQueue", id, item);
      await offlineStorage.remove("failedQueue", id);
      this.notifyListeners();
    }
  }

  // Clear all completed operations
  async clearCompleted() {
    const items = await offlineStorage.getAll("syncQueue");
    const completedIds = items
      .filter((item) => item.status === "completed")
      .map((item) => item.id);

    await offlineStorage.bulkRemove("syncQueue", completedIds);
    this.notifyListeners();
  }

  // Get queue statistics
  async getStats() {
    const pending = await this.getPending();
    const failed = await this.getFailed();

    return {
      pending: pending.length,
      failed: failed.length,
      total: pending.length + failed.length,
    };
  }

  // Add listener for queue changes
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach((callback) => callback());
  }
}

export const syncQueue = new SyncQueue();
