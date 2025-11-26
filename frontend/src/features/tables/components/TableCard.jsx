// frontend/src/features/tables/components/TableCard.jsx
import React from "react";
import {
  Users,
  Clock,
  DollarSign,
  Edit3,
  Trash2,
  Eye,
  User,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import Can from "../../../components/Auth/Can";

const TableCard = ({
  table,
  currency,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDetails,
}) => {
  const statusConfig = {
    available: {
      bg: "bg-success/10",
      border: "border-success",
      badge: "badge-success",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    occupied: {
      bg: "bg-warning/10",
      border: "border-warning",
      badge: "badge-warning",
      icon: <Users className="w-4 h-4" />,
    },
    ordered: {
      bg: "bg-info/10",
      border: "border-info",
      badge: "badge-info",
      icon: <DollarSign className="w-4 h-4" />,
    },
    reserved: {
      bg: "bg-secondary/10",
      border: "border-secondary",
      badge: "badge-secondary",
      icon: <Calendar className="w-4 h-4" />,
    },
    cleaning: {
      bg: "bg-neutral/10",
      border: "border-neutral",
      badge: "badge-neutral",
      icon: <Clock className="w-4 h-4" />,
    },
    unavailable: {
      bg: "bg-error/10",
      border: "border-error",
      badge: "badge-error",
      icon: <AlertCircle className="w-4 h-4" />,
    },
  };

  const config = statusConfig[table.status] || statusConfig.available;

  const formatDuration = (seatedAt) => {
    if (!seatedAt) return null;
    const minutes = Math.floor((Date.now() - new Date(seatedAt)) / 1000 / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div
      className={`card ${config.bg} border-2 ${config.border} shadow-md hover:shadow-lg transition-all cursor-pointer`}
      onClick={() => onViewDetails(table)}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              {table.tableNumber}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge badge-sm ${config.badge}`}>
                {config.icon}
                <span className="ml-1">{table.status}</span>
              </span>
            </div>
          </div>
          <div
            className="dropdown dropdown-end"
            onClick={(e) => e.stopPropagation()}
          >
            <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
              •••
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-10"
            >
              <li>
                <button onClick={() => onViewDetails(table)}>
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </li>
              <Can do="editMenu">
                <li>
                  <button onClick={() => onEdit(table)}>
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </li>
              </Can>
              <Can do="deleteMenu">
                <li>
                  <button
                    onClick={() => onDelete(table._id)}
                    className="text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </li>
              </Can>
            </ul>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-base-content/80">
            <Users className="w-4 h-4" />
            <span>{table.capacity} seats</span>
          </div>

          {table.assignedStaff && (
            <div className="flex items-center gap-2 text-base-content/80">
              <User className="w-4 h-4" />
              <span className="truncate">{table.assignedStaff.fullname}</span>
            </div>
          )}

          {table.currentOrder && (
            <div className="flex items-center gap-2 text-primary font-medium">
              <DollarSign className="w-4 h-4" />
              <span>
                {currency}
                {table.currentOrder.totalAmount?.toFixed(2)}
              </span>
            </div>
          )}

          {table.timing?.seatedAt &&
            ["occupied", "ordered"].includes(table.status) && (
              <div className="flex items-center gap-2 text-warning">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(table.timing.seatedAt)}</span>
              </div>
            )}

          {table.mergedWith && table.mergedWith.length > 0 && (
            <div className="badge badge-outline badge-sm">
              Merged with {table.mergedWith.length} table(s)
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className="card-actions justify-end mt-3"
          onClick={(e) => e.stopPropagation()}
        >
          {table.status === "available" && (
            <Can do="editMenu">
              <button
                onClick={() => onStatusChange(table._id, "occupied")}
                className="btn btn-xs btn-success"
              >
                Occupy
              </button>
            </Can>
          )}
          {table.status === "cleaning" && (
            <Can do="editMenu">
              <button
                onClick={() => onStatusChange(table._id, "available")}
                className="btn btn-xs btn-primary"
              >
                Mark Available
              </button>
            </Can>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableCard;
