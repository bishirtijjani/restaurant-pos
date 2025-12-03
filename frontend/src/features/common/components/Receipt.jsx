// frontend/src/features/common/components/Receipt.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import printJS from "print-js";
import {
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  Receipt as ReceiptIcon,
  Tag,
} from "lucide-react";
import { fetchSettings } from "../../settings/generalSettings/generalSettingsSlice";

const Receipt = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const orderData = extraObject;
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );

  useEffect(() => {
    if (!settings) dispatch(fetchSettings());
  }, [dispatch, settings]);

  const receipt = {
    restaurantName: settings?.restaurantName?.toUpperCase() || "RESTAURANT",
    restaurantAddress: settings?.restaurantAddress,
    restaurantPhone: settings?.restaurantPhone,
    restaurantEmail: settings?.restaurantEmail,
    motto: settings?.restaurantMotto,
    date: new Date().toLocaleString(),
    orderNumber: orderData.orderNumber || "New Order",
    orderType: orderData.orderType || "dine-in",
    table: orderData.table || "",
    customerName: orderData.customerDetails?.name || "Walk-in Customer",
    customerPhone: orderData.customerDetails?.phone || "",
    customerAddress: orderData.customerDetails?.address || "",
    items: orderData.orderItems || orderData.menuItems || [],
    discountBreakdown: orderData.discountBreakdown || null,
    promoCodeUsed: orderData.promoCodeUsed || null,
    subtotal: orderData.discountBreakdown?.hasDiscount
      ? orderData.discountBreakdown.discountedSubtotal
      : orderData.taxBreakdown?.subtotal || 0,
    originalSubtotal: orderData.discountBreakdown?.originalSubtotal || 0,
    serviceCharge: orderData.taxBreakdown?.serviceCharge || 0,
    tax: orderData.taxBreakdown?.totalTax || 0,
    addOnsTotal: orderData.addOnsTotal || 0,
    packagingFee: orderData.packagingFee || 0,
    deliveryFee: orderData.deliveryFee || 0,
    // NEW: Payment fields
    tip: orderData.tip || { amount: 0, percentage: 0 },
    totalAmount: orderData.totalAmount || 0,
    payments: orderData.payments || [], // Split payments array
    paymentMethod: orderData.paymentMethod || "cash",
    amountPaid: orderData.amountPaid || 0,
    change: orderData.change || 0,
    balance: orderData.balance || 0,
    refunds: orderData.refunds || [], // Refunds array
    orderNote: orderData.orderNote || orderData.note || "",
  };

  const currency = settings?.currency?.symbol || "$";

  const handlePrint = () => {
    printJS({
      printable: "printableArea",
      type: "html",
      targetStyles: ["*"],
      documentTitle: `Receipt - Order #${receipt.orderNumber}`,
    });
  };

  const getOrderTypeIcon = () => {
    switch (receipt.orderType) {
      case "dine-in":
        return <UtensilsCrossed size={18} className="mr-1" />;
      case "takeaway":
        return <ShoppingBag size={18} className="mr-1" />;
      case "delivery":
        return <Truck size={18} className="mr-1" />;
      default:
        return <ReceiptIcon size={18} className="mr-1" />;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white text-black shadow-lg rounded-lg">
        <div className="p-6">
          <div id="printableArea" className="text-sm space-y-4">
            {/* Header */}
            <div className="text-center space-y-1 border-b pb-4">
              <h1 className="font-bold text-lg">{receipt.restaurantName}</h1>
              {receipt.motto && (
                <p className="italic text-xs">{receipt.motto}</p>
              )}
              {receipt.restaurantAddress && (
                <p className="text-xs">{receipt.restaurantAddress}</p>
              )}
              {receipt.restaurantPhone && (
                <p className="text-xs">Phone: {receipt.restaurantPhone}</p>
              )}
            </div>

            {/* Order Info */}
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="font-medium">Order #:</td>
                  <td className="text-right">{receipt.orderNumber}</td>
                </tr>
                <tr>
                  <td className="font-medium">Date:</td>
                  <td className="text-right">{receipt.date}</td>
                </tr>
                <tr>
                  <td className="font-medium">Type:</td>
                  <td className="text-right capitalize">{receipt.orderType}</td>
                </tr>
                {receipt.orderType === "dine-in" && receipt.table && (
                  <tr>
                    <td className="font-medium">Table:</td>
                    <td className="text-right">{receipt.table}</td>
                  </tr>
                )}
                {receipt.customerName !== "Walk-in Customer" && (
                  <tr>
                    <td className="font-medium">Customer:</td>
                    <td className="text-right">{receipt.customerName}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="border-t border-dashed my-2"></div>

            {/* Order Items */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className={
                        item.voidInfo?.isVoided ? "line-through opacity-50" : ""
                      }
                    >
                      <td className="py-1">{item.name}</td>
                      <td className="text-center py-1">{item.quantity}</td>
                      <td className="text-right py-1">
                        {currency}
                        {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                    {/* Add-ons */}
                    {item.addOns?.map((addOnGroup, addOnIdx) =>
                      addOnGroup.selectedItems?.map((addOnItem, itemIdx) => (
                        <tr
                          key={`${addOnIdx}-${itemIdx}`}
                          className="text-xs opacity-70"
                        >
                          <td className="pl-3">+ {addOnItem.name}</td>
                          <td></td>
                          <td className="text-right">
                            {addOnItem.price > 0 &&
                              `${currency}${(
                                addOnItem.price * item.quantity
                              ).toFixed(2)}`}
                          </td>
                        </tr>
                      ))
                    )}
                    {/* Item Note */}
                    {item.itemNote && (
                      <tr className="text-xs italic opacity-60">
                        <td colSpan="3" className="pl-3">
                          Note: {item.itemNote}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed my-2"></div>

            {/* Totals */}
            <table className="w-full text-xs">
              <tbody>
                {/* Discount Section */}
                {receipt.discountBreakdown?.hasDiscount ? (
                  <>
                    <tr>
                      <td>Subtotal:</td>
                      <td className="text-right line-through opacity-60">
                        {currency}
                        {receipt.originalSubtotal.toFixed(2)}
                      </td>
                    </tr>
                    {receipt.discountBreakdown.appliedDiscounts?.map(
                      (discount, idx) => (
                        <tr key={idx} className="text-green-600">
                          <td className="pl-2">
                            <span className="inline-flex items-center gap-1">
                              <Tag size={10} />
                              {discount.name}:
                            </span>
                          </td>
                          <td className="text-right">
                            -{currency}
                            {discount.amount?.toFixed(2)}
                          </td>
                        </tr>
                      )
                    )}
                    <tr className="font-medium">
                      <td>After Discount:</td>
                      <td className="text-right">
                        {currency}
                        {receipt.discountBreakdown.discountedSubtotal?.toFixed(
                          2
                        )}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td>Subtotal:</td>
                    <td className="text-right">
                      {currency}
                      {receipt.subtotal.toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* Promo Code Display */}
                {receipt.promoCodeUsed?.code && (
                  <tr className="italic text-green-600">
                    <td colSpan="2" className="text-center py-1">
                      <span className="inline-flex items-center gap-1">
                        <Tag size={10} />
                        Promo Code Applied: {receipt.promoCodeUsed.code}
                      </span>
                    </td>
                  </tr>
                )}

                {receipt.tax > 0 && (
                  <tr>
                    <td>Tax:</td>
                    <td className="text-right">
                      {currency}
                      {receipt.tax.toFixed(2)}
                    </td>
                  </tr>
                )}
                {receipt.serviceCharge > 0 && (
                  <tr>
                    <td>Service Charge:</td>
                    <td className="text-right">
                      {currency}
                      {receipt.serviceCharge.toFixed(2)}
                    </td>
                  </tr>
                )}
                {receipt.packagingFee > 0 && (
                  <tr>
                    <td>Packaging:</td>
                    <td className="text-right">
                      {currency}
                      {receipt.packagingFee.toFixed(2)}
                    </td>
                </tr>
                )}
                {receipt.deliveryFee > 0 && (
                  <tr>
                    <td>Delivery:</td>
                    <td className="text-right">
                      {currency}
                      {receipt.deliveryFee.toFixed(2)}
                    </td>
                  </tr>
                )}
                {receipt.tip?.amount > 0 && (
                  <tr className="text-success">
                    <td>
                      Tip
                      {receipt.tip.percentage > 0 &&
                        ` (${receipt.tip.percentage}%)`}
                      :
                    </td>
                    <td className="text-right">
                      {currency}
                      {receipt.tip.amount.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="font-bold text-base">
                  <td>Total:</td>
                  <td className="text-right">
                    {currency}
                    {receipt.totalAmount.toFixed(2)}
                  </td>
                </tr>

                {/* Payment breakdown - show split payments if available */}
                {receipt.payments && receipt.payments.length > 0 ? (
                  <>
                    <tr>
                      <td colSpan="2" className="pt-2 font-medium">
                        Payment Details:
                      </td>
                    </tr>
                    {receipt.payments.map((payment, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="pl-3 capitalize">{payment.method}:</td>
                        <td className="text-right">
                          {currency}
                          {payment.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td>Paid ({receipt.paymentMethod}):</td>
                    <td className="text-right">
                      {currency}
                      {receipt.amountPaid.toFixed(2)}
                    </td>
                  </tr>
                )}

                {receipt.change > 0 && (
                  <tr className="font-medium text-success">
                    <td>Change:</td>
                    <td className="text-right">
                      {currency}
                      {receipt.change.toFixed(2)}
                    </td>
                  </tr>
                )}
                {receipt.balance > 0 && (
                  <tr className="font-medium">
                    <td>Balance Due:</td>
                    <td className="text-right">
                      {currency}
                      {receipt.balance.toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* Refunds section */}
                {receipt.refunds && receipt.refunds.length > 0 && (
                  <>
                    <tr>
                      <td colSpan="2" className="pt-2">
                        <div className="border-t border-dashed my-1"></div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="font-medium text-error">
                        Refunds:
                      </td>
                    </tr>
                    {receipt.refunds.map((refund, idx) => (
                      <tr key={idx} className="text-sm text-error">
                        <td className="pl-3">
                          {new Date(refund.refundedAt).toLocaleDateString()}:
                        </td>
                        <td className="text-right">
                          -{currency}
                          {refund.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>

            {/* Order Note */}
            {receipt.orderNote && (
              <>
                <div className="border-t border-dashed my-2"></div>
                <div className="text-xs">
                  <p className="font-medium">Note:</p>
                  <p className="italic">{receipt.orderNote}</p>
                </div>
              </>
            )}

            <div className="border-t border-dashed my-2"></div>

            {/* Footer */}
            <div className="text-center text-xs">
              <p>Thank you for your patronage!</p>
              <p className="mt-2 opacity-60">Powered by Codeket</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <button onClick={handlePrint} className="btn btn-primary">
          Print Receipt
        </button>
        <button onClick={closeModal} className="btn btn-outline">
          Close
        </button>
      </div>
    </div>
  );
};

export default Receipt;
