// frontend/src/features/orders/components/PaymentConfirmationModalBody.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import { openModal, closeModal } from "../../common/modalSlice";
import { closeRightDrawer } from "../../common/rightDrawerSlice";
import { showNotification } from "../../common/headerSlice";
import { createOrder, fetchOrders } from "../ordersSlice";
import ErrorText from "../../../components/Typography/ErrorText";

function PaymentConfirmationModalBody(props) {
  const extraObject = props.extraObject || props;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const orderTotal = extraObject.totalAmount || 0;
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: "cash",
    amountReceived: "",
    isPartialPayment: false,
    balance: 0,
    change: 0,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "amountReceived") {
      const amountReceived = parseFloat(value) || 0;
      const balance = paymentDetails.isPartialPayment
        ? orderTotal - amountReceived
        : 0;
      const change =
        !paymentDetails.isPartialPayment && amountReceived > orderTotal
          ? amountReceived - orderTotal
          : 0;
      setPaymentDetails({ ...paymentDetails, [name]: value, balance, change });
    } else if (name === "isPartialPayment") {
      const isPartial = type === "checkbox" ? checked : value;
      const amountReceived = parseFloat(paymentDetails.amountReceived) || 0;
      setPaymentDetails({
        ...paymentDetails,
        isPartialPayment: isPartial,
        balance: isPartial ? orderTotal - amountReceived : 0,
        change:
          !isPartial && amountReceived > orderTotal
            ? amountReceived - orderTotal
            : 0,
      });
    } else {
      setPaymentDetails({ ...paymentDetails, [name]: value });
    }
    setErrorMessage("");
  };

  const handleSubmit = () => {
    const amountReceived = parseFloat(paymentDetails.amountReceived);

    if (!amountReceived) {
      setErrorMessage("Please enter the amount received");
      return;
    }

    if (!paymentDetails.isPartialPayment && amountReceived < orderTotal) {
      setErrorMessage("Amount must be >= total for full payment");
      return;
    }

    if (paymentDetails.isPartialPayment && amountReceived >= orderTotal) {
      setErrorMessage("For partial payment, amount should be less than total");
      return;
    }

    setLoading(true);

    const orderPayload = {
      ...extraObject,
      paymentMethod: paymentDetails.paymentMethod,
      paymentStatus: paymentDetails.isPartialPayment ? "partial" : "paid",
      amountPaid: amountReceived,
      balance: paymentDetails.balance,
      change: paymentDetails.change,
    };

    dispatch(createOrder({ order: orderPayload }))
      .unwrap()
      .then((result) => {
        const createdOrder = result?.data || result;
        dispatch(
          showNotification({
            message: `Order ${
              paymentDetails.isPartialPayment ? "partially " : ""
            }paid successfully!`,
            status: 1,
          })
        );
        dispatch(fetchOrders());
        dispatch(closeModal());
        dispatch(closeRightDrawer());
        dispatch(
          openModal({
            title: "Order Receipt",
            bodyType: MODAL_BODY_TYPES.RECEIPT_MODAL,
            extraObject: createdOrder,
            size: "lg",
          })
        );
      })
      .catch((error) => {
        dispatch(showNotification({ message: error.message, status: 0 }));
        setErrorMessage(error.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-4">
      <div className="alert alert-info">
        <span className="text-lg font-bold">
          Order Total: {currency}
          {orderTotal.toFixed(2)}
        </span>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Payment Method</span>
        </label>
        <select
          name="paymentMethod"
          value={paymentDetails.paymentMethod}
          onChange={handleInputChange}
          className="select select-bordered"
        >
          <option value="cash">Cash</option>
          <option value="Transfer">Bank Transfer</option>
          <option value="card">Card</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-2">
          <input
            type="checkbox"
            name="isPartialPayment"
            checked={paymentDetails.isPartialPayment}
            onChange={handleInputChange}
            className="checkbox checkbox-primary"
          />
          <span className="label-text">Partial Payment</span>
        </label>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Amount Received ({currency})</span>
        </label>
        <FormattedNumberInput
          name="amountReceived"
          value={paymentDetails.amountReceived}
          onChange={handleInputChange}
          className="input input-bordered"
          placeholder="Enter amount"
        />
      </div>

      {paymentDetails.balance > 0 && (
        <div className="flex justify-between p-3 bg-warning/20 rounded-lg">
          <span>Balance Due:</span>
          <span className="font-bold">
            {currency}
            {paymentDetails.balance.toFixed(2)}
          </span>
        </div>
      )}

      {paymentDetails.change > 0 && (
        <div className="flex justify-between p-3 bg-success/20 rounded-lg">
          <span>Change:</span>
          <span className="font-bold">
            {currency}
            {paymentDetails.change.toFixed(2)}
          </span>
        </div>
      )}

      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

      <div className="modal-action">
        <button
          onClick={() => dispatch(closeRightDrawer())}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>{" "}
              Processing...
            </>
          ) : (
            "Complete Order"
          )}
        </button>
      </div>
    </div>
  );
}

export default PaymentConfirmationModalBody;
