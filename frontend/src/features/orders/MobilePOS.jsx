// frontend/src/features/orders/MobilePOS.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useResponsive } from "../../hooks/useResponsive";
import { Lock } from "lucide-react";
import { useSwipe } from "../../hooks/useSwipe";
import { useHaptic } from "../../hooks/useHaptic";
import { BottomTabBar, FloatingCartPreview } from "../../components/Mobile";
import { setActiveTab } from "./mobilePOSSlice";
import { useAuth } from "../../utils/permission";
import TitleCard from "../../components/Cards/TitleCard";

// Import tabs
import MenuTab from "./mobile/MenuTab";
import CartTab from "./mobile/CartTab";
import PaymentTab from "./mobile/PaymentTab";
import MoreTab from "./mobile/MoreTab";

// Import existing desktop POS
import POS from "./POS";

/**
 * Mobile POS Component
 * Adaptive interface that shows mobile UI on small screens
 * and desktop UI on larger screens
 */
const MobilePOS = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const haptic = useHaptic();

  // Redux state
  const { activeTab, showFloatingCart } = useSelector(
    (state) => state.mobilePOS,
  );
  const { cart } = useSelector((state) => state.pos);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings,
  );
  const currency = settings?.currency?.symbol || "$";

  // Permissions
  const canCreateOrders = can("createOrders");

  // Calculate cart total
  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.price + (item.addOnsTotal || 0)) * item.quantity,
    0,
  );

  // Swipe between tabs
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      const tabs = ["menu", "cart", "payment", "more"];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        haptic.light();
        dispatch(setActiveTab(tabs[currentIndex + 1]));
      }
    },
    onSwipeRight: () => {
      const tabs = ["menu", "cart", "payment", "more"];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        haptic.light();
        dispatch(setActiveTab(tabs[currentIndex - 1]));
      }
    },
  });

  const handleNavigateToCart = () => {
    dispatch(setActiveTab("cart"));
  };

  // If desktop, show existing POS
  if (isDesktop) {
    return <POS />;
  }

  // If no permission, show access denied
  if (!canCreateOrders) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <Lock className="w-16 h-16 mb-4 text-error" />
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to create orders.
              </p>
              <button
                onClick={() => navigate("/app/dashboard")}
                className="btn btn-primary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  // Mobile/Tablet UI
  return (
    <div
      className="fixed inset-0 bg-base-200 flex flex-col overflow-hidden"
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
      {...swipeHandlers}
    >
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "menu" && <MenuTab />}
        {activeTab === "cart" && <CartTab />}
        {activeTab === "payment" && <PaymentTab />}
        {activeTab === "more" && <MoreTab />}
      </div>

      {/* Floating Cart Preview (only on menu tab) */}
      {activeTab === "menu" && showFloatingCart && cart.length > 0 && (
        <FloatingCartPreview
          itemCount={cart.length}
          total={cartTotal}
          currency={currency}
          onNavigateToCart={handleNavigateToCart}
        />
      )}

      {/* Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => dispatch(setActiveTab(tab))}
        cartCount={cart.length}
      />
    </div>
  );
};

export default MobilePOS;
