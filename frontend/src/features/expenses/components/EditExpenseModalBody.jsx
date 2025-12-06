import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ErrorText from "../../../components/Typography/ErrorText";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import { showNotification } from "../../common/headerSlice";
import { updateExpense, fetchAllExpenses } from "../expensesSlice";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";

function EditExpenseModalBody({ closeModal, extraObject }) {
  const expenseData = extraObject;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";
  const [expense, setExpense] = useState({
    date: "",
    category: "",
    amount: "",
    description: "",
    paymentMethod: "",
    invoice: "",
  });

  const categories = [
    { value: "Inventory Purchase", name: "Inventory Purchase" },
    { value: "Utilities", name: "Utilities" },
    { value: "Rent", name: "Rent" },
    { value: "Transportation", name: "Transportation" },
    { value: "Maintenance", name: "Maintenance" },
    { value: "Salaries", name: "Salaries" },
    { value: "Miscellaneous", name: "Miscellaneous" },
    { value: "Other", name: "Other" },
  ];

  const paymentMethods = [
    { value: "Cash", name: "Cash" },
    { value: "Credit", name: "Credit" },
    { value: "Bank Transfer", name: "Bank Transfer" },
    { value: "Card", name: "Card" },
    { value: "Other", name: "Other" },
  ];

  useEffect(() => {
    setExpense(expenseData);
    if (expenseData.date) {
      // Convert the date to 'YYYY-MM-DD' format
      const formattedDate = new Date(expenseData.date)
        .toISOString()
        .split("T")[0];
      setExpense({ ...expenseData, date: formattedDate });
    }
  }, [expenseData]);

  const saveExpense = () => {
    if (expense.amount < 1) return setErrorMessage("Amount is required!");
    if (expense.category.trim() === "")
      return setErrorMessage("Category is required!");
    if (expense.description.trim() === "")
      return setErrorMessage("Description is required!");
    if (expense.invoice.trim() === "")
      return setErrorMessage("Invoice is required!");

    setLoading(true);
    console.log(expense);
    dispatch(updateExpense(expense))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "Expense Updated Successfully!",
            status: 1,
          })
        );
        dispatch(fetchAllExpenses());
        closeModal();
      })
      .catch(() => {
        setErrorMessage("Failed to update expense. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    setErrorMessage("");
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  return (
    <>
      {/* Date */}
      <div className="mt-4">
        <label htmlFor="date" className="block text-sm font-medium">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={expense.date}
          onChange={handleInputChange}
          className="input input-bordered w-full mt-2"
        />
      </div>

      {/* Category */}
      <div className="mt-4">
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <SearchableSelect
          options={categories}
          value={expense.category}
          onChange={handleInputChange}
          name="category"
          placeholder="Select Category"
          className="w-full mt-2"
          valueKey="value"
          labelKey="name"
        />
      </div>

      {/* Amount */}
      <div className="mt-4">
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount ({currency})
        </label>
        <FormattedNumberInput
          id="amount"
          name="amount"
          value={expense.amount}
          onChange={handleInputChange}
          className="input input-bordered w-full mt-2"
          placeholder="Enter Amount..."
          min={0}
        />
      </div>

      {/* Description */}
      <div className="mt-4">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={expense.description}
          onChange={handleInputChange}
          className="input input-bordered w-full mt-2 h-full"
          placeholder="Enter Description"
          rows="4"
        />
      </div>

      {/* Payment Method */}
      <div className="mt-4">
        <label htmlFor="paymentMethod" className="block text-sm font-medium">
          Payment Method
        </label>
        <SearchableSelect
          options={paymentMethods}
          value={expense.paymentMethod}
          onChange={handleInputChange}
          name="paymentMethod"
          placeholder="Select Payment Method"
          className="w-full mt-2"
          valueKey="value"
          labelKey="name"
        />
      </div>

      {/* Invoice */}
      <div className="mt-4">
        <label htmlFor="invoice" className="block text-sm font-medium">
          Invoice
        </label>
        <input
          type="text"
          id="invoice"
          name="invoice"
          value={expense.invoice}
          onChange={handleInputChange}
          className="input input-bordered w-full mt-2"
          placeholder="Enter Invoice ID"
        />
      </div>

      {/* Error Message */}
      <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>

      {/* Modal Actions */}
      <div className="modal-action">
        <button className="btn btn-error" onClick={closeModal}>
          Cancel
        </button>
        <button
          className={`btn btn-primary px-6 ${loading ? "loading" : ""}`}
          onClick={saveExpense}
        >
          Save
        </button>
      </div>
    </>
  );
}

export default EditExpenseModalBody;
