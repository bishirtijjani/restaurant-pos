import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateInventoryItem } from "../inventorySlice";
import { fetchAllSuppliers } from "../../suppliers/suppliersSlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { fetchSettings } from "../../settings/generalSettings/generalSettingsSlice";

const CATEGORIES = [
  "Raw Materials",
  "Beverages",
  "Packaging",
  "Cleaning Supplies",
  "Other",
];

const UNITS = ["kg", "g", "L", "ml", "pcs", "pack", "box", "bag"];

const EditInventoryModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.inventory);
  const suppliers = useSelector((state) => state.suppliers.suppliers || []);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";
  const item = extraObject;

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    currentStock: 0,
    minStockLevel: 0,
    costPrice: "",
    supplier: "",
    notes: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!settings) {
      dispatch(fetchSettings());
    }
    dispatch(fetchAllSuppliers());

    if (item) {
      setFormData({
        name: item.name || "",
        sku: item.sku || "",
        category: item.category || "",
        unit: item.unit || "",
        currentStock: item.currentStock || 0,
        minStockLevel: item.minStockLevel || 0,
        costPrice: item.costPrice || "",
        supplier: item.supplier?._id || "",
        notes: item.notes || "",
        reason: "",
      });
    }
  }, [dispatch, item, settings]);

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
      await dispatch(
        updateInventoryItem({
          id: item._id,
          data: {
            ...formData,
            costPrice: parseFloat(formData.costPrice),
            currentStock: parseFloat(formData.currentStock),
            minStockLevel: parseFloat(formData.minStockLevel),
          },
        })
      ).unwrap();

      dispatch(
        showNotification({
          message: "Inventory item updated successfully",
          status: 1,
        })
      );

      dispatch(closeModal());
    } catch (error) {
      console.error("Update inventory item error:", error);
      dispatch(
        showNotification({
          message: error.message || "Failed to update item",
          status: 0,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
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
            <span className="label-text">SKU</span>
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
            <span className="label-text">Supplier</span>
          </label>
          <select
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="select select-bordered"
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Notes</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="textarea textarea-bordered"
            rows="2"
            placeholder="Additional notes..."
          />
        </div>

        {/* Reason for update */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Reason for Update</span>
          </label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="input input-bordered"
            placeholder="e.g., Price update, Corrected information"
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
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Updating...
            </>
          ) : (
            "Update Item"
          )}
        </button>
      </div>
    </div>
  );
};

export default EditInventoryModalBody;
