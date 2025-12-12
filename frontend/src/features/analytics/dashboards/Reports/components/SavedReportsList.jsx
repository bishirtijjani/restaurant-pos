import React from "react";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import { useSelector } from "react-redux";
import { selectSavedReports } from "../../../slices/customReportsSlice";

function SavedReportsList() {
  const savedReports = useSelector(selectSavedReports);
  const reports = savedReports.data || [];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Saved Reports</h3>
        {reports.length > 0 ? (
          <ul className="menu bg-base-100 w-full p-0">
            {reports.map((report) => (
              <li key={report.id}>
                <a className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-primary" />
                    <span>{report.name}</span>
                  </div>
                  <span className="text-xs text-base-content/50">
                    {report.date}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-base-content/50 space-y-2">
            <DocumentTextIcon className="h-10 w-10 opacity-20" />
            <p className="text-sm">No saved reports</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedReportsList;
