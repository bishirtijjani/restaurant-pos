// frontend/src/features/addOnGroups/components/AddAddOnGroupModalBody.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAddOnGroup, fetchAddOnGroups } from "../addOnGroupsSlice";
import { fetchInventoryItems } from "../../inventory/inventorySlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { Plus, Trash2, Package } from "lucide-react";

const AddAddOnGroupModalBody = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.addOnGroups);
  const inventoryItems = useSelector((state) => state.inventory.items || []);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectionType: "single",
    isRequired: false,
    minSelections: 0,
    maxSelections: null,
    items: [
      {
        name: "",
        price: "",
        isAvailable: true,
        inventoryItem: null,
        quantityUsed: 1,
      },
    ],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchInventoryItems());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      // Auto-adjust maxSelections for single type
      if (name === "selectionType" && value === "single") {
        updated.maxSelections = 1;
      }

      // If required, ensure minSelections is at least 1
      if (name === "isRequired" && checked) {
        updated.minSelections = Math.max(1, prev.minSelections);
      }

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));

    if (errors[`item_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`item_${index}_${field}`]: "" }));
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: "",
          price: "",
          isAvailable: true,
          inventoryItem: null,
          quantityUsed: 1,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Group name is required";

    if (formData.isRequired && formData.minSelections < 1) {
      newErrors.minSelections = "Required groups must have min >= 1";
    }

    if (
      formData.selectionType === "single" &&
      formData.maxSelections !== null &&
      formData.maxSelections > 1
    ) {
      newErrors.maxSelections = "Single selection cannot have max > 1";
    }

    formData.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item_${index}_name`] = "Item name is required";
      }
      if (item.price === "" || parseFloat(item.price) < 0) {
        newErrors[`item_${index}_price`] = "Valid price is required";
      }
    });

    if (formData.items.length === 0) {
      newErrors.items = "At least one add-on item is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        items: formData.items.map((item) => ({
          name: item.name,
          price: parseFloat(item.price),
          isAvailable: item.isAvailable,
          inventoryItem: item.inventoryItem || null,
          quantityUsed: parseFloat(item.quantityUsed) || 1,
        })),
        minSelections: parseInt(formData.minSelections) || 0,
        maxSelections:
          formData.maxSelections !== null
            ? parseInt(formData.maxSelections)
            : null,
      };

      await dispatch(createAddOnGroup(payload)).unwrap();
      dispatch(
        showNotification({
          message: "Add-on group created successfully",
          status: 1,
        })
      );
      dispatch(fetchAddOnGroups());
      dispatch(closeModal());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to create add-on group",
          status: 0,
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Group Name *</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input input-bordered ${
              errors.name ? "input-error" : ""
            }`}
            placeholder="e.g., Toppings, Size, Add Extra"
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Description (Optional)</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered"
            rows="2"
            placeholder="Brief description..."
          />
        </div>
      </div>

      <div className="divider">Selection Rules</div>

      {/* Selection Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Selection Type *</span>
          </label>
          <select
            name="selectionType"
            value={formData.selectionType}
            onChange={handleChange}
            className="select select-bordered"
          >
            <option value="single">Single (Choose One)</option>
            <option value="multiple">Multiple (Choose Many)</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Required Group?</span>
            <input
              type="checkbox"
              name="isRequired"
              checked={formData.isRequired}
              onChange={handleChange}
              className="checkbox checkbox-primary"
            />
          </label>
        </div>

        {formData.selectionType === "multiple" && (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Min Selections</span>
              </label>
              <input
                type="number"
                name="minSelections"
                value={formData.minSelections}
                onChange={handleChange}
                className={`input input-bordered ${
                  errors.minSelections ? "input-error" : ""
                }`}
                min="0"
              />
              {errors.minSelections && (
                <ErrorText>{errors.minSelections}</ErrorText>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Max Selections</span>
              </label>
              <input
                type="number"
                name="maxSelections"
                value={formData.maxSelections || ""}
                onChange={handleChange}
                className="input input-bordered"
                min="0"
                placeholder="Leave empty for unlimited"
              />
            </div>
          </>
        )}
      </div>

      <div className="divider">Add-On Items</div>

      {/* Add-On Items */}
      <div className="space-y-3">
        {formData.items.map((item, index) => (
          <div key={index} className="card bg-base-200 border border-base-300">
            <div className="card-body p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold">Item {index + 1}</h4>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name *</span>
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    className={`input input-bordered ${
                      errors[`item_${index}_name`] ? "input-error" : ""
                    }`}
                    placeholder="e.g., Extra Cheese"
                  />
                  {errors[`item_${index}_name`] && (
                    <ErrorText>{errors[`item_${index}_name`]}</ErrorText>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Price ({currency}) *</span>
                  </label>
                  <FormattedNumberInput
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                    className={`input input-bordered ${
                      errors[`item_${index}_price`] ? "input-error" : ""
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors[`item_${index}_price`] && (
                    <ErrorText>{errors[`item_${index}_price`]}</ErrorText>
                  )}
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Link to Inventory (Optional)
                    </span>
                  </label>
                  <select
                    value={item.inventoryItem || ""}
                    onChange={(e) =>
                      handleItemChange(index, "inventoryItem", e.target.value)
                    }
                    className="select select-bordered"
                  >
                    <option value="">No inventory link</option>
                    {inventoryItems.map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.name} ({inv.currentStock} {inv.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {item.inventoryItem && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Quantity Used</span>
                    </label>
                    <FormattedNumberInput
                      value={item.quantityUsed}
                      onChange={(e) =>
                        handleItemChange(index, "quantityUsed", e.target.value)
                      }
                      className="input input-bordered"
                      placeholder="1"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                <div className="form-control flex justify-center">
                  <label className="label cursor-pointer">
                    <span className="label-text mr-2">Available?</span>
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={(e) =>
                        handleItemChange(index, "isAvailable", e.target.checked)
                      }
                      className="checkbox checkbox-primary"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="btn btn-outline btn-sm w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {errors.items && <ErrorText>{errors.items}</ErrorText>}

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
            "Create Group"
          )}
        </button>
      </div>
    </form>
  );
};

export default AddAddOnGroupModalBody;
