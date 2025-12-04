import React from "react";

function TopCustomersTable({ data }) {
  const customers = data || [
    { id: 1, name: "Alice Johnson", visits: 12, totalSpent: 1200, lastVisit: "2023-10-25" },
    { id: 2, name: "Bob Smith", visits: 10, totalSpent: 950, lastVisit: "2023-10-24" },
    { id: 3, name: "Charlie Brown", visits: 8, totalSpent: 800, lastVisit: "2023-10-20" },
    { id: 4, name: "Diana Prince", visits: 15, totalSpent: 1500, lastVisit: "2023-10-26" },
    { id: 5, name: "Evan Wright", visits: 6, totalSpent: 600, lastVisit: "2023-10-18" },
  ];

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
                  <td className="text-right">${customer.totalSpent}</td>
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
