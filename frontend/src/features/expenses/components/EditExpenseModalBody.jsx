import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ErrorText from "../../../components/Typography/ErrorText";
import { showNotification } from "../../common/headerSlice";
import { updateExpense, fetchAllExpenses } from "../expensesSlice";

function EditExpenseModalBody({ closeModal, extraObject }) {
  const expenseData = extraObject;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expense, setExpense] = useState({
    date: "",
    category: "",
    amount: "",
    description: "",
    paymentMethod: "",
    invoice: "",
  });

  const categories = [
    "Inventory Purchase",
    "Utilities",
    "Rent",
    "Transportation",
    "Maintenance",
    "Salaries",
    "Miscellaneous",
    "Other",
  ];

  const paymentMethods = ["Cash", "Credit", "Bank Transfer", "Card", "Other"];

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
        <select
          id="category"
          name="category"
          value={expense.category}
          onChange={handleInputChange}
          className="input input-bordered w-full mt-2"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="mt-4">
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={expense.amount}
          onChange={handleInputChange}
          className="input input-bordered w-full mt-2"
          placeholder="Enter Amount"
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
          className="input input-bordered w-full mt-2"
          placeholder="Enter Description"
          rows="4"
        />
      </div>

      {/* Payment Method */}
      <div className="mt-4">
        <label htmlFor="paymentMethod" className="block text-sm font-medium">
          Payment Method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={expense.paymentMethod}
          onChange={handleInputChange}
          className="input input-bordered w-full mt-2"
        >
          <option value="">Select Payment Method</option>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
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
          placeholder="Enter Invoice"
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
