// frontend/src/features/settings/generalSettings/components/TaxSettings.jsx
import React from "react";
import {
  ReceiptPercentIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const TaxSettings = ({ formData, onTaxChange, onServiceChange }) => {
  const handleTaxChange = (field, value) => {
    onTaxChange({
      ...formData.taxSettings,
      [field]: value,
    });
  };

  const handleServiceChange = (field, value) => {
    onServiceChange({
      ...formData.serviceCharge,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tax Configuration */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg md:text-xl">
            <ReceiptPercentIcon className="w-6 h-6" />
            Tax Configuration
          </h2>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={formData.taxSettings?.enabled || false}
                onChange={(e) => handleTaxChange("enabled", e.target.checked)}
              />
              <span className="label-text font-medium">Enable Tax</span>
            </label>
          </div>

          {formData.taxSettings?.enabled && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tax Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.taxSettings?.name || ""}
                    onChange={(e) => handleTaxChange("name", e.target.value)}
                    placeholder="e.g., VAT, GST, Sales Tax"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Global Tax Rate (%)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.taxSettings?.globalRate || 0}
                    onChange={(e) =>
                      handleTaxChange(
                        "globalRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Tax Calculation Mode
                  </span>
                </label>
                <div className="join join-vertical md:join-horizontal w-full">
                  <button
                    type="button"
                    className={`join-item btn btn-sm md:btn-md flex-1 ${
                      formData.taxSettings?.mode === "per-item"
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                    onClick={() => handleTaxChange("mode", "per-item")}
                  >
                    Per Item
                  </button>
                  <button
                    type="button"
                    className={`join-item btn btn-sm md:btn-md flex-1 ${
                      formData.taxSettings?.mode === "per-order"
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                    onClick={() => handleTaxChange("mode", "per-order")}
                  >
                    Per Order
                  </button>
                </div>
                <label className="label">
                  <span className="label-text-alt">
                    {formData.taxSettings?.mode === "per-item"
                      ? "Tax calculated individually for each item (supports custom rates)"
                      : "Single tax rate applied to order total"}
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.taxSettings?.includeInPrice || false}
                    onChange={(e) =>
                      handleTaxChange("includeInPrice", e.target.checked)
                    }
                  />
                  <div>
                    <span className="label-text font-medium">
                      Tax Included in Price
                    </span>
                    <p className="text-xs opacity-70">
                      Show prices with tax already included
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Charge Configuration */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg md:text-xl">
            <CurrencyDollarIcon className="w-6 h-6" />
            Service Charge
          </h2>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={formData.serviceCharge?.enabled || false}
                onChange={(e) =>
                  handleServiceChange("enabled", e.target.checked)
                }
              />
              <span className="label-text font-medium">
                Enable Service Charge
              </span>
            </label>
          </div>

          {formData.serviceCharge?.enabled && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Charge Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.serviceCharge?.name || ""}
                    onChange={(e) =>
                      handleServiceChange("name", e.target.value)
                    }
                    placeholder="e.g., Service Charge, Tip"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Rate (%)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.serviceCharge?.rate || 0}
                    onChange={(e) =>
                      handleServiceChange(
                        "rate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Apply To</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.serviceCharge?.applyTo || "all"}
                  onChange={(e) =>
                    handleServiceChange("applyTo", e.target.value)
                  }
                >
                  <option value="all">All Orders</option>
                  <option value="dine-in">Dine-in Only</option>
                  <option value="delivery">Delivery Only</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxSettings;
