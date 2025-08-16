import React from "react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
}) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="card-title text-sm opacity-70">{title}</h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">{value}</span>
            {trend && (
              <span
                className={`badge ${
                  trendValue >= 0 ? "badge-success" : "badge-error"
                } gap-1`}
              >
                {trendValue >= 0 ? "↑" : "↓"} {Math.abs(trendValue)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm opacity-70 mt-2">{description}</p>
          )}
        </div>
        <Icon className="w-8 h-8 opacity-70" />
      </div>
    </div>
  </div>
);

export default StatCard;
