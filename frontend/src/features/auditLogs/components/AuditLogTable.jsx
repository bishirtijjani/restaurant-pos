import React, { useState } from "react";
import { format } from "date-fns";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

const getActionColor = (action) => {
  switch (action) {
    case "create":
      return "badge-success";
    case "delete":
    case "void":
      return "badge-error";
    case "update":
    case "edit":
      return "badge-info";
    default:
      return "badge-ghost";
  }
};

const AuditLogTable = ({ logs, pagination, onPageChange, onViewDetail }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-10 text-base-content/60">
        No audit logs found.
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Description/Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-base-200/50">
                <td className="whitespace-nowrap font-mono text-xs">
                  {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs">
                      {log.userId?.fullname || "System"}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {log.userId?.role}
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    className={`badge badge-sm ${getActionColor(log.action)}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">
                      {log.entityType}
                    </span>
                    <span className="text-[10px] font-mono opacity-50">
                      {log.entityId}
                    </span>
                  </div>
                </td>
                <td className="max-w-xs truncate text-xs" title={log.reason}>
                  {log.reason || "-"}
                </td>
                <td>
                  <button
                    onClick={() => onViewDetail(log)}
                    className="btn btn-xs btn-ghost text-primary"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-base-200">
        <div className="text-xs text-base-content/60">
          Showing {(pagination.page - 1) * 20 + 1} to{" "}
          {Math.min(pagination.page * 20, pagination.total)} of{" "}
          {pagination.total} entries
        </div>
        <div className="join">
          <button
            className="join-item btn btn-sm"
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="join-item btn btn-sm no-animation cursor-default">
            Page {pagination.page}
          </span>
          <button
            className="join-item btn btn-sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogTable;
