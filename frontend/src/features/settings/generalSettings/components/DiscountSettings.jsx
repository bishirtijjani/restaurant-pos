// frontend/src/features/settings/generalSettings/components/DiscountSettings.jsx
import React from "react";
import FormattedNumberInput from "../../../../components/Input/FormattedNumberInput";
import { Tag, Percent, DollarSign } from "lucide-react";

const DiscountSettings = ({ formData, onDiscountChange, currency }) => {
  const handleChange = (field, value) => {
    onDiscountChange({
      ...formData.globalDiscount,
      [field]: value,
    });
  };

  const toggleOrderType = (type) => {
    const types = formData.globalDiscount?.applicableOrderTypes || [];
    const newTypes = types.includes(type)
      ? types.filter((t) => t !== type)
      : [...types, type];
    handleChange("applicableOrderTypes", newTypes);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-lg md:text-xl">
          <Tag className="w-6 h-6" />
          Global Discount
        </h2>
        <p className="text-sm text-base-content/70">
          Set a store-wide discount that applies when no other discount is
          active
        </p>

        <div className="form-control mt-4">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={formData.globalDiscount?.enabled || false}
              onChange={(e) => handleChange("enabled", e.target.checked)}
            />
            <span className="label-text font-medium">
              Enable Global Discount
            </span>
          </label>
        </div>

        {formData.globalDiscount?.enabled && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Discount Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.globalDiscount?.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Store Discount"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Discount Type</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange("type", "percentage")}
                    className={`btn flex-1 ${
                      formData.globalDiscount?.type === "percentage"
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    <Percent className="w-4 h-4 mr-1" />
                    Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("type", "fixed")}
                    className={`btn flex-1 ${
                      formData.globalDiscount?.type === "fixed"
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Fixed
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Value{" "}
                    {formData.globalDiscount?.type === "percentage"
                      ? "(%)"
                      : `(${currency})`}
                  </span>
                </label>
                <FormattedNumberInput
                  className="input input-bordered"
                  value={formData.globalDiscount?.value || 0}
                  onChange={(e) =>
                    handleChange("value", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  max={
                    formData.globalDiscount?.type === "percentage"
                      ? 100
                      : undefined
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Discount ({currency})</span>
                </label>
                <FormattedNumberInput
                  className="input input-bordered"
                  value={formData.globalDiscount?.maxDiscount || ""}
                  onChange={(e) =>
                    handleChange(
                      "maxDiscount",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="No limit"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Min Order ({currency})</span>
                </label>
                <FormattedNumberInput
                  className="input input-bordered"
                  value={formData.globalDiscount?.minimumOrderAmount || 0}
                  onChange={(e) =>
                    handleChange(
                      "minimumOrderAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Apply to Order Types
                </span>
              </label>
              <div className="flex gap-2">
                {["dine-in", "takeaway", "delivery"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleOrderType(type)}
                    className={`btn btn-sm capitalize ${
                      formData.globalDiscount?.applicableOrderTypes?.includes(
                        type
                      )
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountSettings;
