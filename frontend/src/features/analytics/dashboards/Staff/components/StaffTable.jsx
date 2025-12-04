import React from "react";

function StaffTable({ data }) {
  const staff = data || [
    { id: 1, name: "John Doe", role: "Waiter", sales: 1200, tips: 150, rating: 4.8 },
    { id: 2, name: "Jane Smith", role: "Waiter", sales: 1500, tips: 200, rating: 4.9 },
    { id: 3, name: "Bob Johnson", role: "Bartender", sales: 900, tips: 100, rating: 4.5 },
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Staff Details</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th className="text-right">Total Sales</th>
                <th className="text-right">Tips Collected</th>
                <th className="text-right">Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="hover">
                  <td>
                    <div className="font-bold">{member.name}</div>
                  </td>
                  <td>{member.role}</td>
                  <td className="text-right">${member.sales}</td>
                  <td className="text-right">${member.tips}</td>
                  <td className="text-right">
                    <div className="badge badge-ghost">{member.rating} ⭐</div>
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

export default StaffTable;
