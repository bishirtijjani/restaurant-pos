// frontend/src/features/tables/components/DraggableTable.jsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit3, Trash2, Eye, Users } from "lucide-react";
import Can from "../../../components/Auth/Can";

const DraggableTable = ({
  table,
  onEdit,
  onDelete,
  onViewDetails,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: table._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const statusColors = {
    available: "bg-success/20 border-success text-success-content",
    occupied: "bg-warning/20 border-warning text-warning-content",
    ordered: "bg-info/20 border-info text-info-content",
    reserved: "bg-secondary/20 border-secondary text-secondary-content",
    cleaning: "bg-neutral/20 border-neutral text-neutral-content",
    unavailable: "bg-error/20 border-error text-error-content",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card border-2 ${
        statusColors[table.status]
      } hover:shadow-lg transition-all cursor-move`}
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center gap-2"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="w-4 h-4 opacity-50" />
            <div>
              <h3 className="font-bold text-lg">{table.tableNumber}</h3>
              <p className="text-xs opacity-70 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {table.capacity} seats
              </p>
            </div>
          </div>
          <span className="badge badge-sm capitalize">{table.status}</span>
        </div>

        {table.currentOrder && (
          <div className="mt-2 p-2 bg-base-100/50 rounded text-xs">
            <span className="font-medium">Order: </span>
            {table.currentOrder.orderNumber}
          </div>
        )}

        {table.assignedStaff && (
          <div className="text-xs opacity-70 mt-1">
            Staff: {table.assignedStaff.fullname}
          </div>
        )}

        <div className="flex gap-1 mt-3">
          <button
            onClick={() => onViewDetails(table)}
            className="btn btn-xs btn-ghost flex-1"
            title="View Details"
          >
            <Eye className="w-3 h-3" />
          </button>
          <Can do="editMenu">
            <button
              onClick={() => onEdit(table)}
              className="btn btn-xs btn-ghost"
              title="Edit"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(table._id)}
              className="btn btn-xs btn-ghost text-error"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </Can>
        </div>
      </div>
    </div>
  );
};

export default DraggableTable;
