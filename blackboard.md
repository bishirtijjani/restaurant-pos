i need help replacing the number input where needed with the FormattedNumberInput.jsx component so as to allow the user to see readable numbers such as 23,997 instead of 23997 but only where needed, i have made some enquiry about these places below, some i have already started so please go through them and do the ones i have not and make sure that it works as sometimes i have noticed that turning an input into a component breaks the code, therefore you need to make sure the component wich you made the change upon works as it should after the change:

AddCustomerModalBody.jsx

debtLimit

EditCustomerModalBody.jsx

debtLimit

Menu Items Files

AddMenuItemModalBody.jsx

price
costPrice

EditMenuItemModalBody.jsx

price
costPrice

Expenses Files

AddExpenseModalBody.jsx

amount

EditExpenseModalBody.jsx

amount

Inventory Files

AddInventoryModalBody.jsx

currentStock
minStockLevel
costPrice

EditInventoryModalBody.jsx

minStockLevel
costPrice
Note: currentStock is NOT editable in edit (only via stock adjustments)

Orders Files

AddOrder.jsx (POS System)

packagingFee
deliveryFee
tableNumber

AddOrderModalBody.jsx

packQuantity
unitQuantity
packPrice
unitPrice

PaymentConfirmationModalBody.jsx

amountReceived

UpdatePaymentModalBody.jsx

amountPaid

Purchase Orders Files

CreatePurchaseOrder.jsx

quantity (for each item)
unitPrice (for each item)

ReceivePurchaseOrderModalBody.jsx

receivedQuantity (for each item)
amountPaid

Stock Adjustments Files

AddStockAdjustmentModalBody.jsx

quantity

Suppliers Files (if you have these)

AddSupplierModalBody.jsx (if exists)

Any credit limit or balance fields

EditSupplierModalBody.jsx (if exists)

Any credit limit or balance fields

Settings Files (if you have financial settings)

GeneralSettingsModalBody.jsx (if exists)

Tax rates
Service charge rates
Any currency/financial settings

KDS Stations Files

StationManagementModalBody.jsx

warningTime
criticalTime
Note: These are minutes, so probably don't need comma formatting (usually under 100)
