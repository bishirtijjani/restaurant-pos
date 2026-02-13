import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  return (
    <div className={`card bg-base-100 shadow-xl border-l-4 border-${color}`}>
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title text-xs opacity-70 uppercase tracking-wider font-semibold">
              {title}
            </h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold">{value}</span>
              {trend && (
                <span
                  className={`badge badge-sm ${
                    trendValue >= 0 ? "badge-success" : "badge-error"
                  } gap-1 font-bold text-xs`}
                >
                  {trendValue >= 0 ? (
                    <ArrowUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3" />
                  )}
                  {Math.abs(trendValue)}%
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, currency = "£" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 p-3 border border-base-200 shadow-xl rounded-lg text-sm">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {currency}
            {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Mock Data ---

const SALES_DATA = [
  { time: "Mon", revenue: 4200, target: 4000 },
  { time: "Tue", revenue: 3800, target: 4000 },
  { time: "Wed", revenue: 5100, target: 4000 },
  { time: "Thu", revenue: 5800, target: 4500 },
  { time: "Fri", revenue: 8400, target: 6000 },
  { time: "Sat", revenue: 9200, target: 7500 },
  { time: "Sun", revenue: 7600, target: 6500 },
];

const CATEGORY_DATA = [
  { name: "Food", value: 28540, color: "#4f46e5" }, // Primary
  { name: "Beverage", value: 12450, color: "#ec4899" }, // Secondary
  { name: "Merch", value: 1200, color: "#14b8a6" }, // Accent
];

const TOP_ITEMS = [
  {
    name: "Ribeye Steak (10oz)",
    category: "Mains",
    sales: 142,
    revenue: 3550,
    image:
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=100&h=100&q=80",
  },
  {
    name: "Fish & Chips",
    category: "Classics",
    sales: 189,
    revenue: 2929,
    image: "/menu-items/Fish & Chips.jpeg",
  }, // Mock path
  {
    name: "House Burger",
    category: "Mains",
    sales: 215,
    revenue: 2795,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&h=100&q=80",
  },
  {
    name: "Seafood Paella",
    category: "Specials",
    sales: 84,
    revenue: 2352,
    emoji: "🥘",
  },
  {
    name: "Craft Lager Print",
    category: "Drinks",
    sales: 412,
    revenue: 2266,
    emoji: "🍺",
  },
];

export default function MockOverview() {
  const [dateRange, setDateRange] = useState("This Week");

  return (
    <div className="p-6 bg-base-200 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-base-content">
            Analytics Dashboard
          </h1>
          <p className="text-base-content/60 text-sm">
            Performance insights and business intelligence.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="join">
            <button className="btn btn-sm join-item">Day</button>
            <button className="btn btn-sm btn-active btn-primary join-item">
              Week
            </button>
            <button className="btn btn-sm join-item">Month</button>
          </div>
          <button className="btn btn-sm btn-outline gap-2">
            <CalendarIcon className="w-4 h-4" />
            Oct 21 - Oct 27
          </button>
          <button className="btn btn-sm btn-primary gap-2 shadow-lg shadow-primary/20">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="£44,100"
          icon={CurrencyDollarIcon}
          color="primary"
          trend={true}
          trendValue={12.5}
        />
        <StatCard
          title="Total Orders"
          value="1,245"
          icon={ShoppingCartIcon}
          color="secondary"
          trend={true}
          trendValue={8.2}
        />
        <StatCard
          title="Avg Order Value"
          value="£35.42"
          icon={CreditCardIcon}
          color="accent"
          trend={true}
          trendValue={-2.1}
        />
        <StatCard
          title="Labor Cost"
          value="22%"
          icon={UserGroupIcon}
          color="info" // Using info for neutral/good stat
          trend={true}
          trendValue={-1.5} // Negative labor cost trend is good (visually we might want green for down here but stick to standard for consistency)
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-6">
            <h3 className="card-title text-base mb-6">
              Revenue vs Target (Weekly)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SALES_DATA}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(val) => `£${val / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                    name="Target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category breakdown Pie Chart */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-6">
            <h3 className="card-title text-base mb-2">Sales by Category</h3>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `£${val.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">£42.2k</span>
                <span className="text-xs opacity-60">Total Sales</span>
              </div>
            </div>
            {/* Custom Legend */}
            <div className="space-y-2 mt-2">
              {CATEGORY_DATA.map((cat, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-bold">
                    £{cat.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-0">
            <div className="p-6 border-b border-base-200 flex justify-between items-center">
              <h3 className="card-title text-base">Top Selling Items</h3>
              <button className="btn btn-xs btn-ghost text-primary">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="bg-base-100">Item Name</th>
                    <th className="bg-base-100 text-right">Sold</th>
                    <th className="bg-base-100 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_ITEMS.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-base-200/50 transition-colors"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-10 h-10 bg-base-200 flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.name} />
                              ) : (
                                <span className="text-xl">{item.emoji}</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-sm">{item.name}</div>
                            <div className="text-xs opacity-50">
                              {item.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right font-medium">{item.sales}</td>
                      <td className="text-right font-bold text-primary">
                        £{item.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Hourly Performance Bar Chart (Peak Hours) */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="card-title text-base">Peak Hours (Avg)</h3>
              <select className="select select-bordered select-xs">
                <option>Revenue</option>
                <option>Orders</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { hour: "12pm", val: 45 },
                    { hour: "1pm", val: 85 },
                    { hour: "2pm", val: 65 },
                    { hour: "3pm", val: 30 },
                    { hour: "4pm", val: 25 },
                    { hour: "5pm", val: 55 },
                    { hour: "6pm", val: 95 },
                    { hour: "7pm", val: 120 },
                    { hour: "8pm", val: 110 },
                    { hour: "9pm", val: 80 },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="val"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-base-200 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <ArrowUpIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs opacity-60 uppercase font-bold">
                  Busiest Hour
                </p>
                <p className="font-bold">7:00 PM - 8:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
