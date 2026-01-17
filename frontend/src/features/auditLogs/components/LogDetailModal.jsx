import React from "react";

const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null;

  // Helper to format values (handle dates, nulls, objects)
  const formatValue = (val) => {
    if (val === null || val === undefined)
      return <span className="text-gray-400">null</span>;
    if (typeof val === "boolean") return val.toString();
    if (typeof val === "object") return JSON.stringify(val, null, 2);
    return val.toString();
  };

  // Only show keys that actually changed if possible, OR show side-by-side
  // For simplicity, we just dump the JSONs or do a rudimentary diff if both exist
  const hasDiff = log.oldValue && log.newValue;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl">
        <h3 className="font-bold text-lg mb-4">
          Audit Detail: {log.action.toUpperCase()} {log.entityType}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="text-sm">
            <span className="font-semibold">Actor:</span>{" "}
            {log.userId?.fullname || "Unknown System"}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Date:</span>{" "}
            {new Date(log.timestamp).toLocaleString()}
          </div>
          <div className="text-sm col-span-2">
            <span className="font-semibold">Reason:</span> {log.reason || "N/A"}
          </div>
        </div>

        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Value */}
          <div className="bg-base-200 p-4 rounded-lg overflow-auto max-h-[60vh]">
            <h4 className="font-bold text-error mb-2">Previous State</h4>
            {log.oldValue ? (
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(log.oldValue, null, 2)}
              </pre>
            ) : (
              <p className="text-sm italic opacity-50">
                No previous state (New Record)
              </p>
            )}
          </div>

          {/* New Value */}
          <div className="bg-base-200 p-4 rounded-lg overflow-auto max-h-[60vh]">
            <h4 className="font-bold text-success mb-2">New State</h4>
            {log.newValue ? (
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(log.newValue, null, 2)}
              </pre>
            ) : (
              <p className="text-sm italic opacity-50">
                No new state (Deleted)
              </p>
            )}
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;
