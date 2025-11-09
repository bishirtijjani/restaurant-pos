import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePayment, fetchOrders } from "../ordersSlice";
import { showNotification } from "../../common/headerSlice";
import { closeModal } from "../../common/modalSlice";
import ErrorText from "../../../components/Typography/ErrorText";

function UpdatePaymentModalBody({ extraObject }) {
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

  const remainingBalance = order.totalAmount - order.amountPaid;

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
        showNotification({
          message: "Payment updated successfully",
          status: 1,
        })
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
    <div className="modal-content">
      <div className="modal-body">
        <div className="space-y-4">
          <div className="alert alert-info">
            <div>
              <div className="text-sm">
                <strong>Order Total:</strong> {currency}
                {order.totalAmount.toLocaleString()}
              </div>
              <div className="text-sm">
                <strong>Currently Paid:</strong> {currency}
                {order.amountPaid.toLocaleString()}
              </div>
              <div className="text-sm">
                <strong>Remaining Balance:</strong> {currency}
                {remainingBalance.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                New Total Amount Paid ({currency})
              </span>
            </label>
            <input
              type="number"
              name="amountPaid"
              value={paymentData.amountPaid}
              onChange={handleInputChange}
              className="input input-bordered"
              placeholder="Enter new total amount paid"
              step="0.01"
              min="0"
              max={order.totalAmount}
            />
            <label className="label">
              <span className="label-text-alt">
                This is the total amount paid so far, not an additional payment
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Payment Method</span>
            </label>
            <select
              name="paymentMethod"
              value={paymentData.paymentMethod}
              onChange={handleInputChange}
              className="select select-bordered"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Reason (Optional)</span>
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
        </div>
      </div>

      <div className="modal-action">
        <button
          onClick={handleSubmit}
          className={`btn btn-primary ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          Update Payment
        </button>
        <button
          onClick={() => dispatch(closeModal())}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default UpdatePaymentModalBody;
