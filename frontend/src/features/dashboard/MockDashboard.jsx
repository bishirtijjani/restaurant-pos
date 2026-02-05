import React from "react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Percent } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Components
import StatCard from "../dashboard/components/StatCard";
import LiveStatusHeader from "../dashboard/components/LiveStatusHeader";
import OperationsAlerts from "../dashboard/components/OperationsAlerts";
import QuickActionToolbar from "../dashboard/components/QuickActionToolbar";
import DashboardRecentOrders from "../dashboard/components/DashboardRecentOrders";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 p-3 border border-base-200 shadow-xl rounded-lg text-sm">
        <p className="font-bold mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#4f46e5" }}
          />
          <span className="opacity-70">Sales:</span>
          <span className="font-semibold">
            ${payload[0].value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Mock Data for Screenshot
const mockData = {
  kpis: {
    todayRevenue: 18547.5,
    activeOrders: 12,
    activeStaff: 8,
  },
  opsStats: {
    tableOccupancy: 78,
  },
  trends: {
    hourlySales: [
      { hour: "9 AM", revenue: 450 },
      { hour: "10 AM", revenue: 820 },
      { hour: "11 AM", revenue: 1340 },
      { hour: "12 PM", revenue: 2890 },
      { hour: "1 PM", revenue: 3420 },
      { hour: "2 PM", revenue: 2650 },
      { hour: "3 PM", revenue: 1180 },
      { hour: "4 PM", revenue: 890 },
      { hour: "5 PM", revenue: 1450 },
      { hour: "6 PM", revenue: 2980 },
      { hour: "7 PM", revenue: 3890 },
      { hour: "8 PM", revenue: 4120 },
      { hour: "9 PM", revenue: 3650 },
      { hour: "10 PM", revenue: 2340 },
    ],
  },
  recentActivity: [
    {
      _id: "1",
      orderNumber: "ORD-2847",
      orderType: "Dine-in",
      customerDetails: { name: "Sarah Johnson", phone: "+1 555-0123" },
      items: [
        { name: "Ribeye Steak", quantity: 2, price: 45.0 },
        { name: "Caesar Salad", quantity: 2, price: 12.0 },
        { name: "Red Wine", quantity: 1, price: 38.0 },
      ],
      totalAmount: 152.0,
      orderStatus: "Preparing",
      createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      table: "12",
    },
    {
      _id: "2",
      orderNumber: "ORD-2846",
      orderType: "Takeaway",
      customerDetails: { name: "Michael Chen", phone: "+1 555-0124" },
      items: [
        { name: "Margherita Pizza", quantity: 3, price: 18.0 },
        { name: "Garlic Bread", quantity: 2, price: 8.0 },
      ],
      totalAmount: 70.0,
      orderStatus: "Ready",
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      table: "Takeaway",
    },
    {
      _id: "3",
      orderNumber: "ORD-2845",
      orderType: "Dine-in",
      customerDetails: { name: "Emily Rodriguez", phone: "+1 555-0125" },
      items: [
        { name: "Grilled Salmon", quantity: 1, price: 32.0 },
        { name: "Asparagus", quantity: 1, price: 9.0 },
        { name: "Sparkling Water", quantity: 2, price: 5.0 },
      ],
      totalAmount: 51.0,
      orderStatus: "Preparing",
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      table: "7",
    },
    {
      _id: "4",
      orderNumber: "ORD-2844",
      orderType: "Delivery",
      customerDetails: { name: "David Thompson", phone: "+1 555-0126" },
      items: [
        { name: "Burger Deluxe", quantity: 2, price: 22.0 },
        { name: "French Fries", quantity: 2, price: 7.0 },
        { name: "Milkshake", quantity: 2, price: 9.0 },
      ],
      totalAmount: 76.0,
      orderStatus: "Out for Delivery",
      createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
      table: "Takeaway",
    },
    {
      _id: "5",
      orderNumber: "ORD-2843",
      orderType: "Dine-in",
      customerDetails: { name: "Jessica Martinez", phone: "+1 555-0127" },
      items: [
        { name: "Lobster Thermidor", quantity: 1, price: 68.0 },
        { name: "Champagne", quantity: 1, price: 95.0 },
      ],
      totalAmount: 163.0,
      orderStatus: "Completed",
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      table: "3",
    },
  ],
  alerts: [
    {
      _id: "1",
      type: "low_stock",
      severity: "warning",
      message: "Ribeye Steak running low (8 portions remaining)",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      _id: "2",
      type: "reservation",
      severity: "info",
      message: "Party of 12 arriving in 45 minutes (Table 15-17)",
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      _id: "3",
      type: "performance",
      severity: "success",
      message: "Peak hour target exceeded by 23%",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  ],
};

const MockDashboard = () => {
  const { kpis, opsStats, trends, recentActivity, alerts } = mockData;

  return (
    <div className="min-h-screen pb-20">
      <LiveStatusHeader />

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Net Sales (Today)"
          value={`$${kpis.todayRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          description="Gross revenue excluding cancellations"
          color="primary"
          trend={true}
          trendValue={18.5}
        />
        <StatCard
          title="Active Orders"
          value={kpis.activeOrders}
          icon={ShoppingCartIcon}
          description="Orders currently in progress"
          color="secondary"
          trend={true}
          trendValue={12.3}
        />
        <StatCard
          title="Active Staff"
          value={kpis.activeStaff}
          icon={UserGroupIcon}
          description="Drivers & servers active today"
          color="accent"
        />
        <StatCard
          title="Occupancy"
          value={`${opsStats.tableOccupancy}%`}
          icon={Percent}
          description="Currently occupied tables"
          color="info"
          trend={true}
          trendValue={8.7}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Operational Flow */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sales Trend Chart */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-6">
              <h3 className="card-title text-lg mb-4">Hourly Sales Trend</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={trends.hourlySales}>
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4f46e5"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4f46e5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
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

export default MockDashboard;
