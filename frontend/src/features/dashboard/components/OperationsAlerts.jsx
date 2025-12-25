import React from "react";
import { AlertTriangle, Info, Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const OperationsAlerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-6 flex flex-col items-center justify-center text-center py-12">
          <div className="bg-success/10 p-4 rounded-full mb-4">
            <Bell className="w-8 h-8 text-success" />
          </div>
          <h3 className="font-bold text-lg">All Systems Normal</h3>
          <p className="text-sm opacity-60">
            No pending operational alerts for the current session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Operational Alerts
          </h3>
          <span className="badge badge-error font-bold">{alerts.length}</span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:bg-base-200 ${
                alert.type === "critical"
                  ? "bg-error/5 border-error/20"
                  : "bg-info/5 border-info/20"
              }`}
            >
              <div
                className={`mt-1 ${
                  alert.type === "critical" ? "text-error" : "text-info"
                }`}
              >
                {alert.type === "critical" ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-base-content">
                  {alert.message}
                </p>
                {alert.actionLink && (
                  <Link
                    to={alert.actionLink}
                    className="btn btn-link btn-xs p-0 h-auto min-h-0 text-primary mt-2 gap-1 no-underline hover:underline"
                  >
                    Take Action <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OperationsAlerts;
