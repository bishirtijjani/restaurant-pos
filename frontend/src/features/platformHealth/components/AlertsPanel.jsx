// frontend/src/features/platformHealth/components/AlertsPanel.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import {
  acknowledgePlatformAlert,
  resolvePlatformAlert,
} from "../platformHealthSlice";
import { formatDistanceToNow } from "date-fns";

const AlertsPanel = ({ alerts }) => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all"); // all, critical, warning, info
  const [statusFilter, setStatusFilter] = useState("active"); // active, acknowledged, resolved
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-5 h-5 text-error" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "info":
        return <Info className="w-5 h-5 text-info" />;
      default:
        return <Info className="w-5 h-5 text-base-content/50" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge badge-error badge-sm">Active</span>;
      case "acknowledged":
        return <span className="badge badge-warning badge-sm">Ack</span>;
      case "resolved":
        return <span className="badge badge-success badge-sm">Resolved</span>;
      case "auto_resolved":
        return <span className="badge badge-success badge-sm">Auto</span>;
      default:
        return null;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = filter === "all" || alert.severity === filter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active"
        ? ["active", "acknowledged"].includes(alert.status)
        : alert.status === statusFilter);
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const handleAcknowledge = async (id) => {
    setProcessingId(id);
    await dispatch(acknowledgePlatformAlert({ alertId: id }));
    setProcessingId(null);
  };

  const handleResolve = async (id) => {
    setProcessingId(id);
    await dispatch(resolvePlatformAlert({ alertId: id }));
    setProcessingId(null);
  };

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200 h-full">
      <div className="card-body p-0">
        <div className="p-4 border-b border-base-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              System Alerts
              <span className="badge badge-neutral badge-sm ml-2">
                {alerts.filter((a) => a.status === "active").length} Active
              </span>
            </h3>

            <div className="flex gap-2">
              <div className="join">
                <button
                  className={`join-item btn btn-xs ${
                    statusFilter === "active" ? "btn-active" : ""
                  }`}
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </button>
                <button
                  className={`join-item btn btn-xs ${
                    statusFilter === "resolved" ? "btn-active" : ""
                  }`}
                  onClick={() => setStatusFilter("resolved")}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-base-content/40" />
              <input
                type="text"
                placeholder="Search alerts..."
                className="input input-sm input-bordered w-full pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select select-sm select-bordered"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warning Only</option>
              <option value="info">Info Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[400px]">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-base-content/50">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No alerts found matching your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 hover:bg-base-200/30 transition-colors ${
                    alert.status === "active" ? "bg-base-100" : "bg-base-200/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm">{alert.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-base-content/50 whitespace-nowrap">
                            {formatDistanceToNow(new Date(alert.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {getStatusBadge(alert.status)}
                        </div>
                      </div>
                      <p className="text-sm text-base-content/70 mb-3">
                        {alert.message}
                      </p>

                      {alert.status === "active" && (
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => handleAcknowledge(alert._id)}
                            disabled={processingId === alert._id}
                          >
                            Acknowledge
                          </button>
                          <button
                            className="btn btn-xs btn-success btn-outline"
                            onClick={() => handleResolve(alert._id)}
                            disabled={processingId === alert._id}
                          >
                            Resolve
                          </button>
                        </div>
                      )}

                      {alert.status === "acknowledged" && (
                        <div className="flex justify-between items-center mt-2 text-xs text-base-content/50 bg-base-200/50 p-2 rounded">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Ack by {alert.acknowledgedBy?.fullname || "Admin"}
                          </span>
                          <button
                            className="btn btn-xs btn-success btn-outline ml-2"
                            onClick={() => handleResolve(alert._id)}
                            disabled={processingId === alert._id}
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;
