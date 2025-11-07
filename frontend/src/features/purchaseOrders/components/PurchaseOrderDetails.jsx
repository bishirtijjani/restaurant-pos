import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../../components/Cards/TitleCard";
import SuspenseContent from "../../../containers/SuspenseContent";
import {
  fetchPurchaseOrderById,
  approvePurchaseOrder,
  cancelPurchaseOrder,
  clearCurrentOrder,
  fetchPurchaseOrders,
} from "../purchaseOrdersSlice";
import { openModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import {
  ArrowLeft,
  Package,
  Truck,
  Calendar,
  DollarSign,
  User,
  FileText,
  Check,
  X,
  Edit3,
  Printer,
  AlertCircle,
} from "lucide-react";
import { checkRole } from "../../../utils/Helpers";

const STATUS_COLORS = {
  draft: "badge-ghost",
  pending: "badge-info",
  approved: "badge-primary",
  received: "badge-success",
  cancelled: "badge-error",
};

const PAYMENT_COLORS = {
  unpaid: "text-error",
  partial: "text-warning",
  paid: "text-success",
};

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector(
    (state) => state.purchaseOrders
  );
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  useEffect(() => {
    if (id) {
      dispatch(fetchPurchaseOrderById(id));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [id, dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleApprove = async () => {
    if (
      window.confirm("Are you sure you want to approve this purchase order?")
    ) {
      try {
        await dispatch(approvePurchaseOrder(id)).unwrap();
        dispatch(
          showNotification({
            message: "Purchase order approved successfully",
            status: 1,
          })
        );
        dispatch(fetchPurchaseOrderById(id));
      } catch (error) {
        dispatch(
          showNotification({
            message: error.message || "Failed to approve purchase order",
            status: 0,
          })
        );
      }
    }
  };

  const handleReceive = () => {
    dispatch(
      openModal({
        title: "Receive Purchase Order",
        bodyType: MODAL_BODY_TYPES.RECEIVE_PURCHASE_ORDER,
        extraObject: currentOrder,
        size: "lg",
      })
    );
  };

  const handleCancel = async () => {
    const reason = window.prompt("Please provide a reason for cancellation:");
    if (reason) {
      try {
        await dispatch(cancelPurchaseOrder({ id, reason })).unwrap();
        dispatch(
          showNotification({
            message: "Purchase order cancelled successfully",
            status: 1,
          })
        );
        dispatch(fetchPurchaseOrderById(id));
      } catch (error) {
        dispatch(
          showNotification({
            message: error.message || "Failed to cancel purchase order",
            status: 0,
          })
        );
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !currentOrder) return <SuspenseContent />;

  return (
    <TitleCard
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <span>Purchase Order #{currentOrder.orderNumber}</span>
        </div>
      }
      TopSideButtons={
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate("/app/purchase-orders")}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-outline btn-sm gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          {currentOrder.status === "draft" &&
            (checkRole("admin") || checkRole("manager")) && (
              <button
                onClick={handleApprove}
                className="btn btn-success btn-sm gap-2"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
            )}

          {currentOrder.status === "approved" &&
            (checkRole("admin") || checkRole("manager")) && (
              <button
                onClick={handleReceive}
                className="btn btn-info btn-sm gap-2"
              >
                <Package className="w-4 h-4" />
                Receive
              </button>
            )}

          {currentOrder.status !== "received" &&
            currentOrder.status !== "cancelled" &&
            checkRole("admin") && (
              <button
                onClick={handleCancel}
                className="btn btn-error btn-outline btn-sm gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
        </div>
      }
      topMargin="mt-2"
    >
      <div className="space-y-6">
        {/* Status and Basic Info */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <span
              className={`badge ${STATUS_COLORS[currentOrder.status]} badge-lg`}
            >
              {currentOrder.status}
            </span>
            <span
              className={`badge badge-lg ${
                PAYMENT_COLORS[currentOrder.paymentStatus]
              }`}
            >
              Payment: {currentOrder.paymentStatus}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-base-content/70">Total Amount</div>
            <div className="text-2xl font-bold text-primary">
              {currency}
              {currentOrder.totalAmount?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        <div className="card bg-base-200">
          <div className="card-body p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Supplier Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-base-content/70">Name</div>
                <div className="font-medium">{currentOrder.supplier?.name}</div>
              </div>
              {currentOrder.supplier?.phone && (
                <div>
                  <div className="text-sm text-base-content/70">Phone</div>
                  <div className="font-medium">
                    {currentOrder.supplier.phone}
                  </div>
                </div>
              )}
              {currentOrder.supplier?.email && (
                <div>
                  <div className="text-sm text-base-content/70">Email</div>
                  <div className="font-medium">
                    {currentOrder.supplier.email}
                  </div>
                </div>
              )}
              {currentOrder.supplier?.address && (
                <div>
                  <div className="text-sm text-base-content/70">Address</div>
                  <div className="font-medium">
                    {currentOrder.supplier.address}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-2 text-base-content/70 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Order Date</span>
              </div>
              <div className="font-semibold">
                {formatDate(currentOrder.orderDate)}
              </div>
            </div>
          </div>

          {currentOrder.expectedDeliveryDate && (
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 text-base-content/70 mb-2">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm">Expected Delivery</span>
                </div>
                <div className="font-semibold">
                  {formatDate(currentOrder.expectedDeliveryDate)}
                </div>
              </div>
            </div>
          )}

          {currentOrder.actualDeliveryDate && (
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 text-base-content/70 mb-2">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Actual Delivery</span>
                </div>
                <div className="font-semibold">
                  {formatDate(currentOrder.actualDeliveryDate)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h3>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="border-b border-base-300">
                    <th>Item</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Subtotal</th>
                    {currentOrder.status === "received" && (
                      <th className="text-right">Received</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.items?.map((item, index) => (
                    <tr key={index} className="border-b border-base-300/50">
                      <td>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-base-content/70">
                          Unit: {item.unit}
                        </div>
                      </td>
                      <td className="text-right">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="text-right">
                        {currency}
                        {item.unitPrice?.toLocaleString()}
                      </td>
                      <td className="text-right font-semibold">
                        {currency}
                        {item.subtotal?.toLocaleString()}
                      </td>
                      {currentOrder.status === "received" && (
                        <td className="text-right">
                          <span
                            className={`badge ${
                              item.receivedQuantity >= item.quantity
                                ? "badge-success"
                                : "badge-warning"
                            }`}
                          >
                            {item.receivedQuantity} {item.unit}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-base-300">
                    <td
                      colSpan={currentOrder.status === "received" ? "4" : "3"}
                      className="text-right font-semibold"
                    >
                      Total Amount:
                    </td>
                    <td className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {currency}
                        {currentOrder.totalAmount?.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="card bg-base-200">
          <div className="card-body p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-base-content/70">
                  Payment Status
                </div>
                <div
                  className={`font-semibold ${
                    PAYMENT_COLORS[currentOrder.paymentStatus]
                  }`}
                >
                  {currentOrder.paymentStatus}
                </div>
              </div>
              <div>
                <div className="text-sm text-base-content/70">Amount Paid</div>
                <div className="font-semibold">
                  {currency}
                  {(currentOrder.amountPaid || 0).toLocaleString()}
                </div>
              </div>
              {currentOrder.paymentMethod && (
                <div>
                  <div className="text-sm text-base-content/70">
                    Payment Method
                  </div>
                  <div className="font-semibold capitalize">
                    {currentOrder.paymentMethod}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(currentOrder.invoiceNumber || currentOrder.notes) && (
          <div className="card bg-base-200">
            <div className="card-body p-6">
              <h3 className="font-semibold text-lg mb-4">
                Additional Information
              </h3>
              <div className="space-y-3">
                {currentOrder.invoiceNumber && (
                  <div>
                    <div className="text-sm text-base-content/70">
                      Invoice Number
                    </div>
                    <div className="font-medium">
                      {currentOrder.invoiceNumber}
                    </div>
                  </div>
                )}
                {currentOrder.notes && (
                  <div>
                    <div className="text-sm text-base-content/70">Notes</div>
                    <div className="font-medium">{currentOrder.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Created By */}
        {currentOrder.createdBy && (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-base-content/70" />
                <span className="text-sm text-base-content/70">
                  Created by:
                </span>
                <span className="font-medium">
                  {currentOrder.createdBy.fullname}
                </span>
                <span className="text-sm text-base-content/70">
                  on {formatDate(currentOrder.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TitleCard>
  );
};

export default PurchaseOrderDetails;
