import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { Package, Calendar, DollarSign, Check } from "lucide-react";

const ReceivePurchaseOrderModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const order = extraObject;
  const { loading } = useSelector((state) => state.purchaseOrders);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [receivedItems, setReceivedItems] = useState(
    order.items.map((item) => ({
      itemId: item._id,
      receivedQuantity: item.quantity,
    }))
  );

  const [paymentData, setPaymentData] = useState({
    actualDeliveryDate: new Date().toISOString().split("T")[0],
    paymentStatus: order.paymentStatus || "unpaid",
    amountPaid: order.amountPaid || 0,
    paymentMethod: order.paymentMethod || "",
  });

  const [errors, setErrors] = useState({});

  const handleReceivedQuantityChange = (itemId, value) => {
    const quantity = parseFloat(value) || 0;
    setReceivedItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, receivedQuantity: quantity } : item
      )
    );
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Check if at least one item has been received
    const hasReceivedItems = receivedItems.some(
      (item) => item.receivedQuantity > 0
    );
    if (!hasReceivedItems) {
      newErrors.items = "At least one item must have a received quantity";
    }

    // Validate received quantities don't exceed ordered quantities
    receivedItems.forEach((receivedItem) => {
      const orderItem = order.items.find((i) => i._id === receivedItem.itemId);
      if (receivedItem.receivedQuantity > orderItem.quantity) {
        newErrors[
          `item_${receivedItem.itemId}`
        ] = `Cannot exceed ordered quantity of ${orderItem.quantity}`;
      }
    });

    // Validate payment data if provided
    if (
      paymentData.amountPaid &&
      parseFloat(paymentData.amountPaid) > order.totalAmount
    ) {
      newErrors.amountPaid = "Amount paid cannot exceed total amount";
    }

    if (paymentData.amountPaid && !paymentData.paymentMethod) {
      newErrors.paymentMethod =
        "Payment method is required when amount is paid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(
        receivePurchaseOrder({
          id: order._id,
          data: {
            receivedItems,
            actualDeliveryDate: paymentData.actualDeliveryDate,
            paymentStatus: paymentData.paymentStatus,
            amountPaid: parseFloat(paymentData.amountPaid) || 0,
            paymentMethod: paymentData.paymentMethod,
          },
        })
      ).unwrap();

      dispatch(
        showNotification({
          message: "Purchase order received successfully",
          status: 1,
        })
      );
      dispatch(fetchPurchaseOrders());
      dispatch(closeModal());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to receive purchase order",
          status: 0,
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Info */}
      <div className="alert alert-info">
        <div className="flex flex-col w-full">
          <div className="font-semibold mb-2">PO #{order.orderNumber}</div>
          <div className="text-sm">Supplier: {order.supplier?.name}</div>
          <div className="text-sm">
            Total Amount: {currency}
            {order.totalAmount?.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Received Items */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          Received Items
        </h3>

        {errors.items && (
          <div className="alert alert-error">
            <ErrorText>{errors.items}</ErrorText>
          </div>
        )}

        <div className="space-y-3">
          {order.items.map((item, index) => {
            const receivedItem = receivedItems.find(
              (ri) => ri.itemId === item._id
            );
            return (
              <div key={item._id} className="card bg-base-200">
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-base-content/70">
                        Ordered: {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-base-content/70">
                        Unit Price
                      </div>
                      <div className="font-semibold">
                        {currency}
                        {item.unitPrice?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Received Quantity ({item.unit})
                      </span>
                    </label>
                    <FormattedNumberInput
                      value={receivedItem?.receivedQuantity || ""}
                      onChange={(e) =>
                        handleReceivedQuantityChange(item._id, e.target.value)
                      }
                      className={`input input-bordered ${
                        errors[`item_${item._id}`] ? "input-error" : ""
                      }`}
                      placeholder="0"
                      min="0"
                      max={item.quantity}
                      step="0.01"
                    />
                    {errors[`item_${item._id}`] && (
                      <ErrorText>{errors[`item_${item._id}`]}</ErrorText>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Date */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Actual Delivery Date
          </span>
        </label>
        <input
          type="date"
          name="actualDeliveryDate"
          value={paymentData.actualDeliveryDate}
          onChange={handlePaymentChange}
          className="input input-bordered"
        />
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Payment Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Payment Status</span>
            </label>
            <select
              name="paymentStatus"
              value={paymentData.paymentStatus}
              onChange={handlePaymentChange}
              className="select select-bordered"
            >
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount Paid ({currency})</span>
            </label>
            <FormattedNumberInput
              name="amountPaid"
              value={paymentData.amountPaid}
              onChange={handlePaymentChange}
              className={`input input-bordered ${
                errors.amountPaid ? "input-error" : ""
              }`}
              placeholder="0.00"
              min="0"
              max={order.totalAmount}
              step="0.01"
            />
            {errors.amountPaid && <ErrorText>{errors.amountPaid}</ErrorText>}
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Payment Method</span>
          </label>
          <select
            name="paymentMethod"
            value={paymentData.paymentMethod}
            onChange={handlePaymentChange}
            className={`select select-bordered ${
              errors.paymentMethod ? "select-error" : ""
            }`}
          >
            <option value="">Select method</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Bank Transfer</option>
            <option value="credit">Credit</option>
          </select>
          {errors.paymentMethod && (
            <ErrorText>{errors.paymentMethod}</ErrorText>
          )}
        </div>
      </div>

      <div className="modal-action">
        <button
          type="button"
          onClick={() => dispatch(closeModal())}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Processing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Receive Order
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReceivePurchaseOrderModalBody;
