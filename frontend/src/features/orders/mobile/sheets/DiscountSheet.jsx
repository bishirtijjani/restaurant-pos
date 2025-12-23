// frontend/src/features/orders/mobile/sheets/DiscountSheet.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tag, Check, X, Percent, BadgeDollarSign } from "lucide-react";
import { useHaptic } from "../../../../hooks/useHaptic";
import { BottomSheet } from "../../../../components/Mobile";
import { setOrderDiscount } from "../../posSlice";
import { fetchDiscounts } from "../../../../features/discounts/discountsSlice";

/**
 * Discount Selection Sheet
 * Mobile-optimized replacement for DiscountSection modal
 */
const DiscountSheet = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const haptic = useHaptic();

  // Redux state
  const { discounts } = useSelector((state) => state.discounts);
  const { cart, orderDiscount } = useSelector((state) => state.pos);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  // Calculate cart subtotal for validation
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.price + (item.addOnsTotal || 0)) * item.quantity,
    0
  );

  // Local state
  const [promoCode, setPromoCode] = useState("");
  const [manualDiscount, setManualDiscount] = useState({
    value: "",
    type: "percentage",
  });
  const [manualError, setManualError] = useState("");

  useEffect(() => {
    dispatch(fetchDiscounts());
  }, [dispatch]);

  const handleApplyDiscount = (discount) => {
    // Validation
    const now = new Date();
    const start = new Date(discount.validFrom);
    const end = new Date(discount.validUntil);

    // Check dates
    if (now < start || now > end) {
      haptic.error();
      // Toast logic here
      return;
    }

    // Check min order
    if (discount.minOrderValue && cartSubtotal < discount.minOrderValue) {
      haptic.error();
      return;
    }

    haptic.success();
    dispatch(
      setOrderDiscount({
        enabled: true,
        type: discount.type,
        value: discount.value,
        maxDiscount: discount.maxDiscount,
        name: discount.name,
        discountId: discount._id,
      })
    );
    onClose();
  };

  const handleApplyPromoCode = () => {
    // In a real app, this would validate against backend
    // For now, we simulate finding a discount by code
    const discount = discounts.find((d) => d.code === promoCode && d.isActive);
    if (discount) {
      handleApplyDiscount(discount);
    } else {
      haptic.error();
    }
  };

  const handleManualApply = () => {
    if (!manualDiscount.value || manualDiscount.value <= 0) {
      setManualError("Enter a valid value");
      haptic.error();
      return;
    }

    if (manualDiscount.type === "percentage" && manualDiscount.value > 100) {
      setManualError("Percentage cannot exceed 100%");
      haptic.error();
      return;
    }

    haptic.success();
    dispatch(
      setOrderDiscount({
        enabled: true,
        type: manualDiscount.type === "percentage" ? "PERCENTAGE" : "FIXED",
        value: parseFloat(manualDiscount.value),
        name: "Manual Discount",
        isManual: true,
      })
    );
    onClose();
  };

  const clearDiscount = () => {
    haptic.medium();
    dispatch(setOrderDiscount(null));
    onClose();
  };

  const activeDiscounts = discounts.filter((d) => d.isActive);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Apply Discount"
      snapPoints={[0.8]}
    >
      <div className="flex flex-col h-full bg-base-100 p-4 space-y-6 overflow-y-auto">
        {/* Current Applied Status */}
        {orderDiscount?.enabled && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-success">{orderDiscount.name}</h3>
              <p className="text-xs text-success-content/70">
                {orderDiscount.type === "PERCENTAGE"
                  ? `${orderDiscount.value}% Off`
                  : `${currency}${orderDiscount.value} Off`}
              </p>
            </div>
            <button
              onClick={clearDiscount}
              className="btn btn-xs btn-circle btn-ghost text-success hover:bg-success/20"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Promo Code Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter Promo Code"
            className="input input-bordered flex-1"
          />
          <button
            onClick={handleApplyPromoCode}
            disabled={!promoCode}
            className="btn btn-primary"
          >
            Apply
          </button>
        </div>

        {/* Available Discounts List */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-base-content/70 uppercase tracking-wider">
            <Tag size={16} /> Available Offers
          </h3>
          <div className="space-y-3">
            {activeDiscounts.map((discount) => {
              const isApplicable =
                cartSubtotal >= (discount.minOrderValue || 0);

              return (
                <button
                  key={discount._id}
                  onClick={() => isApplicable && handleApplyDiscount(discount)}
                  className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group
                                ${
                                  isApplicable
                                    ? "hover:border-primary cursor-pointer border-base-300 bg-base-100"
                                    : "opacity-50 cursor-not-allowed bg-base-200 border-transparent"
                                }
                            `}
                >
                  <div className="flex justify-between items-start z-10 relative">
                    <div>
                      <h4 className="font-bold text-lg">{discount.name}</h4>
                      <p className="text-sm text-base-content/60">
                        {discount.description || "No description"}
                      </p>
                      {discount.minOrderValue > 0 && (
                        <div className="text-xs mt-1 font-medium text-warning">
                          Min. Order: {currency}
                          {discount.minOrderValue}
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xl text-primary">
                      {discount.type === "PERCENTAGE"
                        ? `${discount.value}%`
                        : `${currency}${discount.value}`}
                    </div>
                  </div>

                  {/* Decorative Background Icon */}
                  <Tag className="absolute -bottom-4 -right-4 w-24 h-24 text-base-content/5 rotate-12 group-hover:scale-110 transition-transform" />
                </button>
              );
            })}

            {activeDiscounts.length === 0 && (
              <div className="text-center py-8 text-base-content/50 bg-base-200/50 rounded-xl">
                <Tag size={32} className="mx-auto mb-2 opacity-50" />
                <p>No active discounts found</p>
              </div>
            )}
          </div>
        </div>

        <div className="divider">OR</div>

        {/* Manual Discount */}
        <div>
          <h3 className="font-semibold mb-3 text-sm text-base-content/70 uppercase tracking-wider">
            Manual Discount
          </h3>
          <div className="flex gap-2 mb-2">
            <div className="join flex-1">
              <button
                className={`join-item btn flex-1 ${
                  manualDiscount.type === "percentage" ? "btn-active" : ""
                }`}
                onClick={() =>
                  setManualDiscount({ ...manualDiscount, type: "percentage" })
                }
              >
                <Percent size={16} />
              </button>
              <button
                className={`join-item btn flex-1 ${
                  manualDiscount.type === "fixed" ? "btn-active" : ""
                }`}
                onClick={() =>
                  setManualDiscount({ ...manualDiscount, type: "fixed" })
                }
              >
                <BadgeDollarSign size={16} />
              </button>
            </div>
            <input
              type="number"
              value={manualDiscount.value}
              onChange={(e) => {
                setManualDiscount({ ...manualDiscount, value: e.target.value });
                setManualError("");
              }}
              placeholder="Value"
              className={`input input-bordered w-32 ${
                manualError ? "input-error" : ""
              }`}
            />
          </div>
          {manualError && (
            <p className="text-xs text-error mt-1">{manualError}</p>
          )}
          <button
            onClick={handleManualApply}
            className="btn w-full btn-outline mt-2"
          >
            Apply Manual Discount
          </button>
        </div>

        {/* Spacer for bottom sheet handle */}
        <div className="h-4"></div>
      </div>
    </BottomSheet>
  );
};

export default DiscountSheet;
