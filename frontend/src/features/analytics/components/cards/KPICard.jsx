import React from "react";
import ArrowUpIcon from "@heroicons/react/24/solid/ArrowUpIcon";
import ArrowDownIcon from "@heroicons/react/24/solid/ArrowDownIcon";

function KPICard({ title, value, icon: Icon, trend, trendValue, color = "primary" }) {
  const isPositive = trendValue >= 0;
  const trendColor = isPositive ? "text-success" : "text-error";
  const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all duration-200">
      <div className="card-body p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-base-content/70 mb-1">
              {title}
            </h3>
            <div className="text-2xl font-bold text-base-content">{value}</div>
          </div>
          <div className={`p-3 rounded-lg bg-${color}/10 text-${color}`}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-1 mt-3 text-xs font-medium">
            <span className={`flex items-center ${trendColor}`}>
              <TrendIcon className="w-3 h-3 mr-1" />
              {Math.abs(trendValue)}%
            </span>
            <span className="text-base-content/50">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default KPICard;
