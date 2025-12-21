import React from "react";
import InputText from "../../../components/Input/InputText";

const PaymentSettings = ({ config, onChange }) => {
  const handleStripeChange = (field, value) => {
    onChange({
      ...config,
      stripe: {
        ...config.stripe,
        [field]: value,
      },
    });
  };

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl mt-2">
      <div className="text-xl font-bold mb-4">Payment Integrations</div>
      <div className="divider"></div>

      {/* Stripe Integration */}
      <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title text-xl font-medium flex items-center gap-2">
          <span className="badge badge-lg">Stripe</span>
          {config?.stripe?.enabled ? (
            <div className="badge badge-success badge-sm">Active</div>
          ) : (
            <div className="badge badge-ghost badge-sm">Inactive</div>
          )}
        </div>
        <div className="collapse-content">
          <div className="form-control w-full max-w-xs mb-4">
            <label className="label cursor-pointer justify-start gap-4">
              <span className="label-text font-bold">
                Enable Stripe Payments
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={config?.stripe?.enabled || false}
                onChange={(e) =>
                  handleStripeChange("enabled", e.target.checked)
                }
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputText
              type="text"
              defaultValue={config?.stripe?.publishableKey || ""}
              updateType="publishableKey"
              containerStyle="mt-4"
              labelTitle="Publishable Key"
              updateFormValue={({ value }) =>
                handleStripeChange("publishableKey", value)
              }
              placeholder="pk_test_..."
            />

            <InputText
              type="password"
              defaultValue={config?.stripe?.secretKey || ""}
              updateType="secretKey"
              containerStyle="mt-4"
              labelTitle="Secret Key (Leave empty to keep unchanged)"
              updateFormValue={({ value }) =>
                handleStripeChange("secretKey", value)
              }
              placeholder="sk_test_..."
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Secret keys are stored securely and never returned by the API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
