// frontend/src/features/ultraFastPOS/components/KeyboardSettings.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../../components/Cards/TitleCard";
import { Keyboard, Save, RotateCcw, AlertCircle } from "lucide-react";
import {
  fetchKeyboardSettings,
  updateKeyboardSettings,
  resetKeyboardSettings,
} from "../ultraFastPOSSlice";
import { showNotification } from "../../common/headerSlice";

const KeyboardSettings = () => {
  const dispatch = useDispatch();
  const { keyboardSettings, loading } = useSelector(
    (state) => state.ultraFastPOS
  );

  const [shortcuts, setShortcuts] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [recordedKey, setRecordedKey] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchKeyboardSettings());
  }, [dispatch]);

  useEffect(() => {
    if (keyboardSettings) {
      setShortcuts(keyboardSettings);
    }
  }, [keyboardSettings]);

  // ADD THIS: Global key listener when editing
  useEffect(() => {
    if (!editingKey) return;

    const handleKeyRecord = (event) => {
      event.preventDefault();
      const key = event.key.toLowerCase();

      // Build combination
      let combination = "";
      if (event.ctrlKey) combination += "ctrl+";
      if (event.shiftKey) combination += "shift+";
      if (event.altKey) combination += "alt+";
      combination += key;

      setRecordedKey(combination);
    };

    window.addEventListener("keydown", handleKeyRecord);
    return () => window.removeEventListener("keydown", handleKeyRecord);
  }, [editingKey]);

  const saveKeyBinding = () => {
    if (!editingKey || !recordedKey) return;

    // Check for duplicates
    const duplicate = Object.entries(shortcuts).find(
      ([action, binding]) => action !== editingKey && binding === recordedKey
    );

    if (duplicate) {
      setErrors({
        ...errors,
        [editingKey]: `Already assigned to ${duplicate[0]}`,
      });
      return;
    }

    setShortcuts({
      ...shortcuts,
      [editingKey]: recordedKey,
    });

    setEditingKey(null);
    setRecordedKey("");
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setRecordedKey("");
    setErrors({});
  };

  const handleSave = async () => {
    try {
      await dispatch(updateKeyboardSettings(shortcuts)).unwrap();
      dispatch(
        showNotification({
          message: "Keyboard settings saved successfully!",
          status: 1,
        })
      );
    } catch (error) {
      dispatch(
        showNotification({
          message: "Failed to save settings",
          status: 0,
        })
      );
    }
  };

  const handleReset = async () => {
    if (window.confirm("Reset all keyboard shortcuts to defaults?")) {
      try {
        await dispatch(resetKeyboardSettings()).unwrap();
        dispatch(
          showNotification({
            message: "Keyboard settings reset to defaults",
            status: 1,
          })
        );
      } catch (error) {
        dispatch(
          showNotification({
            message: "Failed to reset settings",
            status: 0,
          })
        );
      }
    }
  };

  const shortcutGroups = {
    "Payment Actions": [
      { key: "finalizeSale", label: "Finalize Sale" },
      { key: "cancelSale", label: "Cancel Sale" },
      { key: "voidLastItem", label: "Void Last Item" },
      { key: "payCash", label: "Pay with Cash" },
      { key: "payCard", label: "Pay with Card" },
      { key: "payTransfer", label: "Pay with Transfer" },
    ],
    "Category Navigation": Array.from({ length: 9 }, (_, i) => ({
      key: `category${i + 1}`,
      label: `Category ${i + 1}`,
    })),
    "Quick Actions": [
      { key: "searchItem", label: "Search Item" },
      { key: "openCalculator", label: "Open Calculator" },
      { key: "reprintLast", label: "Reprint Last Receipt" },
      { key: "customerLookup", label: "Customer Lookup" },
      { key: "applyDiscount", label: "Apply Discount" },
    ],
  };

  return (
    <TitleCard
      title={
        <div className="flex items-center gap-2">
          <Keyboard className="w-6 h-6" />
          Ultra-Fast POS - Keyboard Settings
        </div>
      }
      topMargin="mt-2"
    >
      <div className="alert alert-info mb-6">
        <AlertCircle className="w-5 h-5" />
        <div>
          <p className="font-semibold">
            Configure keyboard shortcuts for Ultra-Fast POS Mode
          </p>
          <p className="text-sm">
            {editingKey
              ? "Press any key combination now..."
              : "Click on a shortcut to record a new key combination"}
          </p>
        </div>
      </div>

      {Object.entries(shortcutGroups).map(([groupName, groupShortcuts]) => (
        <div key={groupName} className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-primary">{groupName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupShortcuts.map(({ key, label }) => (
              <div
                key={key}
                className="card bg-base-200 border border-base-300 hover:border-primary transition-all"
              >
                <div className="card-body p-4">
                  <h4 className="font-semibold text-sm mb-2">{label}</h4>

                  {editingKey === key ? (
                    <div className="space-y-2">
                      <div className="kbd kbd-lg w-full justify-center bg-primary text-primary-content">
                        {recordedKey || "Press keys..."}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveKeyBinding}
                          className="btn btn-success btn-sm flex-1"
                          disabled={!recordedKey}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn btn-error btn-sm flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingKey(key);
                        setRecordedKey("");
                        setErrors({});
                      }}
                      className="kbd kbd-lg w-full justify-center hover:bg-primary hover:text-primary-content transition-all"
                    >
                      {shortcuts[key] || "Not set"}
                    </button>
                  )}

                  {errors[key] && (
                    <p className="text-error text-xs mt-1">{errors[key]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="divider"></div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleReset}
          className="btn btn-outline btn-error gap-2"
          disabled={loading}
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className="btn btn-primary gap-2"
          disabled={loading}
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </TitleCard>
  );
};

export default KeyboardSettings;
