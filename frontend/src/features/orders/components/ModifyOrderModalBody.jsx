// frontend/src/features/orders/components/ModifyOrderModalBody.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { openModal } from "../../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import { fetchAllMenuItems } from "../../menuItems/menuItemsSlice";
import axios from "axios";
import ErrorText from "../../../components/Typography/ErrorText";
import { Plus, Trash2, Edit3, AlertCircle, Package, X } from "lucide-react";

const ModifyOrderModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const order = extraObject;
  const menuItems = useSelector((state) => state.menuItems.menuItems || []);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [orderItems, setOrderItems] = useState([]);
  const [orderNote, setOrderNote] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAllMenuItems());

    if (order) {
      setOrderItems(
        order.orderItems
          .filter((item) => !item.voidInfo?.isVoided)
          .map((item) => ({
            _id: item._id,
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            itemNote: item.itemNote || "",
            addOns: item.addOns || [],
            addOnsTotal: item.addOnsTotal || 0,
            subtotal: item.subtotal,
          }))
      );
      setOrderNote(order.orderNote || "");
    }
  }, [dispatch, order]);

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;

    const newItems = [...orderItems];
    const item = newItems[index];
    const oldQuantity = item.quantity;

    newItems[index] = {
      ...item,
      quantity: newQuantity,
      subtotal:
        item.price * newQuantity +
        (item.addOnsTotal / oldQuantity) * newQuantity,
    };

    setOrderItems(newItems);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length === 1) {
      dispatch(
        showNotification({
          message: "Cannot remove all items. Use cancel order instead.",
          status: 0,
        })
      );
      return;
    }

    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    dispatch(
      openModal({
        title: "Add Item to Order",
        bodyType: MODAL_BODY_TYPES.ADD_ITEM_TO_ORDER,
        extraObject: {
          onConfirm: (newItem) => {
            setOrderItems([...orderItems, { ...newItem, isNew: true }]);
          },
        },
        size: "lg",
      })
    );
  };

  const handleEditItemNote = (index) => {
    const item = orderItems[index];
    const newNote = window.prompt("Edit item note:", item.itemNote || "");
    if (newNote !== null) {
      const newItems = [...orderItems];
      newItems[index] = { ...item, itemNote: newNote };
      setOrderItems(newItems);
    }
  };

  const calculateNewTotal = () => {
    // 1. Subtotal
    const itemsSubtotal = orderItems.reduce((sum, item) => {
      const itemTotal = (item.price + (item.addOnsTotal || 0)) * item.quantity;
      return sum + itemTotal;
    }, 0);

    // 2. Discount
    let discountAmount = 0;
    const orderDiscount = order.orderDiscount;
    if (orderDiscount?.enabled) {
      if (orderDiscount.type === "percentage") {
        discountAmount = (itemsSubtotal * orderDiscount.value) / 100;
        if (orderDiscount.maxDiscount) {
          discountAmount = Math.min(discountAmount, orderDiscount.maxDiscount);
        }
      } else if (orderDiscount.type === "fixed") {
        discountAmount = Math.min(orderDiscount.value, itemsSubtotal);
      }
    }
    const discountedSubtotal = itemsSubtotal - discountAmount;

    // 3. Tax
    let totalTax = 0;
    if (settings?.taxSettings?.enabled) {
      if (settings.taxSettings.mode === "per-item") {
        orderItems.forEach((item) => {
          const itemTotal =
            (item.price + (item.addOnsTotal || 0)) * item.quantity;
          // Find original menu item to get tax rate
          const menuItem = menuItems.find((m) => m._id === item.menuItemId);
          const rate = menuItem?.customTax?.enabled
            ? menuItem.customTax.rate
            : settings.taxSettings.globalRate;
          totalTax += (itemTotal * rate) / 100;
        });
      } else {
        totalTax = (discountedSubtotal * settings.taxSettings.globalRate) / 100;
      }
    }

    // 4. Service Charge
    let serviceCharge = 0;
    if (settings?.serviceCharge?.enabled) {
      const applies =
        settings.serviceCharge.applyTo === "all" ||
        settings.serviceCharge.applyTo === order.orderType;
      if (applies) {
        serviceCharge =
          (discountedSubtotal * settings.serviceCharge.rate) / 100;
      }
    }

    // 5. Fees
    const packaging = order.packagingFee || 0;
    const delivery = order.deliveryFee || 0;

    return discountedSubtotal + totalTax + serviceCharge + packaging + delivery;
  };

  const validate = () => {
    const newErrors = {};

    if (orderItems.length === 0) {
      newErrors.items = "Order must have at least one item";
    }

    if (!reason.trim()) {
      newErrors.reason = "Please provide a reason for modification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axios.put(
        `/api/order-modifications/${order._id}`,
        {
          orderItems: orderItems.map((item) => ({
            _id: item.isNew ? undefined : item._id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            itemNote: item.itemNote,
            addOns: item.addOns,
            isNew: item.isNew,
          })),
          orderNote,
          reason,
          expectedVersion: order.version,
        }
      );

      dispatch(
        showNotification({
          message: "Order modified successfully",
          status: 1,
        })
      );

      dispatch(closeModal());

      // Refresh orders
      window.location.reload();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to modify order";
      dispatch(showNotification({ message, status: 0 }));

      if (error.response?.status === 409) {
        setErrors({
          version:
            "Order has been modified by another user. Please refresh and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="alert alert-warning">
        <AlertCircle className="w-5 h-5" />
        <div>
          <div className="font-semibold">Modifying Active Order</div>
          <div className="text-sm">
            Changes will update totals and adjust inventory automatically.
          </div>
        </div>
      </div>

      {/* Version Conflict Error */}
      {errors.version && (
        <div className="alert alert-error">
          <X className="w-5 h-5" />
          <span>{errors.version}</span>
        </div>
      )}

      {/* Order Items */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Order Items</h3>
          <button
            onClick={handleAddItem}
            className="btn btn-primary btn-sm gap-2"
            disabled={loading}
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {errors.items && <ErrorText>{errors.items}</ErrorText>}

        <div className="space-y-2">
          {orderItems.map((item, index) => (
            <div
              key={index}
              className={`card bg-base-200 border ${
                item.isNew ? "border-success" : "border-base-300"
              }`}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium flex items-center gap-2">
                      {item.name}
                      {item.isNew && (
                        <span className="badge badge-success badge-sm">
                          New
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-base-content/70">
                      {currency}
                      {item.price.toFixed(2)} × {item.quantity} = {currency}
                      {item.subtotal.toFixed(2)}
                    </p>

                    {/* Add-ons */}
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {item.addOns.map((addOnGroup, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-base-content/70"
                          >
                            <span className="font-medium">
                              {addOnGroup.groupName}:
                            </span>{" "}
                            {addOnGroup.selectedItems
                              ?.map((si) => si.name)
                              .join(", ")}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Item Note */}
                    {item.itemNote && (
                      <div className="mt-1 text-xs italic text-base-content/60">
                        Note: {item.itemNote}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={() =>
                          handleQuantityChange(index, item.quantity - 1)
                        }
                        disabled={loading || item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={() =>
                          handleQuantityChange(index, item.quantity + 1)
                        }
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleEditItemNote(index)}
                      disabled={loading}
                      title="Edit Note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      className="btn btn-sm btn-ghost text-error"
                      onClick={() => handleRemoveItem(index)}
                      disabled={loading}
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Note */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Order Note</span>
        </label>
        <textarea
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          className="textarea textarea-bordered"
          rows="2"
          placeholder="General instructions for the order..."
          disabled={loading}
        />
      </div>

      {/* Reason */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Reason for Modification *</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (errors.reason) {
              setErrors((prev) => ({ ...prev, reason: "" }));
            }
          }}
          className={`input input-bordered ${
            errors.reason ? "input-error" : ""
          }`}
          placeholder="e.g., Customer changed mind, added dessert"
          disabled={loading}
        />
        {errors.reason && <ErrorText>{errors.reason}</ErrorText>}
      </div>

      {/* Total Comparison */}
      <div className="bg-primary/10 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Original Total:</span>
          <span className="font-semibold">
            {currency}
            {order.totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">New Total:</span>
          <span className="font-bold text-lg text-primary">
            {currency}
            {calculateNewTotal().toFixed(2)}
          </span>
        </div>
        {calculateNewTotal() !== order.totalAmount && (
          <div className="text-xs text-center mt-2 text-base-content/70">
            Difference:{" "}
            <span
              className={
                calculateNewTotal() > order.totalAmount
                  ? "text-error"
                  : "text-success"
              }
            >
              {calculateNewTotal() > order.totalAmount ? "+" : ""}
              {currency}
              {(calculateNewTotal() - order.totalAmount).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="modal-action">
        <button
          onClick={() => dispatch(closeModal())}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};

export default ModifyOrderModalBody;
