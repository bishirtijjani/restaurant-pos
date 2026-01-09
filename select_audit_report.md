# Select Components Audit Report

This document provides a comprehensive list of all select components and elements used in the `frontend/src` directory, categorized by type and including their specific feature context.

## 1. Custom `SearchableSelect` Component

**Path**: `src/components/Input/SearchableSelect.jsx`

The `SearchableSelect` is the primary high-end component used for filtered searches or data-heavy selections.

| Feature Area   | File Path                                                              | Line | Purpose                                 |
| :------------- | :--------------------------------------------------------------------- | :--- | :-------------------------------------- |
| **Users**      | `features/users/index.jsx`                                             | 350  | **Filter**: Store filter for user list  |
|                | `features/users/index.jsx`                                             | 364  | **Filter**: Role filter for user list   |
|                | `features/users/components/AddUserModalBody.jsx`                       | 165  | **Selection**: Role assignment          |
|                | `features/users/components/EditUserModalBody.jsx`                      | 187  | **Selection**: Role update              |
| **Tables**     | `features/tables/components/TableFormModalBody.jsx`                    | 136  | **Selection**: Table shape              |
|                | `features/tables/components/TableFormModalBody.jsx`                    | 154  | **Selection**: Staff assignment         |
| **Orders**     | `features/orders/index.jsx`                                            | 103  | **Filter**: Store filter                |
|                | `features/orders/index.jsx`                                            | 120  | **Filter**: Status filter               |
|                | `features/orders/components/DiscountSection.jsx`                       | 280  | **Selection**: Discount type            |
|                | `features/orders/components/PaymentConfirmationModalBody.jsx`          | 557  | **Selection**: Payment method           |
|                | `features/orders/components/PaymentConfirmationModalBody.jsx`          | 624  | **Selection**: Customer linking         |
|                | `features/orders/components/UpdatePaymentModalBody.jsx`                | 140  | **Selection**: Payment update           |
|                | `features/orders/components/VoidOrderItemsModalBody.jsx`               | 270  | **Selection**: Void reason              |
| **Inventory**  | `features/inventory/index.jsx`                                         | 167  | **Filter**: Store filter                |
|                | `features/inventory/index.jsx`                                         | 181  | **Filter**: Category filter             |
|                | `features/inventory/components/AddInventoryModalBody.jsx`              | 152  | **Selection**: Product selection        |
|                | `features/inventory/components/AddInventoryModalBody.jsx`              | 171  | **Selection**: Store assignment         |
|                | `features/inventory/components/AddInventoryModalBody.jsx`              | 242  | **Selection**: Supplier selection       |
|                | `features/inventory/components/EditInventoryModalBody.jsx`             | 190  | **Selection**: Store update             |
|                | `features/inventory/components/EditInventoryModalBody.jsx`             | 208  | **Selection**: Product update           |
|                | `features/inventory/components/EditInventoryModalBody.jsx`             | 260  | **Selection**: Supplier update          |
|                | `features/inventory/components/LinkMenuItemsModalBody.jsx`             | 155  | **Selection**: Inventory link           |
| **Purchasing** | `features/purchaseOrders/index.jsx`                                    | 140  | **Filter**: Store filter                |
|                | `features/purchaseOrders/index.jsx`                                    | 152  | **Filter**: Supplier filter             |
|                | `features/purchaseOrders/CreatePurchaseOrder.jsx`                      | 197  | **Selection**: Supplier selection       |
|                | `features/purchaseOrders/CreatePurchaseOrder.jsx`                      | 299  | **Selection**: Row item selection       |
|                | `features/purchaseOrders/components/ReceivePurchaseOrderModalBody.jsx` | 256  | **Selection**: Payment status update    |
|                | `features/purchaseOrders/components/ReceivePurchaseOrderModalBody.jsx` | 292  | **Selection**: Payment method selection |
| **Stock Adj.** | `features/stockAdjustments/index.jsx`                                  | 152  | **Filter**: Store filter                |
|                | `features/stockAdjustments/index.jsx`                                  | 164  | **Filter**: Type filter                 |
|                | `features/stockAdjustments/components/AddStockAdjustmentModalBody.jsx` | 171  | **Selection**: Item selection           |
|                | `features/stockAdjustments/components/AddStockAdjustmentModalBody.jsx` | 189  | **Selection**: Adjustment type          |
|                | `features/stockAdjustments/components/AddStockAdjustmentModalBody.jsx` | 206  | **Selection**: Adjustment reason        |
| **Expenses**   | `features/expenses/index.jsx`                                          | 178  | **Filter**: Store filter                |
|                | `features/expenses/index.jsx`                                          | 198  | **Filter**: Category filter             |
|                | `features/expenses/index.jsx`                                          | 218  | **Filter**: Payment method filter       |
|                | `features/expenses/components/AddExpenseModalBody.jsx`                 | 102  | **Selection**: Expense category         |
|                | `features/expenses/components/AddExpenseModalBody.jsx`                 | 151  | **Selection**: Payment method           |
| **KDS**        | `features/kdsStations/components/StationManagementModalBody.jsx`       | 215  | **Selection**: Store selection          |
|                | `features/kdsStations/components/StationManagementModalBody.jsx`       | 335  | **Selection**: Station selection        |
|                | `features/kdsStations/components/StationManagementModalBody.jsx`       | 361  | **Selection**: Station type             |
|                | `features/kds/components/KDSSettingsModalBody.jsx`                     | 110  | **Selection**: Store selection          |
| **Suppliers**  | `features/suppliers/index.jsx`                                         | 303  | **Sort**: Sort by name/date             |

---

## 2. Standard HTML `<select>` Tags

These are used for static configurations or simpler UI table interactions.

| Feature Area | File Path                                                                | Line | Purpose                               |
| :----------- | :----------------------------------------------------------------------- | :--- | :------------------------------------ |
| **Users**    | `features/users/components/StoreAccessMatrix.jsx`                        | 94   | **Selection**: Store role assignment  |
| **Settings** | `features/settings/generalSettings/index.jsx`                            | 309  | **Config**: Date format               |
|              | `features/settings/generalSettings/index.jsx`                            | 400  | **Config**: Currency position         |
|              | `features/settings/generalSettings/index.jsx`                            | 424  | **Config**: Decimal points            |
|              | `features/settings/generalSettings/components/CommunicationSettings.jsx` | 70   | **Config**: SMS provider              |
|              | `features/settings/generalSettings/components/CommunicationSettings.jsx` | 153  | **Config**: Email provider            |
|              | `features/settings/generalSettings/components/CommunicationSettings.jsx` | 251  | **Config**: WhatsApp provider         |
| **Brand**    | `features/brand/BrandSettings.jsx`                                       | 261  | **Appearance**: Theme selection       |
|              | `features/brand/BrandSettings.jsx`                                       | 441  | **Config**: Default language/currency |
|              | `features/brand/BrandCatalog.jsx`                                        | 159  | **Filter**: Category filter           |
| **Stores**   | `features/stores/components/AddStoreModalBody.jsx`                       | 112  | **Selection**: Branch type            |
| **Orders**   | `features/orders/components/RefundModalBody.jsx`                         | 215  | **Selection**: Refund reason          |

---

## 3. Unused Components

- `src/components/Input/SelectBox.jsx`: This component is a wrapper around `<select>` but is currently not imported or used anywhere in the codebase.
