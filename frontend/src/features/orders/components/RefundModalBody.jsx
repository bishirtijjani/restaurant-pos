// frontend/src/features/orders/components/RefundModalBody.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import ErrorText from "../../../components/Typography/ErrorText";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { fetchOrders } from "../ordersSlice";
import { DollarSign, AlertTriangle } from "lucide-react";

function RefundModalBody({ extraObject, closeModal: closeModalFn }) {
  const dispatch = useDispatch();
  const order = extraObject;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [refundData, setRefundData] = useState({
    refundType: "full", // 'full' or 'partial'
    amount: "",
    reason: "",
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

  const handleSubmit = async () => {
    if (!validateRefund()) {
      return;
    }

    setLoading(true);

    try {
      const refundPayload = {
        amount: refundAmount,
        reason: refundData.reason,
        isPartial: refundData.refundType === "partial",
      };

      const response = await axios.post(
        `/api/orders/${order._id}/refund`,
        refundPayload
      );

      dispatch(
        showNotification({
          message: `Refund of ${currency}${refundAmount.toFixed(2)} processed successfully`,
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
      const errorMsg =
        error.response?.data?.message || "Failed to process refund";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
              refundData.refundType === "partial" ? "btn-warning" : "btn-outline"
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
            <span className="label-text">
              Refund Amount ({currency})
            </span>
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
          disabled={loading || refundAmount === 0}
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
