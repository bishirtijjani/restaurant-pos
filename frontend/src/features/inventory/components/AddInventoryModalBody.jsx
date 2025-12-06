import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInventoryItem } from "../inventorySlice";
import { fetchAllSuppliers } from "../../suppliers/suppliersSlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { fetchSettings } from "../../settings/generalSettings/generalSettingsSlice";
import SearchableSelect from "../../../components/Input/SearchableSelect";

const CATEGORIES = [
  { value: "Raw Materials", name: "Raw Materials" },
  { value: "Beverages", name: "Beverages" },
  { value: "Packaging", name: "Packaging" },
  { value: "Cleaning Supplies", name: "Cleaning Supplies" },
  { value: "Other", name: "Other" },
];

const UNITS = [
  { value: "kg", name: "kg" },
  { value: "g", name: "g" },
  { value: "L", name: "L" },
  { value: "ml", name: "ml" },
  { value: "pcs", name: "pcs" },
  { value: "pack", name: "pack" },
  { value: "box", name: "box" },
  { value: "bag", name: "bag" },
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!settings) {
      dispatch(fetchSettings());
    }
    dispatch(fetchAllSuppliers());
  }, [dispatch, settings]);

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

    // Prevent double submission
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate submit");
      return;
    }

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(createInventoryItem(formData)).unwrap();

      // Show success notification
      dispatch(
        showNotification({
          message: "Inventory item added successfully",
          status: 1,
        })
      );

      // Close modal
      dispatch(closeModal());
    } catch (error) {
      console.error("Create inventory item error:", error);
      dispatch(
        showNotification({
          message: error.message || "Failed to add item",
          status: 0,
        })
      );
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>

        {/* Category */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Category *</span>
          </label>
          <SearchableSelect
            options={CATEGORIES}
            value={formData.category}
            onChange={handleChange}
            name="category"
            placeholder="Select category"
            className={`w-full ${errors.category ? "border-error" : ""}`}
            valueKey="value"
            labelKey="name"
            disabled={isSubmitting}
          />
          {errors.category && <ErrorText>{errors.category}</ErrorText>}
        </div>

        {/* Unit */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Unit *</span>
          </label>
          <SearchableSelect
            options={UNITS}
            value={formData.unit}
            onChange={handleChange}
            name="unit"
            placeholder="Select unit"
            className={`w-full ${errors.unit ? "border-error" : ""}`}
            valueKey="value"
            labelKey="name"
            disabled={isSubmitting}
          />
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            onChange={handleChange}
            name="supplier"
            placeholder="Select supplier"
            className=""
            isLoading={false}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="modal-action">
        <button
          type="button"
          onClick={() => dispatch(closeModal())}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
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
