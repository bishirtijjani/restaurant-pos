import React from "react";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function TaxBreakdownTable({ data, loading }) {
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-base-300 rounded w-1/4"></div>
            <div className="h-10 bg-base-300 rounded"></div>
            <div className="h-10 bg-base-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Tax Breakdown by Rate</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Tax Name / Rate</th>
                <th className="text-right">Tax Collected</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index} className="hover">
                    <td>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-sm opacity-50">
                        {item.rate}% Rate
                      </div>
                    </td>
                    <td className="text-right font-medium">
                      {currency}
                      {item.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center py-4 text-base-content/50"
                  >
                    No tax data available for this range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TaxBreakdownTable;
