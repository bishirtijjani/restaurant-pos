import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useBeforeUnload, useNavigate, useLocation } from "react-router-dom";
import CurrencySelect from "../settings/generalSettings/components/CurrencySelect";
import FormattedNumberInput from "../../components/Input/FormattedNumberInput";
import SearchableSelect from "../../components/Input/SearchableSelect";
import ImageUploader from "../../components/Input/ImageUploader";
import PaymentSettings from "../settings/components/PaymentSettings";
import CommunicationSettings from "../settings/generalSettings/components/CommunicationSettings";
import BrandCatalog from "./BrandCatalog";
import { fetchOrganization, updateOrganization } from "./organizationSlice";
import { showNotification } from "../common/headerSlice";
import {
  Building2,
  Save,
  BookOpen,
  Globe,
  DollarSign,
  CreditCard,
  MessageSquare,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const timezoneOptions = [
  { name: "UTC (Coordinated Universal Time)", value: "UTC" },
  { name: "Africa/Lagos (WAT)", value: "Africa/Lagos" },
  { name: "Europe/London (GMT)", value: "Europe/London" },
  { name: "America/New_York (EST)", value: "America/New_York" },
];

const TABS = [
  { id: "identity", label: "Brand Identity", icon: Building2 },
  { id: "catalog", label: "Master Catalog", icon: BookOpen },
  { id: "localization", label: "Localization", icon: Globe },
  { id: "financials", label: "Financials", icon: DollarSign },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "communications", label: "Communications", icon: MessageSquare },
];

