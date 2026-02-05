import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  setActiveStore,
  clearActiveStore,
} from "../features/common/storeSlice";
import { logoutUser } from "../app/authSlice";
import { clearCart } from "../features/orders/posSlice";
import {
  clearCurrentOrder,
  clearFilters,
} from "../features/orders/ordersSlice";
import { clearCurrentItem } from "../features/inventory/inventorySlice";
import { openModal } from "../features/common/modalSlice";
import { MODAL_BODY_TYPES } from "../utils/globalConstantUtil";
import { showNotification } from "../features/common/headerSlice";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// NOTE: Offline storage is automatically scoped per store via storage.js factory pattern
// Each store has isolated IndexedDB databases, no manual cleanup needed

import { getStores } from "../features/stores/storeSlice";

// Routes that don't require an active store selected
const PUBLIC_STORE_ROUTES = [
  "/app/stores",
  "/app/stores/create",
  "/app/settings/profile",
];

function StoreGuard({ children }) {
  const { activeStoreId } = useSelector((state) => state.commonStore);
  const {
    items: stores,
    loading: storesLoading,
    error: storesError,
  } = useSelector((state) => state.stores);
  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSelectStore = (storeId) => {
    // Clear all feature state before switching stores
    dispatch(clearCart());
    dispatch(clearCurrentOrder());
    dispatch(clearFilters());
    dispatch(clearCurrentItem());

    // Update active store
    dispatch(setActiveStore(storeId));

    // Force reload to ensure clean state and triggered effects
    window.location.reload();
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearActiveStore());
    navigate("/login");
  };

  // Fetch stores if not already loaded and no store is active
  useEffect(() => {
    if (
      !activeStoreId &&
      stores.length === 0 &&
      !storesLoading &&
      !storesError
    ) {
      dispatch(getStores());
    }
  }, [activeStoreId, stores.length, storesLoading, storesError, dispatch]);

  // Cross-Tab Synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "activeStoreId") {
        const newStoreId = e.newValue;
        if (newStoreId && newStoreId !== activeStoreId) {
          // Another tab changed the store. Clear state and update Redux.
          dispatch(clearCart());
          dispatch(clearCurrentOrder());
          dispatch(clearFilters());
          dispatch(clearCurrentItem());
          dispatch(setActiveStore(newStoreId));

          // Reload to ensure full state reset (safest for POS)
          window.location.reload();
        } else if (!newStoreId) {
          // Store was cleared in another tab
          dispatch(setActiveStore(null));
          navigate("/app/stores");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [activeStoreId, dispatch, navigate]);

  // If no store is selected, and we are trying to access a store-specific route
  // Redirect to Store Management
  const isStoreRoute = !PUBLIC_STORE_ROUTES.some((path) =>
    location.pathname.startsWith(path),
  );

  useEffect(() => {
    if (!activeStoreId && isStoreRoute && !storesLoading && !authLoading) {
      // Fallback check: Does the user profile imply they have stores?
      // This protects against the race condition where logging in populates user.stores
      // but Redux stores slice hasn't been fetched yet.
      const userHasStores = user?.stores?.length > 0;

      if (stores.length === 0 && !userHasStores) {
        // New user with no stores -> Force Onboarding Journey
        window.location.href = "/onboarding";
      } else if (stores.length === 1) {
        // AUTO-SELECT: Only one store exists, just use it!
        dispatch(setActiveStore(stores[0]._id));
      }
      // Note: We no longer dispatch openModal here for stores.length > 1
      // as it is handled by the in-place UI in the return statement.
      // If stores.length === 0 but userHasStores is true:
      // We do nothing. The getStores() effect will run/is running,
      // and once it completes, stores.length will be > 0, triggering the modal.
    }
  }, [
    activeStoreId,
    isStoreRoute,
    dispatch,
    stores,
    storesLoading,
    user,
    authLoading,
  ]);

  if (!activeStoreId && isStoreRoute) {
    // If we have stores but none selected, show selection UI (MANDATORY)
    if (stores.length > 1) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-base-100 rounded-[2.5rem] shadow-2xl p-8 border border-base-200"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BuildingStorefrontIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-base-content tracking-tight uppercase">
                Select Store
              </h2>
              <p className="text-base-content/60 mt-2">
                Pick a store to explore your activity
              </p>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {stores.map((store) => {
                const sData = store.storeId || store;
                return (
                  <button
                    key={sData._id}
                    onClick={() => handleSelectStore(sData._id)}
                    className="w-full flex items-center justify-between p-4 rounded-3xl border-2 border-base-200 bg-base-100 hover:border-primary/30 hover:bg-base-200 transition-all group"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-3 rounded-2xl bg-base-200 text-primary group-hover:bg-primary/10">
                        <BuildingStorefrontIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight uppercase tracking-tight text-base-content">
                          {sData.name}
                        </h3>
                        <p className="text-sm opacity-60 flex items-center gap-1 mt-0.5">
                          <MapPinIcon className="w-3 h-3" />
                          {sData.location || "No location set"}
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleLogout}
                className="text-sm font-medium opacity-40 hover:opacity-100 hover:text-error transition-all"
              >
                Logout and try another account
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    // Otherwise show Skeleton UI while loading
    return (
      <div className="flex bg-base-100 min-h-screen">
        {/* Skeleton Sidebar (Desktop) */}
        <div className="w-64 bg-base-200 animate-pulse hidden lg:block" />

        <div className="flex-1 p-8 space-y-8">
          {/* Skeleton Header Area */}
          <div className="flex justify-between items-center">
            <div className="h-10 bg-base-200 rounded-xl animate-pulse w-48" />
            <div className="h-10 bg-base-200 rounded-full animate-pulse w-10" />
          </div>

          {/* Skeleton Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-base-200 rounded-3xl animate-pulse"
              />
            ))}
          </div>

          {/* Skeleton Content Area */}
          <div className="h-[400px] bg-base-200 rounded-[40px] animate-pulse w-full shadow-sm" />
        </div>
      </div>
    );
  }

  return children;
}

export default StoreGuard;
