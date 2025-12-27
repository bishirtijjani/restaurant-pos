import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStores } from "../storeSlice";
import { setActiveStore } from "../../common/storeSlice";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { clearCart } from "../../orders/posSlice";
import { clearCurrentOrder, clearFilters } from "../../orders/ordersSlice";
import { clearCurrentItem } from "../../inventory/inventorySlice";

function SelectStoreModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const { items: stores, loading } = useSelector((state) => state.stores);
  const { activeStoreId } = useSelector((state) => state.commonStore);

  useEffect(() => {
    dispatch(getStores());
  }, [dispatch]);

  const handleSelectStore = (storeId) => {
    if (storeId === activeStoreId) {
      closeModal();
      return;
    }

    // Clear all feature state before switching stores
    dispatch(clearCart());
    dispatch(clearCurrentOrder());
    dispatch(clearFilters());
    dispatch(clearCurrentItem());

    // Update active store
    dispatch(setActiveStore(storeId));

    // Force reload to ensure clean state and triggered effects
    closeModal();
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-gray-500 mb-2">
        You need to select a store to access this section. Please choose one
        from the list below.
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {stores.length === 0 && !loading && (
            <div className="text-center py-10 bg-base-200 rounded-xl border-2 border-dashed border-base-300">
              <BuildingStorefrontIcon className="w-12 h-12 mx-auto text-base-content/20 mb-2" />
              <p className="font-semibold opacity-50">No stores found</p>
              <p className="text-xs opacity-40">
                Contact your administrator if you believe this is an error.
              </p>
            </div>
          )}

          {stores.map((store, k) => {
            const sData = store.storeId || store;
            const isCurrent = sData._id === activeStoreId;

            return (
              <button
                key={k}
                onClick={() => handleSelectStore(sData._id)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all group ${
                  isCurrent
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-base-200 bg-base-100 hover:border-primary/30 hover:bg-base-200"
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div
                    className={`p-3 rounded-lg ${
                      isCurrent
                        ? "bg-primary text-primary-content"
                        : "bg-base-200 text-primary group-hover:bg-primary/10"
                    }`}
                  >
                    <BuildingStorefrontIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">
                      {sData.name}
                    </h3>
                    <p className="text-sm opacity-60 flex items-center gap-1 mt-0.5">
                      <MapPinIcon className="w-3 h-3" />
                      {sData.location || "No location set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <span className="badge badge-primary badge-sm font-bold tracking-wider">
                      ACTIVE
                    </span>
                  )}
                  <ChevronRightIcon
                    className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                      isCurrent ? "text-primary" : "opacity-20"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SelectStoreModalBody;
