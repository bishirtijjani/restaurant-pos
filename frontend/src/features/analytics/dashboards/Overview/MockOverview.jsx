import React from "react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// --- Mock Components ---

const MockKPICard = ({ title, value, icon: Icon, color }) => {
  const getColorClass = (c) => {
    switch (c) {
      case "primary":
        return "text-primary";
      case "secondary":
        return "text-secondary";
      case "accent":
        return "text-accent";
      case "info":
        return "text-info";
      default:
        return "";
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-6 flex flex-row items-center justify-between">
        <div>
          <h2 className="card-title text-base-content/60 text-sm font-normal uppercase tracking-wide">
            {title}
          </h2>
          <div className={`text-3xl font-bold mt-1 ${getColorClass(color)}`}>
            {value}
          </div>
        </div>
        <div className={`p-4 rounded-full bg-base-200 ${getColorClass(color)}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

const MockHourlyChart = ({ data }) => {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-6">
        <h3 className="card-title text-lg mb-4">Real-Time Performance</h3>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickFormatter={(value) => `£${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const MockRecentActivity = () => {
  const activities = [
    {
      time: "2 mins ago",
      msg: "Table 4: Order #2847 Paid (£68.50)",
      type: "success",
    },
    {
      time: "5 mins ago",
      msg: "Kitchen: Low Stock Warning (Lager Keg)",
      type: "warning",
    },
    { time: "8 mins ago", msg: "Table 12: Seated (4 Guests)", type: "info" },
    {
      time: "12 mins ago",
      msg: "Bar Order: 2x Elderflower, 1x Water (£9.50)",
      type: "primary",
    },
    {
      time: "15 mins ago",
      msg: "Kitchen: Sunday Roast - Beef (80% Sold)",
      type: "warning",
    },
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-6">
        <h3 className="card-title text-lg mb-4">Live Updates</h3>
        <div className="space-y-4">
          {activities.map((act, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`w-2 h-2 rounded-full mt-2 bg-${act.type === "neutral" ? "base-content/30" : act.type}`}
                />
                {i !== activities.length - 1 && (
                  <div className="w-0.5 h-full bg-base-200 my-1" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{act.msg}</p>
                <p className="text-xs opacity-50">{act.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Mock Data ---

const MOCK_DATA = {
  kpis: {
    revenue: "£3,420",
    orders: 120,
    avg: "£28.50",
    staff: 8,
  },
  chart: [
    { time: "11am", revenue: 240 },
    { time: "12pm", revenue: 850 },
    { time: "1pm", revenue: 920 },
    { time: "2pm", revenue: 640 },
    { time: "3pm", revenue: 320 },
    { time: "4pm", revenue: 280 },
    { time: "5pm", revenue: 450 },
    { time: "6pm", revenue: 820 },
    { time: "7pm", revenue: 1150 },
    { time: "8pm", revenue: 1050 },
    { time: "9pm", revenue: 780 },
    { time: "10pm", revenue: 420 },
  ],
};

export default function MockOverview() {
  const { kpis, chart } = MOCK_DATA;

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Analytics Overview</h1>
          <p className="text-base-content/60">Live performance metrics</p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-lg badge-primary">24 Oct 2024</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MockKPICard
          title="Total Revenue"
          value={kpis.revenue}
          icon={CurrencyDollarIcon}
          color="primary"
        />
        <MockKPICard
          title="Active Orders"
          value={kpis.orders}
          icon={ShoppingCartIcon}
          color="secondary"
        />
        <MockKPICard
          title="Avg Order Value"
          value={kpis.avg}
          icon={CreditCardIcon}
          color="accent"
        />
        <MockKPICard
          title="Staff On Shift"
          value={kpis.staff}
          icon={UserGroupIcon}
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 h-full">
          <MockHourlyChart data={chart} />
        </div>
        <div className="lg:col-span-1 h-full">
          <MockRecentActivity />
        </div>
      </div>
    </div>
  );
}
