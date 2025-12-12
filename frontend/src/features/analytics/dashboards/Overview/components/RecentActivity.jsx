import React from "react";

function RecentActivity({ data }) {
  const activities = data || [];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Live Activity</h3>
        {activities.length > 0 ? (
          <ul className="steps steps-vertical w-full">
            {activities.map((activity) => (
              <li
                key={activity.id}
                data-content=""
                className={`step step-${activity.type} text-left`}
              >
                <div className="flex flex-col items-start ml-2">
                  <span className="text-xs text-base-content/50">
                    {activity.time}
                  </span>
                  <span className="text-sm font-medium">
                    {activity.message}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-48 text-base-content/50">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentActivity;
