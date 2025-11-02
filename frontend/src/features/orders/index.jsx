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
import SuspenseContent from "../../containers/SuspenseContent";
import { checkRole } from "../../utils/helpers";
import SearchBar from "../../components/Input/SearchBar";
import { showNotification } from "../common/headerSlice";
import Badge from "./components/Badge";
import Datepicker from "react-tailwindcss-datepicker";
import {
  ArrowPathIcon,
  FunnelIcon,
  EyeIcon,
  XCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserCircleIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

const statusColors = {
  new: "badge-info",
  preparing: "badge-warning",
  ready: "badge-success",
  served: "badge-primary",
  completed: "badge-neutral",
  cancelled: "badge-error",
};

const paymentColors = {
  pending: "text-error",
  partial: "text-warning",
  paid: "text-success",
};

const OrderFilters = ({ currentFilters, applyFilters, clearFilters }) => {
  const statusOptions = [
    "new",
    "preparing",
    "ready",
    "served",
    "completed",
    "cancelled",
  ];
  const paymentStatusOptions = ["pending", "partial", "paid"];

  const [dateRange, setDateRange] = useState({
    startDate: currentFilters.startDate || null,
    endDate: currentFilters.endDate || null,
  });

  const handleDateChange = (newValue) => {
    setDateRange(newValue);
    applyFilters({
      startDate: newValue.startDate,
      endDate: newValue.endDate,
    });
  };

  return (
    <div className="bg-base-200 p-4 rounded-lg mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h3 className="font-medium text-base-content/80 flex items-center">
          <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
          Filters
        </h3>
        <button onClick={clearFilters} className="btn btn-xs btn-ghost">
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          <div className="dropdown dropdown-hover">
            <label tabIndex={0} className="btn btn-sm btn-outline min-w-36">
              <FunnelIcon className="w-4 h-4 mr-2" />
              {currentFilters.status || "All"}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {statusOptions.map((status) => (
                <li key={status}>
                  <a
                    onClick={() => applyFilters({ status })}
                    className={currentFilters.status === status ? "active" : ""}
                  >
                    {status}
                  </a>
                </li>
              ))}
              <li>
                <a onClick={() => applyFilters({ status: "" })}>All</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Payment</span>
          </label>
          <div className="dropdown dropdown-hover">
            <label tabIndex={0} className="btn btn-sm btn-outline min-w-36">
              <CurrencyDollarIcon className="w-4 h-4 mr-2" />
              {currentFilters.paymentStatus || "All"}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {paymentStatusOptions.map((status) => (
                <li key={status}>
                  <a
                    onClick={() => applyFilters({ paymentStatus: status })}
                    className={
                      currentFilters.paymentStatus === status ? "active" : ""
                    }
                  >
                    {status}
                  </a>
                </li>
              ))}
              <li>
                <a onClick={() => applyFilters({ paymentStatus: "" })}>All</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="form-control min-w-64">
          <label className="label">
            <span className="label-text">Date Range</span>
          </label>
          <Datepicker
            value={dateRange}
            onChange={handleDateChange}
            showShortcuts={true}
            primaryColor="hsl(var(--p))"
            inputClassName="input input-sm input-bordered w-full"
            containerClassName="relative"
          />
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order }) => {
  const dispatch = useDispatch();
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "₦";

  // Format date for better readability
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 border border-base-200">
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">#{order.orderNumber}</h3>
              <Badge className={statusColors[order.orderStatus]}>
                {order.orderStatus}
              </Badge>
            </div>
            <p className="text-sm flex items-center gap-1 text-base-content/70 mt-1">
              <UserCircleIcon className="w-4 h-4" />
              {order.customerDetails?.name || "Walk-in Customer"}
            </p>
          </div>
          <div
            className={`badge ${paymentColors[order.paymentStatus]} gap-1 p-3`}
          >
            <CurrencyDollarIcon className="w-4 h-4" />
            {order.paymentStatus}
          </div>
        </div>

        <div className="divider my-1"></div>

        <div className="mb-3">
          <div className="flex justify-between items-center">
            <span className="text-base-content/70 text-sm">Total Amount</span>
            <span className="font-semibold text-base">
              {currency}
              {order.totalAmount?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-base-content/70 text-sm flex items-center gap-1">
              <ClockIcon className="w-4 h-4" /> Created
            </span>
            <span className="text-sm">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="card-actions justify-end mt-2">
          <button
            className="btn btn-sm btn-outline btn-primary"
            onClick={() =>
              dispatch(
                openModal({
                  title: `Order #${order.orderNumber}`,
                  bodyType: MODAL_BODY_TYPES.ORDER_DETAILS,
                  extraObject: order,
                })
              )
            }
          >
            <EyeIcon className="w-4 h-4 mr-1" /> View Details
          </button>

          {order.orderStatus !== "cancelled" &&
            order.orderStatus !== "completed" && (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm">
                  Actions
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10"
                >
                  {order.orderStatus !== "ready" && (
                    <li>
                      <a
                        onClick={() =>
                          dispatch(
                            updateOrderStatus({
                              id: order._id,
                              orderStatus: "ready",
                            })
                          )
                        }
                      >
                        Mark as Ready
                      </a>
                    </li>
                  )}
                  {order.orderStatus !== "served" && (
                    <li>
                      <a
                        onClick={() =>
                          dispatch(
                            updateOrderStatus({
                              id: order._id,
                              orderStatus: "served",
                            })
                          )
                        }
                      >
                        Mark as Served
                      </a>
                    </li>
                  )}
                  <li>
                    <a
                      onClick={() =>
                        dispatch(
                          openModal({
                            title: "Update Payment",
                            bodyType: MODAL_BODY_TYPES.UPDATE_PAYMENT,
                            extraObject: order,
                          })
                        )
                      }
                    >
                      Update Payment
                    </a>
                  </li>
                  <li className="text-error">
                    <a
                      onClick={() =>
                        dispatch(
                          cancelOrder({
                            id: order._id,
                            reason: "Customer request",
                          })
                        )
                      }
                    >
                      Cancel Order
                    </a>
                  </li>
                </ul>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, filters } = useSelector(
    (state) => state.orders
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    dispatch(fetchOrders(filters));
    console.log(orders);
  }, [dispatch, filters]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.includes(searchQuery) ||
      order.customerDetails?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      !filters.status || order.orderStatus === filters.status;
    const matchesPayment =
      !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;
    const matchesDate =
      (!filters.startDate ||
        new Date(order.createdAt) >= new Date(filters.startDate)) &&
      (!filters.endDate ||
        new Date(order.createdAt) <= new Date(filters.endDate));

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  if (loading) return <SuspenseContent />;

  return (
    <TitleCard title="Orders Management" topMargin="mt-2">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
        <SearchBar
          searchText={searchQuery}
          setSearchText={setSearchQuery}
          placeholderText="Search by order # or customer..."
          styleClass="w-full lg:w-96"
        />

        <div className="flex items-center gap-2">
          <div className="join">
            <button
              className={`join-item btn btn-sm ${
                viewMode === "grid" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
            <button
              className={`join-item btn btn-sm ${
                viewMode === "list" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
          </div>
          <button
            onClick={() => dispatch(fetchOrders(filters))}
            className="btn btn-sm btn-circle"
            title="Refresh"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <OrderFilters
        currentFilters={filters}
        applyFilters={(newFilters) => dispatch(setFilters(newFilters))}
        clearFilters={() => dispatch(clearFilters())}
      />

      {error ? (
        <div className="alert alert-error">
          <XCircleIcon className="w-6 h-6" />
          <span>{error}</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold">No orders found</h3>
          <p className="text-base-content/70 max-w-md mx-auto mt-2">
            Try adjusting your filters or search terms to find what you're
            looking for
          </p>
          <button
            className="btn btn-outline btn-sm mt-4"
            onClick={() => dispatch(clearFilters())}
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Time</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover">
                  <td className="font-medium">#{order.orderNumber}</td>
                  <td>{order.customerDetails?.name || "Walk-in"}</td>
                  <td>
                    <Badge className={statusColors[order.orderStatus]}>
                      {order.orderStatus}
                    </Badge>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        paymentColors[order.paymentStatus]
                      } gap-1`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="font-medium">
                    ₦{order.totalAmount?.toLocaleString()}
                  </td>
                  <td className="text-sm">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() =>
                          dispatch(
                            openModal({
                              title: `Order #${order.orderNumber}`,
                              bodyType: MODAL_BODY_TYPES.ORDER_DETAILS,
                              extraObject: order,
                            })
                          )
                        }
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      {order.orderStatus !== "cancelled" &&
                        order.orderStatus !== "completed" && (
                          <div className="dropdown dropdown-end">
                            <label
                              tabIndex={0}
                              className="btn btn-ghost btn-sm btn-square"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                                />
                              </svg>
                            </label>
                            <ul
                              tabIndex={0}
                              className="dropdown-content z-10 menu menu-sm p-2 shadow bg-base-100 rounded-box w-48"
                            >
                              {order.orderStatus !== "ready" && (
                                <li>
                                  <a
                                    onClick={() =>
                                      dispatch(
                                        updateOrderStatus({
                                          id: order._id,
                                          orderStatus: "ready",
                                        })
                                      )
                                    }
                                  >
                                    Mark as Ready
                                  </a>
                                </li>
                              )}
                              {order.orderStatus !== "served" && (
                                <li>
                                  <a
                                    onClick={() =>
                                      dispatch(
                                        updateOrderStatus({
                                          id: order._id,
                                          orderStatus: "served",
                                        })
                                      )
                                    }
                                  >
                                    Mark as Served
                                  </a>
                                </li>
                              )}
                              <li>
                                <a
                                  onClick={() =>
                                    dispatch(
                                      openModal({
                                        title: "Update Payment",
                                        bodyType:
                                          MODAL_BODY_TYPES.UPDATE_PAYMENT,
                                        extraObject: order,
                                      })
                                    )
                                  }
                                >
                                  Update Payment
                                </a>
                              </li>
                              <li>
                                <a
                                  className="text-error"
                                  onClick={() =>
                                    dispatch(
                                      cancelOrder({
                                        id: order._id,
                                        reason: "Customer request",
                                      })
                                    )
                                  }
                                >
                                  Cancel Order
                                </a>
                              </li>
                            </ul>
                          </div>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TitleCard>
  );
};

export default Orders;
