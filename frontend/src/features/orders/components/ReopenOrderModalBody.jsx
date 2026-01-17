import React, { useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

const ReopenOrderModalBody = ({ extraObject, closeModal, onConfirm }) => {
  const order = extraObject;
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason.trim());
      closeModal();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Warning Banner */}
      <div className="alert alert-warning mb-6">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <h3 className="font-bold">Reopen Order #{order.orderNumber}?</h3>
          <div className="text-sm">
            This will change the order status back to pending and restore it to
            the active orders list.
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="card bg-base-200 mb-6">
        <div className="card-body p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="opacity-70">Current Status:</span>
              <span className="ml-2 badge badge-sm capitalize">
                {order.orderStatus}
              </span>
            </div>
            <div>
              <span className="opacity-70">Order Type:</span>
              <span className="ml-2 capitalize">{order.orderType}</span>
            </div>
            {order.table && order.table !== "Takeaway" && (
              <div>
                <span className="opacity-70">Table:</span>
                <span className="ml-2 font-medium">{order.table}</span>
              </div>
            )}
            <div>
              <span className="opacity-70">Total Amount:</span>
              <span className="ml-2 font-medium">
                ${order.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason Input */}
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Reason for Reopening <span className="text-error">*</span>
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered h-24"
            placeholder="e.g., Customer requested changes, Order was closed by mistake..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            autoFocus
          />
          <label className="label">
            <span className="label-text-alt opacity-70">
              This will be logged in the order history
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button
            type="button"
            onClick={closeModal}
            className="btn btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary gap-2 ${loading ? "loading" : ""}`}
            disabled={!reason.trim() || loading}
          >
            {!loading && <RotateCcw className="w-4 h-4" />}
            Reopen Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReopenOrderModalBody;
