import React, { useState } from "react";
import {
  UsersIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import EditTableModal from "./EditTableModal";
import { useDispatch } from "react-redux";
import { deleteTable } from "../tableSlice";

const Table = ({ table }) => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const dispatch = useDispatch();

  const getStatusColor = () => {
    switch (table.status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "reserved":
        return "bg-blue-500";
      case "ordered":
        return "bg-yellow-500";
      case "cleaning":
        return "bg-purple-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      dispatch(deleteTable(table._id));
    }
  };

  return (
    <>
      <div
        className={`handle w-48 h-32 p-2 rounded-lg shadow-lg cursor-pointer flex flex-col justify-between ${getStatusColor()}`}
      >
        <div className="flex justify-between items-start">
          <span className="font-bold text-white text-lg">
            {table.tableNumber}
          </span>
          <div className="flex space-x-1">
            <button
              className="btn btn-xs btn-ghost p-0"
              onClick={() => setEditModalOpen(true)}
            >
              <PencilIcon className="h-4 w-4 text-white" />
            </button>
            <button
              className="btn btn-xs btn-ghost p-0"
              onClick={handleDelete}
            >
              <TrashIcon className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        <div className="text-white">
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>{table.capacity}</span>
          </div>
          {table.currentOrder && (
            <div className="text-xs">
              Order: {table.currentOrder.orderNumber}
            </div>
          )}
          {table.assignedStaff && (
            <div className="text-xs">Staff: {table.assignedStaff.fullname}</div>
          )}
        </div>
      </div>
      <EditTableModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        table={table}
      />
    </>
  );
};

export default Table;
