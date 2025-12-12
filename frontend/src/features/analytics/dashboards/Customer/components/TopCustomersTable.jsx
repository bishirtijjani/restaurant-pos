import React from "react";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function TopCustomersTable({ data }) {
  const customers = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th className="text-right">Visits</th>
                <th className="text-right">Total Spent</th>
                <th className="text-right">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="hover">
                  <td>
                    <div className="font-bold">{customer.name}</div>
                  </td>
                  <td className="text-right">{customer.visits}</td>
                  <td className="text-right">
                    {currency}
                    {customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="text-right">{customer.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TopCustomersTable;
