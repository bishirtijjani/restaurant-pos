// frontend/src/features/orders/mobile/sheets/AddOnSheet.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Minus, Check, AlertCircle } from "lucide-react";
import { useHaptic } from "../../../../hooks/useHaptic";
import { BottomSheet } from "../../../../components/Mobile";
import { setActiveSheet } from "../../mobilePOSSlice";
import { addToCart } from "../../posSlice";

/**
 * Add-on Selection Sheet
 * Mobile-optimized replacement for AddOnSelectorModalBody
 */
const AddOnSheet = ({
  menuItem,
  isOpen,
  onClose,
  initialSelections = {},
  initialNote = "",
  mode = "add", // 'add' | 'edit'
  onConfirm,
}) => {
  const dispatch = useDispatch();
  const haptic = useHaptic();

  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  // State
  const [selections, setSelections] = useState({});
  const [itemNote, setItemNote] = useState("");
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Initialize/Reset when item changes or sheet opens
  useEffect(() => {
    if (menuItem && isOpen) {
      setSelections(initialSelections);
      setItemNote(initialNote);
      setErrors({});
      setTotalPrice(menuItem.price);
    }
  }, [menuItem, isOpen]); // removed initialSelections/initialNote from dependency to avoid reset loops if passed inline

  // Calculate total whenever selections change
  useEffect(() => {
    if (!menuItem) return;

    let addonTotal = 0;

    if (menuItem.addOnGroups) {
      menuItem.addOnGroups.forEach((group) => {
        const groupSelections = selections[group._id] || [];

        group.addOnItems.forEach((item) => {
          if (groupSelections.includes(item._id)) {
            addonTotal += item.price;
          }
        });
      });
    }

    setTotalPrice(menuItem.price + addonTotal);
  }, [selections, menuItem]);

  const handleSelection = (groupId, itemId, group) => {
    haptic.light();

    setSelections((prev) => {
      const currentSelections = prev[groupId] || [];
      const isSelected = currentSelections.includes(itemId);

      let newSelections;

      if (group.selectionType === "single") {
        // Toggle if already selected (optional) or select new (mandatory replacement)
        // For single select, we usually just replace
        newSelections = [itemId];
      } else {
        // Multiple selection
        if (isSelected) {
          newSelections = currentSelections.filter((id) => id !== itemId);
        } else {
          // Check max allowed
          if (group.maximum && currentSelections.length >= group.maximum) {
            haptic.error();
            // Could show a toast here
            return prev;
          }
          newSelections = [...currentSelections, itemId];
        }
      }

      // Clear error for this group if resolved
      if (group.required && newSelections.length >= (group.minimum || 1)) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[groupId];
          return newErrors;
        });
      }

      return {
        ...prev,
        [groupId]: newSelections,
      };
    });
  };

  const validateSelections = () => {
    const newErrors = {};
    let isValid = true;

    menuItem.addOnGroups?.forEach((group) => {
      const groupSelections = selections[group._id] || [];

      if (group.required) {
        const min = group.minimum || 1;
        if (groupSelections.length < min) {
          newErrors[group._id] = `Please select at least ${min} option${
            min > 1 ? "s" : ""
          }`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddToCart = () => {
    if (validateSelections()) {
      haptic.success();

      // Construct addOnData similar to standard POS
      const addOnData = {
        addOns: [], // This structure needs to match what posSlice expects
        itemNote,
        total: totalPrice,
      };

      // Transform selections into expected format
      const addOnsList = [];
      menuItem.addOnGroups.forEach((group) => {
        const selectedIds = selections[group._id];
        if (selectedIds && selectedIds.length > 0) {
          const selectedItems = group.addOnItems.filter((item) =>
            selectedIds.includes(item._id)
          );
          addOnsList.push({
            groupName: group.name,
            groupId: group._id,
            selectedItems: selectedItems,
          });
        }
      });

      addOnData.addOns = addOnsList;

      if (onConfirm) {
        onConfirm(addOnData);
      } else {
        dispatch(addToCart({ item: menuItem, addOnData }));
      }
      onClose();
    } else {
      haptic.error();
    }
  };

  if (!menuItem) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Item" : "Customize Item"}
      snapPoints={[0.9]} // Nearly full screen for complex customizations
      initialSnap={0}
      className="bg-base-100"
    >
      <div className="flex flex-col h-full">
        {/* Item Header */}
        <div className="px-5 pb-4 border-b border-base-200">
          <h2 className="text-xl font-bold">{menuItem.name}</h2>
          <p className="text-primary font-bold text-lg mt-1">
            {currency}
            {totalPrice.toFixed(2)}
          </p>
          {menuItem.description && (
            <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
              {menuItem.description}
            </p>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {" "}
          {/* pb-24 for sticky footer space */}
          {/* Add-on Groups */}
          <div className="p-4 space-y-6">
            {menuItem.addOnGroups?.map((group) => (
              <div
                key={group._id}
                className={`space-y-3 ${
                  errors[group._id] ? "bg-error/5 p-3 rounded-lg -mx-3" : ""
                }`}
              >
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      {group.name}
                      {group.required && (
                        <span className="badge badge-xs badge-error">
                          Required
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-base-content/60">
                      {group.selectionType === "single"
                        ? "Select 1"
                        : `Select up to ${group.maximum || "any"}`}
                    </p>
                  </div>
                  {errors[group._id] && (
                    <span className="text-xs text-error font-medium flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors[group._id]}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {group.addOnItems.map((item) => {
                    const isSelected = (selections[group._id] || []).includes(
                      item._id
                    );
                    return (
                      <button
                        key={item._id}
                        onClick={() =>
                          handleSelection(group._id, item._id, group)
                        }
                        className={`
                          flex items-center justify-between p-3 rounded-xl border transition-all text-left
                          ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-base-200 bg-base-100 hover:border-base-300"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                            ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-base-300"
                            }
                          `}
                          >
                            {isSelected && (
                              <Check
                                size={12}
                                className="text-primary-content"
                              />
                            )}
                          </div>
                          <span
                            className={`${isSelected ? "font-medium" : ""}`}
                          >
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium opacity-80">
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

            {/* Special Instructions */}
            <div className="pt-2">
              <h3 className="font-bold text-base mb-2">Special Instructions</h3>
              <textarea
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                placeholder="e.g. No onions, extra spicy..."
                className="textarea textarea-bordered w-full h-24 resize-none text-base"
              />
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-base-100 border-t border-base-200 safe-area-bottom z-50 shadow-lg-up">
          <button
            onClick={handleAddToCart}
            className="btn btn-primary btn-lg w-full flex justify-between items-center text-lg"
          >
            <span>{mode === "edit" ? "Save Changes" : "Add to Cart"}</span>
            <span className="font-bold bg-primary-focus/20 px-2 py-1 rounded">
              {currency}
              {totalPrice.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default AddOnSheet;
