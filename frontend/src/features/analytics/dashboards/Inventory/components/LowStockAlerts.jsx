import React from "react";
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon";

function LowStockAlerts({ data }) {
  const items = data || [];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
          Low Stock Alerts
        </h3>
        <div className="overflow-x-auto">
          <table className="table w-full table-sm">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Current</th>
                <th className="text-right">Par Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover">
                  <td className="font-medium">{item.name}</td>
                  <td className="text-right text-error font-bold">
                    {item.current} {item.unit}
                  </td>
                  <td className="text-right text-base-content/70">
                    {item.par} {item.unit}
                  </td>
                  <td>
                    <button className="btn btn-xs btn-outline btn-primary">
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LowStockAlerts;
