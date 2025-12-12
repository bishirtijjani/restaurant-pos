import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createReport,
  selectReportBuilder,
} from "../../../slices/customReportsSlice";
import { showNotification } from "../../../../common/headerSlice";

function ReportBuilder() {
  const dispatch = useDispatch();
  const { status } = useSelector(selectReportBuilder);
  const isLoading = status === "loading";

  const [reportName, setReportName] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  const metrics = [
    "Net Sales",
    "Total Orders",
    "Avg Order Value",
    "Labor Cost %",
    "Refund Rate",
    "Customer Retention",
    "Inventory Turnover",
  ];

  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      dispatch(
        showNotification({ message: "Please enter a report name", status: 0 })
      );
      return;
    }
    if (selectedMetrics.length === 0) {
      dispatch(
        showNotification({
          message: "Please select at least one metric",
          status: 0,
        })
      );
      return;
    }

    try {
      await dispatch(
        createReport({
          name: reportName,
          metrics: selectedMetrics,
          type: "custom",
          filters: {}, // Can be expanded later
        })
      ).unwrap();

      dispatch(
        showNotification({ message: "Report saved successfully!", status: 1 })
      );
      setReportName("");
      setSelectedMetrics([]);
    } catch (error) {
      dispatch(
        showNotification({
          message: error || "Failed to save report",
          status: 0,
        })
      );
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
            disabled={isLoading}
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
                  selectedMetrics.includes(metric)
                    ? "btn-primary"
                    : "btn-outline"
                }`}
                onClick={() => toggleMetric(metric)}
                disabled={isLoading}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        <div className="card-actions justify-end mt-auto">
          <button
            className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
            onClick={handleSaveReport}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportBuilder;
