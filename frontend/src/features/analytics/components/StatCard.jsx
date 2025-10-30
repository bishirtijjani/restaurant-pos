import React from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/solid";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  color = "primary",
}) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm opacity-70">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend === "up" ? "text-success" : "text-error"
              }`}
            >
              {trend === "up" ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="stat-desc">{description}</div>
        <div className={`p-3 rounded-lg bg-${color}/10`}>
          <Icon className={`w-8 h-8 text-${color}`} />
        </div>
      </div>
    </div>
  </div>
);
export default StatCard;
