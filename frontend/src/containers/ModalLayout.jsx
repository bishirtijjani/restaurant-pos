// frontend/src/containers/ModalLayout.jsx
import { useSelector, useDispatch } from "react-redux";
import { closeModal } from "../features/common/modalSlice";
import { MODAL_BODY_TYPES } from "../utils/globalConstantUtil";
import { X } from "lucide-react";

// User modals
import AddUserModalBody from "../features/users/components/AddUserModalBody";
import EditUserModalBody from "../features/users/components/EditUserModalBody";
import ViewUserModalBody from "../features/users/components/ViewUserModalBody";

// Customer modals
import AddCustomerModalBody from "../features/customers/components/AddCustomerModalBody";
import EditCustomerModalBody from "../features/customers/components/EditCustomerModalBody";
import ViewCustomerModalBody from "../features/customers/components/ViewCustomerModalBody";

import AddCustomerNoteModalBody from "../features/customers/components/AddCustomerNoteModalBody";
import RecordPaymentModalBody from "../features/customers/components/RecordPaymentModalBody";

// Category modals
import AddCategoryModalBody from "../features/categories/components/AddCategoryModalBody";
import EditCategoryModalBody from "../features/categories/components/EditCategoryModalBody";

// Menu item modals
import AddMenuItemModalBody from "../features/menuItems/components/AddMenuItemModalBody";
import EditMenuItemModalBody from "../features/menuItems/components/EditMenuItemModalBody";
import ViewMenuItemModalBody from "../features/menuItems/components/ViewMenuItemModalBody";

// Supplier modals
import AddSupplierModalBody from "../features/suppliers/components/AddSupplierModalBody";
import EditSupplierModalBody from "../features/suppliers/components/EditSupplierModalBody";

// Order modals
import OrderDetailsModalBody from "../features/orders/components/OrderDetailsModalBody";
import UpdatePaymentModalBody from "../features/orders/components/UpdatePaymentModalBody";
import ModifyOrderModalBody from "../features/orders/components/ModifyOrderModalBody";
import AddItemToOrderModalBody from "../features/orders/components/AddItemToOrderModalBody";
import VoidOrderItemsModalBody from "../features/orders/components/VoidOrderItemsModalBody";
import RefundModalBody from "../features/orders/components/RefundModalBody";
import AddOnSelectorModalBody from "../features/orders/components/AddOnSelectorModalBody";

// order/kds/confirmation/session components
import PaymentConfirmationModalBody from "../features/orders/components/PaymentConfirmationModalBody";
import KDSSettingsModalBody from "../features/kds/components/KDSSettingsModalBody";
import SessionExpiredModalBody from "../features/common/components/SessionExpiredModalBody";
import POS from "../features/orders/POS";

// Add-on group modals
import AddAddOnGroupModalBody from "../features/addOnGroups/components/AddAddOnGroupModalBody";
import EditAddOnGroupModalBody from "../features/addOnGroups/components/EditAddOnGroupModalBody";

// Inventory modals
import AddInventoryModalBody from "../features/inventory/components/AddInventoryModalBody";
import EditInventoryModalBody from "../features/inventory/components/EditInventoryModalBody";
import LinkMenuItemsModalBody from "../features/inventory/components/LinkMenuItemsModalBody";

// Expense modals
import AddExpenseModalBody from "../features/expenses/components/AddExpenseModalBody";

// Floor modals
import AddFloorModalBody from "../features/floors/components/AddFloorModalBody";
import MergeTableModalBody from "../features/floors/components/MergeTableModalBody";
import EditExpenseModalBody from "../features/expenses/components/EditExpenseModalBody";

// KDS modals
import StationManagementModalBody from "../features/kdsStations/components/StationManagementModalBody";

// Stock adjustment modals
import AddStockAdjustmentModalBody from "../features/stockAdjustments/components/AddStockAdjustmentModalBody";
import ViewStockAdjustmentModalBody from "../features/stockAdjustments/components/ViewStockAdjustmentModalBody";

// Purchase order modals
import ReceivePurchaseOrderModalBody from "../features/purchaseOrders/components/ReceivePurchaseOrderModalBody";

// discount and promos
import AddDiscountModalBody from "../features/discounts/components/AddDiscountModalBody";
import AddPromoCodeModalBody from "../features/discounts/components/AddPromoCodeModalBody";

