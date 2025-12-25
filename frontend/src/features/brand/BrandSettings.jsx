import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import SearchableSelect from "../../components/Input/SearchableSelect";
import CurrencySelect from "../settings/generalSettings/components/CurrencySelect";
import { Settings, Printer as PrinterIcon, Save, Building } from "lucide-react";
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
    return <div className="p-4">Loading brand settings...</div>;

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="alert bg-primary text-primary-content shadow-lg">
        <div>
          <Building className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Master Brand Settings</h3>
            <div className="text-xs">
              These settings serve as defaults for all stores in your
              organization.
            </div>
          </div>
        </div>
      </div>

      <TitleCard title="Brand Identity (Defaults)" topMargin="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Brand/Restaurant Name
              </span>
            </label>
            <input
              type="text"
              name="restaurantName"
              value={formData.restaurantName || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Global Phone</span>
            </label>
            <input
              type="text"
              name="restaurantPhone"
              value={formData.restaurantPhone || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Global Address</span>
            </label>
            <textarea
              name="restaurantAddress"
              value={formData.restaurantAddress || ""}
              onChange={handleInputChange}
              className="textarea textarea-bordered h-20"
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Global Email</span>
            </label>
            <input
              type="email"
              name="restaurantEmail"
              value={formData.restaurantEmail || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Tagline / Motto</span>
            </label>
            <input
              type="text"
              name="restaurantMotto"
              value={formData.restaurantMotto || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
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
              <h2 className="card-title">Default Localization</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Currency</span>
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
                  <span className="label-text font-medium">Date Format</span>
                </label>
                <select
                  className="select select-bordered"
                  name="dateFormat"
                  value={formData.dateFormat || "MM/DD/YYYY"}
                  onChange={handleInputChange}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
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
              <h2 className="card-title">Default Operational</h2>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Default Timezone</span>
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
            </div>
          </div>
        </div>
      </div>

      {/* Financials (Tax/Service Charge) */}
      <TitleCard title="Financial Defaults">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label font-medium">Default Tax Settings</label>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="VAT"
                className="input input-bordered flex-1"
                value={formData.taxSettings?.name || ""}
                onChange={(e) => {
                  setFormData((p) => ({
                    ...p,
                    taxSettings: { ...p.taxSettings, name: e.target.value },
                  }));
                  setHasChanges(true);
                }}
              />
              <input
                type="number"
                placeholder="7.5"
                className="input input-bordered w-24"
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
            </div>
          </div>
          {/* Service Charge */}
          <div className="form-control">
            <label className="label font-medium">Default Service Charge</label>
            <div className="flex flex-col gap-2">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="toggle toggle-sm"
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
                <span className="label-text">Enable Service Charge</span>
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Service Charge"
                  className="input input-bordered flex-1"
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
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered w-24"
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
              </div>
              <select
                className="select select-bordered w-full"
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
              </select>
            </div>
          </div>
        </div>
      </TitleCard>

      <div className="md:col-span-2">
        <PaymentSettings
          config={formData.paymentGateways}
          onChange={(c) => {
            setFormData((p) => ({ ...p, paymentGateways: c }));
            setHasChanges(true);
          }}
        />
      </div>

      <div className="md:col-span-2">
        <CommunicationSettings
          config={formData.communication}
          onChange={(c) => {
            setFormData((p) => ({ ...p, communication: c }));
            setHasChanges(true);
          }}
        />
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={handleSubmit}
          className={`btn btn-primary ${!hasChanges ? "btn-disabled" : ""}`}
          disabled={isLoading || !hasChanges}
        >
          {isLoading ? (
            <span className="loading loading-spinner no-anim"></span>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isLoading ? "Saving..." : "Save Master Brand Settings"}
        </button>
      </div>
    </div>
  );
};

export default BrandSettings;
