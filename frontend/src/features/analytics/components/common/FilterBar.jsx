import React from "react";
import AnalyticsDateRangePicker from "./DateRangePicker";
import FunnelIcon from "@heroicons/react/24/outline/FunnelIcon";

function FilterBar({ children, showDateRange = true }) {
  return (
    <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-3 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
        <div className="flex items-center gap-2 text-sm text-base-content/70 mr-2">
          <FunnelIcon className="w-4 h-4" />
          <span className="font-medium">Filters:</span>
        </div>
        {children}
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {showDateRange && <AnalyticsDateRangePicker />}
      </div>
    </div>
  );
}

export default FilterBar;
