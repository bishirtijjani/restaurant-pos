// frontend/src/features/platformHealth/components/DatabaseHealthCard.jsx
import React from "react";
import { Database, Clock, Zap } from "lucide-react";

const DatabaseHealthCard = ({ metrics }) => {
  const { connectionPool, queryLatency, slowQueries, size } = metrics;

  // Format bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getLatencyColor = (ms) => {
    if (ms >= 500) return "text-error";
    if (ms >= 100) return "text-warning";
    return "text-success";
  };

  const poolUsage =
    connectionPool.total > 0
      ? (connectionPool.active / connectionPool.total) * 100
      : 0;

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-6">
        <h3 className="card-title text-lg flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-secondary" />
          Database Health
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-base-200/50 p-3 rounded-lg">
            <div className="text-xs text-base-content/60 mb-1">
              Active Connections
            </div>
            <div className="text-xl font-bold flex items-baseline gap-1">
              {connectionPool.active}
              <span className="text-xs font-normal text-base-content/50">
                / {connectionPool.total}
              </span>
            </div>
            <progress
              className="progress progress-secondary w-full h-1 mt-2"
              value={poolUsage}
              max="100"
            ></progress>
          </div>

          <div className="bg-base-200/50 p-3 rounded-lg">
            <div className="text-xs text-base-content/60 mb-1">DB Size</div>
            <div className="text-xl font-bold">{formatBytes(size)}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-base-content/70" />
              Query Latency (ms)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-base-200 rounded p-2">
                <div className="text-xs text-base-content/50">p50</div>
                <div
                  className={`font-bold ${getLatencyColor(queryLatency.p50)}`}
                >
                  {queryLatency.p50}ms
                </div>
              </div>
              <div className="bg-base-200 rounded p-2">
                <div className="text-xs text-base-content/50">p95</div>
                <div
                  className={`font-bold ${getLatencyColor(queryLatency.p95)}`}
                >
                  {queryLatency.p95}ms
                </div>
              </div>
              <div className="bg-base-200 rounded p-2">
                <div className="text-xs text-base-content/50">p99</div>
                <div
                  className={`font-bold ${getLatencyColor(queryLatency.p99)}`}
                >
                  {queryLatency.p99}ms
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-base-200/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Zap
                className={`w-4 h-4 ${
                  slowQueries > 0 ? "text-warning" : "text-base-content/30"
                }`}
              />
              <span>Slow Queries (>100ms)</span>
            </div>
            <span
              className={`font-bold ${
                slowQueries > 0 ? "text-warning" : "text-base-content/70"
              }`}
            >
              {slowQueries}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseHealthCard;
