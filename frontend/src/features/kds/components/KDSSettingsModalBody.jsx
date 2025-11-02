// frontend/src/features/kds/components/KDSSettingsModalBody.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Volume2,
  VolumeX,
  RefreshCw,
  Maximize2,
  Type,
  Palette,
} from "lucide-react";
import { updateSettings } from "../kdsSlice";

const KDSSettingsModalBody = ({ closeModal }) => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.kds.settings);

  const handleSettingChange = (key, value) => {
    dispatch(updateSettings({ [key]: value }));
  };

  const handleSave = () => {
    closeModal();
  };

  return (
    <div className="modal-content">
      <div className="modal-body">
        <div className="space-y-6">
          {/* Sound Settings */}
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                {settings.soundEnabled ? (
                  <Volume2 size={20} />
                ) : (
                  <VolumeX size={20} />
                )}
                Sound Settings
              </h4>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Enable Notifications</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.soundEnabled}
                    onChange={(e) =>
                      handleSettingChange("soundEnabled", e.target.checked)
                    }
                  />
                </label>
              </div>

              {settings.soundEnabled && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Volume</span>
                    <span className="label-text-alt">
                      {Math.round(settings.soundVolume * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume}
                    onChange={(e) =>
                      handleSettingChange(
                        "soundVolume",
                        parseFloat(e.target.value)
                      )
                    }
                    className="range range-primary"
                  />
                  <div className="w-full flex justify-between text-xs px-2 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Display Settings */}
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Maximize2 size={20} />
                Display Settings
              </h4>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Columns</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={settings.columns}
                  onChange={(e) =>
                    handleSettingChange("columns", parseInt(e.target.value))
                  }
                >
                  <option value={1}>1 Column</option>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                  <option value={5}>5 Columns</option>
                  <option value={6}>6 Columns</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Type size={16} />
                    Font Size
                  </span>
                </label>
                <div className="btn-group w-full">
                  <button
                    className={`btn flex-1 ${
                      settings.fontSize === "small" ? "btn-active" : ""
                    }`}
                    onClick={() => handleSettingChange("fontSize", "small")}
                  >
                    Small
                  </button>
                  <button
                    className={`btn flex-1 ${
                      settings.fontSize === "medium" ? "btn-active" : ""
                    }`}
                    onClick={() => handleSettingChange("fontSize", "medium")}
                  >
                    Medium
                  </button>
                  <button
                    className={`btn flex-1 ${
                      settings.fontSize === "large" ? "btn-active" : ""
                    }`}
                    onClick={() => handleSettingChange("fontSize", "large")}
                  >
                    Large
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Palette size={16} />
                    Color Scheme
                  </span>
                </label>
                <div className="space-y-2">
                  <button
                    className={`btn btn-block justify-start ${
                      settings.colorScheme === "default"
                        ? "btn-active"
                        : "btn-outline"
                    }`}
                    onClick={() =>
                      handleSettingChange("colorScheme", "default")
                    }
                  >
                    Default
                  </button>
                  <button
                    className={`btn btn-block justify-start ${
                      settings.colorScheme === "colorblind"
                        ? "btn-active"
                        : "btn-outline"
                    }`}
                    onClick={() =>
                      handleSettingChange("colorScheme", "colorblind")
                    }
                  >
                    Colorblind Mode
                  </button>
                  <button
                    className={`btn btn-block justify-start ${
                      settings.colorScheme === "high-contrast"
                        ? "btn-active"
                        : "btn-outline"
                    }`}
                    onClick={() =>
                      handleSettingChange("colorScheme", "high-contrast")
                    }
                  >
                    High Contrast
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Refresh */}
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <RefreshCw size={20} />
                Auto Refresh
              </h4>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Enable Auto Refresh</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.autoRefresh}
                    onChange={(e) =>
                      handleSettingChange("autoRefresh", e.target.checked)
                    }
                  />
                </label>
              </div>

              {settings.autoRefresh && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Refresh Interval</span>
                    <span className="label-text-alt">
                      {settings.refreshInterval}s
                    </span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={settings.refreshInterval}
                    onChange={(e) =>
                      handleSettingChange(
                        "refreshInterval",
                        parseInt(e.target.value)
                      )
                    }
                    className="range range-primary"
                  />
                  <div className="w-full flex justify-between text-xs px-2 mt-1">
                    <span>10s</span>
                    <span>30s</span>
                    <span>60s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-action">
        <button onClick={handleSave} className="btn btn-primary">
          Save Settings
        </button>
        <button onClick={closeModal} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default KDSSettingsModalBody;
