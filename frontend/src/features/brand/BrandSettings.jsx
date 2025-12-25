import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import SearchableSelect from "../../components/Input/SearchableSelect";
import CurrencySelect from "../settings/generalSettings/components/CurrencySelect";
import { Settings, Save, Building } from "lucide-react";
import { fetchOrganization, updateOrganization } from "./organizationSlice";
import { showNotification } from "../common/headerSlice";
import PaymentSettings from "../settings/components/PaymentSettings";
import CommunicationSettings from "../settings/generalSettings/components/CommunicationSettings";

const timezoneOptions = [
  { name: "UTC (Coordinated Universal Time)", value: "UTC" },
  { name: "Africa/Lagos (WAT)", value: "Africa/Lagos" },
  { name: "Europe/London (GMT)", value: "Europe/London" },
  { name: "America/New_York (EST)", value: "America/New_York" },
];

const BrandSettings = () => {
  const dispatch = useDispatch();
  const { entity: org, isLoading } = useSelector((state) => state.organization);
  const user = useSelector((state) => state.auth.user);
  const [formData, setFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user?.currentOrganizationId) {
      dispatch(fetchOrganization(user.currentOrganizationId));
    }
  }, [dispatch, user?.currentOrganizationId]);

  useEffect(() => {
    if (org) {
      // Map Organization structure to a flat format similar to Store settings for UI compatibility
      const settings = org.brandSettings || {};
      setFormData({
        ...settings,
        ...settings.branding,
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
  }, [org]);

  const handleInputChange = (e) => {
    const target = e.target || e;
    const { name, value, type, checked } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    try {
      // Transform flat UI data back to Organization structure
      const updateData = {
        name: formData.restaurantName,
        brandSettings: {
          ...formData,
          branding: {
            restaurantName: formData.restaurantName,
            restaurantLogo: formData.restaurantLogo,
            restaurantMotto: formData.restaurantMotto,
            restaurantPhone: formData.restaurantPhone,
            restaurantEmail: formData.restaurantEmail,
            restaurantAddress: formData.restaurantAddress,
            website: formData.website,
          },
        },
      };

      await dispatch(
        updateOrganization({ id: user.currentOrganizationId, data: updateData })
      ).unwrap();
      dispatch(
        showNotification({ message: "Brand settings updated", status: 1 })
      );
      setHasChanges(false);
    } catch (error) {
      dispatch(
        showNotification({
          message: error || "Failed to update brand settings",
          status: 0,
        })
      );
    }
  };

  if (!formData || isLoading)
    return (
      <div className="flex items-center justify-center p-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-32">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-focus p-8 text-primary-content shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Master Brand Settings
              </h1>
              <p className="text-primary-content/80 text-sm max-w-md">
                Configure global defaults and brand identity that sync across
                all your store locations.
              </p>
            </div>
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Brand Identity Section */}
        <div className="animate-slideUp">
          <TitleCard title="Brand Identity" topMargin="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Brand/Restaurant Name
                  </span>
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName || ""}
                  onChange={handleInputChange}
                  className="input input-bordered focus:input-primary transition-all"
                  placeholder="e.g. Gourmet Kitchen"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Global Phone</span>
                </label>
                <input
                  type="text"
                  name="restaurantPhone"
                  value={formData.restaurantPhone || ""}
                  onChange={handleInputChange}
                  className="input input-bordered focus:input-primary transition-all"
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">
                    Global Address
                  </span>
                </label>
                <textarea
                  name="restaurantAddress"
                  value={formData.restaurantAddress || ""}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered h-24 focus:textarea-primary transition-all"
                  placeholder="123 Culinary St, Food City"
                ></textarea>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Global Email</span>
                </label>
                <input
                  type="email"
                  name="restaurantEmail"
                  value={formData.restaurantEmail || ""}
                  onChange={handleInputChange}
                  className="input input-bordered focus:input-primary transition-all"
                  placeholder="hello@yourbrand.com"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Tagline / Motto
                  </span>
                </label>
                <input
                  type="text"
                  name="restaurantMotto"
                  value={formData.restaurantMotto || ""}
                  onChange={handleInputChange}
                  className="input input-bordered focus:input-primary transition-all"
                  placeholder="Freshness in every bite"
                />
              </div>
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Website</span>
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleInputChange}
                  className="input input-bordered focus:input-primary transition-all"
                  placeholder="https://www.yourbrand.com"
                />
              </div>
            </div>
          </TitleCard>
        </div>

        {/* Localization & Operational Section */}
        <div className="animate-slideUp">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="card-title text-lg font-bold">
                    Default Localization
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Currency</span>
                    </label>
                    <CurrencySelect
                      value={formData.currency}
                      onChange={(c) => {
                        setFormData((p) => ({ ...p, currency: c }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Date Format
                      </span>
                    </label>
                    <select
                      className="select select-bordered focus:select-primary"
                      name="dateFormat"
                      value={formData.dateFormat || "MM/DD/YYYY"}
                      onChange={handleInputChange}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Settings className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="card-title text-lg font-bold">Operational</h2>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Default Timezone
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
                    valueKey="value"
                    labelKey="name"
                  />
                  <p className="mt-2 text-xs opacity-50">
                    This sets the default timezone for new stores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financials Section */}
        <div className="animate-slideUp">
          <TitleCard title="Financial Defaults">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tax Section */}
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Tax Configuration
                </h3>
                <div className="form-control bg-base-200/50 p-4 rounded-2xl space-y-4">
                  <label className="label-text font-semibold">
                    Tax Name & Rate (%)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g. VAT"
                      className="input input-bordered flex-1 focus:input-primary"
                      value={formData.taxSettings?.name || ""}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          taxSettings: {
                            ...p.taxSettings,
                            name: e.target.value,
                          },
                        }));
                        setHasChanges(true);
                      }}
                    />
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="input input-bordered w-28 focus:input-primary"
                        value={formData.taxSettings?.globalRate || ""}
                        onChange={(e) => {
                          setFormData((p) => ({
                            ...p,
                            taxSettings: {
                              ...p.taxSettings,
                              globalRate: parseFloat(e.target.value),
                            },
                          }));
                          setHasChanges(true);
                        }}
                      />
                      <span className="absolute right-4 top-3 text-base-content/30">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Charge Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    Service Charge
                  </h3>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={formData.serviceCharge?.enabled || false}
                    onChange={(e) => {
                      setFormData((p) => ({
                        ...p,
                        serviceCharge: {
                          ...p.serviceCharge,
                          enabled: e.target.checked,
                        },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div
                  className={`form-control bg-base-200/50 p-4 rounded-2xl space-y-4 transition-all duration-300 ${
                    !formData.serviceCharge?.enabled
                      ? "opacity-50 grayscale"
                      : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g. Service Charge"
                      className="input input-bordered flex-1 focus:input-primary"
                      value={formData.serviceCharge?.name || ""}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          serviceCharge: {
                            ...p.serviceCharge,
                            name: e.target.value,
                          },
                        }));
                        setHasChanges(true);
                      }}
                      disabled={!formData.serviceCharge?.enabled}
                    />
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0"
                        className="input input-bordered w-28 focus:input-primary"
                        value={formData.serviceCharge?.rate || ""}
                        onChange={(e) => {
                          setFormData((p) => ({
                            ...p,
                            serviceCharge: {
                              ...p.serviceCharge,
                              rate: parseFloat(e.target.value),
                            },
                          }));
                          setHasChanges(true);
                        }}
                        disabled={!formData.serviceCharge?.enabled}
                      />
                      <span className="absolute right-4 top-3 text-base-content/30">
                        %
                      </span>
                    </div>
                  </div>
                  <select
                    className="select select-bordered w-full focus:select-primary"
                    value={formData.serviceCharge?.applyTo || "all"}
                    onChange={(e) => {
                      setFormData((p) => ({
                        ...p,
                        serviceCharge: {
                          ...p.serviceCharge,
                          applyTo: e.target.value,
                        },
                      }));
                      setHasChanges(true);
                    }}
                    disabled={!formData.serviceCharge?.enabled}
                  >
                    <option value="all">Apply to All Orders</option>
                    <option value="dine-in">Dine-in Only</option>
                    <option value="delivery">Delivery Only</option>
                    <option value="takeaway">Takeaway Only</option>
                  </select>
                </div>
              </div>
            </div>
          </TitleCard>
        </div>

        {/* Payment Gateways */}
        <div className="animate-slideUp">
          <PaymentSettings
            config={formData.paymentGateways}
            onChange={(c) => {
              setFormData((p) => ({ ...p, paymentGateways: c }));
              setHasChanges(true);
            }}
          />
        </div>

        {/* Communication Settings */}
        <div className="animate-slideUp">
          <CommunicationSettings
            config={formData.communication}
            onChange={(c) => {
              setFormData((p) => ({ ...p, communication: c }));
              setHasChanges(true);
            }}
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
              onClick={() => {
                setFormData(null); // Force reload from state
                dispatch(fetchOrganization(user.currentOrganizationId));
                setHasChanges(false);
              }}
              className="btn btn-ghost btn-sm px-6"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              className={`btn btn-primary btn-sm px-8 shadow-lg shadow-primary/20 ${
                isLoading ? "loading" : ""
              }`}
              disabled={isLoading}
            >
              {!isLoading && <Save className="w-4 h-4 mr-2" />}
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSettings;
