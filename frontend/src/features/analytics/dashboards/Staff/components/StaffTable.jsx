import React from "react";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function StaffTable({ data }) {
  const staff = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

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
                  <td>{member.role || "Staff"}</td>
                  <td className="text-right">
                    {currency}
                    {member.sales.toLocaleString()}
                  </td>
                  <td className="text-right">
                    {currency}
                    {member.tips?.toLocaleString() || "0"}
                  </td>
                  <td className="text-right">
                    <div className="badge badge-ghost">
                      {member.rating || "N/A"} ⭐
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

export default StaffTable;
