import React, { useState, useEffect } from "react";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import { useDispatch, useSelector } from "react-redux";
import { updateInventoryItem } from "../inventorySlice";
import { fetchAllSuppliers } from "../../suppliers/suppliersSlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { fetchSettings } from "../../settings/generalSettings/generalSettingsSlice";
import MultiSelect from "../../../components/Input/MultiSelect";
import { ALLERGENS, DIETARY_TAGS } from "../../../utils/dietaryConstants";

import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
} from "../../../utils/globalConstantUtil";

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
    allergens: [],
    dietaryTags: [],
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
        allergens: item.allergens || [],
        dietaryTags: item.dietaryTags || [],
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

  const categoryOptions = [
    { value: "", name: "Select category" },
    ...INVENTORY_CATEGORIES.map(cat => ({ value: cat, name: cat }))
  ];

  const unitOptions = [
    { value: "", name: "Select unit" },
    ...INVENTORY_UNITS.map(unit => ({ value: unit, name: unit }))
  ];

  const supplierOptions = [
    { value: "", name: "Select supplier" },
    ...suppliers.map(s => ({ value: s._id, name: s.name }))
  ];

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
          <SearchableSelect
            options={categoryOptions}
            value={formData.category}
            onChange={handleChange}
            name="category"
            placeholder="Select category"
            className={errors.category ? "border-error" : ""}
            valueKey="value"
            labelKey="name"
          />
          {errors.category && <ErrorText>{errors.category}</ErrorText>}
        </div>

        {/* Unit */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Unit *</span>
          </label>
          <SearchableSelect
            options={unitOptions}
            value={formData.unit}
            onChange={handleChange}
            name="unit"
            placeholder="Select unit"
            className={errors.unit ? "border-error" : ""}
            valueKey="value"
            labelKey="name"
          />
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
          <SearchableSelect
            options={supplierOptions}
            value={formData.supplier}
            onChange={handleChange}
            name="supplier"
            placeholder="Select supplier"
            className=""
            valueKey="value"
            labelKey="name"
          />
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

        {/* Allergens */}
        <div className="form-control md:col-span-1">
          <label className="label">
            <span className="label-text">Allergens</span>
          </label>
          <MultiSelect
            options={ALLERGENS.map((a) => ({ value: a, name: a }))}
            value={formData.allergens}
            onChange={handleChange}
            name="allergens"
            placeholder="Select allergens"
          />
        </div>

        {/* Dietary Tags */}
        <div className="form-control md:col-span-1">
          <label className="label">
            <span className="label-text">Dietary Tags</span>
          </label>
          <MultiSelect
            options={DIETARY_TAGS.map((t) => ({ value: t, name: t }))}
            value={formData.dietaryTags}
            onChange={handleChange}
            name="dietaryTags"
            placeholder="Select tags (e.g. Halal)"
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
