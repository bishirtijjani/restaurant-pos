// frontend/src/components/SyncManager.jsx
import React, { useState, useEffect } from "react";
import { syncManager } from "../utils/offline/syncManager";
import { syncQueue } from "../utils/offline/syncQueue";
import {
  useSyncQueue,
  useOnlineStatus,
} from "../features/common/hooks/useOffline";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  RotateCcw,
} from "lucide-react";

const SyncManager = ({ onClose }) => {
  const isOnline = useOnlineStatus();
  const { queueStats, retryFailed, clearCompleted } = useSyncQueue();
  const [pendingOps, setPendingOps] = useState([]);
  const [failedOps, setFailedOps] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadOperations();
  }, [queueStats]);

  const loadOperations = async () => {
    const pending = await syncQueue.getPending();
    const failed = await syncQueue.getFailed();
    setPendingOps(pending);
    setFailedOps(failed);
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      alert("Cannot sync while offline");
      return;
    }

    setSyncing(true);
    try {
      await syncManager.syncAll();
      await loadOperations();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleRetry = async (id) => {
    await retryFailed(id);
    await loadOperations();
  };

  const handleClearCompleted = async () => {
    await clearCompleted();
    await loadOperations();
  };

  const getOperationIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-error" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return null;
    }
  };

  const formatOperation = (op) => {
    const action = op.method || op.type;
    const resource = op.endpoint?.split("/").pop() || "item";
    return `${action} ${resource}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-base-300">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Sync Manager</h2>
              <p className="text-sm text-base-content/70 mt-1">
                Manage offline operations and sync status
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          {/* Stats */}
          <div className="stats shadow mt-4 w-full">
            <div className="stat">
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">
                {queueStats.pending}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Failed</div>
              <div className="stat-value text-error">{queueStats.failed}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Status</div>
              <div
                className={`stat-value text-sm ${
                  isOnline ? "text-success" : "text-error"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-b border-base-300 flex gap-2">
          <button
            onClick={handleSyncNow}
            disabled={!isOnline || syncing || queueStats.total === 0}
            className="btn btn-primary gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </button>

          <button
            onClick={handleClearCompleted}
            className="btn btn-ghost gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Completed
          </button>
        </div>

        {/* Operations List */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Pending Operations */}
          {pendingOps.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Pending Operations ({pendingOps.length})
              </h3>
              <div className="space-y-2">
                {pendingOps.map((op) => (
                  <div key={op.id} className="card bg-base-200 shadow-sm">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          {getOperationIcon(op.status)}
                          <div>
                            <div className="font-medium">
                              {formatOperation(op)}
                            </div>
                            <div className="text-sm text-base-content/70">
                              {new Date(op.timestamp).toLocaleString()}
                            </div>
                            {op.attempts > 0 && (
                              <div className="badge badge-warning badge-sm mt-1">
                                Attempt {op.attempts}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Operations */}
          {failedOps.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-error" />
                Failed Operations ({failedOps.length})
              </h3>
              <div className="space-y-2">
                {failedOps.map((op) => (
                  <div key={op.id} className="card bg-base-200 shadow-sm">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          {getOperationIcon(op.status)}
                          <div className="flex-1">
                            <div className="font-medium">
                              {formatOperation(op)}
                            </div>
                            <div className="text-sm text-base-content/70">
                              {new Date(op.timestamp).toLocaleString()}
                            </div>
                            {op.error && (
                              <div className="text-sm text-error mt-1">
                                Error: {op.error}
                              </div>
                            )}
                            <div className="badge badge-error badge-sm mt-1">
                              Failed after {op.attempts} attempts
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRetry(op.id)}
                          disabled={!isOnline}
                          className="btn btn-sm btn-ghost gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retry
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {pendingOps.length === 0 && failedOps.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
              <h3 className="text-xl font-bold mb-2">All Synced!</h3>
              <p className="text-base-content/70">
                No pending or failed operations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncManager;
