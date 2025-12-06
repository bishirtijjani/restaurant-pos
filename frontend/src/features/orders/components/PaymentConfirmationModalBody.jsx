// frontend/src/features/orders/components/PaymentConfirmationModalBody.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import { openModal, closeModal } from "../../common/modalSlice";
import { closeRightDrawer } from "../../common/rightDrawerSlice";
import { showNotification } from "../../common/headerSlice";
import { createOrder, fetchOrders } from "../ordersSlice";
import { clearCart } from "../posSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import { Plus, Trash2, DollarSign } from "lucide-react";

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

  const [paymentMode, setPaymentMode] = useState("single"); // 'single' or 'split'
  const [tipMode, setTipMode] = useState("none"); // 'none', 'percentage', 'custom'
  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTip, setCustomTip] = useState("");

  // Single payment state
  const [singlePayment, setSinglePayment] = useState({
    paymentMethod: "cash",
    amountReceived: "",
  });

  // Split payment state
  const [splitPayments, setSplitPayments] = useState([
    { method: "cash", amount: "" },
  ]);

  // Calculate tip amount
  const calculateTipAmount = () => {
    if (tipMode === "percentage") {
      return (orderTotal * tipPercentage) / 100;
    } else if (tipMode === "custom") {
      return parseFloat(customTip) || 0;
    }
    return 0;
  };

  const tipAmount = calculateTipAmount();
  const totalWithTip = orderTotal + tipAmount;

  // Calculate total paid
  const calculateTotalPaid = () => {
    if (paymentMode === "single") {
      return parseFloat(singlePayment.amountReceived) || 0;
    } else {
      return splitPayments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );
    }
  };

  const totalPaid = calculateTotalPaid();
  const change = totalPaid > totalWithTip ? totalPaid - totalWithTip : 0;
  const balance = totalPaid < totalWithTip ? totalWithTip - totalPaid : 0;

  // Handle single payment change
  const handleSinglePaymentChange = (e) => {
    const { name, value } = e.target;
    setSinglePayment({ ...singlePayment, [name]: value });
    setErrorMessage("");
  };

  // Handle split payment change
  const handleSplitPaymentChange = (index, field, value) => {
    const newPayments = [...splitPayments];
    newPayments[index][field] = value;
    setSplitPayments(newPayments);
    setErrorMessage("");
  };

  // Add split payment row
  const addSplitPayment = () => {
    setSplitPayments([...splitPayments, { method: "cash", amount: "" }]);
  };

  // Remove split payment row
  const removeSplitPayment = (index) => {
    if (splitPayments.length > 1) {
      setSplitPayments(splitPayments.filter((_, i) => i !== index));
    }
  };

  // Handle tip percentage selection
  const selectTipPercentage = (percentage) => {
    setTipMode("percentage");
    setTipPercentage(percentage);
    setCustomTip("");
  };

  // Handle custom tip
  const handleCustomTipChange = (e) => {
    setTipMode("custom");
    setTipPercentage(0);
    setCustomTip(e.target.value);
  };

  // Validation
  const validatePayment = () => {
    if (totalPaid === 0) {
      setErrorMessage("Please enter payment amount");
      return false;
    }

    if (totalPaid < totalWithTip) {
      setErrorMessage(
        `Insufficient payment. Total: ${currency}${totalWithTip.toFixed(2)}, Paid: ${currency}${totalPaid.toFixed(2)}`
      );
      return false;
    }

    if (paymentMode === "split") {
      // Validate all split payments have amounts
      const hasEmptyPayment = splitPayments.some(
        (p) => !p.amount || parseFloat(p.amount) <= 0
      );
      if (hasEmptyPayment) {
        setErrorMessage("All payment entries must have valid amounts");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validatePayment()) {
      return;
    }

    setLoading(true);

    // Prepare payment data
    let orderPayload = {
      ...extraObject,
      totalAmount: totalWithTip, // Include tip in total
      amountPaid: totalPaid,
      balance,
      change,
      tip: {
        amount: tipAmount,
        percentage: tipMode === "percentage" ? tipPercentage : 0,
      },
    };

    // Add payment data based on mode
    if (paymentMode === "split") {
      orderPayload.payments = splitPayments.map((p) => ({
        method: p.method,
        amount: parseFloat(p.amount),
      }));
      // Set primary payment method as first one
      orderPayload.paymentMethod = splitPayments[0].method;
    } else {
      orderPayload.paymentMethod = singlePayment.paymentMethod;
      orderPayload.payments = [
        {
          method: singlePayment.paymentMethod,
          amount: totalPaid,
        },
      ];
    }

    orderPayload.paymentStatus = balance > 0 ? "partial" : "paid";

    dispatch(createOrder({ order: orderPayload }))
      .unwrap()
      .then((result) => {
        const createdOrder = result?.data || result;
        dispatch(
          showNotification({
            message: `Order ${
              balance > 0 ? "partially " : ""
            }paid successfully!`,
            status: 1,
          })
        );
        dispatch(fetchOrders());
        dispatch(clearCart()); // Clear POS cart after successful payment
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
      {/* Order Total */}
      <div className="alert alert-info">
        <span className="text-lg font-bold">
          Order Subtotal: {currency}
          {orderTotal.toFixed(2)}
        </span>
      </div>

      {/* Payment Mode Selection */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Payment Mode</span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setPaymentMode("single")}
            className={`btn btn-sm flex-1 ${
              paymentMode === "single" ? "btn-primary" : "btn-outline"
            }`}
          >
            Single Payment
          </button>
          <button
            onClick={() => setPaymentMode("split")}
            className={`btn btn-sm flex-1 ${
              paymentMode === "split" ? "btn-primary" : "btn-outline"
            }`}
          >
            Split Payment
          </button>
        </div>
      </div>

      {/* Tip Section */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Add Tip (Optional)
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => selectTipPercentage(5)}
              className={`btn btn-sm ${
                tipMode === "percentage" && tipPercentage === 5
                  ? "btn-success"
                  : "btn-outline"
              }`}
            >
              5%
            </button>
            <button
              onClick={() => selectTipPercentage(10)}
              className={`btn btn-sm ${
                tipMode === "percentage" && tipPercentage === 10
                  ? "btn-success"
                  : "btn-outline"
              }`}
            >
              10%
            </button>
            <button
              onClick={() => selectTipPercentage(15)}
              className={`btn btn-sm ${
                tipMode === "percentage" && tipPercentage === 15
                  ? "btn-success"
                  : "btn-outline"
              }`}
            >
              15%
            </button>
            <button
              onClick={() => {
                setTipMode("none");
                setTipPercentage(0);
                setCustomTip("");
              }}
              className={`btn btn-sm ${
                tipMode === "none" ? "btn-error" : "btn-outline"
              }`}
            >
              No Tip
            </button>
          </div>
          <div className="form-control mt-2">
            <label className="label">
              <span className="label-text text-xs">Custom Tip Amount</span>
            </label>
            <FormattedNumberInput
              value={customTip}
              onChange={handleCustomTipChange}
              className="input input-bordered input-sm"
              placeholder="Enter custom tip"
            />
          </div>
          {tipAmount > 0 && (
            <div className="mt-2 p-2 bg-success/20 rounded">
              <span className="text-sm font-medium">
                Tip: {currency}
                {tipAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Single Payment */}
      {paymentMode === "single" && (
        <div className="space-y-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Payment Method</span>
            </label>
            <select
              name="paymentMethod"
              value={singlePayment.paymentMethod}
              onChange={handleSinglePaymentChange}
              className="select select-bordered"
            >
              <option value="cash">Cash</option>
              <option value="Transfer">Bank Transfer</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount Received ({currency})</span>
            </label>
            <FormattedNumberInput
              name="amountReceived"
              value={singlePayment.amountReceived}
              onChange={handleSinglePaymentChange}
              className="input input-bordered"
              placeholder="Enter amount"
            />
          </div>
        </div>
      )}

      {/* Split Payment */}
      {paymentMode === "split" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="label-text font-semibold">Payment Entries</label>
            <button
              onClick={addSplitPayment}
              className="btn btn-sm btn-primary gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Payment
            </button>
          </div>

          {splitPayments.map((payment, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text text-xs">Method</span>
                </label>
                <select
                  value={payment.method}
                  onChange={(e) =>
                    handleSplitPaymentChange(index, "method", e.target.value)
                  }
                  className="select select-bordered select-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text text-xs">Amount ({currency})</span>
                </label>
                <FormattedNumberInput
                  value={payment.amount}
                  onChange={(e) =>
                    handleSplitPaymentChange(index, "amount", e.target.value)
                  }
                  className="input input-bordered input-sm"
                  placeholder="0.00"
                />
              </div>

              <button
                onClick={() => removeSplitPayment(index)}
                className="btn btn-sm btn-error btn-circle"
                disabled={splitPayments.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Summary */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Order Subtotal:</span>
              <span>
                {currency}
                {orderTotal.toFixed(2)}
              </span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>Tip:</span>
                <span>
                  {currency}
                  {tipAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="divider my-1"></div>
            <div className="flex justify-between font-bold text-base">
              <span>Total Payable:</span>
              <span className="text-primary">
                {currency}
                {totalWithTip.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-semibold">
                {currency}
                {totalPaid.toFixed(2)}
              </span>
            </div>
            {change > 0 && (
              <div className="flex justify-between p-2 bg-success/20 rounded">
                <span className="font-medium">Change:</span>
                <span className="font-bold text-success">
                  {currency}
                  {change.toFixed(2)}
                </span>
              </div>
            )}
            {balance > 0 && (
              <div className="flex justify-between p-2 bg-warning/20 rounded">
                <span className="font-medium">Balance Due:</span>
                <span className="font-bold text-warning">
                  {currency}
                  {balance.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

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
