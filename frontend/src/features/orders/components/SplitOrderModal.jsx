import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { splitOrder } from "../../orders/ordersSlice";
import { fetchTables } from "../../tables/tableSlice";
import { ArrowRight, Check, X, Split, AlertCircle, Utensils } from "lucide-react";
import { showNotification } from "../../common/headerSlice";

const SplitOrderModal = ({ sourceOrder, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { tables } = useSelector((state) => state.tables);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [step, setStep] = useState(1); // 1: Select Items, 2: Select Target
  const [selectedItems, setSelectedItems] = useState([]); // [{ itemId, quantity, maxQty, name, price }]
  const [targetMode, setTargetMode] = useState("new"); // "new" or "existing"
  const [selectedTargetTable, setSelectedTargetTable] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  // Helper to get selected qty for an item
  const getSelectedQty = (itemId) => {
    const found = selectedItems.find((i) => i.itemId === itemId);
    return found ? found.quantity : 0;
  };

  const handleItemToggle = (orderItem) => {
    const currentQty = getSelectedQty(orderItem._id);
    const maxQty = orderItem.quantity;

    if (currentQty === 0) {
      // Add 1
      setSelectedItems([
        ...selectedItems,
        {
          itemId: orderItem._id,
          quantity: 1,
          maxQty,
          name: orderItem.name,
          price: orderItem.price,
        },
      ]);
    } else {
      // Remove
      setSelectedItems(selectedItems.filter((i) => i.itemId !== orderItem._id));
    }
  };

  const handleQtyChange = (itemId, delta) => {
    const itemIndex = selectedItems.findIndex((i) => i.itemId === itemId);
    if (itemIndex === -1) return;

    const item = selectedItems[itemIndex];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
    } else if (newQty <= item.maxQty) {
      const newItems = [...selectedItems];
      newItems[itemIndex] = { ...item, quantity: newQty };
      setSelectedItems(newItems);
    }
  };

  const handleSelectAll = () => {
    const all = sourceOrder.orderItems.map((item) => ({
      itemId: item._id,
      quantity: item.quantity,
      maxQty: item.quantity,
      name: item.name,
      price: item.price,
    }));
    setSelectedItems(all);
  };

  const totalSelectedValue = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const sourceOrderValue = sourceOrder.orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return;
    if (targetMode === "existing" && !selectedTargetTable) {
      dispatch(
        showNotification({ message: "Please select a target table", status: 0 })
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        splitOrder({
          orderId: sourceOrder._id,
          itemsToSplit: selectedItems.map(({ itemId, quantity }) => ({
            itemId,
            quantity,
          })),
          targetTableNumber:
            targetMode === "existing" ? selectedTargetTable : null,
          createNewOrder: targetMode === "new",
          version: sourceOrder.version,
        })
      ).unwrap();

      dispatch(
        showNotification({ message: "Order split successfully", status: 1 })
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      dispatch(
        showNotification({
          message: typeof error === "string" ? error : "Failed to split order",
          status: 0,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTables = tables.filter(
    (t) =>
      t.status === "available" ||
      t.status === "occupied" ||
      t.status === "ordered"
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200/50 rounded-t-xl">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Split className="w-5 h-5 text-primary" />
            Split Order #{sourceOrder.orderNumber}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Warning */}
        {sourceOrder.discountBreakdown?.hasDiscount && (
          <div className="p-4 bg-warning/10 text-warning-content text-sm flex items-start gap-2 border-b border-warning/20">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              This order has discounts applied. Splitting will{" "}
              <b>remove all discounts</b> from both orders to prevent
              calculation errors. Please re-apply them manually after splitting.
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">Select items to move</h4>
                <button
                  onClick={handleSelectAll}
                  className="btn btn-ghost btn-xs text-primary"
                >
                  Select All
                </button>
              </div>

              <div className="space-y-2">
                {sourceOrder.orderItems.map((item) => {
                  const selectedQty = getSelectedQty(item._id);
                  const isSelected = selectedQty > 0;

                  return (
                    <div
                      key={item._id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-base-200 hover:border-base-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={isSelected}
                          onChange={() => handleItemToggle(item)}
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-base-content/60">
                            {currency}
                            {item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQtyChange(item._id, -1)}
                            className="btn btn-xs btn-circle btn-ghost border-base-300"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold">
                            {selectedQty}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item._id, 1)}
                            className="btn btn-xs btn-circle btn-ghost border-base-300"
                            disabled={selectedQty >= item.quantity}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end mt-4 text-sm font-semibold">
                Moving:{" "}
                <span className="text-primary ml-1">
                  {currency}
                  {totalSelectedValue.toFixed(2)}
                </span>
                <span className="mx-2 text-base-content/30">/</span>
                Total: {currency}
                {sourceOrderValue.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h4 className="font-semibold text-lg">
                Where to move these items?
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTargetMode("new")}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    targetMode === "new"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-base-200 hover:border-base-300"
                  }`}
                >
                  <div className="text-2xl mb-2">📄</div>
                  <div className="font-bold">New Order</div>
                  <div className="text-xs opacity-70 mt-1">
                    Create a separate takeaway/dine-in order
                  </div>
                </button>

                <button
                  onClick={() => setTargetMode("existing")}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    targetMode === "existing"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-base-200 hover:border-base-300"
                  }`}
                >
                  <Utensils className="w-8 h-8 mb-2 mx-auto" />
                  <div className="font-bold">Another Table</div>
                  <div className="text-xs opacity-70 mt-1">
                    Move to an existing table
                  </div>
                </button>
              </div>

              {targetMode === "existing" && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Select Target Table
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedTargetTable}
                    onChange={(e) => setSelectedTargetTable(e.target.value)}
                  >
                    <option value="">Select a table...</option>
                    {availableTables
                      .filter((t) => t.tableNumber !== sourceOrder.table) // Exclude current
                      .map((t) => (
                        <option key={t._id} value={t.tableNumber}>
                          Table {t.tableNumber} ({t.status})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="bg-base-200 p-4 rounded-lg">
                <h5 className="font-medium text-sm mb-2 text-base-content/70">
                  Summary
                </h5>
                <p className="flex justify-between text-sm">
                  <span>Items to move:</span>
                  <span className="font-bold">
                    {selectedItems.reduce((acc, i) => acc + i.quantity, 0)}{" "}
                    items
                  </span>
                </p>
                <p className="flex justify-between text-sm mt-1">
                  <span>Value:</span>
                  <span className="font-bold">
                    {currency}
                    {totalSelectedValue.toFixed(2)}
                  </span>
                </p>
                <div className="divider my-2"></div>
                <p className="text-xs text-base-content/50">
                  Order #{sourceOrder.orderNumber} will be updated and
                  recalculated.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 flex justify-between bg-base-100 rounded-b-xl">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Back
            </button>
          ) : (
            <button />
          )}

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
              disabled={selectedItems.length === 0}
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={
                isSubmitting ||
                (targetMode === "existing" && !selectedTargetTable)
              }
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  Confirm Split <Check className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitOrderModal;
