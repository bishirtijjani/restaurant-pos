import React from "react";
import { useSelector } from "react-redux";
import TaxBreakdown from "./TaxBreakdown";
import {
  UserCircleIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const OrderDetailsModalBody = ({ extraObject, closeModal }) => {
  const order = extraObject;
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "₦";

  if (!order) {
    return <div className="p-4">Order not found</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="modal-content">
      <div className="modal-body space-y-6">
        {/* Customer Information */}
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5" />
              Customer Information
            </h3>
            <div className="space-y-2">
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
            <div className="space-y-2">
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
                <span className="badge badge-primary">{order.orderStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Payment Status:</span>
                <span
                  className={`badge ${
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
                <span className="text-sm">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.orderItems?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-base-100 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.customizations && (
                      <p className="text-xs opacity-70">
                        {item.customizations}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {item.quantity} × {currency}
                      {item.price.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-70">
                      {currency}
                      {item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tax Breakdown */}
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

              {order.packagingFee > 0 && (
                <div className="flex justify-between mt-2">
                  <span>Packaging Fee:</span>
                  <span>
                    {currency}
                    {order.packagingFee.toFixed(2)}
                  </span>
                </div>
              )}

              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>
                    {currency}
                    {order.deliveryFee.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="divider my-2"></div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">
                  {currency}
                  {order.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between mt-2">
                <span>Amount Paid:</span>
                <span className="text-success">
                  {currency}
                  {(order.amountPaid || 0).toLocaleString()}
                </span>
              </div>

              {order.balance > 0 && (
                <div className="flex justify-between text-error">
                  <span>Balance:</span>
                  <span>
                    {currency}
                    {order.balance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.note && (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm opacity-80">{order.note}</p>
            </div>
          </div>
        )}
      </div>

      <div className="modal-action">
        <button onClick={closeModal} className="btn btn-primary">
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsModalBody;
