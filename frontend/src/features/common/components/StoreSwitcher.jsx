import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveStore } from "../storeSlice";
import {
  ChevronDownIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { clearCart } from "../../orders/posSlice";
import { clearCurrentOrder, clearFilters } from "../../orders/ordersSlice";
import { clearCurrentItem } from "../../inventory/inventorySlice";

function StoreSwitcher() {
  const dispatch = useDispatch();
  const { activeStoreId, activeStore } = useSelector(
    (state) => state.commonStore
  );
  const { user } = useSelector((state) => state.auth);
  // We assume user.stores is populated with the list of available stores
  // If not, we might need to fetch them or rely on the auth slice
  const availableStores = user?.stores || [];

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSwitchStore = (storeId) => {
    if (storeId !== activeStoreId) {
      // Clear all feature state before switching stores
      dispatch(clearCart());
      dispatch(clearCurrentOrder());
      dispatch(clearFilters());
      dispatch(clearCurrentItem());

      // Update active store
      dispatch(setActiveStore(storeId));

      // Hard reload to ensure clean state
      window.location.reload();
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find current store details to display name
  const currentStoreInfo = availableStores.find(
    (s) => (s.storeId?._id || s.storeId) === activeStoreId
  );
  const currentStoreName = currentStoreInfo?.storeId?.name || "Select Store";

  if (availableStores.length <= 1) return null; // Hide if only 1 store

  return (
    <div className="relative px-2 mb-4" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="btn btn-ghost w-full justify-between bg-base-100 border border-base-300 shadow-sm hover:bg-base-200"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <BuildingStorefrontIcon className="w-5 h-5 text-primary" />
          <span className="truncate max-w-[120px]">{currentStoreName}</span>
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full z-50 mt-1 px-2">
          <ul className="menu bg-base-100 w-full rounded-box shadow-xl border border-base-300">
            {availableStores.map((storeLink, index) => {
              const sId = storeLink.storeId?._id || storeLink.storeId;
              const sName = storeLink.storeId?.name || "Unknown Store";
              const isActive = sId === activeStoreId;

              return (
                <li key={index}>
                  <button
                    onClick={() => handleSwitchStore(sId)}
                    className={`${
                      isActive ? "active" : ""
                    } flex justify-between items-center py-2`}
                  >
                    <span className="truncate">{sName}</span>
                    {isActive && (
                      <span className="badge badge-xs badge-primary">
                        Active
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            <div className="divider my-0"></div>
            <li>
              <a
                href="/app/stores"
                className="text-xs text-center justify-center font-semibold text-primary"
              >
                Manage Stores
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default StoreSwitcher;
