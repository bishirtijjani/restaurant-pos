// frontend/src/features/orders/components/UpdatePaymentModalBody.jsx
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { updatePayment, fetchOrders } from "../ordersSlice";
import ErrorText from "../../../components/Typography/ErrorText";

function UpdatePaymentModalBody({ extraObject, closeModal: close }) {
  const dispatch = useDispatch();
  const order = extraObject;
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentData, setPaymentData] = useState({
    amountPaid: order.amountPaid || 0,
    paymentMethod: order.paymentMethod || "cash",
    reason: "",
  });

  const paymentMethodOptions = [
    { value: "cash", name: "Cash" },
    { value: "card", name: "Card" },
    { value: "Transfer", name: "Bank Transfer" },
  ];

  const remainingBalance = order.totalAmount - order.amountPaid;

  const amountError = useMemo(() => {
    const amount = parseFloat(paymentData.amountPaid);
    if (isNaN(amount) || paymentData.amountPaid === "") return ""; // Allow empty while typing, handle on submit
    if (amount < 0) return "Amount cannot be negative";
    if (amount > order.totalAmount) return "Amount cannot exceed total order amount";
    return "";
  }, [paymentData.amountPaid, order.totalAmount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    const newAmountPaid = parseFloat(paymentData.amountPaid);

    if (isNaN(newAmountPaid) || newAmountPaid < 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    if (newAmountPaid > order.totalAmount) {
      setErrorMessage("Amount paid cannot exceed total amount");
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        updatePayment({
          id: order._id,
          amountPaid: newAmountPaid,
          paymentMethod: paymentData.paymentMethod,
          reason: paymentData.reason || "Payment updated",
        })
      ).unwrap();

      dispatch(
        showNotification({ message: "Payment updated successfully", status: 1 })
      );
      dispatch(fetchOrders());
      dispatch(closeModal());
    } catch (error) {
      setErrorMessage(error.message || "Failed to update payment");
      dispatch(
        showNotification({
          message: error.message || "Failed to update payment",
          status: 0,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="alert alert-info text-sm">
        <div className="space-y-1">
          <div>
            <strong>Order Total:</strong> {currency}
            {order.totalAmount?.toFixed(2)}
          </div>
          <div>
            <strong>Currently Paid:</strong> {currency}
            {order.amountPaid?.toFixed(2)}
          </div>
          <div>
            <strong>Remaining:</strong> {currency}
            {remainingBalance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">New Total Amount Paid ({currency})</span>
        </label>
        <FormattedNumberInput
          name="amountPaid"
          value={paymentData.amountPaid}
          onChange={handleInputChange}
          className={`input input-bordered ${amountError ? "input-error" : ""}`}
          placeholder="Enter amount"
          min="0"
          max={order.totalAmount}
        />
        {amountError && (
          <label className="label">
            <span className="label-text-alt text-error">{amountError}</span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt">
            This is the total paid, not additional payment
          </span>
        </label>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Payment Method</span>
        </label>
        <SearchableSelect
          options={paymentMethodOptions}
          value={paymentData.paymentMethod}
          onChange={handleInputChange}
          name="paymentMethod"
          placeholder="Select payment method"
          className=""
          valueKey="value"
          labelKey="name"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Reason (Optional)</span>
        </label>
        <textarea
          name="reason"
          value={paymentData.reason}
          onChange={handleInputChange}
          className="textarea textarea-bordered"
          placeholder="Reason for payment update..."
          rows="2"
        />
      </div>

      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

      <div className="modal-action">
        <button
          onClick={() => dispatch(closeModal())}
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
              Updating...
            </>
          ) : (
            "Update Payment"
          )}
        </button>
      </div>
    </div>
  );
}

export default UpdatePaymentModalBody;
