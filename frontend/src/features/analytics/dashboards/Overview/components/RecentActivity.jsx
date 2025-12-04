import React from "react";

function RecentActivity() {
  const activities = [
    {
      id: 1,
      time: "10:45 AM",
      message: "Order #1024 completed",
      type: "success",
    },
    {
      id: 2,
      time: "10:42 AM",
      message: "Table 5 requested bill",
      type: "info",
    },
    {
      id: 3,
      time: "10:30 AM",
      message: "New reservation for 4 (Smith)",
      type: "primary",
    },
    {
      id: 4,
      time: "10:15 AM",
      message: "Item 'Burger' out of stock",
      type: "error",
    },
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Live Activity</h3>
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
                <span className="text-sm font-medium">{activity.message}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RecentActivity;
