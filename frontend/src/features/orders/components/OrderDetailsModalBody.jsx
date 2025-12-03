// frontend/src/features/orders/components/OrderDetailsModalBody.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { openModal } from "../../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import TaxBreakdown from "./TaxBreakdown";
import {
  UserCircleIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { Edit3, Trash2, AlertCircle, StickyNote } from "lucide-react";
import Can from "../../../components/Auth/Can";

const OrderDetailsModalBody = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const order = extraObject;
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  if (!order) {
    return <div className="p-4">Order not found</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const canModify = !["completed", "cancelled"].includes(order.orderStatus);

  const handleModifyOrder = () => {
    closeModal();
    setTimeout(() => {
      dispatch(
        openModal({
          title: `Modify Order #${order.orderNumber}`,
          bodyType: MODAL_BODY_TYPES.MODIFY_ORDER,
          extraObject: order,
          size: "lg",
        })
      );
    }, 100);
  };

  const handleVoidItems = () => {
    closeModal();
    setTimeout(() => {
      dispatch(
        openModal({
          title: `Void Items - Order #${order.orderNumber}`,
          bodyType: MODAL_BODY_TYPES.VOID_ORDER_ITEMS,
          extraObject: order,
          size: "lg",
        })
      );
    }, 100);
  };

  return (
    <div className="modal-content">
      <div className="modal-body space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Modification Indicator */}
        {order.isModified && (
          <div className="alert alert-info py-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              Modified {order.modificationCount}x • Last:{" "}
              {formatDate(order.lastModifiedAt)}
            </span>
          </div>
        )}

        {/* Voided Items Warning */}
        {order.hasVoidedItems && (
          <div className="alert alert-warning py-2">
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">
              {order.voidedItemsCount} item(s) voided • {currency}
              {order.totalVoidedAmount?.toFixed(2)} deducted
            </span>
          </div>
        )}

        {/* Customer Information */}
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <UserCircleIcon className="w-4 h-4 opacity-70" />
                <span>{order.customerDetails?.name || "Walk-in Customer"}</span>
              </div>
              {order.customerDetails?.phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 opacity-70" />
                  <span>{order.customerDetails.phone}</span>
                </div>
              )}
              {order.customerDetails?.address && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 opacity-70" />
                  <span>{order.customerDetails.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Order Type:</span>
                <span className="capitalize font-medium">
                  {order.orderType}
                </span>
              </div>
              {order.table && order.table !== "Takeaway" && (
                <div className="flex justify-between">
                  <span className="opacity-70">Table:</span>
                  <span className="font-medium">{order.table}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="opacity-70">Status:</span>
                <span className="badge badge-primary badge-sm">
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Payment:</span>
                <span
                  className={`badge badge-sm ${
                    order.paymentStatus === "paid"
                      ? "badge-success"
                      : order.paymentStatus === "partial"
                      ? "badge-warning"
                      : "badge-error"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" /> Created:
                </span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Note */}
        {(order.orderNote || order.note) && (
          <div className="card bg-warning/10 border border-warning/30">
            <div className="card-body p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-warning">
                <StickyNote className="w-5 h-5" />
                Order Note
              </h3>
              <p className="text-sm">{order.orderNote || order.note}</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.orderItems?.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 bg-base-100 rounded-lg ${
                    item.voidInfo?.isVoided ? "opacity-50 line-through" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        {item.voidInfo?.isVoided && (
                          <span className="badge badge-error badge-xs">
                            VOIDED
                          </span>
                        )}
                      </div>

                      {/* Add-ons Display */}
                      {item.addOns && item.addOns.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {item.addOns.map((addOnGroup, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-base-content/70 pl-2 border-l-2 border-primary/30"
                            >
                              <span className="font-medium">
                                {addOnGroup.groupName}:
                              </span>{" "}
                              {addOnGroup.selectedItems?.map((si, siIdx) => (
                                <span key={siIdx}>
                                  {si.name}
                                  {si.price > 0 &&
                                    ` (+${currency}${si.price.toFixed(2)})`}
                                  {siIdx <
                                    addOnGroup.selectedItems.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Item Note */}
                      {item.itemNote && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-warning">
                          <ChatBubbleLeftIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="italic">{item.itemNote}</span>
                        </div>
                      )}

                      {/* Void Info */}
                      {item.voidInfo?.isVoided && (
                        <div className="mt-1 text-xs text-error">
                          Voided: {item.voidInfo.voidReason}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.quantity} × {currency}
                        {item.price.toFixed(2)}
                      </p>
                      {item.addOnsTotal > 0 && (
                        <p className="text-xs text-success">
                          +{currency}
                          {item.addOnsTotal.toFixed(2)} add-ons
                        </p>
                      )}
                      <p className="text-sm font-semibold text-primary">
                        {currency}
                        {item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        {order.taxBreakdown && (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                Payment Breakdown
              </h3>
              <TaxBreakdown
                taxBreakdown={order.taxBreakdown}
                settings={settings}
              />

              {order.addOnsTotal > 0 && (
                <div className="flex justify-between mt-2 text-sm">
                  <span>Add-ons Total:</span>
                  <span>
                    {currency}
                    {order.addOnsTotal.toFixed(2)}
                  </span>
                </div>
              )}

              {order.packagingFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Packaging Fee:</span>
                  <span>
                    {currency}
                    {order.packagingFee.toFixed(2)}
                  </span>
                </div>
              )}

              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span>
                    {currency}
                    {order.deliveryFee.toFixed(2)}
                  </span>
                </div>
              )}

              {order.totalVoidedAmount > 0 && (
                <div className="flex justify-between text-sm text-error">
                  <span>Voided Amount:</span>
                  <span>
                    -{currency}
                    {order.totalVoidedAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="divider my-2"></div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">
                  {currency}
                  {order.totalAmount?.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between mt-2 text-sm">
                <span>Amount Paid:</span>
                <span className="text-success">
                  {currency}
                  {(order.amountPaid || 0).toFixed(2)}
                </span>
              </div>

              {order.balance > 0 && (
                <div className="flex justify-between text-error font-medium">
                  <span>Balance:</span>
                  <span>
                    {currency}
                    {order.balance.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment History */}
        {(order.paymentHistory && order.paymentHistory.length > 0) || (order.payments && order.payments.length > 0) && (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                Payment History
              </h3>
              <div className="space-y-2">
                {order.paymentHistory && order.paymentHistory.length > 0 ? (
                  order.paymentHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg ${
                        entry.type === "refund"
                          ? "bg-error/10 border border-error/30"
                          : "bg-success/10 border border-success/30"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span
                            className={`badge badge-sm ${
                              entry.type === "refund"
                                ? "badge-error"
                                : "badge-success"
                            }`}
                          >
                            {entry.type}
                          </span>
                          {entry.method && (
                            <span className="ml-2 text-sm capitalize">
                              {entry.method}
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-bold ${
                            entry.type === "refund"
                              ? "text-error"
                              : "text-success"
                          }`}
                        >
                          {entry.type === "refund" ? "-" : "+"}
                          {currency}
                          {entry.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      {entry.note && (
                        <div className="text-xs mt-1 italic">{entry.note}</div>
                      )}
                    </div>
                  ))
                ) : (
                  order.payments && order.payments.map((payment, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-success/10 border border-success/30"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm capitalize">
                          {payment.method}
                        </span>
                        <span className="font-bold text-success">
                          {currency}
                          {payment.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(payment.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="modal-action flex-wrap gap-2">
        {canModify && (
          <Can do="editOrders">
            <button
              onClick={handleModifyOrder}
              className="btn btn-outline btn-sm gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Modify Order
            </button>
            <button
              onClick={handleVoidItems}
              className="btn btn-outline btn-error btn-sm gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Void Items
            </button>
          </Can>
        )}
        {(order.paymentStatus === "paid" || order.paymentStatus === "partial") && order.amountPaid > 0 && (
          <Can do="editOrders">
            <button
              onClick={() => {
                closeModal();
                setTimeout(() => {
                  dispatch(
                    openModal({
                      title: `Refund Order #${order.orderNumber}`,
                      bodyType: MODAL_BODY_TYPES.REFUND_ORDER,
                      extraObject: order,
                      size: "lg",
                    })
                  );
                }, 100);
              }}
              className="btn btn-outline btn-warning btn-sm gap-2"
            >
              <CurrencyDollarIcon className="w-4 h-4" />
              Process Refund
            </button>
          </Can>
        )}
        <button onClick={closeModal} className="btn btn-primary btn-sm">
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsModalBody;
