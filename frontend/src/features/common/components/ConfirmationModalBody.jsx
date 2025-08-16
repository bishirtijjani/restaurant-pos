import { useDispatch, useSelector } from "react-redux";
import { CONFIRMATION_MODAL_CLOSE_TYPES } from "../../../utils/globalConstantUtil";
import { showNotification } from "../headerSlice";
import { deleteUser } from "../../users/usersSlice";
import { deleteCategory } from "../../categories/categoriesSlice";
import { deleteSupplier } from "../../suppliers/suppliersSlice";
import { deleteMenuItem } from "../../menuItems/menuItemsSlice";
import { cancelOrder } from "../../orders/ordersSlice";
import { deleteExpense } from "../../expenses/expensesSlice";

function ConfirmationModalBody({ extraObject, closeModal }) {
  const dispatch = useDispatch();

  const { message, type, id, index } = extraObject;
  console.log(extraObject);
  const proceedWithYes = async () => {
    try {
      let result;
      let successMessage;

      if (type === CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_LEAD) {
        result = await dispatch(deleteLead(index)).unwrap();
        successMessage = "Lead Deleted!";
      } else if (type === CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_USER) {
        result = await dispatch(deleteUser(id)).unwrap();
        successMessage = "User Deleted!";
      } else if (type === CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_CATEGORY) {
        result = await dispatch(deleteCategory(id)).unwrap();
        successMessage = "Category Deleted Successfully!";
      } else if (type === CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_SUPPLIER) {
        result = await dispatch(deleteSupplier(id)).unwrap();
        successMessage = "Supplier Deleted Successfully!";
      } else if (type === CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_MENU_ITEM) {
        result = await dispatch(deleteMenuItem(id)).unwrap();
        successMessage = "Menu Item Deleted Successfully!";
      } else if (type === CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_ORDER) {
        result = await dispatch(cancelOrder(id)).unwrap();
        successMessage = "Order Deleted Successfully!";
      } else if (type === CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_EXPENSE) {
        result = await dispatch(deleteExpense(id)).unwrap();
        successMessage = "Expense Deleted Successfully!";
      }

      // Show success notification
      dispatch(showNotification({ message: successMessage, status: 1 }));
    } catch (error) {
      // Show error notification
      dispatch(
        showNotification({
          message: error.message || "An error occurred!",
          status: 0,
        })
      );
    } finally {
      // Close the modal in both success and error cases
      closeModal();
    }
  };

  return (
    <>
      <p className=" text-xl mt-8 text-center">{message}</p>

      <div className="modal-action mt-12">
        <button
          className="btn btn-outline btn-error"
          onClick={() => closeModal()}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary w-36"
          onClick={() => proceedWithYes()}
        >
          Yes
        </button>
      </div>
    </>
  );
}

export default ConfirmationModalBody;
