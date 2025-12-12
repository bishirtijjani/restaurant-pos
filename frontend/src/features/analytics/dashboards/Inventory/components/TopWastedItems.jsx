import React from "react";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function TopWastedItems({ data }) {
  const items = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Top Wasted Items</h3>
        <div className="overflow-x-auto">
          <table className="table w-full table-sm">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Cost Loss</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover">
                  <td>{item.name}</td>
                  <td className="text-right">{item.qty}</td>
                  <td className="text-right text-error">
                    -{currency}
                    {item.cost.toFixed(2)}
                  </td>
                  <td>
                    <div className="badge badge-ghost badge-sm">
                      {item.reason}
                    </div>
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

export default TopWastedItems;
