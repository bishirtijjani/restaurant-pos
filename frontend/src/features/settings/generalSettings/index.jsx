import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../../components/Cards/TitleCard";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import CurrencySelect from "./components/CurrencySelect";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import {
  Settings,
  Printer as PrinterIcon,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  fetchSettings,
  updateSettings,
  resetSettings,
  selectSettings,
  selectSettingsOverrides,
  selectSettingsLoading,
  updateLocalSettings,
} from "./generalSettingsSlice";
import { showNotification } from "../../common/headerSlice";
import PaymentSettings from "../components/PaymentSettings";
import CommunicationSettings from "./components/CommunicationSettings";

const InheritedBadge = () => (
  <span className="badge badge-ghost badge-sm text-[10px] opacity-60 ml-2">
    Inherited
  </span>
);

const timezoneOptions = [
  { name: "UTC (Coordinated Universal Time)", value: "UTC" },
  { name: "America/New_York (Eastern Time)", value: "America/New_York" },
  { name: "America/Chicago (Central Time)", value: "America/Chicago" },
  { name: "America/Denver (Mountain Time)", value: "America/Denver" },
  { name: "America/Los_Angeles (Pacific Time)", value: "America/Los_Angeles" },
  { name: "Europe/London (GMT)", value: "Europe/London" },
  { name: "Europe/Paris (CET)", value: "Europe/Paris" },
  { name: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
  // Add more as needed
];

const GeneralSettings = () => {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const overrides = useSelector(selectSettingsOverrides) || {};
  const loading = useSelector(selectSettingsLoading);
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync state with Redux store
  useEffect(() => {
    if (settings) {
      setFormData({
        ...settings,
        paymentGateways: settings.paymentGateways || {
          stripe: {
            enabled: false,
            publishableKey: "",
            secretKey: "",
            accountId: "",
          },
        },
        communication: settings.communication || {
          email: { provider: "log", enabled: true, config: {} },
          sms: { provider: "log", enabled: false, config: {} },
          whatsapp: { provider: "log", enabled: false, config: {} },
        },
      });
    }
  }, [settings]);

  // Handle Input Change
  const handleInputChange = (e) => {
    // Handle both native events and custom objects from SearchableSelect/FormattedNumberInput
    const target = e.target || e;
    const { name, value, type, checked } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setHasChanges(true);
  };

  // Handle Submit
  const handleSubmit = async () => {
    try {
      await dispatch(updateSettings(formData)).unwrap();
      dispatch(
        showNotification({
          message: "Settings updated successfully",
          status: 1,
        })
      );
      setHasChanges(false);
    } catch (error) {
      dispatch(
        showNotification({
          message: error || "Failed to update settings",
          status: 0,
        })
      );
    }
  };

  // Handle payment settings change
  const handlePaymentChange = (newPaymentConfig) => {
    setFormData((prev) => ({
      ...prev,
      paymentGateways: newPaymentConfig,
    }));
    setHasChanges(true);
  };

  // Handle communication settings change
  const handleCommChange = (newCommConfig) => {
    setFormData((prev) => ({
      ...prev,
      communication: newCommConfig,
    }));
    setHasChanges(true);
  };

  // Handle Reset
  const handleReset = async () => {
    if (
      window.confirm("Are you sure you want to reset all settings to default?")
    ) {
      try {
        await dispatch(resetSettings()).unwrap();
        dispatch(
          showNotification({ message: "Settings reset to defaults", status: 1 })
        );
        setHasChanges(false);
      } catch (error) {
        dispatch(
          showNotification({
            message: error || "Failed to reset settings",
            status: 0,
          })
        );
      }
    }
  };

  if (!formData || !settings) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-32">
      {settings.brandName && (
        <div className="alert bg-base-100 shadow-sm border-base-200">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Brand Context
              </span>
              <h2 className="text-xl font-black text-primary">
                {settings.brandName}
              </h2>
            </div>
            {settings.organizationId && (
              <button
                className="btn btn-ghost btn-sm gap-2"
                onClick={() =>
                  dispatch(
                    showNotification({
                      message: "Organization Management coming soon!",
                      status: 1,
                    })
                  )
                }
              >
                <Settings className="w-4 h-4" />
                Brand Settings
              </button>
            )}
          </div>
        </div>
      )}

      <TitleCard title="Store-Specific Settings" topMargin="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Restaurant Name{" "}
                {!overrides.restaurantName && <InheritedBadge />}
              </span>
            </label>
            <input
              type="text"
              name="restaurantName"
              value={formData.restaurantName || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              autoComplete="off"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Phone Number {!overrides.restaurantPhone && <InheritedBadge />}
              </span>
            </label>
            <input
              type="text"
              name="restaurantPhone"
              value={formData.restaurantPhone || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              autoComplete="off"
            />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">
                Address {!overrides.restaurantAddress && <InheritedBadge />}
              </span>
            </label>
            <textarea
              name="restaurantAddress"
              value={formData.restaurantAddress || ""}
              onChange={handleInputChange}
              className="textarea textarea-bordered h-24"
              autoComplete="off"
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Email {!overrides.restaurantEmail && <InheritedBadge />}
              </span>
            </label>
            <input
              type="email"
              name="restaurantEmail"
              value={formData.restaurantEmail || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              autoComplete="off"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Motto / Tagline{" "}
                {!overrides.restaurantMotto && <InheritedBadge />}
              </span>
            </label>
            <input
              type="text"
              name="restaurantMotto"
              value={formData.restaurantMotto || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              autoComplete="off"
            />
          </div>
        </div>
      </TitleCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Localization */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="card-title">Localization</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Currency {!overrides.currency && <InheritedBadge />}
                  </span>
                </label>
                <CurrencySelect
                  value={formData.currency}
                  onChange={(newCurrency) => {
                    setFormData((prev) => ({
                      ...prev,
                      currency: newCurrency,
                    }));
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Date Format {!overrides.dateFormat && <InheritedBadge />}
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  name="dateFormat"
                  value={formData.dateFormat || "MM/DD/YYYY"}
                  onChange={handleInputChange}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Operational */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-secondary" />
              <h2 className="card-title">Operational</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Timezone {!overrides.timezone && <InheritedBadge />}
                  </span>
                </label>
                <SearchableSelect
                  options={timezoneOptions}
                  value={formData.timezone}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "timezone", value: e.target.value },
                    })
                  }
                  name="timezone"
                  placeholder="Select Timezone"
                  className=""
                  valueKey="value"
                  labelKey="name"
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications || false}
                    onChange={handleInputChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text font-medium">
                    Email Notifications{" "}
                    {!overrides.emailNotifications && <InheritedBadge />}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Printer Settings (Hybrid Mode) */}
        <div className="card bg-base-100 shadow-lg md:col-span-2">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <PrinterIcon className="w-5 h-5 text-primary" />
              <h2 className="card-title">Printer Configuration</h2>
            </div>

            <div className="alert alert-info shadow-sm mb-4">
              <div>
                <h3 className="font-bold text-xs">Hybrid Printing Strategy</h3>
                <div className="text-xs opacity-90">
                  Mode A: <b>Universal (Default)</b> uses standard browser
                  printing (Popup).
                  <br />
                  Mode B: <b>WebUSB (Turbo)</b> uses direct USB connection for
                  instant silent printing.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Printing Mode</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  name="printerSettings.mode"
                  value={formData.printerSettings?.mode || "browser"}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      printerSettings: {
                        ...prev.printerSettings,
                        mode: e.target.value,
                      },
                    }));
                    setHasChanges(true); // Ensure save button enables
                  }}
                >
                  <option value="browser">Universal (Browser Popup)</option>
                  <option value="webusb">Turbo (Direct USB)</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Paper Width</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.printerSettings?.paperWidth || "80mm"}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      printerSettings: {
                        ...prev.printerSettings,
                        paperWidth: e.target.value,
                      },
                    }));
                    setHasChanges(true);
                  }}
                >
                  <option value="80mm">80mm (Standard)</option>
                  <option value="58mm">58mm (Small)</option>
                </select>
              </div>

              {formData.printerSettings?.mode === "webusb" && (
                <div className="col-span-1 md:col-span-2">
                  <div className="card bg-base-200 border border-base-300">
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">USB Connection</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          {formData.printerSettings?.vendorId ? (
                            <div className="badge badge-success gap-2 p-3">
                              Connected:{" "}
                              {formData.printerSettings.deviceName ||
                                "USB Printer"}
                              (ID: {formData.printerSettings.vendorId})
                            </div>
                          ) : (
                            <div className="text-sm opacity-60">
                              No printer connected yet
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={async () => {
                            try {
                              const { printerService } = await import(
                                "../../../services/PrinterService"
                              );
                              const device = await printerService.connect();

                              setFormData((prev) => ({
                                ...prev,
                                printerSettings: {
                                  ...prev.printerSettings,
                                  vendorId: device.vendorId,
                                  productId: device.productId,
                                  deviceName: device.productName,
                                },
                              }));
                              setHasChanges(true); // Ensure save button enables
                            } catch (e) {
                              alert("Connection failed: " + e.message);
                            }
                          }}
                        >
                          Connect USB Device
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="md:col-span-2">
          <PaymentSettings
            config={formData.paymentGateways}
            onChange={handlePaymentChange}
          />
        </div>

        {/* Communication Settings */}
        <div className="md:col-span-2">
          <CommunicationSettings
            config={formData.communication}
            onChange={handleCommChange}
          />
        </div>
      </div>

      {/* Persistent Floating Save Bar */}
      <div className="fixed bottom-6 left-6 right-6 lg:left-80 z-40">
        <div
          className={`flex items-center justify-between bg-base-100/80 backdrop-blur-xl border border-base-300 p-4 rounded-2xl shadow-2xl transition-all duration-300 transform ${
            hasChanges
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2 text-sm ml-2">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
            <span className="font-medium">You have unsaved changes</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="btn btn-ghost btn-sm px-6 text-error hover:bg-error/10"
              disabled={loading}
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSubmit}
              className={`btn btn-primary btn-sm px-8 shadow-lg shadow-primary/20 ${
                loading ? "loading" : ""
              }`}
              disabled={loading}
            >
              {!loading && <Save className="w-4 h-4 mr-2" />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
