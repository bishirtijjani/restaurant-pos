import React from "react";
import { connectionMonitor } from "../../../utils/offline/connectionMonitor";
import { syncManager } from "../../../utils/offline/syncManager";
import { syncQueue } from "../../../utils/offline/syncQueue";
import { offlineStorage } from "../../../utils/offline/storage";

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  React.useEffect(() => {
    const unsubscribe = connectionMonitor.addListener((status) => {
      setIsOnline(status.online);
    });

    return unsubscribe;
  }, []);

  return isOnline;
};

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = React.useState({
    syncing: false,
    lastSync: null,
    error: null,
  });

  React.useEffect(() => {
    const unsubscribe = syncManager.addListener((event) => {
      switch (event.type) {
        case "sync:start":
          setSyncStatus((prev) => ({ ...prev, syncing: true, error: null }));
          break;
        case "sync:complete":
          setSyncStatus({
            syncing: false,
            lastSync: Date.now(),
            error: event.success ? null : event.error,
          });
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, []);

  return syncStatus;
};

export const useSyncQueue = () => {
  const [queueStats, setQueueStats] = React.useState({
    pending: 0,
    failed: 0,
    total: 0,
  });

  React.useEffect(() => {
    const updateStats = async () => {
      const stats = await syncQueue.getStats();
      setQueueStats(stats);
    };

    updateStats();

    const unsubscribe = syncQueue.addListener(updateStats);

    return unsubscribe;
  }, []);

  const retryFailed = async (id) => {
    await syncQueue.retry(id);
  };

  const clearCompleted = async () => {
    await syncQueue.clearCompleted();
  };

  return { queueStats, retryFailed, clearCompleted };
};

export const useOfflineStorage = (storeName) => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, [storeName]);

  const loadData = async () => {
    try {
      const items = await offlineStorage.getAll(storeName);
      setData(items);
    } catch (error) {
      console.error("Failed to load offline data:", error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, reload: loadData };
};
