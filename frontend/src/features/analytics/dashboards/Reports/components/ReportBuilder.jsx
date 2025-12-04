import React, { useState } from "react";

function ReportBuilder() {
  const [reportName, setReportName] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  const metrics = ["Net Sales", "Total Orders", "Avg Order Value", "Labor Cost %", "Refund Rate"];

  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Report Builder</h3>
        
        <div className="form-control w-full max-w-xs mb-4">
          <label className="label">
            <span className="label-text">Report Name</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Weekly Sales Summary"
            className="input input-bordered w-full max-w-xs"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="label">
            <span className="label-text">Select Metrics</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <button
                key={metric}
                className={`btn btn-sm ${
                  selectedMetrics.includes(metric) ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => toggleMetric(metric)}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        <div className="card-actions justify-end mt-auto">
          <button className="btn btn-primary w-full">Generate Report</button>
        </div>
      </div>
    </div>
  );
}

export default ReportBuilder;