// Reservation modals
import AddReservationModalBody from "../features/reservations/components/AddReservationModalBody";
import EditReservationModalBody from "../features/reservations/components/EditReservationModalBody";

// Common modals
import ConfirmationModalBody from "../features/common/components/ConfirmationModalBody";
import InputModalBody from "../features/common/components/InputModalBody";
import EditItemNoteModalBody from "../features/common/components/EditItemNoteModalBody";
import Receipt from "../features/common/components/Receipt";

// Store modals
import AddStoreModalBody from "../features/stores/components/AddStoreModalBody";
import SelectStoreModalBody from "../features/stores/components/SelectStoreModalBody";
import StoreAccessMatrix from "../features/users/components/StoreAccessMatrix";
import PermissionMatrix from "../features/users/components/PermissionMatrix";

// Brand modals
import BrandMenuForm from "../features/brand/components/BrandMenuForm";
import ImportWizardModalBody from "../features/common/components/ImportWizardModalBody";

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
                [MODAL_BODY_TYPES.VIEW_CUSTOMER]: (
                  <ViewCustomerModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_CUSTOMER_NOTE]: (
                  <AddCustomerNoteModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.RECORD_CUSTOMER_PAYMENT]: (
                  <RecordPaymentModalBody
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
                  <POS closeModal={close} extraObject={extraObject} />
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
                [MODAL_BODY_TYPES.MODIFY_ORDER]: (
                  <ModifyOrderModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_ITEM_TO_ORDER]: (
                  <AddItemToOrderModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.VOID_ORDER_ITEMS]: (
                  <VoidOrderItemsModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.REFUND_ORDER]: (
                  <RefundModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_ON_SELECTOR]: (
                  <AddOnSelectorModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.ADD_KDS_STATION]: (
                  <StationManagementModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_KDS_STATION]: (
                  <StationManagementModalBody
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

                [MODAL_BODY_TYPES.ADD_NEW_FLOOR]: (
                  <AddFloorModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.MERGE_TABLE]: (
                  <MergeTableModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.ADD_ADDON_GROUP]: (
                  <AddAddOnGroupModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_ADDON_GROUP]: (
                  <EditAddOnGroupModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.ADD_STOCK_ADJUSTMENT]: (
                  <AddStockAdjustmentModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.VIEW_STOCK_ADJUSTMENT]: (
                  <ViewStockAdjustmentModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.RECEIVE_PURCHASE_ORDER]: (
                  <ReceivePurchaseOrderModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.ADD_INVENTORY_ITEM]: (
                  <AddInventoryModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_INVENTORY_ITEM]: (
                  <EditInventoryModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.LINK_MENU_ITEMS]: (
                  <LinkMenuItemsModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),

                [MODAL_BODY_TYPES.ADD_DISCOUNT]: (
                  <AddDiscountModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_DISCOUNT]: (
                  <AddDiscountModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_PROMO_CODE]: (
                  <AddPromoCodeModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_PROMO_CODE]: (
                  <AddPromoCodeModalBody
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
                [MODAL_BODY_TYPES.EDIT_ITEM_NOTE]: (
                  <EditItemNoteModalBody
                    extraObject={extraObject}
                    closeModal={close}
                  />
                ),
                [MODAL_BODY_TYPES.INPUT]: (
                  <InputModalBody
                    extraObject={extraObject}
                    closeModal={close}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_RESERVATION]: (
                  <AddReservationModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.EDIT_RESERVATION]: (
                  <EditReservationModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.ADD_NEW_STORE]: (
                  <AddStoreModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.SELECT_STORE]: (
                  <SelectStoreModalBody
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.MANAGE_STORE_ACCESS]: (
                  <StoreAccessMatrix closeModal={close} user={extraObject} />
                ),
                [MODAL_BODY_TYPES.MANAGE_USER_PERMISSIONS]: (
                  <PermissionMatrix
                    closeModal={close}
                    extraObject={extraObject}
                  />
                ),
                [MODAL_BODY_TYPES.BRAND_MENU_FORM]: (
                  <BrandMenuForm extraObject={extraObject} />
                ),
                [MODAL_BODY_TYPES.IMPORT_WIZARD]: (
                  <ImportWizardModalBody
                    closeModal={close}
                    extraObject={extraObject}
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
