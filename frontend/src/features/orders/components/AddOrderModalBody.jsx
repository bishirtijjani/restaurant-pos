import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import ErrorText from "../../../components/Typography/ErrorText";

/**
 * Helper function that, given a menuItem and a total number of units requested,
 * allocates available stock from the menuItem's batches (sorted by expiry date)
 * until the requested quantity is satisfied.
 *
 * Returns an object with:
 *   - valid: true if the total quantity is available; false otherwise.
 *   - allocations: an array of allocations in the form:
 *         { batchNumber, allocated, expiryDate }
 *   - error: if not valid, an error message.
 */
const calculateAllocations = (menuItem, totalUnitsRequested) => {
  if (!menuItem?.batches?.length) {
    return { valid: false, error: "Out of Stock !" };
  }

  // Sort batches by expiry (earliest first)
  const sortedBatches = [...menuItem.batches].sort(
    (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
  );
  let remaining = totalUnitsRequested;
  const allocations = [];

  for (const batch of sortedBatches) {
    if (batch.quantity > 0) {
      // Allocate as much as possible from the current batch
      const allocated = Math.min(batch.quantity, remaining);
      if (allocated > 0) {
        allocations.push({
          batchNumber: batch.batchNumber,
          allocated,
          expiryDate: batch.expiryDate,
        });
        remaining -= allocated;
        if (remaining <= 0) break;
      }
    }
  }

  if (remaining > 0) {
    const totalAllocated = totalUnitsRequested - remaining;
    return {
      valid: false,
      error: `Quantity exceeds available stock across all batches. Requested ${totalUnitsRequested} units but only ${totalAllocated} available.`,
    };
  }
  return { valid: true, allocations };
};

function AddOrderModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const { menuItems, loading: menuItemsLoading } = useSelector(
    (state) => state.menuItems
  );
  const { customers, loading: customersLoading } = useSelector(
    (state) => state.customers
  );
  const { settings } = useSelector((state) => state.generalSettings);
  const currency = settings?.currency?.symbol || "$";

  const [order, setOrder] = useState({
    customerId: "",
    menuItems: [],
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    dispatch(fetchAllMenuItems());
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  const handleInputChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  // Calculates the total amount for a menuItem row
  const calculateMenuItemTotal = (
    packQty,
    unitQty,
    standardPackPrice,
    standardUnitPrice
  ) => {
    return packQty * standardPackPrice + unitQty * standardUnitPrice;
  };

  /**
   * Validates the quantity inputs for a menuItem row.
   * It calculates the total units requested (taking into account units per pack)
   * and then uses calculateAllocations() to see if the order can be fulfilled.
   * If so, it updates that menuItem order with the allocation details.
   */
  const validateQuantityInput = (index, field, value) => {
    const menuItemOrder = order.menuItems[index];
    const selectedMenuItem = menuItems.find(
      (p) => p._id === menuItemOrder.menuItemId
    );
    if (!selectedMenuItem) {
      return { isValid: false, error: "No menuItem selected" };
    }
    // Determine new quantities (if the field being edited is packQuantity or unitQuantity)
    const packQty =
      field === "packQuantity"
        ? parseInt(value) || 0
        : menuItemOrder.packQuantity;
    const unitQty =
      field === "unitQuantity"
        ? parseInt(value) || 0
        : menuItemOrder.unitQuantity;
    const totalUnitsOrdered =
      packQty * (selectedMenuItem.unitsInPack || 1) + unitQty;

    const allocationResult = calculateAllocations(
      selectedMenuItem,
      totalUnitsOrdered
    );
    if (!allocationResult.valid) {
      return { isValid: false, error: allocationResult.error };
    }

    // Create a human-readable allocation message
    const allocationMessage = allocationResult.allocations
      .map(
        (a) =>
          `Batch ${a.batchNumber} (${a.allocated} units, expires: ${new Date(
            a.expiryDate
          ).toLocaleDateString()})`
      )
      .join(", ");

    // Update the menuItem row with the new quantities and allocations
    const newMenuItems = [...order.menuItems];
    newMenuItems[index] = {
      ...newMenuItems[index],
      packQuantity: packQty,
      unitQuantity: unitQty,
      allocations: allocationResult.allocations,
      allocationMessage,
      totalAmount: calculateMenuItemTotal(
        packQty,
        unitQty,
        selectedMenuItem.standardPackPrice,
        selectedMenuItem.standardUnitPrice
      ),
      packQuantityError: "",
      unitQuantityError: "",
    };
    setOrder({ ...order, menuItems: newMenuItems });
    return { isValid: true, error: null };
  };

  /**
   * Handles changes in the menuItem row.
   * For menuItem selection, it resets quantities and allocation details.
   * For quantity inputs, it validates and updates the allocations automatically.
   */
  const handleMenuItemChange = (index, e) => {
    const { name, value } = e.target;
    setErrorMessage("");

    // If changing the menuItem selection, update the row accordingly.
    if (name === "menuItemId") {
      const newMenuItems = [...order.menuItems];
      const selectedMenuItem = menuItems.find((p) => p._id === value);
      if (!selectedMenuItem) return;
      newMenuItems[index] = {
        menuItemId: value,
        allocations: [],
        allocationMessage: "",
        packQuantity: 0,
        unitQuantity: 0,
        packPrice: selectedMenuItem.standardPackPrice,
        unitPrice: selectedMenuItem.standardUnitPrice,
        totalAmount: 0,
        unitsInPack: selectedMenuItem.unitsInPack || 1,
        packQuantityError: "",
        unitQuantityError: "",
      };
      setOrder({ ...order, menuItems: newMenuItems });
      dispatch(
        showNotification({
          message: `Selected menuItem ${selectedMenuItem.name}. Prices set.`,
          status: 1,
        })
      );
      return;
    }

    // For quantity fields, use the helper to validate and update state.
    if (name === "packQuantity" || name === "unitQuantity") {
      const validation = validateQuantityInput(index, name, value);
      if (!validation.isValid) {
        const errorField =
          name === "packQuantity" ? "packQuantityError" : "unitQuantityError";
        const newMenuItems = [...order.menuItems];
        newMenuItems[index] = {
          ...newMenuItems[index],
          [errorField]: validation.error,
        };
        setOrder({ ...order, menuItems: newMenuItems });
      }
      // Important: Do not update state again after calling validateQuantityInput,
      // as it already sets the correct values.
      return;
    }
  };

  // Adds a new (empty) menuItem row
  const addMenuItemField = () => {
    setOrder({
      ...order,
      menuItems: [
        ...order.menuItems,
        {
          menuItemId: "",
          allocations: [],
          allocationMessage: "",
          packQuantity: 0,
          unitQuantity: 0,
          packPrice: 0,
          unitPrice: 0,
          totalAmount: 0,
          unitsInPack: 1,
          packQuantityError: "",
          unitQuantityError: "",
        },
      ],
    });
  };

  const removeMenuItemField = (index) => {
    const newMenuItems = order.menuItems.filter((_, i) => i !== index);
    setOrder({ ...order, menuItems: newMenuItems });
  };

  // Sums up the total amount across all menuItem rows
  const calculateTotalAmount = () => {
    return order.menuItems.reduce(
      (acc, menuItem) => acc + (menuItem.totalAmount || 0),
      0
    );
  };

  const handleCustomerChange = (e) => {
    setOrder({ ...order, customerId: e.target.value });
    setErrorMessage("");
  };

  // Prepares the final order payload and opens the payment confirmation modal.
  const saveOrder = () => {
    if (order.menuItems.length === 0) {
      return setErrorMessage("At least one menuItem is required!");
    }
    if (
      order.menuItems.some(
        (prod) => prod.packQuantity === 0 && prod.unitQuantity === 0
      )
    ) {
      return setErrorMessage(
        "Each menuItem must have either pack or unit quantity!"
      );
    }

    const selectedCustomer = order.customerId
      ? customers.find((c) => c._id === order.customerId)
      : null;

    const orderPayload = {
      customerId: order.customerId || null,
      customerDetails: selectedCustomer || null,
      menuItems: order.menuItems.map((menuItem) => ({
        unitsInPack: menuItem.unitsInPack, // <<–– add this!
        menuItemId: menuItem.menuItemId,
        // Pass the auto-generated allocations array for each menuItem.
        allocations: menuItem.allocations, // Each allocation: { batchNumber, allocated, expiryDate }
        packQuantity: parseInt(menuItem.packQuantity) || 0,
        unitQuantity: parseInt(menuItem.unitQuantity) || 0,
        packPrice: parseFloat(menuItem.packPrice) || 0,
        unitPrice: parseFloat(menuItem.unitPrice) || 0,
        totalAmount: parseFloat(menuItem.totalAmount) || 0,
      })),
      totalAmount: calculateTotalAmount(),
    };

    if (
      orderPayload.menuItems.some(
        (prod) => prod.packPrice <= 0 || prod.unitPrice <= 0
      )
    ) {
      dispatch(showNotification({ message: "Invalid price!", status: 0 }));
      return setErrorMessage("One or more menuItems has its price set to 0!");
    }

    dispatch(
      openModal({
        title: "Payment Confirmation",
        bodyType: MODAL_BODY_TYPES.PAYMENT_CONFIRMATION,
        extraObject: orderPayload,
        size: "lg",
      })
    );
  };

  return (
    <div className="modal-content">
      {/* Modal Header */}
      <div className="modal-header">
        <h2 className="text-lg font-semibold">Add New Order</h2>
      </div>

      {/* Modal Body */}
      <div className="modal-body">
        {/* Customer Details */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Customer (Optional - Leave empty for walk-in customer)
          </label>
          <select
            value={order.customerId}
            onChange={handleCustomerChange}
            className="select select-bordered w-full"
            disabled={customersLoading}
          >
            <option value="">Walk-in Customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.fullname} - {customer.phone || "No Phone"}
              </option>
            ))}
          </select>
        </div>

        {/* Order MenuItems Table */}
        <table className="table-auto w-full border-collapse border border-gray-400">
          {order.menuItems.length > 0 && (
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-gray-400 px-4 py-2">#</th>
                <th className="border border-gray-400 px-4 py-2">MenuItem</th>
                <th className="border border-gray-400 px-4 py-2">
                  Batches Allocated
                </th>
                <th className="border border-gray-400 px-4 py-2">Pack Qty</th>
                <th className="border border-gray-400 px-4 py-2">Pack Price</th>
                <th className="border border-gray-400 px-4 py-2">Unit Qty</th>
                <th className="border border-gray-400 px-4 py-2">Unit Price</th>
                <th className="border border-gray-400 px-4 py-2">
                  Total Amount
                </th>
                <th className="border border-gray-400 px-4 py-2">Actions</th>
              </tr>
            </thead>
          )}
          <tbody>
            {order.menuItems.map((prod, index) => (
              <tr key={index} className="border-b border-gray-400">
                <td className="border border-gray-400 px-4 py-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  <SearchableSelect
                    options={menuItems}
                    value={prod.menuItemId}
                    onChange={(e) => handleMenuItemChange(index, e)}
                    placeholder="Search for a menuItem..."
                    isLoading={menuItemsLoading}
                    disabled={menuItemsLoading}
                  />
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {prod.allocationMessage ? (
                    <div className="text-sm">{prod.allocationMessage}</div>
                  ) : (
                    <div className="text-sm italic text-gray-500">
                      Auto allocation on quantity input
                    </div>
                  )}
                </td>
                <td className="border border-gray-400 px-4 py-2 text-center">
                  {prod.unitsInPack > 1 ? (
                    <div>
                      <FormattedNumberInput
                        id={`packQuantity-${index}`}
                        name="packQuantity"
                        value={prod.packQuantity}
                        onChange={(e) => handleMenuItemChange(index, e)}
                        className={`input input-bordered w-full ${
                          prod.packQuantityError ? "border-red-500" : ""
                        }`}
                        min={0}
                        placeholder="Enter Pack Quantity"
                      />
                      {prod.packQuantityError && (
                        <p className="text-red-500 text-sm mt-1">
                          {prod.packQuantityError}
                        </p>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border border-gray-400 px-4 py-2 text-right">
                  {prod.unitsInPack > 1 ? (
                    <FormattedNumberInput
                      id={`packPrice-${index}`}
                      value={prod.packPrice}
                      className="input input-bordered w-full text-right"
                      disabled
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border border-gray-400 px-4 py-2 text-center">
                  <FormattedNumberInput
                    id={`unitQuantity-${index}`}
                    name="unitQuantity"
                    value={prod.unitQuantity}
                    onChange={(e) => handleMenuItemChange(index, e)}
                    className={`input input-bordered w-full ${
                      prod.unitQuantityError ? "border-red-500" : ""
                    }`}
                    min={0}
                    placeholder="Enter Unit Quantity"
                  />
                  {prod.unitQuantityError && (
                    <p className="text-red-500 text-sm mt-1">
                      {prod.unitQuantityError}
                    </p>
                  )}
                </td>
                <td className="border border-gray-400 px-4 py-2 text-right">
                  <FormattedNumberInput
                    id={`unitPrice-${index}`}
                    value={prod.unitPrice}
                    className="input input-bordered w-full text-right"
                    disabled
                  />
                </td>
                <td className="border border-gray-400 px-4 py-2 text-right">
                  <FormattedNumberInput
                    id={`totalAmount-${index}`}
                    value={prod.totalAmount}
                    className="input input-bordered w-full text-right"
                    disabled
                  />
                </td>
                <td className="border border-gray-400 px-4 py-2 text-center">
                  <button
                    onClick={() => removeMenuItemField(index)}
                    className="btn btn-error"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addMenuItemField} className="btn btn-secondary mt-4">
          Add MenuItem
        </button>

        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
      </div>

      {/* Modal Actions */}
      <div className="modal-action mt-6">
        <button
          onClick={saveOrder}
          className={`btn btn-primary ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          Proceed to Payment
        </button>
        <button onClick={closeModal} className="btn btn-error">
          Close
        </button>
      </div>
    </div>
  );
}

export default AddOrderModalBody;
