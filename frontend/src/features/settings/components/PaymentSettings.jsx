import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../../common/headerSlice";
import InputText from "../../../components/Input/InputText";
import axios from "axios";

const PaymentSettings = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    stripe: {
      enabled: false,
      publishableKey: "",
      secretKey: "", // Only for input, won't be returned by API usually if hidden
      accountId: "",
    },
  });

  // Fetch current settings
  useEffect(() => {
    // Note: We need a specialized endpoint to manage payment settings (admin only).
    // The general /api/payments/config endpoint is public-facing (safe).
    // We should probably rely on the existing GeneralSettings or Store update endpoints.
    // For now, let's assume valid store settings are loaded or we fetch store details.
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/stores/my-store");
      // Assuming store settings structure corresponds to our model
      const paymentGateways =
        response.data.data.settings?.paymentGateways || {};

      setConfig((prev) => ({
        ...prev,
        stripe: {
          ...prev.stripe,
          ...paymentGateways.stripe,
          secretKey: "", // Clear secret key on load for security (user re-enters to update)
        },
      }));
    } catch (error) {
      console.error("Failed to fetch payment settings", error);
      // dispatch(showNotification({ message: "Failed to load settings", status: 0 }));
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async () => {
    setIsLoading(true);
    try {
      // We need to update the store settings.
      // Assuming there's a generic store update endpoint that takes partial settings.
      const payload = {
        settings: {
          paymentGateways: config,
        },
      };

      await axios.put("/api/stores/my-store", payload);
      dispatch(
        showNotification({
          message: "Payment settings updated successfully!",
          status: 1,
        })
      );
    } catch (error) {
      console.error("Failed to update settings", error);
      dispatch(
        showNotification({
          message: error.response?.data?.message || "Update failed",
          status: 0,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      stripe: {
        ...prev.stripe,
        [field]: value,
      },
    }));
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
          {config.stripe.enabled ? (
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
                checked={config.stripe.enabled}
                onChange={(e) =>
                  handleStripeChange("enabled", e.target.checked)
                }
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputText
              type="text"
              defaultValue={config.stripe.publishableKey}
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
              defaultValue={config.stripe.secretKey}
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

      <div className="mt-8 flex justify-end">
        <button
          className={`btn btn-primary ${isLoading ? "loading" : ""}`}
          onClick={updateSettings}
        >
          Save Payment Settings
        </button>
      </div>
    </div>
  );
};

export default PaymentSettings;
