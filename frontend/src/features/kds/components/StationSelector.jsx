// frontend/src/features/kds/components/StationSelector.jsx
import React from "react";
import { Monitor, Check } from "lucide-react";

const StationSelector = ({ stations, currentStation, onStationChange }) => {
  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-sm md:btn-md gap-1 md:gap-2 px-2 md:px-4"
      >
        <Monitor size={18} className="md:w-5 md:h-5" />
        <span className="hidden sm:inline text-xs md:text-sm max-w-[80px] md:max-w-none truncate">
          {currentStation?.name || "Select"}
        </span>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-64 mt-2 max-h-96 overflow-auto"
      >
        <li className="menu-title">
          <span>Kitchen Stations</span>
        </li>
        <li>
          <button
            onClick={() => onStationChange("all")}
            className={currentStation?.type === "all" ? "active" : ""}
          >
            <div className="flex items-center justify-between w-full">
              <span>All Stations</span>
              {currentStation?.type === "all" && <Check size={16} />}
            </div>
          </button>
        </li>
        <div className="divider my-1"></div>
        {stations.map((station) => (
          <li key={station._id}>
            <button
              onClick={() => onStationChange(station._id)}
              className={currentStation?._id === station._id ? "active" : ""}
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">{station.name}</div>
                  <div className="text-xs opacity-70 capitalize">
                    {station.type}
                  </div>
                </div>
                {currentStation?._id === station._id && <Check size={16} />}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StationSelector;
