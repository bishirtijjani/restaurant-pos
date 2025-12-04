import React from "react";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";

function SavedReportsList({ data }) {
  const reports = data || [
    { id: 1, name: "Monthly Sales Report", date: "2023-10-01" },
    { id: 2, name: "Staff Performance Q3", date: "2023-09-30" },
    { id: 3, name: "Inventory Audit", date: "2023-10-15" },
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Saved Reports</h3>
        <ul className="menu bg-base-100 w-full p-0">
          {reports.map((report) => (
            <li key={report.id}>
              <a className="flex justify-between">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-primary" />
                  <span>{report.name}</span>
                </div>
                <span className="text-xs text-base-content/50">{report.date}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SavedReportsList;
