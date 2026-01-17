// frontend/src/features/platformHealth/components/APIPerformanceCard.jsx
import React from "react";
import { Globe, Activity, AlertCircle } from "lucide-react";

const APIPerformanceCard = ({ metrics }) => {
  const {
    requestRate,
    errorRate,
    avgResponseTime,
    activeRequests,
    slowestEndpoints,
  } = metrics;

  const getErrorRateColor = (rate) => {
    if (rate >= 5) return "text-error";
    if (rate >= 2) return "text-warning";
    return "text-success";
  };

  const getResponseTimeColor = (ms) => {
    if (ms >= 500) return "text-error";
    if (ms >= 200) return "text-warning";
    return "text-success";
  };

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-6">
        <h3 className="card-title text-lg flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-accent" />
          API Performance
        </h3>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="text-center p-2 bg-base-200/50 rounded-lg">
            <div className="text-xs text-base-content/60 mb-1">Req/Sec</div>
            <div className="text-lg font-bold">{requestRate.toFixed(1)}</div>
          </div>
          <div className="text-center p-2 bg-base-200/50 rounded-lg">
            <div className="text-xs text-base-content/60 mb-1">Err Rate</div>
            <div
              className={`text-lg font-bold ${getErrorRateColor(errorRate)}`}
            >
              {errorRate.toFixed(2)}%
            </div>
          </div>
          <div className="text-center p-2 bg-base-200/50 rounded-lg">
            <div className="text-xs text-base-content/60 mb-1">Avg Time</div>
            <div
              className={`text-lg font-bold ${getResponseTimeColor(
                avgResponseTime
              )}`}
            >
              {Math.round(avgResponseTime)}ms
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Active Requests</span>
            </div>
            <span className="font-bold badge badge-ghost">
              {activeRequests}
            </span>
          </div>

          {slowestEndpoints && slowestEndpoints.length > 0 && (
            <div>
              <div className="text-xs font-bold text-base-content/50 uppercase mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Slowest Endpoints
              </div>
              <div className="space-y-2">
                {slowestEndpoints.map((endpoint, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs bg-base-200/30 p-2 rounded"
                  >
                    <div className="truncate flex-1 pr-2">
                      <span className="font-mono bg-base-300 px-1 rounded mr-1">
                        {endpoint.method}
                      </span>
                      {endpoint.path}
                    </div>
                    <span
                      className={`font-mono font-bold ${getResponseTimeColor(
                        endpoint.avgTime
                      )}`}
                    >
                      {Math.round(endpoint.avgTime)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIPerformanceCard;
