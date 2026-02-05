import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "./dashboardSlice";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Percent } from "lucide-react";

// Components
import StatCard from "./components/StatCard";
import LiveStatusHeader from "./components/LiveStatusHeader";
import OperationsAlerts from "./components/OperationsAlerts";
import QuickActionToolbar from "./components/QuickActionToolbar";
import DashboardRecentOrders from "./components/DashboardRecentOrders";
import HourlyTrendChart from "../analytics/dashboards/Overview/components/HourlyTrendChart";
import FirstOrderWidget from "./components/FirstOrderWidget";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const { kpis, opsStats, trends, recentActivity, alerts } = stats;

  useEffect(() => {
    dispatch(fetchDashboardData());

    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      dispatch(fetchDashboardData());
    }, 120000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading && !kpis.todayRevenue) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg mx-4 mt-4">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error loading command center: {error}</span>
        </div>
        <div className="flex-none">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => dispatch(fetchDashboardData())}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Proxy for "New User/Empty State": No revenue today, no active orders, no recent history
  const isNewStore =
    !loading &&
    kpis.todayRevenue === 0 &&
    kpis.activeOrders === 0 &&
    recentActivity.length === 0;

  return (
    <div className="min-h-screen pb-20">
      <LiveStatusHeader />

      {isNewStore && <FirstOrderWidget />}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Net Sales (Today)"
          value={`$${(kpis.todayRevenue || 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          description="Gross revenue excluding cancellations"
          color="primary"
        />
        <StatCard
          title="Active Orders"
          value={kpis.activeOrders || 0}
          icon={ShoppingCartIcon}
          description="Orders currently in progress"
          color="secondary"
        />
        <StatCard
          title="Active Staff"
          value={kpis.activeStaff || 0}
          icon={UserGroupIcon}
          description="Drivers & servers active today"
          color="accent"
        />
        <StatCard
          title="Occupancy"
          value={`${opsStats.tableOccupancy || 0}%`}
          icon={Percent}
          description="Currently occupied tables"
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Operational Flow */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sales Trend */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <HourlyTrendChart data={trends.hourlySales} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <OperationsAlerts alerts={alerts} />
            <QuickActionToolbar />
          </div>
        </div>

        {/* Live Feed Column */}
        <div className="lg:col-span-1">
          <DashboardRecentOrders orders={recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
