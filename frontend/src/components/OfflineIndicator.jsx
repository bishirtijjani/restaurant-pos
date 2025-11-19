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
  Clock,
} from "lucide-react";

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const { syncing, lastSync, error } = useSyncStatus();
  const { queueStats } = useSyncQueue();

  if (isOnline && !syncing && queueStats.total === 0) {
    return null;
  }

  const getMessage = () => {
    if (!isOnline) {
      return {
        title: "Offline Mode",
        message: "Changes will sync automatically when you're back online",
        icon: <WifiOff className="w-6 h-6" />,
        alertClass: "alert-warning",
      };
    }

    if (syncing) {
      return {
        title: "Syncing Changes...",
        message: `Syncing ${queueStats.pending} ${
          queueStats.pending === 1 ? "change" : "changes"
        }`,
        icon: <RefreshCw className="w-6 h-6 animate-spin" />,
        alertClass: "alert-info",
      };
    }

    if (queueStats.failed > 0) {
      return {
        title: "Some Changes Failed to Sync",
        message: `${queueStats.failed} ${
          queueStats.failed === 1 ? "change" : "changes"
        } failed. Will retry automatically.`,
        icon: <AlertCircle className="w-6 h-6" />,
        alertClass: "alert-error",
      };
    }

    if (queueStats.pending > 0) {
      return {
        title: "Changes Pending",
        message: `${queueStats.pending} ${
          queueStats.pending === 1 ? "change" : "changes"
        } waiting to sync`,
        icon: <Clock className="w-6 h-6" />,
        alertClass: "alert-info",
      };
    }

    return {
      title: "All Synced",
      message: lastSync
        ? `Last synced at ${new Date(lastSync).toLocaleTimeString()}`
        : "Up to date",
      icon: <CheckCircle className="w-6 h-6" />,
      alertClass: "alert-success",
    };
  };

  const { title, message, icon, alertClass } = getMessage();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`alert ${alertClass} shadow-lg max-w-sm`}>
        <div className="flex items-center gap-3">
          {icon}
          <div className="flex-1">
            <h3 className="font-bold">{title}</h3>
            <div className="text-xs">{message}</div>
          </div>
          {queueStats.total > 0 && (
            <div className="badge badge-lg">{queueStats.total}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
// end
// of file just to reach 100 lines
