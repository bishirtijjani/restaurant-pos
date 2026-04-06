import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import {
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { syncManager } from "../../../utils/offline/syncManager";
import { syncQueue } from "../../../utils/offline/syncQueue";

const SyncStatusModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState("idle"); // idle, syncing, complete, error
  const [queue, setQueue] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadQueue();
    }

    // Subscribe to sync manager events
    const unsubscribe = syncManager.addListener((event) => {
      if (event.type === "sync:start") setStatus("syncing");
      if (event.type === "sync:complete") {
        setStatus(event.success ? "complete" : "error");
        loadQueue();
      }
      if (
        event.type === "push:success" ||
        event.type === "push:error" ||
        event.type === "sync:conflict"
      ) {
        loadQueue();
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  const loadQueue = async () => {
    const pending = await syncQueue.getPending();
    const failed = await syncQueue.getFailed();

    // Check which failed items are conflicts
    const conflictItems = failed.filter(
      (item) => item.failureReason === "conflict",
    );
    const normalFailed = failed.filter(
      (item) => item.failureReason !== "conflict",
    );

    setQueue([...pending, ...normalFailed]);
    setConflicts(conflictItems);
  };

  const handleForceSync = () => {
    syncManager.syncAll();
  };

  const resolveConflict = async (id, action) => {
    // action = 'server' (discard local) or 'client' (force overwrite - complex logic needed backend side or retries)
    // For now, let's implement 'Discard Local' easily.
    // 'Force Overwrite' would require stripping the ID/Version and reposting, or using a special 'force' flag.

    if (action === "discard") {
      await syncQueue.remove(id);
      loadQueue();
    } else if (action === "retry") {
      // Reset attempts and try again (maybe it wasn't a real conflict? just optimistic)
      await syncQueue.retry(id);
      loadQueue();
      syncManager.syncAll();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-xl bg-white p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold flex items-center gap-2">
              <ArrowPathIcon
                className={`h-6 w-6 ${
                  status === "syncing" ? "animate-spin" : ""
                }`}
              />
              Sync Status
            </Dialog.Title>
            <button onClick={onClose}>
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Status Indicator */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Connection Status</p>
              <p className="font-semibold text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                Online
              </p>
            </div>
            <button
              onClick={handleForceSync}
              disabled={status === "syncing"}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {status === "syncing" ? "Syncing..." : "Sync Now"}
            </button>
          </div>

          {/* Conflicts Section */}
          {conflicts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Conflicts Requiring Attention ({conflicts.length})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {conflicts.map((item) => (
                  <div
                    key={item.id}
                    className="border border-red-200 bg-red-50 p-3 rounded-lg"
                  >
                    <p className="font-medium text-sm">
                      {item.storeName} - {item.type}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      Server has a newer version of this item.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => resolveConflict(item.id, "discard")}
                        className="text-xs px-3 py-1 bg-white border border-red-300 text-red-700 rounded hover:bg-red-50"
                      >
                        Discard My Changes
                      </button>
                      {/* Future: Merge UI */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Section */}
          {queue.some(
            (i) => i.failureReason && i.failureReason !== "conflict",
          ) && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-orange-600 flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Failed Operations
                </h3>
                <button
                  onClick={() => syncManager.retryFailedOperations()}
                  className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                >
                  Retry All Failed
                </button>
              </div>
            </div>
          )}

          {/* Queue Section */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">
              Pending Changes ({queue.filter((i) => !i.failureReason).length})
            </h3>
            {queue.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <CheckCircleIcon className="h-10 w-10 mx-auto text-green-500 mb-2" />
                <p>All changes synced!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm capitalize">
                        {item.type} {item.storeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        item.attempts > 0
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.attempts > 0 ? "Retrying..." : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SyncStatusModal;
