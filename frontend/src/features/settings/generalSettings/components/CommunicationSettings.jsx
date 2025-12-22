import React from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";

/**
 * CommunicationSettings
 * Allows store owners to configure Email, SMS, and WhatsApp providers.
 */
const CommunicationSettings = ({ config, onChange }) => {
  const handleChannelChange = (channel, field, value) => {
    onChange({
      ...config,
      [channel]: {
        ...config[channel],
        [field]: value,
      },
    });
  };

  const handleConfigChange = (channel, configKey, value) => {
    const currentConfig = { ...(config[channel]?.config || {}) };
    if (value === "") {
      delete currentConfig[configKey];
    } else {
      currentConfig[configKey] = value;
    }
    handleChannelChange(channel, "config", currentConfig);
  };

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl mt-6">
      <div className="text-xl font-bold mb-4">Communication Channels</div>
      <div className="divider"></div>

      <div className="grid grid-cols-1 gap-6">
        {/* Email Settings */}
        <section className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-500" />
            Email Configuration
            <span
              className={`badge badge-sm ${
                config?.email?.enabled ? "badge-success" : "badge-ghost"
              }`}
            >
              {config?.email?.enabled ? "Active" : "Disabled"}
            </span>
          </div>
          <div className="collapse-content">
            <div className="form-control mb-4">
              <label className="label cursor-pointer justify-start gap-4">
                <span className="label-text font-bold">
                  Enable Email Notifications
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={config?.email?.enabled || false}
                  onChange={(e) =>
                    handleChannelChange("email", "enabled", e.target.checked)
                  }
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Provider</span>
                </label>
                <select
                  className="select select-bordered"
                  value={config?.email?.provider || "log"}
                  onChange={(e) =>
                    handleChannelChange("email", "provider", e.target.value)
                  }
                >
                  <option value="log">Console Log (Development)</option>
                  <option value="sendgrid">SendGrid</option>
                </select>
              </div>

              {config?.email?.provider === "sendgrid" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">SendGrid API Key</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered"
                      placeholder="SG.xxxx"
                      onChange={(e) =>
                        handleConfigChange("email", "apiKey", e.target.value)
                      }
                    />
                    <p className="text-xs opacity-50 mt-1">
                      Leave empty to keep existing key.
                    </p>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">From Email</span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered"
                      placeholder="hello@yourdomain.com"
                      value={config?.email?.config?.fromEmail || ""}
                      onChange={(e) =>
                        handleConfigChange("email", "fromEmail", e.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* SMS Settings */}
        <section className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-green-500" />
            SMS Configuration
            <span
              className={`badge badge-sm ${
                config?.sms?.enabled ? "badge-success" : "badge-ghost"
              }`}
            >
              {config?.sms?.enabled ? "Active" : "Disabled"}
            </span>
          </div>
          <div className="collapse-content">
            <div className="form-control mb-4">
              <label className="label cursor-pointer justify-start gap-4">
                <span className="label-text font-bold">Enable SMS Alerts</span>
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={config?.sms?.enabled || false}
                  onChange={(e) =>
                    handleChannelChange("sms", "enabled", e.target.checked)
                  }
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Provider</span>
                </label>
                <select
                  className="select select-bordered"
                  value={config?.sms?.provider || "log"}
                  onChange={(e) =>
                    handleChannelChange("sms", "provider", e.target.value)
                  }
                >
                  <option value="log">Console Log (Development)</option>
                  <option value="twilio">Twilio</option>
                </select>
              </div>

              {config?.sms?.provider === "twilio" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Account SID</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={config?.sms?.config?.accountSid || ""}
                      onChange={(e) =>
                        handleConfigChange("sms", "accountSid", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Auth Token</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered"
                      placeholder="••••••••"
                      onChange={(e) =>
                        handleConfigChange("sms", "authToken", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">From Number</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="+1234567"
                      value={config?.sms?.config?.fromNumber || ""}
                      onChange={(e) =>
                        handleConfigChange("sms", "fromNumber", e.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* WhatsApp Settings */}
        <section className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-600" />
            WhatsApp Configuration
            <span
              className={`badge badge-sm ${
                config?.whatsapp?.enabled ? "badge-success" : "badge-ghost"
              }`}
            >
              {config?.whatsapp?.enabled ? "Active" : "Disabled"}
            </span>
          </div>
          <div className="collapse-content">
            <div className="form-control mb-4">
              <label className="label cursor-pointer justify-start gap-4">
                <span className="label-text font-bold">
                  Enable WhatsApp Alerts
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-emerald"
                  checked={config?.whatsapp?.enabled || false}
                  onChange={(e) =>
                    handleChannelChange("whatsapp", "enabled", e.target.checked)
                  }
                />
              </label>
            </div>
            <div className="alert alert-info py-2 px-4 mb-4 text-xs">
              WhatsApp uses the Twilio Business API in this version.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Provider</span>
                </label>
                <select
                  className="select select-bordered"
                  value={config?.whatsapp?.provider || "log"}
                  onChange={(e) =>
                    handleChannelChange("whatsapp", "provider", e.target.value)
                  }
                >
                  <option value="log">Console Log (Development)</option>
                  <option value="twilio">Twilio (WhatsApp)</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CommunicationSettings;
