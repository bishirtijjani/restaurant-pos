// frontend/src/components/Mobile/FloatingCartPreview.jsx
import React from "react";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useHaptic } from "../../hooks/useHaptic";

/**
 * Floating Cart Preview Component
 * Shows cart summary, tap to navigate to cart tab
 */
const FloatingCartPreview = ({
  itemCount = 0,
  total = 0,
  currency = "$",
  onNavigateToCart,
  className = "",
}) => {
  const haptic = useHaptic();

  const handleClick = () => {
    haptic.light();
    onNavigateToCart?.();
  };

  if (itemCount === 0) return null;

  return (
    <div className={`fixed bottom-20 left-4 right-4 z-30 ${className}`}>
      <button
        onClick={handleClick}
        className="w-full bg-primary text-primary-content rounded-2xl shadow-2xl p-4 flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-error text-error-content text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium opacity-90">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </div>
            <div className="text-lg font-bold">
              {currency}
              {total.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">View Cart</span>
          <ChevronRight size={20} />
        </div>
      </button>
    </div>
  );
};

export default FloatingCartPreview;
