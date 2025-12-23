import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { setActiveStore } from "../features/common/storeSlice";
import { clearCart } from "../features/orders/posSlice";
import {
  clearCurrentOrder,
  clearFilters,
} from "../features/orders/ordersSlice";
import { clearCurrentItem } from "../features/inventory/inventorySlice";
import { showNotification } from "../features/common/headerSlice";

// NOTE: Offline storage is automatically scoped per store via storage.js factory pattern
// Each store has isolated IndexedDB databases, no manual cleanup needed

// Routes that don't require an active store selected
const PUBLIC_STORE_ROUTES = [
  "/app/stores",
  "/app/stores/create",
  "/app/settings/profile",
];

function StoreGuard({ children }) {
  const { activeStoreId } = useSelector((state) => state.commonStore);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    location.pathname.startsWith(path)
  );

  if (!activeStoreId && isStoreRoute) {
    // Show notification before redirecting
    dispatch(
      showNotification({
        message: "Please select a store to continue",
        status: 0,
      })
    );

    return <Navigate to="/app/stores" replace />;
  }

  return children;
}

export default StoreGuard;
