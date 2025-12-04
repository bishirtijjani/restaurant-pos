import React from "react";
import { Link } from "react-router-dom";

function AnalyticsHeader({ title, breadcrumbs, rightSection }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <div className="text-sm breadcrumbs text-base-content/70 mb-1">
          <ul>
            <li>
              <Link to="/app/analytics/overview">Analytics</Link>
            </li>
            {breadcrumbs &&
              breadcrumbs.map((crumb, index) => (
                <li key={index}>
                  {crumb.path ? (
                    <Link to={crumb.path}>{crumb.label}</Link>
                  ) : (
                    crumb.label
                  )}
                </li>
              ))}
          </ul>
        </div>
        <h1 className="text-2xl font-bold text-base-content">{title}</h1>
      </div>
      {rightSection && <div className="flex gap-2">{rightSection}</div>}
    </div>
  );
}

export default AnalyticsHeader;
