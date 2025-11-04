import { MODAL_BODY_TYPES } from "../utils/globalConstantUtil";
import { useSelector, useDispatch } from "react-redux";
import { closeModal } from "../features/common/modalSlice";
import ConfirmationModalBody from "../features/common/components/ConfirmationModalBody";
import SessionExpiredModalBody from "../features/common/components/SessionExpiredModalBody";
import ViewUserModalBody from "../features/users/components/ViewUserModalBody";
import EditUserModalBody from "../features/users/components/EditUserModalBody";
import AddUserModalBody from "../features/users/components/AddUserModalBody";
import AddMenuItemModalBody from "../features/menuItems/components/AddMenuItemModalBody";
import EditMenuItemModalBody from "../features/menuItems/components/EditMenuItemModalBody";
import AddCategoryModalBody from "../features/categories/components/AddCategoryModalBody";
import EditCategoryModalBody from "../features/categories/components/EditCategoryModalBody";
import AddSupplierModalBody from "../features/suppliers/components/AddSupplierModalBody";
import EditSupplierModalBody from "../features/suppliers/components/EditSupplierModalBody";
import AddOrderModalBody from "../features/orders/components/AddOrderModalBody";
import PaymentConfirmationModalBody from "../features/orders/components/PaymentConfirmationModalBody";
import Receipt from "../features/common/components/Receipt";
import AddExpenseModalBody from "../features/expenses/components/AddExpenseModalBody";
import EditExpenseModalBody from "../features/expenses/components/EditExpenseModalBody";
import AddCustomerModalBody from "../features/customers/components/AddCustomerModalBody";
import EditCustomerModalBody from "../features/customers/components/EditCustomerModalBody";
import ViewMenuItemModalBody from "../features/menuItems/components/ViewMenuItemModalBody";
import { X } from "lucide-react";
import KDSSettingsModalBody from "../features/kds/components/KDSSettingsModalBody";
import OrderDetailsModalBody from "../features/orders/components/OrderDetailsModalBody";
import UpdatePaymentModalBody from "../features/orders/components/UpdatePaymentModalBody";
function ModalLayout() {
  const { isOpen, bodyType, size, extraObject, title } = useSelector(
    (state) => state.modal
  );
  const dispatch = useDispatch();

  const close = (e) => {
    dispatch(closeModal(e));
  };

  return (
    <>
      {/* The button to open modal */}
      <div className={`modal h-full ${isOpen ? "modal-open" : ""} `}>
        <div
          className={`modal-box flex flex-col p-0 border border-primary/10 ${
            size === "xl" ? "max-w-full h-full" : ""
          }`}
        >
          {/* Modal Header */}
          <div className="bg-base-200 py-3 px-4 rounded-t-lg flex items-center justify-between border-b border-base-300 sticky top-0 z-10">
            <h3 className="font-bold text-xl">{title}</h3>
            <button
              className="btn btn-sm btn-circle btn-error btn-outline"
              onClick={() => close()}
            >
              <X size={20} />
            </button>
          </div>
          {/* Modal Body */}
          <div className="p-4 overflow-y-auto flex-grow">
            {/* Loading modal body according to different modal type */}
            {
              {
                [MODAL_BODY_TYPES.ADD_NEW_USER]: (
                  <AddUserModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_USER]: (
                  <EditUserModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.VIEW_USER]: (
                  <ViewUserModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_NEW_CUSTOMER]: (
                  <AddCustomerModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_CUSTOMER]: (
                  <EditCustomerModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_NEW_MENU_ITEM]: (
                  <AddMenuItemModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_MENU_ITEM]: (
                  <EditMenuItemModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.VIEW_MENU_ITEM]: (
                  <ViewMenuItemModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_NEW_CATEGORY]: (
                  <AddCategoryModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_CATEGORY]: (
                  <EditCategoryModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_NEW_SUPPLIER]: (
                  <AddSupplierModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_SUPPLIER]: (
                  <EditSupplierModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_ORDER]: (
                  <AddOrderModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ORDER_DETAILS]: (
                  <OrderDetailsModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.UPDATE_PAYMENT]: (
                  <UpdatePaymentModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.ADD_EXPENSE]: (
                  <AddExpenseModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_EXPENSE]: (
                  <EditExpenseModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.KDS_SETTINGS]: (
                  <KDSSettingsModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.PAYMENT_CONFIRMATION]: (
                  <PaymentConfirmationModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.RECEIPT_MODAL]: (
                  <Receipt closeModal={close} extraObject={extraObject} />
                ),
                [MODAL_BODY_TYPES.SESSION_EXPIRED]: (
                  <SessionExpiredModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.CONFIRMATION]: (
                  <ConfirmationModalBody
                    extraObject={extraObject}
                    closeModal={close}
                  />
                ),
                [MODAL_BODY_TYPES.DEFAULT]: <div></div>,
              }[bodyType]
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalLayout;
