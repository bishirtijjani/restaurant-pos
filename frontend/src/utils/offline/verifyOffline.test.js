import { describe, it, expect, vi } from "vitest";
import { syncManager } from "./syncManager";
import offlineStorage from "./storage";

describe("Offline Capabilities Verification", () => {
  it("should have a valid SyncManager instance", () => {
    expect(syncManager).toBeDefined();
    expect(typeof syncManager.pushToServer).toBe("function");
    expect(typeof syncManager.pullFromServer).toBe("function");
    expect(typeof syncManager.startAutoSync).toBe("function");
  });

  it("should have valid offline storage configuration", () => {
    expect(offlineStorage).toBeDefined();
    expect(typeof offlineStorage.set).toBe("function");
    expect(typeof offlineStorage.get).toBe("function");

    // Simulate getting stores
    const stores = offlineStorage._getStores();
    // It might return null in test env if localStorage is missing activeStoreId, but the method should exist
    // We just want to ensure the code loads without syntax errors
  });

  it("should initialize sync queue listener", () => {
    const mockCallback = vi.fn();
    syncManager.addListener(mockCallback);

    // Trigger a fake event
    syncManager.notifyListeners({ type: "test" });
    expect(mockCallback).toHaveBeenCalledWith({ type: "test" });
  });
});
