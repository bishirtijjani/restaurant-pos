import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveStore } from "../storeSlice";
import {
  BuildingStorefrontIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { clearCart } from "../../orders/posSlice";
import { clearCurrentOrder, clearFilters } from "../../orders/ordersSlice";
import { clearCurrentItem } from "../../inventory/inventorySlice";

function StoreSwitcher() {
  const dispatch = useDispatch();
  const { activeStoreId } = useSelector((state) => state.commonStore);
  const { user } = useSelector((state) => state.auth);

  // We assume user.stores is populated with the list of available stores
  const availableStores = user?.stores || [];

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
    // Close the dropdown after selection (optional, as reload will handle it, but for UI feedback)
    const details = document.getElementById("store-switcher-dropdown");
    if (details) details.removeAttribute("open");
  };

  // Find current store details to display name
  const currentStoreInfo = availableStores.find(
    (s) => (s.storeId?._id || s.storeId) === activeStoreId,
  );
  const currentStoreName = currentStoreInfo?.storeId?.name || "Select Store";

  if (availableStores.length <= 1) return null; // Hide if only 1 store

  return (
    <details
      id="store-switcher-dropdown"
      className="dropdown dropdown-bottom w-full"
    >
      <summary className="btn btn-ghost w-full justify-between bg-base-100 border border-base-300 shadow-sm hover:bg-base-200 group">
        <div className="flex items-center gap-2 overflow-hidden">
          <BuildingStorefrontIcon className="w-5 h-5 text-primary" />
          <span className="truncate max-w-[120px]">{currentStoreName}</span>
        </div>
      </summary>

      <ul className="menu dropdown-content z-[50] p-2 shadow-xl bg-base-100 rounded-box w-full border border-base-300 mt-1">
        {availableStores.map((storeLink, index) => {
          const sId = storeLink.storeId?._id || storeLink.storeId;
          const sName = storeLink.storeId?.name || "Unknown Store";
          const isActive = sId === activeStoreId;

          return (
            <li key={index}>
              <button
                onClick={() => handleSwitchStore(sId)}
                className={`flex justify-between items-center py-2 ${isActive ? "active" : ""}`}
              >
                <span className="truncate">{sName}</span>
                {isActive && (
                  <span className="badge badge-xs badge-primary">Active</span>
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
    </details>
  );
}

export default StoreSwitcher;
