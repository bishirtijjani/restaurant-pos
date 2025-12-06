import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { recordCustomerPayment } from "../customersSlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import SearchableSelect from "../../../components/Input/SearchableSelect";

const RecordPaymentModalBody = ({ extraObject, closeModal: close }) => {
  const dispatch = useDispatch();
  const { customerId, customerName } = extraObject;

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      dispatch(showNotification({ message: "Please enter a valid amount", status: 0 }));
      return;
    }

    setLoading(true);
    try {
      await dispatch(recordCustomerPayment({
        id: customerId,
        paymentData: {
          amount: parseFloat(amount),
          paymentMethod,
          note
        }
      })).unwrap();
      
      dispatch(showNotification({ message: "Payment recorded successfully", status: 1 }));
      close();
    } catch (error) {
      dispatch(showNotification({ message: error.message || "Failed to record payment", status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-base-content/70">
        Recording payment for <span className="font-bold">{customerName}</span>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Amount *</span>
        </label>
        <FormattedNumberInput
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input input-bordered w-full"
          placeholder="0.00"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Payment Method</span>
        </label>
        <SearchableSelect
          options={[
            { value: "cash", name: "Cash" },
            { value: "card", name: "Card" },
            { value: "transfer", name: "Transfer" },
            { value: "other", name: "Other" },
          ]}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          name="paymentMethod"
          placeholder="Select Payment Method"
          className="w-full"
          valueKey="value"
          labelKey="name"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Note (Optional)</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="Payment reference, receipt number, etc."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>

      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={() => close()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm"></span> : "Record Payment"}
        </button>
      </div>
    </form>
  );
};

export default RecordPaymentModalBody;
