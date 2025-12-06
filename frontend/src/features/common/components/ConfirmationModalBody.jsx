// frontend/src/features/common/components/ConfirmationModalBody.jsx
import { useDispatch } from "react-redux";
import { CONFIRMATION_MODAL_CLOSE_TYPES } from "../../../utils/globalConstantUtil";
import { showNotification } from "../headerSlice";
import { deleteUser } from "../../users/usersSlice";
import { deleteCategory } from "../../categories/categoriesSlice";
import { deleteSupplier } from "../../suppliers/suppliersSlice";
import { deleteMenuItem } from "../../menuItems/menuItemsSlice";
import { cancelOrder } from "../../orders/ordersSlice";
import { deleteExpense } from "../../expenses/expensesSlice";
import {
  deleteAddOnGroup,
  fetchAddOnGroups,
} from "../../addOnGroups/addOnGroupsSlice";
import {
  deleteInventoryItem,
  fetchInventoryItems,
} from "../../inventory/inventorySlice";
import { deleteTable, mergeTables, splitTables, safeUnmergeTables } from "../../tables/tableSlice";
import { updateTableStatus } from "../../tables/tableSlice";
import { updateReservation, deleteReservation } from "../../reservations/reservationSlice";
import { deleteDiscount, deletePromoCode, fetchDiscounts, fetchPromoCodes } from "../../discounts/discountsSlice";

function ConfirmationModalBody({ extraObject, closeModal }) {
  const dispatch = useDispatch();

  const { message, type, id } = extraObject;

  const proceedWithYes = async () => {
    try {
      let successMessage;

      switch (type) {
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_USER:
          await dispatch(deleteUser(id)).unwrap();
          successMessage = "User Deleted!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_CATEGORY:
          await dispatch(deleteCategory(id)).unwrap();
          successMessage = "Category Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_SUPPLIER:
          await dispatch(deleteSupplier(id)).unwrap();
          successMessage = "Supplier Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_MENU_ITEM:
          await dispatch(deleteMenuItem(id)).unwrap();
          successMessage = "Menu Item Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_ORDER:
          await dispatch(
            cancelOrder({ id, reason: "Cancelled by user" })
          ).unwrap();
          successMessage = "Order Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_EXPENSE:
          await dispatch(deleteExpense(id)).unwrap();
          successMessage = "Expense Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_ADDON_GROUP:
          await dispatch(deleteAddOnGroup(id)).unwrap();
          dispatch(fetchAddOnGroups());
          successMessage = "Add-on Group Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_INVENTORY_ITEM:
          await dispatch(deleteInventoryItem(id)).unwrap();
          dispatch(fetchInventoryItems());
          successMessage = "Inventory Item Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.CANCEL_ORDER:
          await dispatch(
            cancelOrder({ id, reason: "Cancelled by user" })
          ).unwrap();
          successMessage = "Order Cancelled Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_TABLE:
          await dispatch(deleteTable(id)).unwrap();
          successMessage = "Table Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.ASSIGN_RESERVATION:
          const { tableId, reservationId } = extraObject;
          await dispatch(updateTableStatus({ id: tableId, status: "reserved" })).unwrap();
          await dispatch(updateReservation({ id: reservationId, data: { tableId, status: "confirmed" } })).unwrap();
          successMessage = "Reservation assigned successfully";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.CLEAR_CART:
          // This is handled by the callback in extraObject
          if (extraObject.onConfirm) {
            extraObject.onConfirm();
          }
          successMessage = "Cart cleared successfully";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.MERGE_TABLES:
          const { tableIds } = extraObject;
          await dispatch(mergeTables({ tableIds })).unwrap();
          successMessage = "Tables merged successfully";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.SPLIT_TABLES:
          await dispatch(safeUnmergeTables({ id, reason: "User requested split" })).unwrap();
          successMessage = "Tables split successfully";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_RESERVATION:
          await dispatch(deleteReservation(id)).unwrap();
          successMessage = "Reservation Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_DISCOUNT:
          await dispatch(deleteDiscount(id)).unwrap();
          dispatch(fetchDiscounts());
          successMessage = "Discount Deleted Successfully!";
          break;
        case CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_PROMO_CODE:
          await dispatch(deletePromoCode(id)).unwrap();
          dispatch(fetchPromoCodes());
          successMessage = "Promo Code Deleted Successfully!";
          break;
        default:
          successMessage = "Action completed!";
      }

      dispatch(showNotification({ message: successMessage, status: 1 }));
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "An error occurred!",
          status: 0,
        })
      );
    } finally {
      closeModal();
    }
  };

  const isDelete = type.startsWith("DELETE");
  const buttonText = type === CONFIRMATION_MODAL_CLOSE_TYPES.CANCEL_ORDER ? "Yes, Cancel" : isDelete ? "Yes, Delete" : "Yes, Confirm";

  return (
    <>
      <p className="text-xl mt-8 text-center">{message}</p>

      <div className="modal-action mt-12">
        <button className="btn btn-outline" onClick={() => closeModal()}>
          Back
        </button>

        <button className="btn btn-error w-36" onClick={() => proceedWithYes()}>
          {buttonText}
        </button>
      </div>
    </>
  );
}

export default ConfirmationModalBody;
