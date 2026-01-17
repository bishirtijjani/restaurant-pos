import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mergeOrders } from "../../orders/ordersSlice";
import { showNotification } from "../../common/headerSlice";
import { Merge, ArrowRight, AlertTriangle, X } from "lucide-react";

const MergeTableModal = ({ sourceTable, sourceOrder, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { tables } = useSelector((state) => state.tables);
  const { orders } = useSelector((state) => state.orders);

  const [selectedTargetTableId, setSelectedTargetTableId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find tables that have active orders (candidates for merging)
  // Exclude current table
  const mergeCandidates = tables.filter(
    (t) => t._id !== sourceTable._id && t.currentOrder // Must have active order to merge INTO
  );

  const getOrderForTable = (table) => {
    // Depending on structure, table might have populated order or just ID.
    // If just ID, find in orders list
    if (!table.currentOrder) return null;
    const orderId = table.currentOrder._id || table.currentOrder;
    return orders.find((o) => o._id === orderId);
  };

  const handleMerge = async () => {
    if (!selectedTargetTableId) return;

    const targetTable = tables.find((t) => t._id === selectedTargetTableId);
    const targetOrder = getOrderForTable(targetTable);

    if (!targetOrder) {
      dispatch(
        showNotification({
          message: "Target table has no active order",
          status: 0,
        })
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        mergeOrders({
          sourceOrderIds: [sourceOrder._id],
          targetOrderId: targetOrder._id,
        })
      ).unwrap();

      dispatch(
        showNotification({ message: "Orders merged successfully", status: 1 })
      );
      if (onSuccess) onSuccess();
      onClose(); // Close this modal
    } catch (error) {
      dispatch(
        showNotification({
          message: typeof error === "string" ? error : "Merge failed",
          status: 0,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200/50 rounded-t-xl">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Merge className="w-5 h-5 text-warning" />
            Merge Table {sourceTable.tableNumber}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="alert alert-warning text-sm shadow-sm mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Merging will move <b>all items</b> from Table{" "}
              {sourceTable.tableNumber} to the target table. Table{" "}
              {sourceTable.tableNumber} will become empty.
            </span>
          </div>

          <div className="form-control">
            <label className="label font-medium">Merge into which table?</label>
            <select
              className="select select-bordered w-full"
              value={selectedTargetTableId}
              onChange={(e) => setSelectedTargetTableId(e.target.value)}
            >
              <option value="">Select a table...</option>
              {mergeCandidates.map((t) => {
                const ord = getOrderForTable(t);
                return (
                  <option key={t._id} value={t._id}>
                    Table {t.tableNumber} (Order #{ord?.orderNumber || "?"})
                  </option>
                );
              })}
            </select>
            {mergeCandidates.length === 0 && (
              <div className="text-error text-sm mt-2">
                No other active tables found to merge into.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-base-300 flex justify-end gap-2 bg-base-100 rounded-b-xl">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleMerge}
            className="btn btn-warning"
            disabled={!selectedTargetTableId || isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Confirm Merge"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeTableModal;
