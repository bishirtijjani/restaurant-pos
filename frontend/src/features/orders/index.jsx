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
  MoreVertical,
  CreditCard,
  ChefHat,
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

      <div className="flex gap-4">
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
            className="w-full md:w-40"
            size="!h-10"
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
            className="w-full md:w-40"
            size="!h-10"
            valueKey="value"
            labelKey="name"
          />
        </div>

        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-xs">Date Range</span>
          </label>
          <div className="h-10">
            <Datepicker
              value={dateRange}
              onChange={handleDateChange}
              showShortcuts={true}
              inputClassName="input input-bordered w-full !h-10"
            />
          </div>
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
        {/* Header - Order # */}
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-base-200">
          <h3 className="font-bold text-xl">#{order.orderNumber}</h3>
          <span className="font-bold text-lg text-primary">
            {currency}
            {order.totalAmount?.toFixed(2)}
          </span>
        </div>

        {/* Info Table */}
        <div className="overflow-x-auto mb-4">
          <table className="table w-full">
            <tbody>
              <tr>
                <td className="font-semibold text-base-content/70 pl-0 py-1">
                  Customer
                </td>
                <td className="text-right pr-0 py-1 flex items-center justify-end gap-1">
                  <User className="w-4 h-4" />
                  {order.customerDetails?.name || "Walk-in"}
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-base-content/70 pl-0 py-1">
                  Date
                </td>
                <td className="text-right pr-0 py-1 flex items-center justify-end gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(order.createdAt)}
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-base-content/70 pl-0 py-1">
                  Type
                </td>
                <td className="text-right pr-0 py-1 capitalize font-medium">
                  {order.orderType}
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-base-content/70 pl-0 py-1 align-middle">
                  Status
                </td>
                <td className="text-right pr-0 py-1">
                  <span
                    className={`badge badge-sm gap-1 ${
                      statusColors[order.orderStatus]
                    }`}
                  >
                    <ChefHat className="w-4 h-4" />
                    {order.orderStatus}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-base-content/70 pl-0 py-1 align-middle">
                  Payment
                </td>
                <td className="text-right pr-0 py-1">
                  <div
                    className={`badge badge-sm gap-1 ${
                      paymentColors[order.paymentStatus]
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    {order.paymentStatus}
                  </div>
                </td>
              </tr>
              {(order.isModified || order.hasVoidedItems) && (
                <tr>
                  <td className="font-semibold text-base-content/70 pl-0 py-1 align-middle">
                    Flags
                  </td>
                  <td className="text-right pr-0 py-1 flex justify-end gap-1">
                    {order.isModified && (
                      <span className="badge badge-sm badge-outline badge-info">
                        Modified
                      </span>
                    )}
                    {order.hasVoidedItems && (
                      <span className="badge badge-sm badge-outline badge-warning">
                        Voided
                      </span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="card-actions justify-end gap-2 mt-auto pt-2 border-t border-base-200">
          <button
            className="btn btn-sm btn-outline gap-2"
            onClick={() => onViewDetails(order)}
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          {canModify && (
            <div className="dropdown dropdown-top dropdown-end">
              <label
                tabIndex={0}
                className="btn btn-sm btn-primary gap-2 text-white"
              >
                Actions
                <MoreVertical className="w-4 h-4" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200 mb-1"
              >
                <Can do="editOrders">
                  <li>
                    <a onClick={() => onModify(order)}>
                      <Edit3 className="w-4 h-4" /> Modify Order
                    </a>
                  </li>
                  <li>
                    <a onClick={() => onUpdatePayment(order)}>
                      <DollarSign className="w-4 h-4" /> Update Payment
                    </a>
                  </li>
                  <li>
                    <a onClick={() => onVoid(order)}>
                      <Trash2 className="w-4 h-4" /> Void Items
                    </a>
                  </li>
                </Can>
                <Can do="cancelOrders">
                  <div className="divider my-1"></div>
                  <li>
                    <a
                      onClick={() => onCancel(order)}
                      className="text-error hover:bg-error/10"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Order
                    </a>
                  </li>
                </Can>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TopSideButtons = ({ onRefresh }) => {
  const navigate = useNavigate();
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
        <Can do="createOrders">
          <button
            onClick={() => navigate("/app/pos")}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
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
          <Can do="createOrders">
            <li>
              <button
                onClick={() => navigate("/app/pos")}
                className="text-primary font-medium"
              >
                <Plus className="w-4 h-4" /> New Order
              </button>
            </li>
          </Can>
        </ul>
      </div>
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
      TopSideButtons={
        <TopSideButtons onRefresh={() => dispatch(fetchOrders(filters))} />
      }
      topMargin="mt-2"
    >
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
        <SearchBar
          searchText={searchQuery}
          setSearchText={setSearchQuery}
          placeholderText="Search by order # or customer..."
          styleClass="flex-1 lg:flex-none w-full"
          inputStyleClass="!h-10"
        />
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
