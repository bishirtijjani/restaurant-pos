import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { Monitor, Plus, X } from "lucide-react";
import {
  createStation,
  updateStation,
  fetchStations,
} from "../kdsStationsSlice";
import { fetchAllCategories } from "../../categories/categoriesSlice";
import { showNotification } from "../../common/headerSlice";
import { useAuth } from "../../../utils/permission";

const StationManagementModalBody = ({ closeModal, extraObject }) => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const isEdit = !!extraObject?.station;
  const station = extraObject?.station || {};

  const categories = useSelector((state) => state.categories.categories);
  const users = useSelector((state) => state.users.users || []);

  const [formData, setFormData] = useState({
    name: station.name || "",
    type: station.type || "all",
    categories: station.categories || [],
    assignedUsers: station.assignedUsers?.map((u) => u._id || u) || [],
    isActive: station.isActive !== false,
    displaySettings: {
      columns: station.displaySettings?.columns || 3,
      fontSize: station.displaySettings?.fontSize || "medium",
      colorScheme: station.displaySettings?.colorScheme || "default",
      soundEnabled: station.displaySettings?.soundEnabled !== false,
      soundVolume: station.displaySettings?.soundVolume || 0.7,
      autoAdvance: station.displaySettings?.autoAdvance || false,
    },
    timingSettings: {
      warningTime: station.timingSettings?.warningTime || 10,
      criticalTime: station.timingSettings?.criticalTime || 15,
    },
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  // Check permissions
  const canCreate = can("createKDSStations");
  const canEdit = can("editKDSStations");
  const hasPermission = isEdit ? canEdit : canCreate;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Station name is required";
    if (formData.type !== "all" && formData.categories.length === 0) {
      newErrors.categories = "Select at least one category or choose 'All'";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasPermission) {
      dispatch(
        showNotification({
          message: "You don't have permission to perform this action",
          status: 0,
        })
      );
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        categories: formData.type === "all" ? [] : formData.categories,
      };

      if (isEdit) {
        await dispatch(updateStation({ id: station._id, ...payload })).unwrap();
        dispatch(
          showNotification({
            message: "Station updated successfully",
            status: 1,
          })
        );
      } else {
        await dispatch(createStation(payload)).unwrap();
        dispatch(
          showNotification({
            message: "Station created successfully",
            status: 1,
          })
        );
      }

      dispatch(fetchStations());
      closeModal();
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Operation failed",
          status: 0,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryName) => {
    if (!hasPermission) {
      dispatch(
        showNotification({
          message: "You don't have permission to modify categories",
          status: 0,
        })
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter((c) => c !== categoryName)
        : [...prev.categories, categoryName],
    }));
  };

  // Show permission denied message if user doesn't have access
  if (!hasPermission) {
    return (
      <div className="modal-content">
        <div className="hero min-h-[300px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-2xl font-bold text-error">Access Denied</h1>
              <p className="py-4">
                You do not have permission to {isEdit ? "edit" : "create"}{" "}
                stations.
              </p>
              <button onClick={closeModal} className="btn btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Monitor size={18} /> Basic Information
          </h3>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Station Name *</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`input input-bordered ${
                errors.name ? "input-error" : ""
              }`}
              placeholder="e.g., Grill Station"
              disabled={!hasPermission}
            />
            {errors.name && (
              <label className="label text-error text-xs">{errors.name}</label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Station Type</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="select select-bordered"
              disabled={!hasPermission}
            >
              <option value="all">All Items</option>
              <option value="grill">Grill</option>
              <option value="fryer">Fryer</option>
              <option value="salad">Salad</option>
              <option value="pizza">Pizza</option>
              <option value="dessert">Dessert</option>
              <option value="beverage">Beverage</option>
              <option value="expo">Expo</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="checkbox checkbox-primary"
                disabled={!hasPermission}
              />
              <span className="label-text">Active Station</span>
            </label>
          </div>
        </div>
      </div>

      {/* Categories */}
      {formData.type !== "all" && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold mb-3">Assigned Categories *</h3>
            {errors.categories && (
              <div className="alert alert-error py-2 text-xs mb-2">
                {errors.categories}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => toggleCategory(cat.name)}
                  className={`btn btn-sm ${
                    formData.categories.includes(cat.name)
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                  disabled={!hasPermission}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {formData.categories.length > 0 && (
              <div className="text-xs opacity-70 mt-2">
                Selected: {formData.categories.join(", ")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Display Settings */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold mb-3">Display Settings</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Columns</span>
              </label>
              <select
                value={formData.displaySettings.columns}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displaySettings: {
                      ...formData.displaySettings,
                      columns: parseInt(e.target.value),
                    },
                  })
                }
                className="select select-bordered select-sm"
                disabled={!hasPermission}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Font Size</span>
              </label>
              <select
                value={formData.displaySettings.fontSize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displaySettings: {
                      ...formData.displaySettings,
                      fontSize: e.target.value,
                    },
                  })
                }
                className="select select-bordered select-sm"
                disabled={!hasPermission}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                checked={formData.displaySettings.soundEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displaySettings: {
                      ...formData.displaySettings,
                      soundEnabled: e.target.checked,
                    },
                  })
                }
                className="checkbox checkbox-sm"
                disabled={!hasPermission}
              />
              <span className="label-text">Enable Sound Notifications</span>
            </label>
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold mb-3">Timing Settings (minutes)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Warning Time</span>
              </label>
              <FormattedNumberInput
                value={formData.timingSettings.warningTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timingSettings: {
                      ...formData.timingSettings,
                      warningTime: parseInt(e.target.value),
                    },
                  })
                }
                className="input input-bordered input-sm"
                min="5"
                max="30"
                disabled={!hasPermission}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Critical Time</span>
              </label>
              <FormattedNumberInput
                value={formData.timingSettings.criticalTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timingSettings: {
                      ...formData.timingSettings,
                      criticalTime: parseInt(e.target.value),
                    },
                  })
                }
                className="input input-bordered input-sm"
                min="10"
                max="60"
                disabled={!hasPermission}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={closeModal} className="btn btn-outline">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !hasPermission}
          className={`btn btn-primary ${loading ? "loading" : ""}`}
        >
          {isEdit ? "Update Station" : "Create Station"}
        </button>
      </div>
    </form>
  );
};

export default StationManagementModalBody;
