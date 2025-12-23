// frontend/src/components/Mobile/FloatingCartPreview.jsx
import React from "react";
import { ShoppingCart, ChevronUp } from "lucide-react";
import { useSwipe } from "../../hooks/useSwipe";
import { useHaptic } from "../../hooks/useHaptic";

/**
 * Floating Cart Preview Component
 * Shows cart summary and can be swiped up to expand
 */
const FloatingCartPreview = ({
  itemCount = 0,
  total = 0,
  currency = "$",
  onExpand,
  onNavigateToCart,
  className = "",
}) => {
  const haptic = useHaptic();

  const swipeHandlers = useSwipe({
    onSwipeUp: () => {
      haptic.medium();
      onExpand?.();
    },
  });

  const handleClick = () => {
    haptic.light();
    onNavigateToCart?.();
  };

  if (itemCount === 0) return null;

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 z-30 ${className}`}
      {...swipeHandlers}
    >
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
          <ChevronUp size={20} className="animate-bounce" />
        </div>
      </button>

      {/* Swipe hint */}
      <div className="text-center mt-2">
        <div className="inline-flex items-center gap-1 text-xs text-base-content/50">
          <ChevronUp size={12} />
          <span>Swipe up to expand</span>
        </div>
      </div>
    </div>
  );
};

export default FloatingCartPreview;
