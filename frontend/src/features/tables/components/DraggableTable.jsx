// frontend/src/features/tables/components/DraggableTable.jsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { useSelector } from "react-redux";

const DraggableTableItem = ({
  table,
  onClick,
  editMode,
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

  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
    position: "absolute",
    left: table.position.x,
    top: table.position.y,
    width: table.position.width || 100,
    height: table.position.height || 100,
    cursor: editMode ? "move" : "pointer",
  };

  const statusConfig = {
    available: {
      bg: "bg-success/20",
      border: "border-success",
      icon: <CheckCircle className="w-4 h-4 text-success" />,
      pulse: false,
    },
    occupied: {
      bg: "bg-warning/20",
      border: "border-warning",
      icon: <Users className="w-4 h-4 text-warning" />,
      pulse: true,
    },
    ordered: {
      bg: "bg-info/20",
      border: "border-info",
      icon: <DollarSign className="w-4 h-4 text-info" />,
      pulse: true,
    },
    reserved: {
      bg: "bg-secondary/20",
      border: "border-secondary",
      icon: <Calendar className="w-4 h-4 text-secondary" />,
      pulse: false,
    },
    cleaning: {
      bg: "bg-neutral/20",
      border: "border-neutral",
      icon: <Clock className="w-4 h-4 text-neutral" />,
      pulse: false,
    },
    unavailable: {
      bg: "bg-error/20",
      border: "border-error",
      icon: <AlertCircle className="w-4 h-4 text-error" />,
      pulse: false,
    },
  };

  const config = statusConfig[table.status] || statusConfig.available;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(editMode ? { ...attributes, ...listeners } : {})}
      onClick={() => !editMode && onClick?.()}
      className={`
        ${config.bg} ${config.border}
        border-2 rounded-lg shadow-lg
        hover:shadow-xl transition-all duration-300
        flex flex-col items-center justify-center
        ${config.pulse ? "animate-pulse" : ""}
        ${editMode ? "hover:scale-105" : "hover:scale-110"}
        overflow-hidden
        group
      `}
    >
      {/* Table Number */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          {config.icon}
          <span className="font-bold text-lg">{table.tableNumber}</span>
        </div>

        {/* Capacity */}
        <div className="flex items-center justify-center gap-1 text-xs opacity-70">
          <Users className="w-3 h-3" />
          <span>{table.capacity}</span>
        </div>

        {/* Order Info */}
        {table.currentOrder && (
          <div className="mt-2 px-2 py-1 bg-base-100/80 rounded text-xs font-medium">
            {currency}
            {table.currentOrder.totalAmount?.toFixed(2)}
          </div>
        )}

        {/* Occupancy Timer */}
        {table.timing?.seatedAt &&
          ["occupied", "ordered"].includes(table.status) && (
            <div className="mt-1 text-xs opacity-60 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor(
                (Date.now() - new Date(table.timing.seatedAt)) / 1000 / 60
              )}
              m
            </div>
          )}

        {/* Reservation Indicator */}
        {table.currentReservation && (
          <div className="absolute top-1 right-1">
            <Calendar className="w-3 h-3 text-secondary" />
          </div>
        )}
      </div>

      {/* Staff Badge */}
      {table.assignedStaff && (
        <div className="absolute bottom-1 left-1 right-1 bg-base-100/90 rounded px-1 py-0.5 text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
          {table.assignedStaff.fullname}
        </div>
      )}
    </div>
  );
};

export default DraggableTableItem;
