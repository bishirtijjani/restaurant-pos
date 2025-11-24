// frontend/src/features/orders/components/DiscountSection.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActiveDiscounts,
  validatePromoCode,
  clearValidatedPromo,
} from "../../discounts/discountsSlice";
import {
  Tag,
  Percent,
  X,
  Check,
  Gift,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const DiscountSection = ({
  orderType,
  subtotal,
  appliedDiscount,
  onApplyDiscount,
  onRemoveDiscount,
  currency,
}) => {
  const dispatch = useDispatch();
  const { activeDiscounts, validatedPromo, promoLoading } = useSelector(
    (state) => state.discounts
  );

  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualDiscount, setManualDiscount] = useState({
    type: "percentage",
    value: "",
    name: "Manual Discount",
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    dispatch(fetchActiveDiscounts(orderType));
  }, [dispatch, orderType]);

  useEffect(() => {
    if (validatedPromo) {
      onApplyDiscount({
        enabled: true,
        type: validatedPromo.discountType,
        value: validatedPromo.discountValue,
        maxDiscount: validatedPromo.maximumDiscountAmount,
        name: `Promo: ${validatedPromo.code}`,
        promoCode: validatedPromo.code,
        amount: validatedPromo.discountAmount,
      });
      setPromoCode("");
      dispatch(clearValidatedPromo());
    }
  }, [validatedPromo, onApplyDiscount, dispatch]);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Enter a promo code");
      return;
    }

    setPromoError("");

    try {
      await dispatch(
        validatePromoCode({
          code: promoCode,
          orderAmount: subtotal,
          orderType,
        })
      ).unwrap();
    } catch (error) {
      setPromoError(error.message || "Invalid promo code");
    }
  };

  const handleApplyManualDiscount = () => {
    const value = parseFloat(manualDiscount.value);
    if (!value || value <= 0) return;

    if (manualDiscount.type === "percentage" && value > 100) {
      return;
    }

    onApplyDiscount({
      enabled: true,
      type: manualDiscount.type,
      value,
      name: manualDiscount.name || "Manual Discount",
    });

    setManualDiscount({
      type: "percentage",
      value: "",
      name: "Manual Discount",
    });
    setShowManual(false);
  };

  const handleSelectDiscount = (discount) => {
    onApplyDiscount({
      enabled: true,
      type: discount.type,
      value: discount.value,
      maxDiscount: discount.maximumDiscountAmount,
      name: discount.name,
      discountId: discount._id,
    });
  };

  const hasHappyHour = activeDiscounts.happyHour?.length > 0;

  return (
    <div className="bg-base-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-base-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Discounts & Promos</span>
          {hasHappyHour && (
            <span className="badge badge-warning badge-xs">Happy Hour!</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Applied Discount Display */}
      {appliedDiscount?.enabled && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between bg-success/20 border border-success/30 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              <div>
                <p className="text-sm font-medium">{appliedDiscount.name}</p>
                <p className="text-xs text-base-content/70">
                  {appliedDiscount.type === "percentage"
                    ? `${appliedDiscount.value}% off`
                    : `${currency}${appliedDiscount.value} off`}
                </p>
              </div>
            </div>
            <button
              onClick={onRemoveDiscount}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && !appliedDiscount?.enabled && (
        <div className="px-3 pb-3 space-y-4">
          {/* Happy Hour Discounts */}
          {hasHappyHour && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-warning flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Active Happy Hour
              </p>
              {activeDiscounts.happyHour.map((discount) => (
                <button
                  key={discount._id}
                  onClick={() => handleSelectDiscount(discount)}
                  className="w-full flex items-center justify-between p-2 bg-warning/10 border border-warning/30 rounded-lg hover:bg-warning/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {discount.type === "bogo" ? (
                      <Gift className="w-4 h-4 text-warning" />
                    ) : (
                      <Percent className="w-4 h-4 text-warning" />
                    )}
                    <span className="text-sm">{discount.name}</span>
                  </div>
                  <span className="text-sm font-medium text-warning">
                    {discount.type === "percentage"
                      ? `${discount.value}% off`
                      : discount.type === "fixed"
                      ? `${currency}${discount.value} off`
                      : "BOGO"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Regular Discounts */}
          {activeDiscounts.regular?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-base-content/70">
                Available Discounts
              </p>
              {activeDiscounts.regular.map((discount) => (
                <button
                  key={discount._id}
                  onClick={() => handleSelectDiscount(discount)}
                  className="w-full flex items-center justify-between p-2 bg-base-100 border border-base-300 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-primary" />
                    <span className="text-sm">{discount.name}</span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {discount.type === "percentage"
                      ? `${discount.value}% off`
                      : `${currency}${discount.value} off`}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Promo Code Input */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-base-content/70">
              Have a promo code?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleApplyPromoCode()}
                className={`input input-sm input-bordered flex-1 uppercase font-mono ${
                  promoError ? "input-error" : ""
                }`}
                placeholder="Enter code"
              />
              <button
                onClick={handleApplyPromoCode}
                disabled={promoLoading || !promoCode.trim()}
                className="btn btn-sm btn-primary"
              >
                {promoLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Apply"
                )}
              </button>
            </div>
            {promoError && <p className="text-xs text-error">{promoError}</p>}
          </div>

          {/* Manual Discount */}
          <div className="space-y-2">
            <button
              onClick={() => setShowManual(!showManual)}
              className="text-xs text-primary hover:underline"
            >
              {showManual ? "Hide manual discount" : "Add manual discount"}
            </button>

            {showManual && (
              <div className="space-y-2 p-3 bg-base-100 rounded-lg border border-base-300">
                <div className="flex gap-2">
                  <select
                    value={manualDiscount.type}
                    onChange={(e) =>
                      setManualDiscount((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="select select-sm select-bordered"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">{currency}</option>
                  </select>
                  <input
                    type="number"
                    value={manualDiscount.value}
                    onChange={(e) =>
                      setManualDiscount((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    className="input input-sm input-bordered flex-1"
                    placeholder="Value"
                    min="0"
                    max={manualDiscount.type === "percentage" ? 100 : undefined}
                  />
                </div>
                <input
                  type="text"
                  value={manualDiscount.name}
                  onChange={(e) =>
                    setManualDiscount((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="input input-sm input-bordered w-full"
                  placeholder="Reason (optional)"
                />
                <button
                  onClick={handleApplyManualDiscount}
                  disabled={!manualDiscount.value}
                  className="btn btn-sm btn-outline w-full"
                >
                  Apply Manual Discount
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountSection;
