import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TitleCard from "../../components/Cards/TitleCard";
import SuspenseContent from "../../containers/SuspenseContent";
import { formatCurrency } from "../../utils/numberFormat";
import { openModal } from "../common/modalSlice";
import { showNotification } from "../common/headerSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
import {
  fetchPurchaseOrders,
  approvePurchaseOrder,
  cancelPurchaseOrder,
  clearError,
  clearSuccess,
} from "./purchaseOrdersSlice";
import { useAuth } from "../../utils/permission";
import Can from "../../components/Auth/Can";
import {
  Package,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Check,
  X,
  Clock,
  FileText,
  Truck,
  Calendar,
} from "lucide-react";

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

const TopSideButtons = () => {
  const navigate = useNavigate();
  const { can } = useAuth();

  return (
    <div className="flex flex-wrap gap-2">
      <Can do="createPurchaseOrders">
        <button
          onClick={() => navigate("/app/purchase-orders/new")}
          className="btn btn-primary btn-sm lg:btn-md gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Purchase Order</span>
        </button>
      </Can>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-ghost btn-sm lg:btn-md gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  );
};

const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  supplierFilter,
  setSupplierFilter,
  suppliers,
}) => {
  return (
    <div className="bg-base-100 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="input input-bordered flex items-center gap-2">
            <Search className="w-5 h-5 opacity-70" />
            <input
              type="text"
              className="grow"
              placeholder="Search by PO number, supplier, or invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="select select-bordered select-sm lg:select-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="select select-bordered select-sm lg:select-md"
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const PurchaseOrderCard = ({
  order,
  onView,
  onApprove,
  onReceive,
  onCancel,
}) => {
  const { can } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return <FileText className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <Check className="w-4 h-4" />;
      case "received":
        return <Package className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
      <div className="card-body p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="card-title text-lg font-bold">
              PO #{order.orderNumber}
            </h3>
            <p className="text-sm text-base-content/70 flex items-center gap-1 mt-1">
              <Truck className="w-4 h-4" />
              {order.supplier?.name || "Unknown Supplier"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`badge ${STATUS_COLORS[order.status]} gap-1`}>
              {getStatusIcon(order.status)}
              {order.status}
            </span>
            <span
              className={`text-sm font-semibold ${
                PAYMENT_COLORS[order.paymentStatus]
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base-content/70 text-sm">Total Amount</span>
            <span className="font-semibold text-lg text-primary">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base-content/70 text-sm flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Order Date
            </span>
            <span className="text-sm">{formatDate(order.orderDate)}</span>
          </div>

          {order.expectedDeliveryDate && (
            <div className="flex justify-between items-center">
              <span className="text-base-content/70 text-sm flex items-center gap-1">
                <Truck className="w-4 h-4" /> Expected Delivery
              </span>
              <span className="text-sm">
                {formatDate(order.expectedDeliveryDate)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-base-content/70 text-sm">Items</span>
            <span className="text-sm font-medium">
              {order.items?.length || 0}
            </span>
          </div>
        </div>

        <div className="card-actions justify-end mt-4 flex-wrap gap-2">
          <button
            className="btn btn-sm btn-outline btn-primary"
            onClick={() => onView(order)}
          >
            <Eye className="w-4 h-4 mr-1" /> View
          </button>

          <Can do="approvePurchaseOrders">
            {order.status === "draft" && (
              <button
                className="btn btn-sm btn-success"
                onClick={() => onApprove(order._id)}
              >
                <Check className="w-4 h-4 mr-1" /> Approve
              </button>
            )}
          </Can>

          <Can do="receivePurchaseOrders">
            {order.status === "approved" && (
              <button
                className="btn btn-sm btn-info"
                onClick={() => onReceive(order)}
              >
                <Package className="w-4 h-4 mr-1" /> Receive
              </button>
            )}
          </Can>

          <Can do="cancelPurchaseOrders">
            {order.status !== "received" && order.status !== "cancelled" && (
              <button
                className="btn btn-sm btn-error btn-outline"
                onClick={() => onCancel(order._id)}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </Can>
        </div>
      </div>
    </div>
  );
};

const PurchaseOrdersManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { orders = [], loading, error, success, message } = useSelector(
    (state) => state.purchaseOrders || {}
  );
  const suppliers = useSelector((state) => state.suppliers.suppliers || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  useEffect(() => {
    dispatch(fetchPurchaseOrders());
  }, [dispatch]);

  useEffect(() => {
    if (success && message) {
      dispatch(showNotification({ message, status: 1 }));
      dispatch(clearSuccess());
      dispatch(fetchPurchaseOrders());
    }
    if (error) {
      dispatch(
        showNotification({ message: error.message || error, status: 0 })
      );
      dispatch(clearError());
    }
  }, [success, message, error, dispatch]);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.supplier?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      const matchesSupplier = supplierFilter
        ? order.supplier?._id === supplierFilter
        : true;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [orders, searchQuery, statusFilter, supplierFilter]);

  const handleView = (order) => {
    navigate(`/app/purchase-orders/${order._id}`);
  };

  const handleApprove = async (id) => {
    if (
      window.confirm("Are you sure you want to approve this purchase order?")
    ) {
      try {
        await dispatch(approvePurchaseOrder(id)).unwrap();
      } catch (err) {
        // Error handled in useEffect
      }
    }
  };

  const handleReceive = (order) => {
    dispatch(
      openModal({
        title: "Receive Purchase Order",
        bodyType: MODAL_BODY_TYPES.RECEIVE_PURCHASE_ORDER,
        extraObject: order,
        size: "lg",
      })
    );
  };

  const handleCancel = async (id) => {
    const reason = window.prompt("Please provide a reason for cancellation:");
    if (reason) {
      try {
        await dispatch(cancelPurchaseOrder({ id, reason })).unwrap();
      } catch (err) {
        // Error handled in useEffect
      }
    }
  };

  if (loading) return <SuspenseContent />;

  if (!can("viewPurchaseOrders")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to view purchase orders.
              </p>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  return (
    <TitleCard
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <span>Purchase Orders</span>
          <span className="badge badge-primary">{filteredOrders.length}</span>
        </div>
      }
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        suppliers={suppliers}
      />

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <FileText className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No purchase orders found
          </h3>
          <p className="text-base-content/70 max-w-md mx-auto">
            {searchQuery || statusFilter || supplierFilter
              ? "Try adjusting your filters"
              : "Create your first purchase order to get started"}
          </p>
          <Can do="createPurchaseOrders">
            <button
              onClick={() => navigate("/app/purchase-orders/new")}
              className="btn btn-primary mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Purchase Order
            </button>
          </Can>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <PurchaseOrderCard
              key={order._id}
              order={order}
              onView={handleView}
              onApprove={handleApprove}
              onReceive={handleReceive}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </TitleCard>
  );
};

export default PurchaseOrdersManagement;
