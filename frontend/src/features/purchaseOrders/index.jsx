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
  Plus,
  RefreshCw,
  Eye,
  Check,
  X,
  Clock,
  FileText,
  Truck,
  Calendar,
  MoreVertical,
} from "lucide-react";
import SearchBar from "../../components/Input/SearchBar";
import SearchableSelect from "../../components/Input/SearchableSelect";

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

const TopSideButtons = ({ onRefresh }) => {
  const navigate = useNavigate();
  const { can } = useAuth();

  const openNewPO = () => {
    navigate("/app/purchase-orders/new");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="btn btn-ghost btn-sm btn-circle"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <Can do="createPurchaseOrders">
          <button onClick={openNewPO} className="btn btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" />
            <span>New PO</span>
          </button>
        </Can>
      </div>

      {/* Mobile View - Single Dropdown */}
      <div className="sm:hidden dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
          <MoreVertical className="w-5 h-5" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52 mt-2 z-[1000] border border-base-200"
        >
          <li>
            <button onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" /> Refresh Data
            </button>
          </li>
          <div className="divider my-1"></div>
          <Can do="createPurchaseOrders">
            <li>
              <button onClick={openNewPO} className="text-primary font-medium">
                <Plus className="w-4 h-4" /> New PO
              </button>
            </li>
          </Can>
        </ul>
      </div>
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
  const statusOptions = [
    { value: "", name: "All Status" },
    { value: "draft", name: "Draft" },
    { value: "pending", name: "Pending" },
    { value: "approved", name: "Approved" },
    { value: "received", name: "Received" },
    { value: "cancelled", name: "Cancelled" },
  ];

  const supplierOptions = [
    { value: "", name: "All Suppliers" },
    ...suppliers.map((s) => ({ value: s._id, name: s.name })),
  ];

  return (
    <div className="bg-base-100 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            searchText={searchQuery}
            setSearchText={setSearchQuery}
            placeholderText="Search by PO number, supplier, or invoice..."
            styleClass="w-full"
            inputStyleClass="!h-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-row">
          <SearchableSelect
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            name="statusFilter"
            placeholder="All Status"
            className="w-full lg:w-48"
            size="!h-10"
            valueKey="value"
            labelKey="name"
          />

          <SearchableSelect
            options={supplierOptions}
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            name="supplierFilter"
            placeholder="All Suppliers"
            className="w-full lg:w-56"
            size="!h-10"
            valueKey="value"
            labelKey="name"
          />
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
  const {
    orders = [],
    loading,
    error,
    success,
    message,
  } = useSelector((state) => state.purchaseOrders || {});
  const suppliers = useSelector((state) => state.suppliers.suppliers || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  useEffect(() => {
    dispatch(
      fetchPurchaseOrders({
        status: statusFilter,
        supplier: supplierFilter,
      })
    );
  }, [dispatch, statusFilter, supplierFilter]);

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
      // Server handles status and supplier filtering
      // We only handle client-side text search
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.supplier?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [orders, searchQuery]);

  const handleView = (order) => {
    navigate(`/app/purchase-orders/${order._id}`);
  };

  const handleApprove = (id) => {
    dispatch(
      openModal({
        title: "Approve Purchase Order",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: "Are you sure you want to approve this purchase order?",
          type: MODAL_BODY_TYPES.CONFIRMATION,
          _id: id,
          title: "Approve Purchase Order",
          action: async () => {
            try {
              await dispatch(approvePurchaseOrder(id)).unwrap();
              dispatch(
                showNotification({
                  message: "Purchase order approved successfully",
                  status: 1,
                })
              );
            } catch (err) {
              dispatch(
                showNotification({
                  message: err.message || "Failed to approve order",
                  status: 0,
                })
              );
            }
          },
        },
      })
    );
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

  const handleCancel = (id) => {
    dispatch(
      openModal({
        title: "Cancel Purchase Order",
        bodyType: MODAL_BODY_TYPES.INPUT,
        extraObject: {
          title: "Cancellation Reason",
          message: "Please provide a reason for cancellation:",
          inputType: "text",
          placeholder: "Reason...",
          confirmAction: async (reason) => {
            try {
              await dispatch(cancelPurchaseOrder({ id, reason })).unwrap();
              dispatch(
                showNotification({
                  message: "Purchase order cancelled successfully",
                  status: 1,
                })
              );
            } catch (err) {
              dispatch(
                showNotification({
                  message: err.message || "Failed to cancel order",
                  status: 0,
                })
              );
            }
          },
        },
      })
    );
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

  const handleRefresh = () => {
    dispatch(
      fetchPurchaseOrders({
        status: statusFilter,
        supplier: supplierFilter,
      })
    );
  };

  return (
    <TitleCard
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <span>Purchase Orders</span>
          <span className="badge badge-primary">{filteredOrders.length}</span>
        </div>
      }
      TopSideButtons={<TopSideButtons onRefresh={handleRefresh} />}
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
