// Updated Dashboard.js with real data integration
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { addNotification } from "../common/rightDrawerSlice"; // For adding notifications to the notifications list
import { updateNotificationsCount } from "../common/headerSlice"; // For updating the notifications count
import { fetchDashboardData } from "./dashboardSlice";
import { getToken, isTokenExpired } from "../../utils/helpers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import ShoppingCartIcon from "@heroicons/react/24/outline/ShoppingCartIcon";
import ExclamationCircleIcon from "@heroicons/react/24/outline/ExclamationCircleIcon";
import ClockIcon from "@heroicons/react/24/outline/ClockIcon";
import ArrowTrendingUpIcon from "@heroicons/react/24/outline/ArrowTrendingUpIcon";
import BuildingOfficeIcon from "@heroicons/react/24/outline/BuildingOfficeIcon";
import TagIcon from "@heroicons/react/24/outline/TagIcon";
import BanknotesIcon from "@heroicons/react/24/outline/BanknotesIcon";
import TruckIcon from "@heroicons/react/24/outline/TruckIcon";
import { Link, useNavigate } from "react-router-dom";
import { checkRole } from "../../utils/helpers";
import StatCard from "./components/StatCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const { notifications } = useSelector((state) => state.rightDrawer);

  useEffect(() => {
    if (stats?.expiringProducts?.length) {
      dispatch(
        addNotification({
          message: ` ${stats?.expiringProducts?.length} Product(s) expiring soon`,
          status: 0, // Success status
        })
      );
      dispatch(updateNotificationsCount(notifications?.length)); // Update the notifications count
    }
  }, [stats, dispatch]);

  useEffect(() => {
    if (isTokenExpired(getToken())) {
      dispatch(
        openModal({
          title: "Session Expired",
          bodyType: MODAL_BODY_TYPES.SESSION_EXPIRED,
          extraObject: {},
        })
      );
    } else {
      dispatch(fetchDashboardData());
    }
  }, [dispatch]);

  // Calculate trends (simplified - you might want to implement more sophisticated trend calculation)
  const calculateTrend = (current, previous) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="alert alert-error">{error}</div>;
  return (
    <div className="p-4 max-w-[1920px] mx-auto">
      {/* Alert Banner */}
      {stats?.lowStockProducts?.length || stats?.expiringProducts?.length ? (
        <div className="alert alert-warning mb-6">
          <ExclamationCircleIcon className="w-6 h-6" />
          <span>
            {stats?.lowStockProducts?.length > 1 &&
              stats?.lowStockProducts?.length +
                " products below minimum stock threshold - "}
            {stats?.lowStockProducts?.length === 1 &&
              " 1 product below minimum stock threshold - "}
            {stats?.expiringProducts?.length > 1 &&
              stats?.expiringProducts?.length + " products expiring soon"}
            {stats?.expiringProducts?.length === 1 &&
              " 1 product expiring soon"}
          </span>{" "}
          <a href={"#expiring-products"} className="btn btn-sm">
            View Details
          </a>
        </div>
      ) : (
        ""
      )}

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 center justify-center">
        <StatCard
          title="Total Inventory Value"
          value={`₦ ${stats?.totalInventoryValue.toLocaleString({
            maximumSignificantDigits: 3,
          })}`}
          icon={ChartBarIcon}
          trend={true}
          trendValue={12} // You might want to calculate this based on historical data
          description="Based on current stock levels"
        />
        <StatCard
          title="Products Sold Today"
          value={stats?.todaysSales ? stats?.todaysSales?.length : 0}
          icon={ShoppingCartIcon}
          trend={true}
          trendValue={-5} // Calculate based on historical data
          description="Number of Prducts sold today"
        />
        <StatCard
          title="Total Sales Today"
          value={
            stats?.todaysSales
              ? `₦ ${stats?.todaysSales
                  .reduce((acc, sale) => acc + sale.totalAmount, 0)
                  .toLocaleString()}`
              : 0
          }
          icon={BanknotesIcon}
          trend={true}
          trendValue={-5} // Calculate based on historical data
          description="Total sales amount today"
        />
        <StatCard
          title="Total Products"
          value={stats?.productCount}
          icon={TagIcon}
          description="Across all categories"
        />
        <StatCard
          title="Items Near Expiry"
          value={stats?.itemsNearExpiry}
          icon={ClockIcon}
          description="Expiring within 90 days"
        />
      </div>

      {/* Main Content Grid */}

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Quick Actions</h2>
          <div className="grid grid-cols-2  gap-4">
            <button
              className="btn btn-primary"
              onClick={() =>
                dispatch(
                  openModal({
                    title: "New Order",
                    bodyType: MODAL_BODY_TYPES.ADD_ORDER,
                    extraObject: {},
                    size: "xl",
                  })
                )
              }
            >
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              New Order
            </button>

            {/* only admin and manager */}
            {(checkRole("admin") || checkRole("manager")) && (
              <button
                className="btn btn-accent"
                onClick={() =>
                  dispatch(
                    openModal({
                      title: "Add Product",
                      bodyType: MODAL_BODY_TYPES.ADD_NEW_PRODUCT,
                      extraObject: {},
                      size: "xl",
                    })
                  )
                }
              >
                <TagIcon className="w-5 h-5 mr-2" />
                Add Product
              </button>
            )}

            <button
              className="btn btn-info"
              onClick={() => navigate("/app/products")}
            >
              <BuildingOfficeIcon className="w-5 h-5 mr-2" />
              Products
            </button>

            <button
              className="btn btn-warning"
              onClick={() => navigate("/app/orders")}
            >
              <BuildingOfficeIcon className="w-5 h-5 mr-2" />
              View Orders
            </button>

            {/* only admin and manager */}
            {(checkRole("admin") || checkRole("manager")) && (
              <button
                className="btn btn-error"
                onClick={() => navigate("/app/suppliers")}
              >
                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                Suppliers
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="stats stats-vertical shadow mt-4">
            <div className="stat">
              <div className="stat-title">Total Products</div>
              <div className="stat-value">{stats?.productCount}</div>
              <div className="stat-desc">Across all categories</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Categories</div>
              <div className="stat-value">{stats?.categoryCount}</div>
              <div className="stat-desc">Active categories</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Sales Trend */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Sales & Orders Trend</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats?.monthlyOrders?.map((order) => ({
                    month: new Date(0, order._id.month - 1).toLocaleString(
                      "default",
                      { month: "short" }
                    ),
                    sales: order.totalSales,
                    orders: order.orderCount,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#570DF8"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#36D399"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Expiring Products */}
        <div className="card bg-base-100 shadow-xl" id="expiring-products">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Products Expiring Soon
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.expiringProducts?.map((item, index) => {
                    const daysLeft = Math.ceil(
                      (new Date(item.expiringBatches[0].expiryDate) -
                        new Date()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.totalExpiringQuantity} units</td>
                        {console.log(
                          new Date(
                            item.expiringBatches[0].expiryDate
                          ).toLocaleDateString()
                        )}
                        <td>
                          {new Date(
                            item.expiringBatches[0].expiryDate
                          ).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              daysLeft <= 7
                                ? "badge-error"
                                : daysLeft <= 14
                                ? "badge-warning"
                                : "badge-success"
                            }`}
                          >
                            {daysLeft} days left
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <ExclamationCircleIcon className="w-5 h-5 text-error" />
              Low Stock Alerts
            </h2>
            <div className="space-y-4">
              {stats?.lowStockProducts?.map((item, index) => (
                <div
                  key={index}
                  className="bg-error bg-opacity-10 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm opacity-70">
                        Current Stock: {item.totalStock}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Activity</h2>
            <div className="space-y-4">
              {stats?.recentActivity?.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-base-300 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Order {activity._id}</p>
                    <p className="text-sm opacity-70">
                      {activity.customerDetails.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₦{activity.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-sm opacity-70">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
