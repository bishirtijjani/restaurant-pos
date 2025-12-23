// frontend/src/features/orders/mobile/PaymentTab.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CreditCard,
  Banknote,
  Smartphone,
  DollarSign,
  Tag,
  User,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  ChevronRight,
} from "lucide-react";
import { useHaptic } from "../../../hooks/useHaptic";
import CustomerSheet from "./sheets/CustomerSheet";
import DiscountSheet from "./sheets/DiscountSheet";
import TableSelectionSheet from "./sheets/TableSelectionSheet";
import { setOrderType } from "../posSlice";
import { setActiveSheet, setActiveTab } from "../mobilePOSSlice";
import { openRightDrawer } from "../../common/rightDrawerSlice";
import { RIGHT_DRAWER_TYPES } from "../../../utils/globalConstantUtil";
import { BottomSheet } from "../../../components/Mobile";

/**
 * Payment Tab - Mobile optimized payment processing
 * Features: Order summary, payment methods, tips, completion
 */
const PaymentTab = () => {
  const dispatch = useDispatch();
  const haptic = useHaptic();

  // Redux state
  const { cart, orderType, customerDetails, orderNote, orderDiscount } =
    useSelector((state) => state.pos);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const { activeSheet } = useSelector((state) => state.mobilePOS);
  const currency = settings?.currency?.symbol || "$";

  // Local state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [tipPercentage, setTipPercentage] = useState(0);

  // Calculate totals (simplified - full calculation in payment confirmation)
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price + (item.addOnsTotal || 0)) * item.quantity,
    0
  );

  const tipAmount = (subtotal * tipPercentage) / 100;
  const total = subtotal + tipAmount;

  // Payment methods
  const paymentMethods = [
    { id: "cash", name: "Cash", icon: Banknote, color: "btn-success" },
    { id: "card", name: "Card", icon: CreditCard, color: "btn-info" },
    {
      id: "Transfer",
      name: "Transfer",
      icon: Smartphone,
      color: "btn-warning",
    },
  ];

  // Order types
  const orderTypes = [
    { id: "dine-in", name: "Dine-In", icon: UtensilsCrossed },
    { id: "takeaway", name: "Takeaway", icon: ShoppingBag },
    { id: "delivery", name: "Delivery", icon: Truck },
    { id: "walk-in", name: "Walk-In", icon: User },
  ];

  // Tip presets
  const tipPresets = [
    { value: 0, label: "No Tip" },
    { value: 5, label: "5%" },
    { value: 10, label: "10%" },
    { value: 15, label: "15%" },
  ];

  // Handle payment method selection
  const handlePaymentMethodSelect = (methodId) => {
    haptic.light();
    setSelectedPaymentMethod(methodId);
  };

  // Handle tip selection
  const handleTipSelect = (percentage) => {
    haptic.light();
    setTipPercentage(percentage);
  };

  // Handle order type change
  const handleOrderTypeChange = (type) => {
    haptic.light();
    dispatch(setOrderType(type));

    // If dine-in, show table selection next
    if (type === "dine-in") {
      dispatch(setActiveSheet("table"));
    } else {
      dispatch(setActiveSheet(null));
    }
  };

  // Handle complete payment
  const handleCompletePayment = () => {
    haptic.success();

    // Prepare order payload (similar to desktop POS)
    const orderPayload = {
      table: orderType === "dine-in" ? "Table 1" : "Takeaway", // TODO: Get actual table
      customerDetails: {
        customerId: customerDetails.customerId || null,
        name: customerDetails.name || "Walk-in",
        phone: customerDetails.phone,
        address: orderType === "delivery" ? customerDetails.address : "",
      },
      orderType,
      orderItems: cart.map((item) => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        itemNote: item.itemNote || "",
        addOns:
          item.addOns?.map((a) => ({
            groupId: a.groupId,
            selectedItemIds: a.selectedItemIds,
          })) || [],
        subtotal: (item.price + (item.addOnsTotal || 0)) * item.quantity,
        preparationTime: item.preparationTime || 15,
      })),
      packagingFee: 0,
      deliveryFee: 0,
      totalAmount: total,
      orderNote,
      orderDiscount: orderDiscount?.enabled ? orderDiscount : null,
      promoCode: orderDiscount?.promoCode || null,
      taxBreakdown: {
        subtotal: subtotal,
        totalTax: 0, // TODO: Calculate tax
        serviceCharge: 0,
      },
    };

    // Open payment confirmation drawer
    dispatch(
      openRightDrawer({
        header: "Payment Confirmation",
        bodyType: RIGHT_DRAWER_TYPES.CONFIRM_PAYMENT,
        extraObject: orderPayload,
      })
    );
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-base-200 p-8">
        <CreditCard size={80} className="text-base-content/20 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No items to pay for</h2>
        <p className="text-base-content/60 text-center mb-6">
          Add items to your cart first
        </p>
        <button
          onClick={() => dispatch(setActiveTab("menu"))}
          className="btn btn-primary"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Header */}
      <div className="bg-base-100 p-4 shadow-sm">
        <h2 className="text-xl font-bold">Payment</h2>
        <p className="text-sm text-base-content/60">
          Review and complete order
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Order Type */}
        <div className="bg-base-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Order Type</h3>
            <button
              onClick={() => dispatch(setActiveSheet("orderType"))}
              className="btn btn-ghost btn-sm gap-2"
            >
              Change
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
            {(() => {
              const currentType = orderTypes.find((t) => t.id === orderType);
              const Icon = currentType?.icon;
              return (
                <>
                  <Icon size={24} className="text-primary" />
                  <span className="font-medium">{currentType?.name}</span>
                </>
              );
            })()}
          </div>
        </div>

        {/* Customer Details (for delivery/takeaway) */}
        {(orderType === "delivery" || orderType === "takeaway") && (
          <div className="bg-base-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User size={18} />
                Customer Details
              </h3>
              <button
                onClick={() => dispatch(setActiveSheet("customer"))}
                className="btn btn-ghost btn-sm gap-2"
              >
                {customerDetails.name ? "Edit" : "Add"}
                <ChevronRight size={16} />
              </button>
            </div>
            {customerDetails.name ? (
              <div className="space-y-2 text-sm">
                <div>{customerDetails.name}</div>
                {customerDetails.phone && <div>{customerDetails.phone}</div>}
                {orderType === "delivery" && customerDetails.address && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="mt-1 flex-shrink-0" />
                    <span>{customerDetails.address}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-base-content/60">
                No customer details added
              </p>
            )}
          </div>
        )}

        {/* Discount */}
        <div className="bg-base-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Tag size={18} />
              Discount
            </h3>
            <button
              onClick={() => dispatch(setActiveSheet("discount"))}
              className="btn btn-ghost btn-sm gap-2"
            >
              {orderDiscount?.enabled ? "Change" : "Apply"}
              <ChevronRight size={16} />
            </button>
          </div>
          {orderDiscount?.enabled ? (
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <span className="font-medium text-success">
                {orderDiscount.name}
              </span>
              <span className="font-bold text-success">
                -{currency}
                {orderDiscount.amount?.toFixed(2) || "0.00"}
              </span>
            </div>
          ) : (
            <p className="text-sm text-base-content/60">No discount applied</p>
          )}
        </div>

        {/* Tip */}
        <div className="bg-base-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <DollarSign size={18} />
            Add Tip (Optional)
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {tipPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleTipSelect(preset.value)}
                className={`btn btn-sm ${
                  tipPercentage === preset.value ? "btn-success" : "btn-outline"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {tipAmount > 0 && (
            <div className="mt-3 p-2 bg-success/10 rounded-lg text-center">
              <span className="text-sm font-medium text-success">
                Tip: {currency}
                {tipAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-base-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPaymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-primary/50"
                  }`}
                >
                  <Icon
                    size={24}
                    className={isSelected ? "text-primary" : ""}
                  />
                  <span
                    className={`font-medium ${
                      isSelected ? "text-primary" : ""
                    }`}
                  >
                    {method.name}
                  </span>
                  {isSelected && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-content" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-base-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal ({cart.length} items)</span>
              <span>
                {currency}
                {subtotal.toFixed(2)}
              </span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>Tip ({tipPercentage}%)</span>
                <span>
                  {currency}
                  {tipAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="divider my-2"></div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                {currency}
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Payment Button */}
      <div className="bg-base-100 p-4 border-t-2 border-base-300 shadow-lg">
        <button
          onClick={handleCompletePayment}
          className="btn btn-primary btn-lg w-full gap-2"
        >
          <CreditCard size={20} />
          Complete Payment - {currency}
          {total.toFixed(2)}
        </button>
      </div>

      {/* Sheets */}
      <BottomSheet
        isOpen={activeSheet === "orderType"}
        onClose={() => dispatch(setActiveSheet(null))}
        title="Select Order Type"
      >
        <div className="p-6 space-y-3">
          {orderTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = orderType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => handleOrderTypeChange(type.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-base-300 hover:border-primary/50"
                }`}
              >
                <Icon size={28} className={isSelected ? "text-primary" : ""} />
                <span
                  className={`text-lg font-medium ${
                    isSelected ? "text-primary" : ""
                  }`}
                >
                  {type.name}
                </span>
                {isSelected && (
                  <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-content" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      <TableSelectionSheet
        isOpen={activeSheet === "table"}
        onClose={() => dispatch(setActiveSheet(null))}
      />

      <CustomerSheet
        isOpen={activeSheet === "customer"}
        onClose={() => dispatch(setActiveSheet(null))}
      />

      <DiscountSheet
        isOpen={activeSheet === "discount"}
        onClose={() => dispatch(setActiveSheet(null))}
      />
    </div>
  );
};

export default PaymentTab;
