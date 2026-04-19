// frontend/src/features/addOnGroups/components/EditAddOnGroupModalBody.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAddOnGroup, fetchAddOnGroups } from "../addOnGroupsSlice";
import { fetchInventoryItems } from "../../inventory/inventorySlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import MultiSelect from "../../../components/Input/MultiSelect";
import { DIETARY_TAGS, ALLERGENS } from "../../../utils/dietaryConstants";
import { Plus, Trash2, Package, Lock } from "lucide-react";

const EditAddOnGroupModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const group = extraObject;
  const { loading } = useSelector((state) => state.addOnGroups);
  const inventoryItems = useSelector((state) => state.inventory.items || []);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  // Brand-lock helpers
  const isBrandControlled = !!group?.masterId;
  const BRAND_TIP = "Brand-controlled. Edit this in the Brand Dashboard.";
  const BrandLockedField = ({ children }) => {
    if (!isBrandControlled) return children;
    return (
      <div className="tooltip tooltip-top w-full" data-tip={BRAND_TIP}>
        {children}
      </div>
    );
  };
  const BrandLockIcon = () =>
    isBrandControlled ? (
      <Lock className="w-3.5 h-3.5 text-base-content/40 ml-1.5 inline-block" />
    ) : null;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectionType: "single",
    isRequired: false,
    minSelections: 0,
    maxSelections: null,
    isActive: true,
    items: [],
    reason: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchInventoryItems());

    if (group) {
      setFormData({
        name: group.name || "",
        description: group.description || "",
        selectionType: group.selectionType || "single",
        isRequired: group.isRequired || false,
        minSelections: group.minSelections || 0,
        maxSelections: group.maxSelections,
        isActive: group.isActive !== false,
        items:
          group.items?.map((item) => ({
            _id: item._id,
            name: item.name,
            price: item.price,
            isAvailable: item.isAvailable !== false,
            inventoryItem: item.inventoryItem?._id || null,
            quantityUsed: item.quantityUsed || 1,
            allergens: item.allergens || [],
            dietaryTags: item.dietaryTags || [],
          })) || [],
        reason: "",
      });
    }
  }, [dispatch, group]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      if (name === "selectionType" && value === "single") {
        updated.maxSelections = 1;
      }

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
          allergens: [],
          dietaryTags: [],
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
        name: formData.name,
        description: formData.description,
        selectionType: formData.selectionType,
        isRequired: formData.isRequired,
        minSelections: parseInt(formData.minSelections) || 0,
        maxSelections:
          formData.maxSelections !== null
            ? parseInt(formData.maxSelections)
            : null,
        isActive: formData.isActive,
        items: formData.items.map((item) => ({
          _id: item._id,
          name: item.name,
          price: parseFloat(item.price),
          isAvailable: item.isAvailable,
          inventoryItem: item.inventoryItem || null,
          quantityUsed: parseFloat(item.quantityUsed) || 1,
          allergens: item.allergens || [],
          dietaryTags: item.dietaryTags || [],
        })),
        reason: formData.reason || "Updated add-on group",
      };

      await dispatch(
        updateAddOnGroup({ id: group._id, data: payload })
      ).unwrap();
      dispatch(
        showNotification({
          message: "Add-on group updated successfully",
          status: 1,
        })
      );
      dispatch(fetchAddOnGroups());
      dispatch(closeModal());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to update add-on group",
          status: 0,
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Brand-lock banner */}
      {isBrandControlled && (
        <div className="alert alert-warning py-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            This add-on group is managed by the Brand. Only brand admins can edit it.
          </span>
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4">
        <BrandLockedField>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Group Name * <BrandLockIcon /></span>
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
              disabled={isBrandControlled}
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </div>
        </BrandLockedField>

        <BrandLockedField>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description (Optional) <BrandLockIcon /></span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered"
              rows="2"
              placeholder="Brief description..."
              disabled={isBrandControlled}
            />
          </div>
        </BrandLockedField>

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Active?</span>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="checkbox checkbox-primary"
            />
          </label>
        </div>
      </div>

      <div className="divider">Selection Rules</div>

      {/* Selection Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BrandLockedField>
          <div className="form-control">
            <SearchableSelect
              options={[
                { value: "single", name: "Single (Choose One)" },
                { value: "multiple", name: "Multiple (Choose Many)" },
              ]}
              value={formData.selectionType}
              onChange={(e) => handleChange({ target: { name: "selectionType", value: e.target.value } })}
              name="selectionType"
              label={<>Selection Type * <BrandLockIcon /></>}
              placeholder="Select Type"
              className=""
              valueKey="value"
              labelKey="name"
              disabled={isBrandControlled}
            />
          </div>
        </BrandLockedField>

        <BrandLockedField>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Required Group? <BrandLockIcon /></span>
              <input
                type="checkbox"
                name="isRequired"
                checked={formData.isRequired}
                onChange={handleChange}
                className="checkbox checkbox-primary"
                disabled={isBrandControlled}
              />
            </label>
          </div>
        </BrandLockedField>

        {formData.selectionType === "multiple" && (
          <>
            <BrandLockedField>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Min Selections <BrandLockIcon /></span>
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
                  disabled={isBrandControlled}
                />
                {errors.minSelections && (
                  <ErrorText>{errors.minSelections}</ErrorText>
                )}
              </div>
            </BrandLockedField>

            <BrandLockedField>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Selections <BrandLockIcon /></span>
                </label>
                <input
                  type="number"
                  name="maxSelections"
                  value={formData.maxSelections || ""}
                  onChange={handleChange}
                  className="input input-bordered"
                  min="0"
                  placeholder="Leave empty for unlimited"
                  disabled={isBrandControlled}
                />
              </div>
            </BrandLockedField>
          </>
        )}
      </div>

      <div className="divider">Add-On Items</div>

      {/* Add-On Items */}
      <div className="space-y-3">
        {formData.items.map((item, index) => (
          <div key={index} className={`card bg-base-200 border ${ isBrandControlled ? 'border-warning/40 opacity-80' : 'border-base-300' }`}>
            <div className="card-body p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold">Item {index + 1}</h4>
                {formData.items.length > 1 && !isBrandControlled && (
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
                  <SearchableSelect
                    options={[
                      { _id: "", name: "No inventory link" },
                      ...inventoryItems
                    ]}
                    value={item.inventoryItem || ""}
                    onChange={(e) =>
                      handleItemChange(index, "inventoryItem", e.target.value)
                    }
                    name={`inventoryItem_${index}`}
                    placeholder="Select Inventory Item"
                    className=""
                    valueKey="_id"
                    labelKey="name"
                    formatLabel={(item) => item._id ? `${item.name} (${item.currentStock} ${item.unit})` : item.name}
                  />
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

                <div className="form-control flex justify-center mt-6">
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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Allergens</span>
                  </label>
                  <MultiSelect
                    options={ALLERGENS.map((a) => ({ value: a, name: a }))}
                    value={item.allergens}
                    onChange={(e) => handleItemChange(index, "allergens", e.target.value)}
                    name={`allergens_${index}`}
                    placeholder="Select allergens"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Dietary Tags</span>
                  </label>
                  <MultiSelect
                    options={DIETARY_TAGS.map((t) => ({ value: t, name: t }))}
                    value={item.dietaryTags}
                    onChange={(e) => handleItemChange(index, "dietaryTags", e.target.value)}
                    name={`dietaryTags_${index}`}
                    placeholder="Select tags"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="btn btn-outline btn-sm w-full gap-2"
          disabled={isBrandControlled}
          title={isBrandControlled ? BRAND_TIP : undefined}
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {errors.items && <ErrorText>{errors.items}</ErrorText>}

      {/* Reason */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Reason for Update (Optional)</span>
        </label>
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          className="input input-bordered"
          placeholder="e.g., Price adjustment, added new items"
        />
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
              Updating...
            </>
          ) : (
            "Update Group"
          )}
        </button>
      </div>
    </form>
  );
};

export default EditAddOnGroupModalBody;
