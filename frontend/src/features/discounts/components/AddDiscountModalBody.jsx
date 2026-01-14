// frontend/src/features/discounts/components/AddDiscountModalBody.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { createDiscount, updateDiscount } from "../discountsSlice";
import { fetchAllMenuItems } from "../../menuItems/menuItemsSlice";
import { fetchAllCategories } from "../../categories/categoriesSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import { Percent, DollarSign, Gift, Clock, PlusCircle } from "lucide-react";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const AddDiscountModalBody = ({ extraObject, closeModal: close }) => {
  const dispatch = useDispatch();
  const isEdit = !!extraObject?._id;

  const menuItems = useSelector((state) => state.menuItems.menuItems || []);
  const categories = useSelector((state) => state.categories.categories || []);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "percentage",
    value: "",
    scope: "all",
    applicableCategories: [],
    applicableItems: [],
    isActive: true,
    startDate: "",
    endDate: "",
    isHappyHour: false,
    happyHourConfig: {
      daysOfWeek: [],
      startTime: "",
      endTime: "",
    },
    bogoConfig: {
      buyQuantity: 1,
      getQuantity: 1,
      getDiscountPercent: 100,
      applicableItems: [],
    },
    minimumOrderAmount: "",
    maximumDiscountAmount: "",
    usageLimit: "",
    applicableOrderTypes: ["dine-in", "takeaway", "delivery"],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAllMenuItems());
    dispatch(fetchAllCategories());

    if (isEdit && extraObject) {
      setFormData({
        ...extraObject,
        startDate: extraObject.startDate
          ? extraObject.startDate.slice(0, 10)
          : "",
        endDate: extraObject.endDate ? extraObject.endDate.slice(0, 10) : "",
        value: extraObject.value?.toString() || "",
        minimumOrderAmount: extraObject.minimumOrderAmount?.toString() || "",
        maximumDiscountAmount:
          extraObject.maximumDiscountAmount?.toString() || "",
        usageLimit: extraObject.usageLimit?.toString() || "",
      });
    }
  }, [dispatch, isEdit, extraObject]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleHappyHourChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      happyHourConfig: {
        ...prev.happyHourConfig,
        [field]: value,
      },
    }));
  };

  const handleBogoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      bogoConfig: {
        ...prev.bogoConfig,
        [field]: value,
      },
    }));
  };

  const toggleDayOfWeek = (day) => {
    setFormData((prev) => {
      const days = prev.happyHourConfig.daysOfWeek || [];
      const newDays = days.includes(day)
        ? days.filter((d) => d !== day)
        : [...days, day];
      return {
        ...prev,
        happyHourConfig: {
          ...prev.happyHourConfig,
          daysOfWeek: newDays,
        },
      };
    });
  };

  const toggleOrderType = (type) => {
    setFormData((prev) => {
      const types = prev.applicableOrderTypes || [];
      const newTypes = types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type];
      return { ...prev, applicableOrderTypes: newTypes };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = "Valid discount value is required";
    }
    if (formData.type === "percentage" && parseFloat(formData.value) > 100) {
      newErrors.value = "Percentage cannot exceed 100%";
    }
    if (formData.applicableOrderTypes.length === 0) {
      newErrors.orderTypes = "Select at least one order type";
    }
    if (formData.isHappyHour) {
      if (
        !formData.happyHourConfig.startTime ||
        !formData.happyHourConfig.endTime
      ) {
        newErrors.happyHour = "Happy hour times are required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    const payload = {
      ...formData,
      value: parseFloat(formData.value),
      minimumOrderAmount: formData.minimumOrderAmount
        ? parseFloat(formData.minimumOrderAmount)
        : 0,
      maximumDiscountAmount: formData.maximumDiscountAmount
        ? parseFloat(formData.maximumDiscountAmount)
        : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    };

    try {
      if (isEdit) {
        await dispatch(
          updateDiscount({ id: extraObject._id, data: payload })
        ).unwrap();
        dispatch(
          showNotification({
            message: "Discount updated successfully",
            status: 1,
          })
        );
      } else {
        await dispatch(createDiscount(payload)).unwrap();
        dispatch(
          showNotification({
            message: "Discount created successfully",
            status: 1,
          })
        );
      }
      dispatch(closeModal());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to save discount",
          status: 0,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddNewCategory = () => {
    dispatch(
      openModal({
        title: "Add New Category",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_CATEGORY,
        size: "xl",
      })
    );
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text font-medium">Discount Name *</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input input-bordered ${
              errors.name ? "input-error" : ""
            }`}
            placeholder="e.g., Weekend Special, Happy Hour"
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </div>

        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered"
            rows="2"
            placeholder="Optional description"
          />
        </div>
      </div>

      {/* Discount Type */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Discount Type *</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: "percentage", icon: Percent, label: "Percentage" },
            { type: "fixed", icon: DollarSign, label: "Fixed Amount" },
            { type: "bogo", icon: Gift, label: "BOGO" },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type }))}
              className={`btn ${
                formData.type === type ? "btn-primary" : "btn-outline"
              } flex-col h-auto py-3`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Value */}
      {formData.type !== "bogo" && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Discount Value *{" "}
              {formData.type === "percentage" ? "(%)" : `(${currency})`}
            </span>
          </label>
          <FormattedNumberInput
            name="value"
            value={formData.value}
            onChange={handleChange}
            className={`input input-bordered ${
              errors.value ? "input-error" : ""
            }`}
            placeholder={
              formData.type === "percentage" ? "e.g., 10" : "e.g., 5.00"
            }
          />
          {errors.value && <ErrorText>{errors.value}</ErrorText>}
        </div>
      )}

      {/* BOGO Config */}
      {formData.type === "bogo" && (
        <div className="bg-base-200 p-4 rounded-lg space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Gift className="w-4 h-4" />
            BOGO Configuration
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Buy Quantity</span>
              </label>
              <input
                type="number"
                value={formData.bogoConfig.buyQuantity}
                onChange={(e) =>
                  handleBogoChange("buyQuantity", parseInt(e.target.value) || 1)
                }
                className="input input-bordered input-sm"
                min="1"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Get Quantity</span>
              </label>
              <input
                type="number"
                value={formData.bogoConfig.getQuantity}
                onChange={(e) =>
                  handleBogoChange("getQuantity", parseInt(e.target.value) || 1)
                }
                className="input input-bordered input-sm"
                min="1"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Discount %</span>
              </label>
              <input
                type="number"
                value={formData.bogoConfig.getDiscountPercent}
                onChange={(e) =>
                  handleBogoChange(
                    "getDiscountPercent",
                    parseInt(e.target.value) || 100
                  )
                }
                className="input input-bordered input-sm"
                min="0"
                max="100"
              />
            </div>
          </div>
          <p className="text-xs text-base-content/60">
            Example: Buy {formData.bogoConfig.buyQuantity}, Get{" "}
            {formData.bogoConfig.getQuantity}{" "}
            {formData.bogoConfig.getDiscountPercent === 100
              ? "Free"
              : `at ${formData.bogoConfig.getDiscountPercent}% off`}
          </p>
        </div>
      )}

      {/* Happy Hour Toggle */}
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            name="isHappyHour"
            checked={formData.isHappyHour}
            onChange={handleChange}
            className="toggle toggle-warning"
          />
          <div>
            <span className="label-text font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Happy Hour Discount
            </span>
            <p className="text-xs text-base-content/60">
              Automatically applies during specified times
            </p>
          </div>
        </label>
      </div>

      {/* Happy Hour Config */}
      {formData.isHappyHour && (
        <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm">Days of Week</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleDayOfWeek(value)}
                  className={`btn btn-sm ${
                    formData.happyHourConfig.daysOfWeek?.includes(value)
                      ? "btn-warning"
                      : "btn-outline"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Start Time</span>
              </label>
              <input
                type="time"
                value={formData.happyHourConfig.startTime}
                onChange={(e) =>
                  handleHappyHourChange("startTime", e.target.value)
                }
                className="input input-bordered input-sm"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">End Time</span>
              </label>
              <input
                type="time"
                value={formData.happyHourConfig.endTime}
                onChange={(e) =>
                  handleHappyHourChange("endTime", e.target.value)
                }
                className="input input-bordered input-sm"
              />
            </div>
          </div>
          {errors.happyHour && <ErrorText>{errors.happyHour}</ErrorText>}
        </div>
      )}

      {/* Scope */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Applies To</span>
        </label>
        <SearchableSelect
          options={[
            { value: "all", name: "All Items" },
            { value: "category", name: "Specific Categories" },
            { value: "items", name: "Specific Items" },
          ]}
          value={formData.scope}
          onChange={handleChange}
          name="scope"
          placeholder="Select Scope"
          className=""
          valueKey="value"
          labelKey="name"
        />
      </div>

      {/* Category Selection */}
      {formData.scope === "category" && (
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm flex items-center gap-2">
              Select Categories
              <button
                type="button"
                onClick={openAddNewCategory}
                className="btn btn-ghost btn-xs text-primary"
                title="Add New Category"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </span>
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => {
                  setFormData((prev) => {
                    const cats = prev.applicableCategories || [];
                    const newCats = cats.includes(cat.name)
                      ? cats.filter((c) => c !== cat.name)
                      : [...cats, cat.name];
                    return { ...prev, applicableCategories: newCats };
                  });
                }}
                className={`btn btn-sm ${
                  formData.applicableCategories?.includes(cat.name)
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Item Selection */}
      {formData.scope === "items" && (
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">Select Menu Items</span>
          </label>
          <div className="max-h-40 overflow-y-auto p-2 border rounded-lg space-y-1">
            {menuItems.map((item) => (
              <label
                key={item._id}
                className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-1 rounded"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={formData.applicableItems?.includes(item._id)}
                  onChange={() => {
                    setFormData((prev) => {
                      const items = prev.applicableItems || [];
                      const newItems = items.includes(item._id)
                        ? items.filter((i) => i !== item._id)
                        : [...items, item._id];
                      return { ...prev, applicableItems: newItems };
                    });
                  }}
                />
                <span className="text-sm">{item.name}</span>
                <span className="text-xs text-base-content/60 ml-auto">
                  {currency}
                  {item.price}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Order Types */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Applicable Order Types</span>
        </label>
        <div className="flex gap-2">
          {["dine-in", "takeaway", "delivery"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleOrderType(type)}
              className={`btn btn-sm capitalize ${
                formData.applicableOrderTypes?.includes(type)
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.orderTypes && <ErrorText>{errors.orderTypes}</ErrorText>}
      </div>

      {/* Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">Min Order ({currency})</span>
          </label>
          <FormattedNumberInput
            name="minimumOrderAmount"
            value={formData.minimumOrderAmount}
            onChange={handleChange}
            className="input input-bordered input-sm"
            placeholder="0"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">
              Max Discount ({currency})
            </span>
          </label>
          <FormattedNumberInput
            name="maximumDiscountAmount"
            value={formData.maximumDiscountAmount}
            onChange={handleChange}
            className="input input-bordered input-sm"
            placeholder="No limit"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">Usage Limit</span>
          </label>
          <input
            type="number"
            name="usageLimit"
            value={formData.usageLimit}
            onChange={handleChange}
            className="input input-bordered input-sm"
            placeholder="Unlimited"
            min="1"
          />
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">Start Date</span>
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="input input-bordered input-sm"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">End Date</span>
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="input input-bordered input-sm"
          />
        </div>
      </div>

      {/* Active Toggle */}
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="toggle toggle-success"
          />
          <span className="label-text">Active</span>
        </label>
      </div>

      {/* Actions */}
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
          ) : isEdit ? (
            "Update Discount"
          ) : (
            "Create Discount"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddDiscountModalBody;
