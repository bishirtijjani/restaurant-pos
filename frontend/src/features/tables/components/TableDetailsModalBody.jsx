// frontend/src/features/tables/components/TableDetailsModal.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Clock,
  User,
  FileText,
  Edit3,
  X,
  Link as LinkIcon,
  Unlink,
  Split,
  Merge,
} from "lucide-react";
import SplitOrderModal from "../../orders/components/SplitOrderModal";
import MergeTableModal from "./MergeTableModal";

const TableDetailsModal = ({ table, onClose, onStatusChange, onEdit }) => {
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings,
  );
  const orders = useSelector((state) => state.orders.orders);
  const currency = settings?.currency?.symbol || "$";
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const currentOrder = orders.find((o) => o._id === table.currentOrder?._id);

  const statusOptions = [
    "available",
    "occupied",
    "ordered",
    "reserved",
    "cleaning",
    "unavailable",
  ];

  const statusColors = {
    available: "badge-success",
    occupied: "badge-warning",
    ordered: "badge-info",
    reserved: "badge-secondary",
    cleaning: "badge-neutral",
    unavailable: "badge-error",
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Table {table.tableNumber}</h2>
            <span className={`badge ${statusColors[table.status]} mt-2`}>
              {table.status}
            </span>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Table Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/70">Capacity</p>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {table.capacity} seats
                  </p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Shape</p>
                  <p className="font-medium capitalize">{table.shape}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Assigned Staff</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {table.assignedStaff?.fullname || "None"}
                  </p>
                </div>
                {table.lastOccupiedAt && (
                  <div>
                    <p className="text-sm text-base-content/70">
                      Last Occupied
                    </p>
                    <p className="font-medium flex items-center gap-1 text-xs">
                      <Clock className="w-4 h-4" />
                      {formatDate(table.lastOccupiedAt)}
                    </p>
                  </div>
                )}
              </div>
              {table.notes && (
                <div className="mt-4">
                  <p className="text-sm text-base-content/70">Notes</p>
                  <p className="text-sm italic">{table.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Order */}
          {currentOrder && (
            <div className="card bg-info/10 border border-info/30">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-info" />
                    Current Order
                  </h3>
                  {/* Order Actions */}
                  <div className="flex gap-2">
                    <button
                      className="btn btn-xs btn-outline btn-info gap-1"
                      onClick={() => setShowSplitModal(true)}
                    >
                      <Split className="w-3 h-3" /> Split
                    </button>
                    <button
                      className="btn btn-xs btn-outline btn-warning gap-1"
                      onClick={() => setShowMergeModal(true)}
                    >
                      <Merge className="w-3 h-3" /> Merge Into
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Order Number:</span>
                      <span className="font-medium">
                        #{currentOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <span className="badge badge-sm badge-primary">
                        {currentOrder.orderStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="font-bold text-primary">
                        {currency}
                        {currentOrder.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Customer:</span>
                      <span className="font-medium">
                        {currentOrder.customerDetails?.name || "Walk-in"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Merged Tables */}
          {table.mergedWith && table.mergedWith.length > 0 && (
            <div className="card bg-warning/10 border border-warning/30">
              <div className="card-body">
                <h3 className="font-semibold mb-3">Merged With</h3>
                <div className="flex flex-wrap gap-2">
                  {table.mergedWith.map((mergedTable, idx) => (
                    <span key={idx} className="badge badge-warning">
                      Table {mergedTable.tableNumber}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Status Change */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-3">Change Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(table._id, status)}
                    disabled={table.status === status}
                    className={`btn btn-sm ${
                      table.status === status ? "btn-active" : "btn-outline"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-base-100 border-t border-base-300 p-6 flex gap-3">
          <button
            onClick={() => onEdit(table)}
            className="btn btn-primary gap-2 flex-1"
          >
            <Edit3 className="w-4 h-4" />
            Edit Table
          </button>
          <button onClick={onClose} className="btn btn-outline flex-1">
            Close
          </button>
        </div>
      </div>

      {showSplitModal && currentOrder && (
        <SplitOrderModal
          sourceOrder={currentOrder}
          onClose={() => setShowSplitModal(false)}
          onSuccess={() => {
            // success
            onClose(); // Close details modal too? Or just refresh?
          }}
        />
      )}

      {showMergeModal && currentOrder && (
        <MergeTableModal
          sourceTable={table}
          sourceOrder={currentOrder}
          onClose={() => setShowMergeModal(false)}
          onSuccess={() => {
            onClose(); // Close details
          }}
        />
      )}
    </div>
  );
};

export default TableDetailsModal;
