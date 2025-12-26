// frontend/src/features/orders/index.jsx
import React, { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  updateOrderStatus,
  cancelOrder,
  setFilters,
  clearFilters,
} from "./ordersSlice";
import { fetchSettings } from "../settings/generalSettings/generalSettingsSlice";
import SuspenseContent from "../../containers/SuspenseContent";
import SearchBar from "../../components/Input/SearchBar";
import SearchableSelect from "../../components/Input/SearchableSelect";
import { showNotification } from "../common/headerSlice";
import Datepicker from "react-tailwindcss-datepicker";
import {
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  AlertCircle,
  Eye,
  XCircle,
  FileText,
  DollarSign,
  Clock,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/permission";
import Can from "../../components/Auth/Can";

const statusColors = {
  pending: "badge-info",
  preparing: "badge-warning",
  ready: "badge-success",
  served: "badge-primary",
  completed: "badge-neutral",
  cancelled: "badge-error",
};

const paymentColors = {
  pending: "badge-error",
  partial: "badge-warning",
  paid: "badge-success",
};

const OrderFilters = ({ currentFilters, applyFilters, clearFiltersAction }) => {
  const statusOptions = [
    { value: "", name: "All" },
    { value: "pending", name: "pending" },
    { value: "preparing", name: "preparing" },
    { value: "ready", name: "ready" },
    { value: "served", name: "served" },
    { value: "completed", name: "completed" },
    { value: "cancelled", name: "cancelled" },
  ];
  const paymentStatusOptions = [
    { value: "", name: "All" },
    { value: "pending", name: "pending" },
    { value: "partial", name: "partial" },
    { value: "paid", name: "paid" },
  ];

  const [dateRange, setDateRange] = useState({
    startDate: currentFilters.startDate || null,
    endDate: currentFilters.endDate || null,
  });

  const handleDateChange = (newValue) => {
    setDateRange(newValue);
    applyFilters({ startDate: newValue.startDate, endDate: newValue.endDate });
  };

  return (
    <div className="bg-base-200 p-4 rounded-lg mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h3 className="font-medium text-base-content/80 flex items-center">
          <SlidersHorizontal className="w-5 h-5 mr-2" />
          Filters
        </h3>
        <button onClick={clearFiltersAction} className="btn btn-xs btn-ghost">
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs">Status</span>
          </label>
          <SearchableSelect
            options={statusOptions}
            value={currentFilters.status || ""}
            onChange={(e) => applyFilters({ status: e.target.value })}
            name="status"
            placeholder="Filter by status"
            className=""
            size="select-sm"
            valueKey="value"
            labelKey="name"
          />
        </div>

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs">Payment</span>
          </label>
          <SearchableSelect
            options={paymentStatusOptions}
            value={currentFilters.paymentStatus || ""}
            onChange={(e) => applyFilters({ paymentStatus: e.target.value })}
            name="paymentStatus"
            placeholder="Filter by payment"
            className=""
            size="select-sm"
            valueKey="value"
            labelKey="name"
          />
        </div>

        <div className="form-control min-w-[200px]">
          <label className="label py-1">
            <span className="label-text text-xs">Date Range</span>
          </label>
          <Datepicker
            value={dateRange}
            onChange={handleDateChange}
            showShortcuts={true}
            inputClassName="input input-sm input-bordered w-full"
          />
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({
  order,
  currency,
  onViewDetails,
  onUpdatePayment,
  onModify,
  onVoid,
  onCancel,
}) => {
  const { can } = useAuth();
  const canModify = !["completed", "cancelled"].includes(order.orderStatus);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateString));
  };

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold">#{order.orderNumber}</h3>
              <span
                className={`badge badge-sm ${statusColors[order.orderStatus]}`}
              >
                {order.orderStatus}
              </span>
              {order.isModified && (
                <span className="badge badge-sm badge-outline badge-info">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Modified
                </span>
              )}
              {order.hasVoidedItems && (
                <span className="badge badge-sm badge-outline badge-warning">
                  Voided
                </span>
              )}
            </div>
            <p className="text-xs flex items-center gap-1 text-base-content/70 mt-1">
              <User className="w-3 h-3" />
              {order.customerDetails?.name || "Walk-in"}
            </p>
          </div>
          <span className={`badge ${paymentColors[order.paymentStatus]}`}>
            {order.paymentStatus}
          </span>
        </div>

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-base-content/70">Total</span>
            <span className="font-semibold">
              {currency}
              {order.totalAmount?.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-base-content/50">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(order.createdAt)}
            </span>
            <span className="capitalize">{order.orderType}</span>
          </div>
        </div>

        <div className="card-actions justify-end mt-3 flex-wrap gap-1">
          <button
            className="btn btn-xs btn-outline"
            onClick={() => onViewDetails(order)}
          >
            <Eye className="w-3 h-3" />
          </button>
          {canModify && (
            <>
              <Can do="editOrders">
                <button
                  className="btn btn-xs btn-outline btn-info"
                  onClick={() => onModify(order)}
                  title="Modify"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  className="btn btn-xs btn-outline btn-warning"
                  onClick={() => onVoid(order)}
                  title="Void Items"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => onUpdatePayment(order)}
                  title="Update Payment"
                >
                  <DollarSign className="w-3 h-3" />
                </button>
              </Can>
              <Can do="cancelOrders">
                <button
                  className="btn btn-xs btn-outline btn-error"
                  onClick={() => onCancel(order)}
                  title="Cancel"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </Can>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TopSideButtons = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap gap-2">
      <Can do="createOrders">
        <button
          onClick={() => navigate("/app/pos")}
          className="btn btn-primary btn-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Order</span>
        </button>
      </Can>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-ghost btn-sm gap-2"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
};

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useAuth();

  const { orders, loading, error, filters } = useSelector(
    (state) => state.orders
  );
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!settings) dispatch(fetchSettings());
    if (can("viewOrders")) dispatch(fetchOrders(filters));
  }, [dispatch, filters]);

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber?.includes(searchQuery) ||
      order.customerDetails?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (order) => {
    dispatch(
      openModal({
        title: `Order #${order.orderNumber}`,
        bodyType: MODAL_BODY_TYPES.ORDER_DETAILS,
        extraObject: order,
        size: "lg",
      })
    );
  };

  const handleModify = (order) => {
    dispatch(
      openModal({
        title: `Modify Order #${order.orderNumber}`,
        bodyType: MODAL_BODY_TYPES.MODIFY_ORDER,
        extraObject: order,
        size: "lg",
      })
    );
  };

  const handleVoid = (order) => {
    dispatch(
      openModal({
        title: `Void Items - Order #${order.orderNumber}`,
        bodyType: MODAL_BODY_TYPES.VOID_ORDER_ITEMS,
        extraObject: order,
        size: "lg",
      })
    );
  };

  const handleUpdatePayment = (order) => {
    dispatch(
      openModal({
        title: "Update Payment",
        bodyType: MODAL_BODY_TYPES.UPDATE_PAYMENT,
        extraObject: order,
      })
    );
  };

  const handleCancelOrder = (order) => {
    dispatch(
      openModal({
        title: "Cancel Order",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to cancel order #${order.orderNumber}?`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.CANCEL_ORDER,
          id: order._id,
        },
      })
    );
  };

  if (loading) return <SuspenseContent />;

  if (!can("viewOrders")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">You do not have permission to view orders.</p>
              <button
                onClick={() => navigate("/app/dashboard")}
                className="btn btn-primary"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  return (
    <TitleCard
      title="Orders Management"
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
        <SearchBar
          searchText={searchQuery}
          setSearchText={setSearchQuery}
          placeholderText="Search by order # or customer..."
          styleClass="w-full lg:w-96"
        />
        <button
          onClick={() => dispatch(fetchOrders(filters))}
          className="btn btn-sm btn-circle"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <OrderFilters
        currentFilters={filters}
        applyFilters={(newFilters) => dispatch(setFilters(newFilters))}
        clearFiltersAction={() => dispatch(clearFilters())}
      />

      {error ? (
        <div className="alert alert-error mb-6">
          <XCircle className="w-6 h-6" />
          <span>
            {typeof error === "object"
              ? error.message || "An error occurred"
              : error}
          </span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <FileText className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold">No orders found</h3>
          <p className="text-base-content/70 mt-2">
            Try adjusting your filters
          </p>
          <button
            className="btn btn-outline btn-sm mt-4"
            onClick={() => dispatch(clearFilters())}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              currency={currency}
              onViewDetails={handleViewDetails}
              onUpdatePayment={handleUpdatePayment}
              onModify={handleModify}
              onVoid={handleVoid}
              onCancel={handleCancelOrder}
            />
          ))}
        </div>
      )}
    </TitleCard>
  );
};

export default Orders;
