// frontend/src/features/orders/components/AddOnSelectorModalBody.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { fetchAddOnGroupsForMenuItem } from "../../addOnGroups/addOnGroupsSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import { Check, X } from "lucide-react";

const AddOnSelectorModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const { menuItem, onConfirm } = extraObject;
  const { menuItemGroups, loading } = useSelector((state) => state.addOnGroups);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [selections, setSelections] = useState({});
  const [itemNote, setItemNote] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If addOnGroups are already populated in the menuItem, we can use them immediately
    // but we still fetch to get the freshest availability/stock info
    if (menuItem?._id) {
      dispatch(fetchAddOnGroupsForMenuItem(menuItem._id));
    }
  }, [dispatch, menuItem?._id]);

  // Use either the fetched groups or the ones already on the menuItem if populated
  const displayGroups =
    menuItemGroups.length > 0
      ? menuItemGroups
      : Array.isArray(menuItem?.addOnGroups) &&
        typeof menuItem.addOnGroups[0] === "object"
      ? menuItem.addOnGroups
      : [];

  const handleSelect = (groupId, itemId, group) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];

      if (group.selectionType === "single") {
        return { ...prev, [groupId]: [itemId] };
      } else {
        if (current.includes(itemId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== itemId) };
        } else {
          if (group.maxSelections && current.length >= group.maxSelections) {
            dispatch(
              showNotification({
                message: `Maximum ${group.maxSelections} selections allowed for ${group.name}`,
                status: 0,
              })
            );
            return prev;
          }
          return { ...prev, [groupId]: [...current, itemId] };
        }
      }
    });

    if (errors[groupId]) {
      setErrors((prev) => ({ ...prev, [groupId]: "" }));
    }
  };

  const calculateTotal = () => {
    let total = menuItem.price;
    Object.entries(selections).forEach(([groupId, selectedIds]) => {
      const group = displayGroups.find((g) => g._id === groupId);
      if (group) {
        selectedIds.forEach((itemId) => {
          const item = group.items.find((i) => i._id === itemId);
          if (item) {
            total += item.price;
          }
        });
      }
    });
    return total;
  };

  const validate = () => {
    const newErrors = {};

    displayGroups.forEach((group) => {
      const selected = selections[group._id] || [];

      if (group.isRequired && selected.length === 0) {
        newErrors[group._id] = `${group.name} is required`;
      }

      if (group.minSelections && selected.length < group.minSelections) {
        newErrors[
          group._id
        ] = `Please select at least ${group.minSelections} option(s)`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;

    // Rich data construction
    const summary = [];
    const addOns = Object.entries(selections)
      .filter(([_, selectedIds]) => selectedIds.length > 0)
      .map(([groupId, selectedIds]) => {
        const group = displayGroups.find((g) => g._id === groupId);

        // Collect names for summary
        if (group) {
          selectedIds.forEach((id) => {
            const item = group.items.find((i) => i._id === id);
            if (item) summary.push(item.name);
          });
        }

        return {
          groupId,
          selectedItemIds: selectedIds,
        };
      });

    onConfirm({
      addOns,
      itemNote: itemNote.trim(),
      total: calculateTotal(),
      addOnSummary: summary, // NEW: Pass back names for display
    });

    dispatch(closeModal());
  };

  if (loading && displayGroups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!displayGroups || displayGroups.length === 0) {
    return (
      <div className="space-y-4">
        <div className="alert alert-info">
          <span>No add-ons available for this item.</span>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Special Instructions (Optional)</span>
          </label>
          <textarea
            value={itemNote}
            onChange={(e) => setItemNote(e.target.value)}
            className="textarea textarea-bordered"
            rows="3"
            placeholder="Any special requests?"
          />
        </div>

        <div className="modal-action">
          <button
            onClick={() => dispatch(closeModal())}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn btn-primary">
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Item Info */}
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-bold text-lg">{menuItem.name}</h3>
        <p className="text-primary font-semibold">
          Base Price: {currency}
          {menuItem.price.toFixed(2)}
        </p>
      </div>

      {/* Add-On Groups */}
      {displayGroups.map((group) => (
        <div key={group._id} className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                {group.name}
                {group.isRequired && (
                  <span className="badge badge-error badge-sm">Required</span>
                )}
              </h4>
              {group.description && (
                <p className="text-sm text-base-content/70">
                  {group.description}
                </p>
              )}
              <p className="text-xs text-base-content/60 mt-1">
                {group.selectionType === "single"
                  ? "Choose one"
                  : `Choose ${
                      group.minSelections
                        ? `${group.minSelections}-${
                            group.maxSelections || "many"
                          }`
                        : group.maxSelections
                        ? `up to ${group.maxSelections}`
                        : "any"
                    }`}
              </p>
            </div>
          </div>

          {errors[group._id] && <ErrorText>{errors[group._id]}</ErrorText>}

          <div className="grid grid-cols-1 gap-2">
            {group.items.map((item) => {
              const selected = (selections[group._id] || []).includes(item._id);
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleSelect(group._id, item._id, group)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:bg-base-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-base-300"
                      }`}
                    >
                      {selected && (
                        <Check className="w-3 h-3 text-primary-content" />
                      )}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-primary font-semibold">
                    {item.price > 0
                      ? `+${currency}${item.price.toFixed(2)}`
                      : "Free"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Notes */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Special Instructions (Optional)</span>
        </label>
        <textarea
          value={itemNote}
          onChange={(e) => setItemNote(e.target.value)}
          className="textarea textarea-bordered"
          rows="3"
          placeholder="e.g., No onions, extra spicy"
        />
      </div>

      {/* Total */}
      <div className="bg-primary/10 p-4 rounded-lg flex justify-between items-center">
        <span className="font-semibold">Total:</span>
        <span className="text-2xl font-bold text-primary">
          {currency}
          {calculateTotal().toFixed(2)}
        </span>
      </div>

      <div className="modal-action">
        <button
          onClick={() => dispatch(closeModal())}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button onClick={handleConfirm} className="btn btn-primary">
          Add to Cart - {currency}
          {calculateTotal().toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default AddOnSelectorModalBody;
