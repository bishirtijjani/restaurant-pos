import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInventoryItem, fetchInventoryItems } from "../inventorySlice";
import { fetchAllSuppliers } from "../../suppliers/suppliersSlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { fetchSettings } from "../../settings/generalSettings/generalSettingsSlice";
import SearchableSelect from "../../../components/Input/SearchableSelect";

const CATEGORIES = [
  "Raw Materials",
  "Beverages",
  "Packaging",
  "Cleaning Supplies",
  "Other",
];

const UNITS = ["kg", "g", "L", "ml", "pcs", "pack", "box", "bag"];

const AddInventoryModalBody = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.inventory);
  const suppliers = useSelector((state) => state.suppliers.suppliers || []);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    currentStock: 0,
    minStockLevel: 10,
    costPrice: "",
    supplier: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!settings) {
      dispatch(fetchSettings());
    }
    dispatch(fetchAllSuppliers());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.costPrice || parseFloat(formData.costPrice) < 0) {
      newErrors.costPrice = "Valid cost price is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await dispatch(createInventoryItem(formData)).unwrap();
      dispatch(
        showNotification({
          message: "Inventory item added successfully",
          status: 1,
        })
      );
      dispatch(fetchInventoryItems());
      dispatch(closeModal());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to add item",
          status: 0,
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Item Name *</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input input-bordered ${
              errors.name ? "input-error" : ""
            }`}
            placeholder="Enter item name"
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </div>

        {/* SKU */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">SKU (Optional)</span>
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="input input-bordered"
            placeholder="e.g., ITM-001"
          />
        </div>

        {/* Category */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Category *</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`select select-bordered ${
              errors.category ? "select-error" : ""
            }`}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <ErrorText>{errors.category}</ErrorText>}
        </div>

        {/* Unit */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Unit *</span>
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className={`select select-bordered ${
              errors.unit ? "select-error" : ""
            }`}
          >
            <option value="">Select unit</option>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {errors.unit && <ErrorText>{errors.unit}</ErrorText>}
        </div>

        {/* Current Stock */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Current Stock</span>
          </label>
          <FormattedNumberInput
            name="currentStock"
            value={formData.currentStock}
            onChange={handleChange}
            className="input input-bordered"
            min="0"
            step="0.01"
          />
        </div>

        {/* Min Stock Level */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Minimum Stock Level</span>
          </label>
          <FormattedNumberInput
            name="minStockLevel"
            value={formData.minStockLevel}
            onChange={handleChange}
            className="input input-bordered"
            min="0"
            step="0.01"
          />
        </div>

        {/* Cost Price */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Cost Price ({currency}) *</span>
          </label>
          <FormattedNumberInput
            name="costPrice"
            value={formData.costPrice}
            onChange={handleChange}
            className={`input input-bordered ${
              errors.costPrice ? "input-error" : ""
            }`}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          {errors.costPrice && <ErrorText>{errors.costPrice}</ErrorText>}
        </div>

        {/* Supplier */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Supplier (Optional)</span>
          </label>
          <SearchableSelect
            options={suppliers}
            value={formData.supplier}
            onChange={(e) =>
              // SearchableSelect currently emits an object like:
              // { target: { name: "productId", value: optionId } }
              // map that into the same shape handleChange expects:
              handleChange({
                target: { name: "supplier", value: e?.target?.value },
              })
            }
            placeholder="Select supplier"
            className=""
            isLoading={false}
          />
        </div>

        {/* Notes */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Notes (Optional)</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="textarea textarea-bordered"
            rows="3"
            placeholder="Additional notes about this item..."
          />
        </div>
      </div>

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
              Adding...
            </>
          ) : (
            "Add Item"
          )}
        </button>
      </div>
    </form>
  );
};

export default AddInventoryModalBody;
