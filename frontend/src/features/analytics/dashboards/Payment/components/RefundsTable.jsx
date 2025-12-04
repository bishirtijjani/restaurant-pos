import React from "react";

function RefundsTable({ data }) {
  const refunds = data || [
    { id: 1, date: "2023-10-25", amount: 45.0, reason: "Customer Complaint", method: "Credit Card" },
    { id: 2, date: "2023-10-24", amount: 12.5, reason: "Wrong Item", method: "Cash" },
    { id: 3, date: "2023-10-22", amount: 30.0, reason: "Order Cancelled", method: "Mobile Payment" },
  ];

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
                  <td className="text-right text-error">-${refund.amount.toFixed(2)}</td>
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