const SectionCard = ({ title, description, children }) => (
  <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">
    {(title || description) && (
      <div className="px-6 py-4 border-b border-base-200 bg-base-50">
        {title && <h3 className="font-bold text-base">{title}</h3>}
        {description && (
          <p className="text-xs text-base-content/50 mt-0.5">{description}</p>
        )}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="form-control">
    <label className="label pb-1">
      <span className="label-text font-semibold">{label}</span>
      {hint && <span className="label-text-alt text-base-content/40">{hint}</span>}
    </label>
    {children}
  </div>
);

// Custom blocker hook compatible with BrowserRouter (legacy router)
const useCustomBlocker = (shouldBlock) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [blockedState, setBlockedState] = useState(null);
  const pendingNavigation = useRef(null);

  useEffect(() => {
    if (!shouldBlock) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldBlock]);

  const confirmNavigation = useCallback(() => {
    if (pendingNavigation.current) {
      const { to, options } = pendingNavigation.current;
      setBlockedState(null);
      pendingNavigation.current = null;
      navigate(to, options);
    }
  }, [navigate]);

  const cancelNavigation = useCallback(() => {
    pendingNavigation.current = null;
    setBlockedState(null);
  }, []);

  const attemptNavigation = useCallback((to, options) => {
    if (shouldBlock && to !== location.pathname) {
      pendingNavigation.current = { to, options };
      setBlockedState({ reset: cancelNavigation, proceed: confirmNavigation });
      return false;
    }
    return true;
  }, [shouldBlock, location.pathname, cancelNavigation, confirmNavigation]);

  return blockedState;
};

const BrandSettings = () => {
  const dispatch = useDispatch();
  const { entity: org, isLoading } = useSelector((state) => state.organization);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("identity");
  const [formData, setFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // ── Navigation guard ──────────────────────────────────────────────────────
  // Block in-app navigation when there are unsaved changes
  const blocker = useCustomBlocker(hasChanges);

  // Also warn on browser tab close / refresh
  useBeforeUnload(
    useCallback(
      (e) => {
        if (hasChanges) {
          e.preventDefault();
          e.returnValue = "";
        }
      },
      [hasChanges]
    )
  );

  useEffect(() => {
    if (user?.currentOrganizationId) {
      dispatch(fetchOrganization(user.currentOrganizationId));
    }
  }, [dispatch, user?.currentOrganizationId]);

  useEffect(() => {
    if (org) {
      const settings = org.brandSettings || {};
      setFormData({
        ...settings,
        ...settings.branding,
        restaurantName: org.name || "", // <-- Load from org.name
        paymentGateways: settings.paymentGateways || {
          stripe: { enabled: false, publishableKey: "", secretKey: "", accountId: "" },
        },
        communication: settings.communication || {
          email: { provider: "log", enabled: true, config: {} },
          sms: { provider: "log", enabled: false, config: {} },
          whatsapp: { provider: "log", enabled: false, config: {} },
        },
      });
    }
  }, [org]);

  const set = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    set(name, type === "checkbox" ? checked : value);
  };

  const handleReset = () => {
    setFormData(null);
    dispatch(fetchOrganization(user.currentOrganizationId));
    setHasChanges(false);
  };

  const handleSubmit = async () => {
    try {
      const updateData = {
        name: formData.restaurantName,
        brandSettings: {
          ...formData,
          branding: {
            restaurantLogo: formData.restaurantLogo,
            restaurantMotto: formData.restaurantMotto,
            restaurantEmail: formData.restaurantEmail,
            website: formData.website,
          },
        },
      };
      await dispatch(
        updateOrganization({ id: user.currentOrganizationId, data: updateData })
      ).unwrap();
      dispatch(showNotification({ message: "Brand settings saved", status: 1 }));
      setHasChanges(false);
    } catch (error) {
      dispatch(
        showNotification({ message: error || "Failed to save brand settings", status: 0 })
      );
    }
  };

  if (!formData || isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const isCatalogTab = activeTab === "catalog";

  return (
    <div className="flex flex-col min-h-screen animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-accent/15 rounded-2xl">
          <Building2 className="w-7 h-7 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Brand Dashboard</h1>
          <p className="text-base-content/50 text-sm">
            Manage your organization-wide settings and master catalog
          </p>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="relative mb-6">
        {/* Scroll hint: gradient fade + chevron on the right */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 flex items-center justify-end pr-1"
          style={{ background: "linear-gradient(to right, transparent, var(--b1, #fff) 80%)" }}
        >
          <ChevronRight className="w-4 h-4 text-base-content/30" />
        </div>

        <div className="flex gap-1 bg-base-200/60 p-1 rounded-2xl overflow-x-auto scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                activeTab === id
                  ? "bg-base-100 shadow-md text-primary"
                  : "text-base-content/50 hover:text-base-content hover:bg-base-100/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className={`flex-1 ${isCatalogTab ? "" : "space-y-6 pb-32"}`}>

        {/* ── IDENTITY ── */}
        {activeTab === "identity" && (
          <>
            <SectionCard
              title="Logo & Visual Identity"
              description="Your brand logo will appear in receipts, customer-facing pages, and store dashboards"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-72 shrink-0">
                  <ImageUploader
                    value={formData.restaurantLogo || ""}
                    onChange={(url) => set("restaurantLogo", url)}
                    previewClass="h-48 object-contain rounded-xl"
                  />
                </div>
                {formData.restaurantLogo && (
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                      Hosted URL
                    </p>
                    <div className="bg-base-200/60 p-3 rounded-xl break-all text-xs font-mono text-base-content/60 border border-base-300">
                      {formData.restaurantLogo}
                    </div>
                    <p className="text-xs text-base-content/40">
                      This is the Cloudinary-hosted URL automatically generated on upload.
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Brand Information"
              description="This information represents your brand across all store locations"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Brand / Restaurant Name">
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName || ""}
                    onChange={handleInputChange}
                    className="input input-bordered focus:input-primary transition-all"
                    placeholder="e.g. Gourmet Kitchen"
                    autoComplete="off"
                  />
                </Field>

                <Field label="Global Contact Email">
                  <input
                    type="email"
                    name="restaurantEmail"
                    value={formData.restaurantEmail || ""}
                    onChange={handleInputChange}
                    className="input input-bordered focus:input-primary transition-all"
                    placeholder="hello@yourbrand.com"
                    autoComplete="off"
                  />
                </Field>

                <Field label="Tagline / Motto" hint="Optional">
                  <input
                    type="text"
                    name="restaurantMotto"
                    value={formData.restaurantMotto || ""}
                    onChange={handleInputChange}
                    className="input input-bordered focus:input-primary transition-all"
                    placeholder="Freshness in every bite"
                    autoComplete="off"
                  />
                </Field>

                <Field label="Website" hint="Optional">
                  <input
                    type="url"
                    name="website"
                    value={formData.website || ""}
                    onChange={handleInputChange}
                    className="input input-bordered focus:input-primary transition-all"
                    placeholder="https://www.yourbrand.com"
                    autoComplete="off"
                  />
                </Field>
              </div>
            </SectionCard>
          </>
        )}

        {/* ── MASTER CATALOG ── */}
        {activeTab === "catalog" && (
          <div className="pb-8">
            <BrandCatalog />
          </div>
        )}

        {/* ── LOCALIZATION ── */}
        {activeTab === "localization" && (
          <SectionCard
            title="Localization & Operations"
            description="These defaults apply to new stores. Existing stores can override them individually"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Default Currency">
                <CurrencySelect
                  value={formData.currency}
                  onChange={(c) => {
                    setFormData((p) => ({ ...p, currency: c }));
                    setHasChanges(true);
                  }}
                />
              </Field>

              <Field label="Default Timezone">
                <SearchableSelect
                  options={timezoneOptions}
                  value={formData.timezone}
                  onChange={(e) =>
                    handleInputChange({ target: { name: "timezone", value: e.target.value } })
                  }
                  name="timezone"
                  valueKey="value"
                  labelKey="name"
                />
                <p className="text-xs text-base-content/40 mt-2">
                  Default timezone applied when creating new stores.
                </p>
              </Field>

              <Field label="Date Format">
                <select
                  className="select select-bordered focus:select-primary w-full"
                  name="dateFormat"
                  value={formData.dateFormat || "MM/DD/YYYY"}
                  onChange={handleInputChange}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                </select>
              </Field>
            </div>
          </SectionCard>
        )}

        {/* ── FINANCIALS ── */}
        {activeTab === "financials" && (
          <div className="space-y-6">
            <SectionCard
              title="Tax Configuration"
              description="Default tax settings applied to all stores unless overridden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Tax Name">
                  <input
                    type="text"
                    placeholder="e.g. VAT"
                    className="input input-bordered focus:input-primary"
                    value={formData.taxSettings?.name || ""}
                    onChange={(e) => {
                      setFormData((p) => ({
                        ...p,
                        taxSettings: { ...p.taxSettings, name: e.target.value },
                      }));
                      setHasChanges(true);
                    }}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Rate (%)" hint="Global default">
                  <div className="relative">
                    <FormattedNumberInput
                      placeholder="0.00"
                      className="input input-bordered w-full focus:input-primary pr-8"
                      value={formData.taxSettings?.globalRate || ""}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          taxSettings: { ...p.taxSettings, globalRate: e.target.value },
                        }));
                        setHasChanges(true);
                      }}
                    />
                    <span className="absolute right-4 top-3 text-base-content/30 pointer-events-none">%</span>
                  </div>
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Service Charge">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-sm">Enable Service Charge</p>
                  <p className="text-xs text-base-content/40">Applies a charge to orders at checkout</p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.serviceCharge?.enabled || false}
                  onChange={(e) => {
                    setFormData((p) => ({
                      ...p,
                      serviceCharge: { ...p.serviceCharge, enabled: e.target.checked },
                    }));
                    setHasChanges(true);
                  }}
                />
              </div>

              <div
                className={`space-y-4 transition-all duration-300 ${
                  !formData.serviceCharge?.enabled ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Charge Name">
                    <input
                      type="text"
                      placeholder="e.g. Service Charge"
                      className="input input-bordered focus:input-primary"
                      value={formData.serviceCharge?.name || ""}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          serviceCharge: { ...p.serviceCharge, name: e.target.value },
                        }));
                        setHasChanges(true);
                      }}
                      autoComplete="off"
                      disabled={!formData.serviceCharge?.enabled}
                    />
                  </Field>
                  <Field label="Rate (%)">
                    <div className="relative">
                      <FormattedNumberInput
                        placeholder="0"
                        className="input input-bordered w-full focus:input-primary pr-8"
                        value={formData.serviceCharge?.rate || ""}
                        onChange={(e) => {
                          setFormData((p) => ({
                            ...p,
                            serviceCharge: { ...p.serviceCharge, rate: e.target.value },
                          }));
                          setHasChanges(true);
                        }}
                        disabled={!formData.serviceCharge?.enabled}
                      />
                      <span className="absolute right-4 top-3 text-base-content/30 pointer-events-none">%</span>
                    </div>
                  </Field>
                </div>
                <Field label="Apply To">
                  <select
                    className="select select-bordered w-full focus:select-primary"
                    value={formData.serviceCharge?.applyTo || "all"}
                    onChange={(e) => {
                      setFormData((p) => ({
                        ...p,
                        serviceCharge: { ...p.serviceCharge, applyTo: e.target.value },
                      }));
                      setHasChanges(true);
                    }}
                    disabled={!formData.serviceCharge?.enabled}
                  >
                    <option value="all">All Orders</option>
                    <option value="dine-in">Dine-in Only</option>
                    <option value="delivery">Delivery Only</option>
                    <option value="takeaway">Takeaway Only</option>
                  </select>
                </Field>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === "payments" && (
          <PaymentSettings
            config={formData.paymentGateways}
            onChange={(c) => {
              setFormData((p) => ({ ...p, paymentGateways: c }));
              setHasChanges(true);
            }}
          />
        )}

        {/* ── COMMUNICATIONS ── */}
        {activeTab === "communications" && (
          <CommunicationSettings
            config={formData.communication}
            onChange={(c) => {
              setFormData((p) => ({ ...p, communication: c }));
              setHasChanges(true);
            }}
          />
        )}
      </div>

      {/* ── Floating Save Bar (hidden on Catalog tab) ── */}
      {!isCatalogTab && (
        <div className="fixed bottom-6 left-6 right-6 lg:left-80 z-40 pointer-events-none">
          <div
            className={`flex items-center justify-between bg-error text-error-content p-3 rounded-2xl shadow-2xl shadow-error/30 transition-all duration-300 transform pointer-events-auto border border-error/50 ${
              hasChanges
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-3 ml-2 min-w-0">
              <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="text-sm font-bold truncate">
                Unsaved changes
                <span className="hidden sm:inline font-normal opacity-80"> — {activeTab}</span>
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="btn btn-sm btn-ghost text-error-content hover:bg-error-content/20 gap-2"
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-sm bg-error-content text-error hover:bg-error-content/90 px-6 gap-2 font-bold border-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unsaved Changes Navigation Confirmation Modal ── */}
      {blocker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => blocker.reset()}
          />
          {/* Modal */}
          <div className="relative bg-base-100 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">Leave without saving?</h3>
                <p className="text-base-content/60 text-sm leading-relaxed">
                  You have unsaved changes on the{" "}
                  <span className="font-semibold capitalize text-base-content">{activeTab}</span>{" "}
                  tab. If you leave now, all unsaved changes will be lost.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  className="btn btn-outline flex-1"
                  onClick={() => blocker.reset()}
                >
                  Stay & Keep Editing
                </button>
                <button
                  className="btn btn-error flex-1"
                  onClick={() => blocker.proceed()}
                >
                  Leave Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandSettings;
