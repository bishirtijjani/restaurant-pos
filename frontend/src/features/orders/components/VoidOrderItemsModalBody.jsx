// frontend/src/features/orders/components/VoidOrderItemsModalBody.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { fetchAllMenuItems } from "../../menuItems/menuItemsSlice";
import { fetchOrders, voidOrderItems } from "../ordersSlice";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import ErrorText from "../../../components/Typography/ErrorText";
import { AlertTriangle, Package, Check } from "lucide-react";

const VoidOrderItemsModalBody = ({ extraObject, closeModal: close }) => {
  const dispatch = useDispatch();
  const order = extraObject;
  const currentUser = useSelector((state) => state.auth.user);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const menuItems = useSelector((state) => state.menuItems.menuItems);
  const currency = settings?.currency?.symbol || "$";

  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const voidReasonOptions = [
    { value: "", name: "Select a reason..." },
    { value: "Customer changed mind", name: "Customer changed mind" },
    { value: "Wrong item ordered", name: "Wrong item ordered" },
    { value: "Item unavailable", name: "Item unavailable" },
    { value: "Quality issue", name: "Quality issue" },
    { value: "Duplicate entry", name: "Duplicate entry" },
    { value: "Other", name: "Other" },
  ];

  React.useEffect(() => {
    dispatch(fetchAllMenuItems());
  }, [dispatch]);

  const activeItems = order.orderItems.filter(
    (item) => !item.voidInfo?.isVoided
  );

  const toggleItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
    if (errors.items) setErrors((prev) => ({ ...prev, items: "" }));
  };

  const selectAll = () => {
    if (selectedItems.length === activeItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(activeItems.map((item) => item._id));
    }
  };

  const calculateOrderTotal = (items) => {
    // 1. Subtotal
    const itemsSubtotal = items.reduce((sum, item) => {
      return sum + item.subtotal;
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
        items.forEach((item) => {
          // Find original menu item to get tax rate
          const menuItem = menuItems.find((m) => m._id === item.menuItemId);
          const rate = menuItem?.customTax?.enabled
            ? menuItem.customTax.rate
            : settings.taxSettings.globalRate;
          totalTax += (item.subtotal * rate) / 100;
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

    // Fees (Constant)
    const packaging = order.packagingFee || 0;
    const delivery = order.deliveryFee || 0;

    return discountedSubtotal + totalTax + serviceCharge + packaging + delivery;
  };

  const calculateVoidTotal = () => {
    const currentTotal = calculateOrderTotal(activeItems);
    
    const remainingItems = activeItems.filter(
      (item) => !selectedItems.includes(item._id)
    );
    const projectedTotal = calculateOrderTotal(remainingItems);

    return Math.max(0, currentTotal - projectedTotal);
  };

  const validate = () => {
    const newErrors = {};
    if (selectedItems.length === 0) {
      newErrors.items = "Please select at least one item to void";
    }
    if (!reason.trim()) {
      newErrors.reason = "Please provide a reason for voiding";
    }
    if (selectedItems.length === activeItems.length) {
      newErrors.items = "Cannot void all items. Use cancel order instead.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await dispatch(
        voidOrderItems({
          orderId: order._id,
          itemIds: selectedItems,
          reason,
        })
      ).unwrap();

      dispatch(
        showNotification({
          message: `Successfully voided ${selectedItems.length} item(s)`,
          status: 1,
        })
      );
      dispatch(fetchOrders());
      dispatch(closeModal());
    } catch (error) {
      const message = error.message || "Failed to void items";
      dispatch(showNotification({ message, status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="alert alert-warning">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <div className="font-semibold">Voiding Items</div>
          <div className="text-sm">
            Voided items will be removed from the order total and inventory will
            be restored.
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-base-200 p-3 rounded-lg flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content rounded-full w-10">
            <span>{currentUser?.fullname?.[0] || "U"}</span>
          </div>
        </div>
        <div>
          <div className="font-medium">
            {currentUser?.fullname || "Unknown User"}
          </div>
          <div className="text-xs text-base-content/70">
            Performing void action
          </div>
        </div>
      </div>

      {/* Item Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Select Items to Void</h3>
          <button onClick={selectAll} className="btn btn-xs btn-ghost">
            {selectedItems.length === activeItems.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {errors.items && <ErrorText>{errors.items}</ErrorText>}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activeItems.map((item) => {
            const isSelected = selectedItems.includes(item._id);
            return (
              <button
                key={item._id}
                type="button"
                onClick={() => toggleItem(item._id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${
                  isSelected
                    ? "border-error bg-error/10"
                    : "border-base-300 hover:bg-base-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? "border-error bg-error" : "border-base-300"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-error-content" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-base-content/70">
                      {item.quantity} × {currency}
                      {item.price.toFixed(2)}
                    </div>
                    {item.addOns?.length > 0 && (
                      <div className="text-xs text-base-content/60">
                        + {item.addOns.length} add-on(s)
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-semibold">
                  {currency}
                  {item.subtotal.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reason */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Reason for Voiding *</span>
        </label>
        <SearchableSelect
          options={voidReasonOptions}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (errors.reason) setErrors((prev) => ({ ...prev, reason: "" }));
          }}
          name="reason"
          placeholder="Select a reason"
          className={`${errors.reason ? "border-error" : ""}`}
          valueKey="value"
          labelKey="name"
        />
        {errors.reason && <ErrorText>{errors.reason}</ErrorText>}
      </div>

      {reason === "Other" && (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Specify Reason *</span>
          </label>
          <textarea
            value={reason === "Other" ? "" : reason}
            onChange={(e) => setReason(e.target.value)}
            className="textarea textarea-bordered"
            rows="2"
            placeholder="Enter specific reason..."
          />
        </div>
      )}

      {/* Summary */}
      {selectedItems.length > 0 && (
        <div className="bg-error/10 p-4 rounded-lg border border-error/30">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-base-content/70">Items to void</div>
              <div className="font-semibold">
                {selectedItems.length} item(s)
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-base-content/70">
                Amount to deduct
              </div>
              <div className="font-bold text-lg text-error">
                -{currency}
                {calculateVoidTotal().toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Restoration Notice */}
      <div className="flex items-center gap-2 text-sm text-base-content/70">
        <Package className="w-4 h-4" />
        <span>
          Inventory quantities will be automatically restored for voided items
          with inventory links.
        </span>
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
          className="btn btn-error"
          disabled={loading || selectedItems.length === 0}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Voiding...
            </>
          ) : (
            `Void ${selectedItems.length} Item(s)`
          )}
        </button>
      </div>
    </div>
  );
};

export default VoidOrderItemsModalBody;
