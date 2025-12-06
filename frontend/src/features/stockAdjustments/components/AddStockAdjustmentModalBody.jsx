import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import { fetchInventoryItems } from "../../inventory/inventorySlice";
import {
  createStockAdjustment,
  fetchStockAdjustments,
} from "../stockAdjustmentsSlice";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  STOCK_ADJUSTMENT_TYPES,
  STOCK_ADJUSTMENT_REASONS,
} from "../../../utils/globalConstantUtil";

const AddStockAdjustmentModalBody = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.stockAdjustments);
  const inventoryItems = useSelector((state) => state.inventory.items || []);

  const inventoryOptions = [
    { value: "", name: "Select item" },
    ...inventoryItems.map(item => ({
      value: item._id,
      name: `${item.name} - Current: ${item.currentStock} ${item.unit}`
    }))
  ];

  const typeOptions = [
    { value: "", name: "Select type" },
    ...STOCK_ADJUSTMENT_TYPES.map(t => ({ value: t.value, name: t.label }))
  ];

  const reasonOptions = [
    { value: "", name: "Select reason" },
    ...STOCK_ADJUSTMENT_REASONS.map(r => ({ value: r.value, name: r.label }))
  ];

  const [formData, setFormData] = useState({
    inventoryItem: "",
    type: "",
    reason: "",
    quantity: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    dispatch(fetchInventoryItems());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "inventoryItem") {
      const item = inventoryItems.find((i) => i._id === value);
      setSelectedItem(item);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.inventoryItem) newErrors.inventoryItem = "Item is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.reason) newErrors.reason = "Reason is required";

    const quantity = parseFloat(formData.quantity);
    if (!formData.quantity || quantity <= 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    // For subtraction, check if enough stock
    if (formData.type === "subtraction" && selectedItem) {
      if (quantity > selectedItem.currentStock) {
        newErrors.quantity = `Cannot subtract ${quantity}. Only ${selectedItem.currentStock} available.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(
        createStockAdjustment({
          ...formData,
          quantity: parseFloat(formData.quantity),
        })
      ).unwrap();

      dispatch(
        showNotification({
          message: "Stock adjustment created successfully",
          status: 1,
        })
      );
      dispatch(fetchStockAdjustments());
      dispatch(closeModal());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to create adjustment",
          status: 0,
        })
      );
    }
  };

  const getNewStockPreview = () => {
    if (!selectedItem || !formData.quantity || !formData.type) return null;

    const quantity = parseFloat(formData.quantity);
    const current = selectedItem.currentStock;
    let newStock;

    switch (formData.type) {
      case "addition":
        newStock = current + quantity;
        break;
      case "subtraction":
        newStock = current - quantity;
        break;
      case "correction":
        newStock = quantity;
        break;
      default:
        return null;
    }

    return (
      <div className="alert alert-info mt-4">
        <div>
          <div>
            <span>Current Stock: </span>
            <span className="font-semibold">
              {" "}
              {current} {selectedItem.unit}
            </span>
          </div>
          <div className="">
            <span>New Stock: </span>
            <span className="font-semibold text-lg ">
              {newStock} {selectedItem.unit}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Inventory Item *</span>
        </label>
        <SearchableSelect
          options={inventoryOptions}
          value={formData.inventoryItem}
          onChange={handleChange}
          name="inventoryItem"
          placeholder="Select item"
          className={errors.inventoryItem ? "border-error" : ""}
          valueKey="value"
          labelKey="name"
        />
        {errors.inventoryItem && <ErrorText>{errors.inventoryItem}</ErrorText>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Adjustment Type *</span>
          </label>
          <SearchableSelect
            options={typeOptions}
            value={formData.type}
            onChange={handleChange}
            name="type"
            placeholder="Select type"
            className={errors.type ? "border-error" : ""}
            valueKey="value"
            labelKey="name"
          />
          {errors.type && <ErrorText>{errors.type}</ErrorText>}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Reason *</span>
          </label>
          <SearchableSelect
            options={reasonOptions}
            value={formData.reason}
            onChange={handleChange}
            name="reason"
            placeholder="Select reason"
            className={errors.reason ? "border-error" : ""}
            valueKey="value"
            labelKey="name"
          />
          {errors.reason && <ErrorText>{errors.reason}</ErrorText>}
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">
            Quantity * {selectedItem && `(${selectedItem.unit})`}
          </span>
        </label>
        <FormattedNumberInput
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className={`input input-bordered ${
            errors.quantity ? "input-error" : ""
          }`}
          placeholder={
            formData.type === "correction"
              ? "Enter exact stock quantity"
              : "Enter quantity to adjust"
          }
          min="0"
          step="0.01"
        />
        {errors.quantity && <ErrorText>{errors.quantity}</ErrorText>}
        {formData.type === "correction" && (
          <label className="label">
            <span className="label-text-alt">
              This will set the stock to exactly this amount
            </span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Notes (Optional)</span>
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="textarea textarea-bordered"
          rows="3"
          placeholder="Additional notes about this adjustment..."
        />
      </div>

      {getNewStockPreview()}

      <div className="modal-action">
        <button
          type="button"
          onClick={() => dispatch(closeModal())}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Creating...
            </>
          ) : (
            "Create Adjustment"
          )}
        </button>
      </div>
    </form>
  );
};

export default AddStockAdjustmentModalBody;
