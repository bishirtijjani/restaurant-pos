// frontend/src/components/OfflineIndicator.jsx
import React from "react";
import {
  useOnlineStatus,
  useSyncStatus,
  useSyncQueue,
} from "../features/common/hooks/useOffline";
import {
  WifiOff,
  Wifi,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const { syncing, lastSync, error } = useSyncStatus();
  const { queueStats } = useSyncQueue();

  if (isOnline && !syncing && queueStats.total === 0) {
    return null; // Don't show anything when everything is fine
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`alert shadow-lg ${
          !isOnline
            ? "alert-error"
            : syncing
            ? "alert-info"
            : queueStats.failed > 0
            ? "alert-warning"
            : "alert-success"
        } max-w-sm`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          {!isOnline ? (
            <WifiOff className="w-6 h-6" />
          ) : syncing ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : queueStats.failed > 0 ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <CheckCircle className="w-6 h-6" />
          )}

          {/* Message */}
          <div className="flex-1">
            <h3 className="font-bold">
              {!isOnline
                ? "Offline Mode"
                : syncing
                ? "Syncing..."
                : queueStats.failed > 0
                ? "Sync Issues"
                : "Synced"}
            </h3>
            <div className="text-xs">
              {!isOnline && "Changes will sync when connection is restored"}
              {syncing && "Syncing your changes"}
              {queueStats.pending > 0 &&
                `${queueStats.pending} operations pending`}
              {queueStats.failed > 0 &&
                `${queueStats.failed} operations failed`}
              {lastSync &&
                isOnline &&
                !syncing &&
                queueStats.total === 0 &&
                `Last synced ${new Date(lastSync).toLocaleTimeString()}`}
            </div>
          </div>

          {/* Queue info badge */}
          {queueStats.total > 0 && (
            <div className="badge badge-lg">{queueStats.total}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
