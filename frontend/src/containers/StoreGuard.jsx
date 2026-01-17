import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { setActiveStore } from "../features/common/storeSlice";
import { clearCart } from "../features/orders/posSlice";
import {
  clearCurrentOrder,
  clearFilters,
} from "../features/orders/ordersSlice";
import { clearCurrentItem } from "../features/inventory/inventorySlice";
import { openModal } from "../features/common/modalSlice";
import { MODAL_BODY_TYPES } from "../utils/globalConstantUtil";
import { showNotification } from "../features/common/headerSlice";

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
  const { user } = useSelector((state) => state.auth);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    if (!activeStoreId && isStoreRoute && !storesLoading) {
      // Fallback check: Does the user profile imply they have stores?
      // This protects against the race condition where logging in populates user.stores
      // but Redux stores slice hasn't been fetched yet.
      const userHasStores = user?.stores?.length > 0;

      if (stores.length === 0 && !userHasStores) {
        // New user with no stores -> Force Onboarding Journey
        window.location.href = "/onboarding";
      } else if (stores.length > 0) {
        // User with stores but none active -> Select Store Modal
        dispatch(
          openModal({
            title: "Select Active Store",
            bodyType: MODAL_BODY_TYPES.SELECT_STORE,
            size: "lg",
          }),
        );
      }
      // If stores.length === 0 but userHasStores is true:
      // We do nothing. The getStores() effect will run/is running,
      // and once it completes, stores.length will be > 0, triggering the modal.
    }
  }, [
    activeStoreId,
    isStoreRoute,
    dispatch,
    stores.length,
    storesLoading,
    user,
  ]);

  if (!activeStoreId && isStoreRoute) {
    return (
      <div className="relative min-h-[50vh] flex items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-base-100/50 backdrop-blur-md z-0"></div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 text-center"
        >
          <div className="loading loading-ring loading-lg text-primary mb-4"></div>
          <p className="font-black text-xs uppercase tracking-[0.2em] opacity-40">
            Initializing Flow
          </p>
        </motion.div>
      </div>
    );
  }

  return children;
}

export default StoreGuard;
