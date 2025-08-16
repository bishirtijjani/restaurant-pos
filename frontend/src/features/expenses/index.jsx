import React, { useEffect } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllExpenses } from "./expensesSlice"; // Adjusted import
import SuspenseContent from "../../containers/SuspenseContent";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import { checkRole } from "../../utils/helpers";

const TopSideButtons = () => {
  const dispatch = useDispatch();

  const openAddNewExpense = () => {
    dispatch(
      openModal({
        title: "Add New Expense",
        bodyType: MODAL_BODY_TYPES.ADD_EXPENSE,
        size: "xl",
      })
    );
  };

  return (
    <div className="flex justify-between w-100 space-x-3">
      {(checkRole("admin") || checkRole("manager")) && (
        <button onClick={openAddNewExpense} className="btn btn-primary">
          <PlusCircleIcon className="w-6 h-6 " /> Add New Expense
        </button>
      )}
      <button onClick={() => location.reload()} className="btn btn-primary">
        <ArrowPathIcon className="w-6 h-6" /> Reload
      </button>
    </div>
  );
};

const Expenses = () => {
  const dispatch = useDispatch();
  const expenses = useSelector((state) => state.expenses.expenses || []);
  const status = useSelector((state) => state.expenses.status);
  const error = useSelector((state) => state.expenses.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllExpenses());
    }
  }, [dispatch, status]);

  if (status === "loading") return <SuspenseContent />;

  const ExpenseRows = expenses.map((expense) => (
    <tr className="border-spacing-x-3 border-collapse" key={expense._id}>
      <td className="border-2">{expense.invoice}</td>
      <td className="border-2">{expense.category}</td>
      <td className="border-2">
        {expense.amount?.toLocaleString("en-US", {
          style: "currency",
          currency: "NGN",
        })}
      </td>
      <td className="border-2">
        {new Date(expense.date).toLocaleDateString()}
      </td>

      {/* for admin and manager only */}
      {(checkRole("admin") || checkRole("manager")) && (
        <td className="border-2">
          <button
            className="btn btn-sm text-white bg-primary min-w-[70px]"
            onClick={() =>
              dispatch(
                openModal({
                  title: "Edit Expense",
                  bodyType: MODAL_BODY_TYPES.EDIT_EXPENSE,
                  extraObject: expense,
                })
              )
            }
          >
            <div className="flex items-center justify-center space-x-1">
              <PencilSquareIcon className="w-5 h-5" />
              <span className="hidden md:block">Edit</span>
            </div>
          </button>
        </td>
      )}
      {/* for admin only */}
      {checkRole("admin") && (
        <td className="border-2">
          <button
            className="btn btn-sm text-white btn-error min-w-[70px]"
            onClick={() =>
              dispatch(
                openModal({
                  title: "Delete Expense?",
                  bodyType: MODAL_BODY_TYPES.CONFIRMATION,
                  extraObject: {
                    message: `Are you sure you want to delete the expense with reference ${expense.invoice}?`,
                    type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_EXPENSE,
                    id: expense._id,
                  },
                })
              )
            }
          >
            <div className="flex items-center justify-center space-x-1">
              <TrashIcon className="w-5 h-5" />
              <span className="hidden md:block">Delete</span>
            </div>
          </button>
        </td>
      )}
    </tr>
  ));

  return (
    <TitleCard
      title="All Expenses"
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      <div className="overflow-x-auto w-full">
        <table className="table table-zebra w-full table-pin-rows">
          <thead className="border-b-4 text-md border-primary">
            <tr>
              <th>Reference/Invoice</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              ExpenseRows
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center">
                  {error.message}
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </TitleCard>
  );
};

export default Expenses;
