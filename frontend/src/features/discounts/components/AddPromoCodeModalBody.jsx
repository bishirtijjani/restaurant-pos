// frontend/src/features/discounts/components/AddPromoCodeModalBody.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { createPromoCode, updatePromoCode } from "../discountsSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { Tag, Percent, DollarSign, Copy, RefreshCw } from "lucide-react";

const generateRandomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const AddPromoCodeModalBody = ({ extraObject, closeModal: close }) => {
  const dispatch = useDispatch();
  const isEdit = !!extraObject?._id;

  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderAmount: "",
    maximumDiscountAmount: "",
    usageLimit: "",
    usageLimitPerCustomer: "",
    isActive: true,
    startDate: "",
    endDate: "",
    applicableOrderTypes: ["dine-in", "takeaway", "delivery"],
    stackable: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && extraObject) {
      setFormData({
        ...extraObject,
        startDate: extraObject.startDate
          ? extraObject.startDate.slice(0, 10)
          : "",
        endDate: extraObject.endDate ? extraObject.endDate.slice(0, 10) : "",
        discountValue: extraObject.discountValue?.toString() || "",
        minimumOrderAmount: extraObject.minimumOrderAmount?.toString() || "",
        maximumDiscountAmount:
          extraObject.maximumDiscountAmount?.toString() || "",
        usageLimit: extraObject.usageLimit?.toString() || "",
        usageLimitPerCustomer:
          extraObject.usageLimitPerCustomer?.toString() || "",
      });
    }
  }, [isEdit, extraObject]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleGenerateCode = () => {
    setFormData((prev) => ({ ...prev, code: generateRandomCode() }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formData.code);
    dispatch(showNotification({ message: "Code copied!", status: 1 }));
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

    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (formData.code.length < 3)
      newErrors.code = "Code must be at least 3 characters";
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = "Valid discount value is required";
    }
    if (
      formData.discountType === "percentage" &&
      parseFloat(formData.discountValue) > 100
    ) {
      newErrors.discountValue = "Percentage cannot exceed 100%";
    }
    if (formData.applicableOrderTypes.length === 0) {
      newErrors.orderTypes = "Select at least one order type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    const payload = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      discountValue: parseFloat(formData.discountValue),
      minimumOrderAmount: formData.minimumOrderAmount
        ? parseFloat(formData.minimumOrderAmount)
        : 0,
      maximumDiscountAmount: formData.maximumDiscountAmount
        ? parseFloat(formData.maximumDiscountAmount)
        : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      usageLimitPerCustomer: formData.usageLimitPerCustomer
        ? parseInt(formData.usageLimitPerCustomer)
        : null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    };

    try {
      if (isEdit) {
        await dispatch(
          updatePromoCode({ id: extraObject._id, data: payload })
        ).unwrap();
        dispatch(
          showNotification({
            message: "Promo code updated successfully",
            status: 1,
          })
        );
      } else {
        await dispatch(createPromoCode(payload)).unwrap();
        dispatch(
          showNotification({
            message: "Promo code created successfully",
            status: 1,
          })
        );
      }
      dispatch(closeModal());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to save promo code",
          status: 0,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Promo Code */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Promo Code *</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-3 w-5 h-5 text-base-content/50" />
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`input input-bordered w-full pl-10 uppercase font-mono ${
                errors.code ? "input-error" : ""
              }`}
              placeholder="e.g., SAVE20"
              maxLength={20}
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateCode}
            className="btn btn-outline btn-square"
            title="Generate random code"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {formData.code && (
            <button
              type="button"
              onClick={handleCopyCode}
              className="btn btn-outline btn-square"
              title="Copy code"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
        {errors.code && <ErrorText>{errors.code}</ErrorText>}
      </div>

      {/* Description */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="textarea textarea-bordered"
          rows="2"
          placeholder="e.g., Get 20% off your first order!"
        />
      </div>

      {/* Discount Type & Value */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Discount Type</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, discountType: "percentage" }))
              }
              className={`btn flex-1 ${
                formData.discountType === "percentage"
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >
              <Percent className="w-4 h-4 mr-1" />
              Percentage
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, discountType: "fixed" }))
              }
              className={`btn flex-1 ${
                formData.discountType === "fixed"
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Fixed
            </button>
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Value{" "}
              {formData.discountType === "percentage" ? "(%)" : `(${currency})`}{" "}
              *
            </span>
          </label>
          <FormattedNumberInput
            name="discountValue"
            value={formData.discountValue}
            onChange={handleChange}
            className={`input input-bordered ${
              errors.discountValue ? "input-error" : ""
            }`}
            placeholder={
              formData.discountType === "percentage"
                ? "e.g., 20"
                : "e.g., 10.00"
            }
          />
          {errors.discountValue && (
            <ErrorText>{errors.discountValue}</ErrorText>
          )}
        </div>
      </div>

      {/* Constraints */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">
              Min Order Amount ({currency})
            </span>
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
      </div>

      {/* Usage Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">Total Usage Limit</span>
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
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">Per Customer Limit</span>
          </label>
          <input
            type="number"
            name="usageLimitPerCustomer"
            value={formData.usageLimitPerCustomer}
            onChange={handleChange}
            className="input input-bordered input-sm"
            placeholder="Unlimited"
            min="1"
          />
        </div>
      </div>

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

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
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
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              name="stackable"
              checked={formData.stackable}
              onChange={handleChange}
              className="toggle toggle-info"
            />
            <span className="label-text">Stackable with other discounts</span>
          </label>
        </div>
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
            "Update Promo Code"
          ) : (
            "Create Promo Code"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddPromoCodeModalBody;
