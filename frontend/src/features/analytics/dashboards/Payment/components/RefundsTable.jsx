import React from "react";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function RefundsTable({ data }) {
  const refunds = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Recent Refunds</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Method</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr key={refund.id} className="hover">
                  <td>{refund.date}</td>
                  <td>{refund.reason}</td>
                  <td>{refund.method}</td>
                  <td className="text-right text-error">
                    -{currency}
                    {refund.amount.toFixed(2)}
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

export default RefundsTable;
