import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../../components/Cards/TitleCard";
import {
  Settings,
  Building2,
  DollarSign,
  AlertTriangle,
  Globe,
  RotateCcw,
  Save,
  MapPin,
  Phone,
  Quote,
  Mail,
} from "lucide-react";
import {
  fetchSettings,
  updateSettings,
  resetSettings,
  clearError,
  clearSuccess,
  selectSettings,
  selectSettingsLoading,
  selectSettingsError,
  selectSettingsSuccess,
} from "./generalSettingsSlice";
import { showNotification } from "../../common/headerSlice";
import CurrencySelect from "./components/CurrencySelect";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import TaxSettings from "./components/TaxSettings";
import { useAuth } from "../../../utils/permission";
import { openModal, closeModal } from "../../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../../utils/globalConstantUtil";

const GeneralSettings = () => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const settings = useSelector(selectSettings);
  const loading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);
  const successMessage = useSelector(selectSettingsSuccess);

  const [formData, setFormData] = useState({
    restaurantName: "",
    restaurantAddress: "",
    restaurantPhone: "",
    restaurantEmail: "",
    restaurantMotto: "",
    currency: {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
    },
    dateFormat: "MM/DD/YYYY",
    lowStockAlert: 10,
    autoGenerateSKU: true,
    taxRate: 0,
    emailNotifications: true,
    timezone: "Nigeria/Lagos",
    taxSettings: {
      enabled: true,
      globalRate: 7.5,
      name: "VAT",
      mode: "per-item",
      includeInPrice: false,
    },
    serviceCharge: {
      enabled: false,
      rate: 0,
      name: "Service Charge",
      applyTo: "dine-in",
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        ...settings,
        taxSettings: settings.taxSettings || formData.taxSettings,
        serviceCharge: settings.serviceCharge || formData.serviceCharge,
      });
    }
  }, [settings]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setHasChanges(true);
  };

  const handleCurrencyChange = (currency) => {
    setFormData((prev) => ({
      ...prev,
      currency: currency,
    }));
    setHasChanges(true);
  };

  const handleTaxSettingsChange = (taxSettings) => {
    setFormData((prev) => ({
      ...prev,
      taxSettings,
    }));
    setHasChanges(true);
  };

  const handleServiceChargeChange = (serviceCharge) => {
    setFormData((prev) => ({
      ...prev,
      serviceCharge,
    }));
    setHasChanges(true);
  };

  const handleSubmit = () => {
    dispatch(updateSettings(formData))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "Settings updated successfully!",
            status: 1,
          })
        );
        setHasChanges(false);
      })
      .catch((error) => {
        dispatch(
          showNotification({
            message: error.message || error,
            status: 0,
          })
        );
      });
  };

  const handleReset = () => {
    dispatch(
      openModal({
        title: "Confirm Reset",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: "Are you sure you want to reset all settings to defaults? This action cannot be undone.",
          type: CONFIRMATION_MODAL_CLOSE_TYPES.RESET_SETTINGS,
        },
      })
    );
  };

  // Handle modal confirmations
  useEffect(() => {
    const handleModalClose = (event) => {
      if (event.detail?.type === CONFIRMATION_MODAL_CLOSE_TYPES.RESET_SETTINGS) {
        dispatch(resetSettings())
          .unwrap()
          .then(() => {
            setHasChanges(false);
            dispatch(
              showNotification({
                message: "Settings reset to defaults successfully!",
                status: 1,
              })
            );
          })
          .catch((error) => {
            dispatch(
              showNotification({
                message: error.message || error,
                status: 0,
              })
            );
          });
      }
    };

    window.addEventListener("modalClosed", handleModalClose);
    return () => window.removeEventListener("modalClosed", handleModalClose);
  }, [dispatch]);

  const timezoneOptions = [
    { value: "Nigeria/Lagos", name: "West African Time" },
    { value: "America/New_York", name: "Eastern Daylight Time" },
    { value: "India/Mumbai", name: "India Standard Time" },
    { value: "UAE/Dubai", name: "Gulf Standard Time" },
    { value: "America/Los_Angeles", name: "Pacific Time" },
    { value: "UTC", name: "UTC" },
  ];

  const dateFormatOptions = [
    { value: "MM/DD/YYYY", name: "MM/DD/YYYY" },
    { value: "DD/MM/YYYY", name: "DD/MM/YYYY" },
  ];

  // Check if user has permission to edit settings
  if (!can("editGeneralSettings")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to edit general settings. Only
                administrators can modify these settings.
              </p>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">General Settings</h1>
        </div>
        <p className="text-base-content/70">
          Configure your Restaurant management system preferences
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error mb-6">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success mb-6">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="space-y-8">
        {/* Restaurant Information */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="card-title">Restaurant Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Restaurant Name *
                  </span>
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  placeholder="Enter your restaurant name"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Restaurant Email *
                  </span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Mail className="w-4 h-4 opacity-70" />
                  <input
                    type="email"
                    name="restaurantEmail"
                    value={formData.restaurantEmail}
                    onChange={handleInputChange}
                    className="grow"
                    placeholder="restaurant@example.com"
                    required
                  />
                </label>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">
                    Restaurant Address *
                  </span>
                </label>
                <label className="textarea textarea-bordered flex items-start gap-2 min-h-20">
                  <MapPin className="w-4 h-4 opacity-70 mt-1 flex-shrink-0" />
                  <textarea
                    name="restaurantAddress"
                    value={formData.restaurantAddress}
                    onChange={handleInputChange}
                    className="grow resize-none bg-transparent border-none outline-none"
                    placeholder="Enter your restaurant address"
                    rows="3"
                    required
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Phone Number *</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Phone className="w-4 h-4 opacity-70" />
                  <input
                    type="tel"
                    name="restaurantPhone"
                    value={formData.restaurantPhone}
                    onChange={handleInputChange}
                    className="grow"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Restaurant Motto
                  </span>
                  <span className="label-text-alt text-base-content/50">
                    Optional
                  </span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Quote className="w-4 h-4 opacity-70" />
                  <input
                    type="text"
                    name="restaurantMotto"
                    value={formData.restaurantMotto}
                    onChange={handleInputChange}
                    className="grow"
                    placeholder="Your restaurant's motto or tagline"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Format */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="card-title">Currency & Format</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Currency</span>
                </label>
                <CurrencySelect
                  value={formData.currency}
                  onChange={handleCurrencyChange}
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Date Format</span>
                </label>
                <SearchableSelect
                  options={dateFormatOptions}
                  value={formData.dateFormat}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "dateFormat", value: e.target.value },
                    })
                  }
                  name="dateFormat"
                  placeholder="Select Date Format"
                  className=""
                  valueKey="value"
                  labelKey="name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h2 className="card-title">Inventory Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Low Stock Alert Threshold
                  </span>
                </label>
                <FormattedNumberInput
                  name="lowStockAlert"
                  value={formData.lowStockAlert}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  min="0"
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    name="autoGenerateSKU"
                    checked={formData.autoGenerateSKU}
                    onChange={handleInputChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text font-medium">
                    Auto Generate SKU
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tax & Pricing */}
        <TaxSettings
          formData={formData}
          onTaxChange={handleTaxSettingsChange}
          onServiceChange={handleServiceChargeChange}
        />

        {/* System Settings */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="card-title">System Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Timezone</span>
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
                    checked={formData.emailNotifications}
                    onChange={handleInputChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text font-medium">
                    Email Notifications
                  </span>
                </label>
              </div>
            </div>
          </div>
        {/* Printer Settings (Hybrid Mode) */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <PrinterIcon className="w-5 h-5 text-primary" />
              <h2 className="card-title">Printer Configuration</h2>
            </div>
            
            <div className="alert alert-info shadow-sm mb-4">
              <div>
                <h3 className="font-bold text-xs">Hybrid Printing Strategy</h3>
                <div className="text-xs opacity-90">
                  Mode A: <b>Universal (Default)</b> uses standard browser printing (Popup).<br/>
                  Mode B: <b>WebUSB (Turbo)</b> uses direct USB connection for instant silent printing.
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
                  name="printerSettings.mode" // We handle nested change manually below
                  value={formData.printerSettings?.mode || "browser"}
                  onChange={(e) =>
                    setFormData(prev => ({
                        ...prev,
                        printerSettings: { ...prev.printerSettings, mode: e.target.value }
                    }))
                  }
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
                  onChange={(e) =>
                    setFormData(prev => ({
                        ...prev,
                        printerSettings: { ...prev.printerSettings, paperWidth: e.target.value }
                    }))
                  }
                >
                  <option value="80mm">80mm (Standard)</option>
                  <option value="58mm">58mm (Small)</option>
                </select>
              </div>

              {formData.printerSettings?.mode === 'webusb' && (
                  <div className="col-span-1 md:col-span-2">
                       <div className="card bg-base-200 border border-base-300">
                          <div className="card-body p-4">
                              <h3 className="card-title text-sm">USB Connection</h3>
                              <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                      {formData.printerSettings?.vendorId ? (
                                           <div className="badge badge-success gap-2 p-3">
                                               Connected: {formData.printerSettings.deviceName || "USB Printer"} 
                                               (ID: {formData.printerSettings.vendorId})
                                           </div>
                                      ) : (
                                          <div className="text-sm opacity-60">No printer connected yet</div>
                                      )}
                                  </div>
                                  <button 
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={async () => {
                                        try {
                                            const { printerService } = await import("../../../../services/PrinterService");
                                            const device = await printerService.connect();
                                            
                                            setFormData(prev => ({
                                                ...prev,
                                                printerSettings: { 
                                                    ...prev.printerSettings, 
                                                    vendorId: device.vendorId,
                                                    productId: device.productId,
                                                    deviceName: device.productName
                                                }
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

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline btn-error"
            disabled={loading}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>

          <button
            onClick={handleSubmit}
            className={`btn btn-primary ${!hasChanges ? "btn-disabled" : ""}`}
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
