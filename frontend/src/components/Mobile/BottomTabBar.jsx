// frontend/src/components/Mobile/BottomTabBar.jsx
import React from "react";
import {
  UtensilsCrossed,
  ShoppingCart,
  CreditCard,
  MoreHorizontal,
} from "lucide-react";
import { useHaptic } from "../../hooks/useHaptic";

/**
 * Bottom Tab Bar for mobile navigation
 * Provides primary navigation between main POS sections
 */
const BottomTabBar = ({
  activeTab,
  onTabChange,
  cartCount = 0,
  className = "",
}) => {
  const haptic = useHaptic();

  const tabs = [
    {
      id: "menu",
      label: "Menu",
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      id: "payment",
      label: "Pay",
      icon: CreditCard,
      badge: null,
    },
    {
      id: "more",
      label: "More",
      icon: MoreHorizontal,
      badge: null,
    },
  ];

  const handleTabClick = (tabId) => {
    if (tabId !== activeTab) {
      haptic.light();
      onTabChange(tabId);
    }
  };

  return (
    <div
      className={`w-full bg-base-100 border-t border-base-300 safe-area-bottom z-50 ${className}`}
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                isActive ? "text-primary" : "text-base-content/60"
              }`}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  size={24}
                  className={`transition-all ${
                    isActive ? "scale-110" : "scale-100"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {tab.badge !== null && (
                  <span className="absolute -top-2 -right-2 bg-error text-error-content text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
