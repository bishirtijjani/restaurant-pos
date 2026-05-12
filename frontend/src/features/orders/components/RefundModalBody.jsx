// frontend/src/features/orders/components/RefundModalBody.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import ErrorText from "../../../components/Typography/ErrorText";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { fetchOrders, refundOrder } from "../ordersSlice";
import { DollarSign, AlertTriangle, WifiOff } from "lucide-react";
import { useOnlineStatus } from "../../../hooks/useOnlineStatus";

function RefundModalBody({ extraObject, closeModal: closeModalFn }) {
  const dispatch = useDispatch();
  const order = extraObject;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isOnline = useOnlineStatus();

  // Non-cash refunds require live gateway connectivity (Stripe etc.).
  // Detect whether this order has any non-cash payments to surface the right
  // guidance offline. Cash-only orders can still be refunded — the queued
  // operation processes normally on reconnect with no gateway round-trip.
  const hasNonCashPayment =
    order.paymentMethod && order.paymentMethod !== "cash"
      ? true
      : Array.isArray(order.payments)
        ? order.payments.some((p) => p.method && p.method !== "cash")
        : false;
  const refundBlockedOffline = !isOnline && hasNonCashPayment;

  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [refundData, setRefundData] = useState({
    refundType: "full", // 'full' or 'partial'
    amount: "",
    reason: "",
    category: "other", // NEW: refund category
  });

  const maxRefundAmount = order.amountPaid || 0;
  const fullRefundAmount = maxRefundAmount;

  // Calculate refund amount based on type
  const getRefundAmount = () => {
    if (refundData.refundType === "full") {
      return fullRefundAmount;
    } else {
      return parseFloat(refundData.amount) || 0;
    }
  };

  const refundAmount = getRefundAmount();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRefundData({ ...refundData, [name]: value });
    setErrorMessage("");
  };

  const handleRefundTypeChange = (type) => {
    setRefundData({
      ...refundData,
      refundType: type,
      amount: type === "full" ? fullRefundAmount.toString() : "",
    });
    setErrorMessage("");
  };

  const validateRefund = () => {
    if (!refundData.reason || refundData.reason.trim() === "") {
      setErrorMessage("Refund reason is required");
      return false;
    }

    if (refundData.refundType === "partial") {
      if (!refundData.amount || parseFloat(refundData.amount) <= 0) {
        setErrorMessage("Please enter a valid refund amount");
        return false;
      }

      if (parseFloat(refundData.amount) > maxRefundAmount) {
        setErrorMessage(
          `Refund amount cannot exceed ${currency}${maxRefundAmount.toFixed(2)}`
        );
        return false;
      }
    }

    return true;
  };

  const [confirmRefund, setConfirmRefund] = useState(false);

  const handleSubmit = async () => {
    if (!validateRefund()) {
      return;
    }

    // Safety check for large refunds (over 50% of total or > 100)
    const isLargeRefund =
      refundAmount > order.totalAmount * 0.5 || refundAmount > 100;

    if (isLargeRefund && !confirmRefund) {
      setConfirmRefund(true);
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        refundOrder({
          orderId: order._id,
          amount: refundAmount,
          reason: refundData.reason,
          category: refundData.category,
          isPartial: refundData.refundType === "partial",
        })
      ).unwrap();

      dispatch(
        showNotification({
          message: `Refund of ${currency}${refundAmount.toFixed(
            2
          )} processed successfully`,
          status: 1,
        })
      );

      dispatch(fetchOrders());

      if (closeModalFn) {
        closeModalFn();
      } else {
        dispatch(closeModal());
      }
    } catch (error) {
      console.error("Refund error:", error);
      const errorMsg = error.message || "Failed to process refund";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      setConfirmRefund(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {refundBlockedOffline && (
        <div className="alert alert-error">
          <WifiOff size={18} />
          <span className="text-sm">
            Offline — card and Transfer refunds need server connectivity to
            reach the payment gateway. Reconnect to process this refund.
          </span>
        </div>
      )}
      {!isOnline && !hasNonCashPayment && (
        <div className="alert alert-warning">
          <WifiOff size={18} />
          <span className="text-sm">
            Offline — cash refund will be queued and synced when connectivity
            returns.
          </span>
        </div>
      )}

      {/* Order Information */}
      <div className="alert alert-info">
        <div className="flex flex-col gap-1">
          <span className="font-bold">Order #{order.orderNumber}</span>
          <span className="text-sm">
            Total: {currency}
            {order.totalAmount?.toFixed(2)}
          </span>
          <span className="text-sm">
            Amount Paid: {currency}
            {maxRefundAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Warning */}
      <div className="alert alert-warning">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-sm">
          Refunds cannot be undone. Please verify the refund amount and reason
          before proceeding.
        </span>
      </div>

      {/* Refund Type Selection */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Refund Type</span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleRefundTypeChange("full")}
            className={`btn btn-sm flex-1 ${
              refundData.refundType === "full" ? "btn-error" : "btn-outline"
            }`}
          >
            Full Refund
          </button>
          <button
            onClick={() => handleRefundTypeChange("partial")}
            className={`btn btn-sm flex-1 ${
              refundData.refundType === "partial"
                ? "btn-warning"
                : "btn-outline"
            }`}
          >
            Partial Refund
          </button>
        </div>
      </div>

      {/* Partial Refund Amount Input */}
      {refundData.refundType === "partial" && (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Refund Amount ({currency})</span>
            <span className="label-text-alt">
              Max: {currency}
              {maxRefundAmount.toFixed(2)}
            </span>
          </label>
          <FormattedNumberInput
            name="amount"
            value={refundData.amount}
            onChange={handleInputChange}
            className="input input-bordered"
            placeholder="Enter refund amount"
          />
        </div>
      )}

      {/* Category Selection */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Refund Category *</span>
        </label>
        <select
          name="category"
          value={refundData.category}
          onChange={handleInputChange}
          className="select select-bordered"
        >
          <option value="other">Other</option>
          <option value="quality_issue">Quality Issue</option>
          <option value="wrong_order">Wrong Order</option>
          <option value="customer_changed_mind">Customer Changed Mind</option>
          <option value="delivery_delay">Delivery Delay</option>
          <option value="item_unavailable">Item Unavailable</option>
          <option value="staff_error">Staff Error</option>
        </select>
      </div>

      {/* Reason Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Reason for Refund *</span>
        </label>
        <textarea
          name="reason"
          value={refundData.reason}
          onChange={handleInputChange}
          className="textarea textarea-bordered h-24"
          placeholder="Enter reason for refund (required)"
        />
      </div>

      {/* Refund Summary */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Refund Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Refund Type:</span>
              <span className="font-medium capitalize">
                {refundData.refundType}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Refund Amount:</span>
              <span className="font-bold text-error">
                {currency}
                {refundAmount.toFixed(2)}
              </span>
            </div>
            <div className="divider my-1"></div>
            <div className="flex justify-between">
              <span>Remaining Paid:</span>
              <span className="font-medium">
                {currency}
                {(maxRefundAmount - refundAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {confirmRefund && (
        <div className="alert alert-warning animate-pulse">
          <AlertTriangle className="w-5 h-5" />
          <span>
            This is a large refund amount. Click confirm again to proceed.
          </span>
        </div>
      )}

      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

      <div className="modal-action">
        <button
          onClick={closeModalFn || (() => dispatch(closeModal()))}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="btn btn-error"
          disabled={loading || refundAmount === 0 || refundBlockedOffline}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>{" "}
              Processing...
            </>
          ) : (
            `Process Refund (${currency}${refundAmount.toFixed(2)})`
          )}
        </button>
      </div>
    </div>
  );
}

export default RefundModalBody;
