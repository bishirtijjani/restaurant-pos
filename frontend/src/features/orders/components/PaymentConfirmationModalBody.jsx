import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, fetchOrders } from "../ordersSlice";
import { showNotification } from "../../common/headerSlice";
import { openModal } from "../../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import { closeModal } from "../../common/modalSlice";
import { useNavigate } from "react-router-dom";

import ErrorText from "../../../components/Typography/ErrorText";

function PaymentConfirmationModalBody({ extraObject = {} }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Calculate total amount from the order details
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

      setPaymentDetails({
        ...paymentDetails,
        [name]: value,
        balance,
        change,
      });
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
      setPaymentDetails({
        ...paymentDetails,
        [name]: value,
      });
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
      setErrorMessage(
        "Amount received must be equal to or greater than the total amount for full payment"
      );
      return;
    }

    if (paymentDetails.isPartialPayment && amountReceived >= orderTotal) {
      setErrorMessage(
        "For partial payment, amount should be less than the total amount"
      );
      return;
    }

    if (paymentDetails.isPartialPayment && amountReceived <= 0) {
      setErrorMessage("Partial payment amount must be greater than 0");
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
        // result is the API response object from the thunk (usually { success, message, data })
        const createdOrder = result?.data || result;

        dispatch(
          showNotification({
            message: `Order ${
              paymentDetails.isPartialPayment ? "partially " : ""
            }paid successfully!${
              createdOrder?.orderNumber
                ? ` Order #${createdOrder.orderNumber}`
                : ""
            }`,
            status: 1,
          })
        );

        dispatch(fetchOrders());
        dispatch(closeModal());

        dispatch(
          openModal({
            title: "Order Receipt",
            bodyType: MODAL_BODY_TYPES.RECEIPT_MODAL,
            extraObject: createdOrder,
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
    <div className="modal-content">
      <div className="modal-body">
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-4">
            Order Total: {currency}
            {orderTotal.toLocaleString()}
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={paymentDetails.paymentMethod}
              onChange={handleInputChange}
              className="select select-bordered w-full"
            >
              <option value="cash">Cash</option>
              <option value="transfer">Bank Transfer</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPartialPayment"
                checked={paymentDetails.isPartialPayment}
                onChange={handleInputChange}
                className="checkbox"
              />
              <span className="text-sm font-medium">Partial Payment</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Amount Received ($)
              {paymentDetails.isPartialPayment && (
                <span className="text-gray-500 ml-2">
                  (Must be less than ${orderTotal.toLocaleString()})
                </span>
              )}
            </label>
            <input
              type="number"
              name="amountReceived"
              value={paymentDetails.amountReceived}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              placeholder="Enter amount received"
            />
          </div>

          {paymentDetails.balance > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Balance</label>
              <input
                type="text"
                value={`$${paymentDetails.balance.toLocaleString()}`}
                className="input input-bordered w-full"
                disabled
              />
            </div>
          )}

          {paymentDetails.change > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Change Due
              </label>
              <input
                type="text"
                value={`$${paymentDetails.change.toLocaleString()}`}
                className="input input-bordered w-full"
                disabled
              />
            </div>
          )}

          {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        </div>
      </div>

      <div className="modal-action">
        <button
          onClick={handleSubmit}
          className={`btn btn-primary ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          Complete Order
        </button>
        <button
          onClick={() => dispatch(closeModal())}
          className="btn btn-error"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PaymentConfirmationModalBody;
