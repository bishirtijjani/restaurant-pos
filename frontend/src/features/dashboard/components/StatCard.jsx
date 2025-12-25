import React from "react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  color = "primary",
}) => (
  <div className={`card bg-base-100 shadow-xl border-l-4 border-${color}`}>
    <div className="card-body p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="card-title text-[10px] md:text-sm opacity-70 uppercase tracking-wider font-semibold">
            {title}
          </h2>
          <div className="flex items-baseline gap-2 mt-1 md:mt-2">
            <span className="text-xl md:text-3xl font-extrabold">{value}</span>
            {trend && (
              <span
                className={`badge ${
                  trendValue >= 0 ? "badge-success" : "badge-error"
                } gap-1 font-bold`}
              >
                {trendValue >= 0 ? "↑" : "↓"} {Math.abs(trendValue)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs opacity-60 mt-2 font-medium">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-2xl bg-${color}/10`}>
          <Icon className={`w-8 h-8 text-${color}`} />
        </div>
      </div>
    </div>
  </div>
);

export default StatCard;
