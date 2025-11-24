// frontend/src/features/orders/components/DiscountBreakdown.jsx
import React from "react";
import { Tag, Percent, Gift, Clock } from "lucide-react";

const DiscountBreakdown = ({ discountBreakdown, currency }) => {
  if (!discountBreakdown || !discountBreakdown.hasDiscount) return null;

  const {
    originalSubtotal,
    totalDiscountAmount,
    discountedSubtotal,
    appliedDiscounts,
  } = discountBreakdown;

  const getDiscountIcon = (type) => {
    switch (type) {
      case "happy_hour":
      case "happy_hour_bogo":
        return <Clock className="w-3 h-3 text-warning" />;
      case "bogo":
        return <Gift className="w-3 h-3 text-success" />;
      default:
        return <Percent className="w-3 h-3 text-primary" />;
    }
  };

  return (
    <div className="space-y-2">
      {/* Original Subtotal */}
      <div className="flex justify-between text-sm text-base-content/70">
        <span>Original Subtotal:</span>
        <span className="line-through">
          {currency}
          {originalSubtotal?.toFixed(2)}
        </span>
      </div>

      {/* Applied Discounts */}
      {appliedDiscounts?.map((discount, index) => (
        <div
          key={index}
          className="flex justify-between text-sm text-success items-center"
        >
          <span className="flex items-center gap-1">
            {getDiscountIcon(discount.type)}
            {discount.name}
            {discount.promoCode && (
              <code className="text-xs bg-success/20 px-1 rounded">
                {discount.promoCode}
              </code>
            )}
          </span>
          <span>
            -{currency}
            {discount.amount?.toFixed(2)}
          </span>
        </div>
      ))}

      {/* Total Discount */}
      {totalDiscountAmount > 0 && (
        <>
          <div className="divider my-1 h-px"></div>
          <div className="flex justify-between text-sm font-medium text-success">
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Total Savings:
            </span>
            <span>
              -{currency}
              {totalDiscountAmount.toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default DiscountBreakdown;
