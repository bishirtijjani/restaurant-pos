import React from "react";

function TopSellingItemsTable({ data }) {
  const items = data || [
    { id: 1, name: "Cheeseburger", quantity: 120, revenue: 1200 },
    { id: 2, name: "Fries", quantity: 200, revenue: 800 },
    { id: 3, name: "Coke", quantity: 150, revenue: 300 },
    { id: 4, name: "Pizza", quantity: 50, revenue: 750 },
    { id: 5, name: "Salad", quantity: 30, revenue: 300 },
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Top Selling Items</h3>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Item Name</th>
                <th className="text-right">Quantity</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="hover">
                  <th>{index + 1}</th>
                  <td>{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">${item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TopSellingItemsTable;
