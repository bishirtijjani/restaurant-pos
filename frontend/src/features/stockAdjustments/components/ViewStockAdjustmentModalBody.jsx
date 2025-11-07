import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../common/modalSlice";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  User,
  Package,
} from "lucide-react";

const ADJUSTMENT_TYPES = {
  addition: { icon: TrendingUp, color: "text-success", label: "Addition" },
  subtraction: {
    icon: TrendingDown,
    color: "text-error",
    label: "Subtraction",
  },
  correction: { icon: AlertCircle, color: "text-warning", label: "Correction" },
};

const REASON_LABELS = {
  wastage: "Wastage",
  damage: "Damage",
  theft: "Theft",
  return: "Return",
  donation: "Donation",
  correction: "Stock Correction",
  stock_take: "Stock Take",
  other: "Other",
};

const ViewStockAdjustmentModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const adjustment = extraObject;

  const typeConfig = ADJUSTMENT_TYPES[adjustment.type];
  const TypeIcon = typeConfig?.icon || AlertCircle;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg bg-base-200`}>
            <TypeIcon className={`w-8 h-8 ${typeConfig?.color}`} />
          </div>
          <div>
            <h3 className="font-bold text-xl">{adjustment.adjustmentNumber}</h3>
            <span className={`badge ${typeConfig?.color} mt-1`}>
              {typeConfig?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Item Information */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Item
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">Item Name:</span>
              <span className="font-medium">
                {adjustment.inventoryItem?.name || "Unknown"}
              </span>
            </div>
            {adjustment.inventoryItem?.sku && (
              <div className="flex justify-between">
                <span className="text-base-content/70">SKU:</span>
                <span className="font-medium">
                  {adjustment.inventoryItem.sku}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-base-content/70">Category:</span>
              <span className="font-medium">
                {adjustment.inventoryItem?.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Adjustment Details */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h4 className="font-semibold mb-3">Adjustment Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Type:</span>
              <span className={`badge ${typeConfig?.color}`}>
                {typeConfig?.label}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-base-content/70">Reason:</span>
              <span className="font-medium">
                {REASON_LABELS[adjustment.reason]}
              </span>
            </div>

            <div className="divider my-2"></div>

            <div className="flex justify-between">
              <span className="text-base-content/70">Quantity Adjusted:</span>
              <span className="font-semibold text-lg">
                {adjustment.quantity} {adjustment.inventoryItem?.unit}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-base-content/70">Previous Stock:</span>
              <span className="font-medium">
                {adjustment.previousStock} {adjustment.inventoryItem?.unit}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-base-content/70">New Stock:</span>
              <span className="font-semibold text-primary text-lg">
                {adjustment.newStock} {adjustment.inventoryItem?.unit}
              </span>
            </div>

            <div className="divider my-2"></div>

            <div className="flex justify-between items-center">
              <span className="text-base-content/70 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date & Time:
              </span>
              <span className="text-sm">
                {formatDate(adjustment.createdAt)}
              </span>
            </div>

            {adjustment.performedBy && (
              <div className="flex justify-between items-center">
                <span className="text-base-content/70 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Performed By:
                </span>
                <span className="font-medium">
                  {adjustment.performedBy.fullname}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {adjustment.notes && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h4 className="font-semibold mb-2">Notes</h4>
            <p className="text-base-content/80">{adjustment.notes}</p>
          </div>
        </div>
      )}

      <div className="modal-action">
        <button
          onClick={() => dispatch(closeModal())}
          className="btn btn-primary"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewStockAdjustmentModalBody;
