import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SuspenseContent from "../../containers/SuspenseContent";
import Datepicker from "react-tailwindcss-datepicker";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { format } from "date-fns";

import {
  fetchOverviewStats,
  fetchSalesTrends,
  fetchSalesByCategory,
  fetchMenuItemPerformance,
  fetchPeakHoursAnalysis,
  fetchExpenseAnalysis,
  fetchStaffPerformance,
  fetchProfitabilityReport,
  setDateRange,
  setSelectedRange,
  selectOverviewStats,
  selectSalesTrends,
  selectSalesByCategory,
  selectMenuItemPerformance,
  selectPeakHoursAnalysis,
  selectExpenseAnalysis,
  selectStaffPerformance,
  selectProfitabilityReport,
  selectDateRange,
  selectSelectedRange,
} from "./analyticsSlice";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
];

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const dateRange = useSelector(selectDateRange);
  const selectedRange = useSelector(selectSelectedRange);
  const overviewStats = useSelector(selectOverviewStats);
  const salesTrends = useSelector(selectSalesTrends);
  const salesByCategory = useSelector(selectSalesByCategory);
  const menuItemPerformance = useSelector(selectMenuItemPerformance);
  const peakHoursAnalysis = useSelector(selectPeakHoursAnalysis);
  const expenseAnalysis = useSelector(selectExpenseAnalysis);
  const staffPerformance = useSelector(selectStaffPerformance);
  const profitabilityReport = useSelector(selectProfitabilityReport);

  // console.log("dateRange: ", dateRange);
  // console.log("selectedRange: ", selectedRange);
  // console.log("overviewStats: ", overviewStats);
  // console.log("salesTrends: ", salesTrends);
  // console.log("salesByCategory: ", salesByCategory);
  // console.log("menuItemPerformance: ", menuItemPerformance);
  // console.log("peakHoursAnalysis: ", peakHoursAnalysis);
  // console.log("expenseAnalysis: ", expenseAnalysis);
  console.log("staffPerformance: ", staffPerformance);
  // console.log("profitabilityReport: ", profitabilityReport);

  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");

  const handleDateRangeChange = (range) => {
    dispatch(
      setDateRange({
        startDate: new Date(range.startDate),
        endDate: new Date(range.endDate),
      })
    );
    dispatch(setSelectedRange("custom"));
    fetchAllData();
  };

  const handleRangeSelect = (range) => {
    dispatch(setSelectedRange(range));
    fetchAllData(range);
  };

  const fetchAllData = (range = selectedRange) => {
    const params = range === "custom" ? { dateRange } : { range };

    dispatch(fetchOverviewStats(params));
    dispatch(fetchSalesTrends(params));
    dispatch(fetchSalesByCategory(params));
    dispatch(fetchMenuItemPerformance(params));
    dispatch(fetchPeakHoursAnalysis(params));
    dispatch(fetchExpenseAnalysis(params));
    dispatch(fetchStaffPerformance(params));
    dispatch(fetchProfitabilityReport(params));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
    }).format(value);
  };

  // Loading state render
  if (
    overviewStats.loading ||
    salesTrends.loading ||
    salesByCategory.loading ||
    menuItemPerformance.loading
  ) {
    return <SuspenseContent />;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">
        Restaurant Analytics Dashboard
      </h1>

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="btn-group">
          <button
            className={`btn btn-sm ${
              selectedRange === "today" ? "btn-active" : ""
            }`}
            onClick={() => handleRangeSelect("today")}
          >
            Today
          </button>
          <button
            className={`btn btn-sm ${
              selectedRange === "week" ? "btn-active" : ""
            }`}
            onClick={() => handleRangeSelect("week")}
          >
            Last 7 Days
          </button>
          <button
            className={`btn btn-sm ${
              selectedRange === "month" ? "btn-active" : ""
            }`}
            onClick={() => handleRangeSelect("month")}
          >
            Last 30 Days
          </button>
          <button
            className={`btn btn-sm ${
              selectedRange === "year" ? "btn-active" : ""
            }`}
            onClick={() => handleRangeSelect("year")}
          >
            Year
          </button>
        </div>

        <div className="w-72">
          <Datepicker
            value={dateRange}
            onChange={handleDateRangeChange}
            showShortcuts={true}
            primaryColor="blue"
          />
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="tabs tabs-boxed mb-4">
        <a
          className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </a>
        <a
          className={`tab ${activeTab === "sales" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("sales")}
        >
          Sales Analysis
        </a>
        <a
          className={`tab ${activeTab === "menu" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("menu")}
        >
          Menu Performance
        </a>
        <a
          className={`tab ${activeTab === "expenses" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("expenses")}
        >
          Expenses
        </a>
        <a
          className={`tab ${activeTab === "staff" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          Staff Performance
        </a>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "overview" && (
          <OverviewTab
            overviewStats={overviewStats.data}
            salesTrends={salesTrends.data}
            salesByCategory={salesByCategory.data}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === "sales" && (
          <SalesTab
            salesTrends={salesTrends.data}
            salesByCategory={salesByCategory.data}
            peakHoursAnalysis={peakHoursAnalysis.data}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === "menu" && (
          <MenuPerformanceTab
            menuItemPerformance={menuItemPerformance.data}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === "expenses" && (
          <ExpensesTab
            expenseAnalysis={expenseAnalysis.data}
            profitabilityReport={profitabilityReport.data}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === "staff" && (
          <StaffPerformanceTab
            staffPerformance={staffPerformance.data}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
};

// Component for the Overview Tab
const OverviewTab = ({
  overviewStats,
  salesTrends,
  salesByCategory,
  formatCurrency,
}) => {
  if (!overviewStats) return <div>No data available</div>;

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Sales</div>
            <div className="stat-value text-primary">
              {formatCurrency(overviewStats.totalSales)}
            </div>
            <div className="stat-desc">{overviewStats.orderCount} orders</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Average Check</div>
            <div className="stat-value text-secondary">
              {formatCurrency(overviewStats.averageCheck)}
            </div>
            <div className="stat-desc">Per customer</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Gross Profit</div>
            <div className="stat-value">
              {formatCurrency(overviewStats.grossProfit)}
            </div>
            <div className="stat-desc">
              {overviewStats.grossProfitMargin.toFixed(1)}% margin
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Expenses</div>
            <div className="stat-value text-error">
              {formatCurrency(overviewStats.totalExpenses)}
            </div>
          </div>
        </div>
      </div>

      {/* Order Types Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Order Type Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={salesTrends.filter((item) => item.date !== null)}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="orderCount"
                  stroke="#82ca9d"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Best Selling Items</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {overviewStats.topItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.totalQuantity}</td>
                      <td>{formatCurrency(item.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      {salesTrends && salesTrends.length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Sales Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={salesTrends.filter((item) => item.date !== null)}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="orderCount"
                  stroke="#82ca9d"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for the Sales Tab
const SalesTab = ({
  salesTrends,
  salesByCategory,
  peakHoursAnalysis,
  formatCurrency,
}) => {
  return (
    <div>
      {/* Sales by Category */}
      {salesByCategory && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Sales by Category</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={salesByCategory}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>

              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Items Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesByCategory.map((category, index) => (
                      <tr key={index}>
                        <td>{category.name}</td>
                        <td>{category.quantity}</td>
                        <td>{formatCurrency(category.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Peak Hours Analysis Heatmap */}
      {peakHoursAnalysis && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Peak Hours Analysis</h2>
            <div className="overflow-x-auto">
              <table className="table w-full text-center">
                <thead>
                  <tr>
                    <th>Day</th>
                    {Array.from({ length: 12 }, (_, i) => i + 6).map((hour) => (
                      <th key={hour}>
                        {hour % 12 || 12}
                        {hour < 12 ? "am" : "pm"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {peakHoursAnalysis.formattedData &&
                    peakHoursAnalysis.formattedData.map((day) => (
                      <tr key={day.day}>
                        <td>{day.day}</td>
                        {day.hours.slice(6, 18).map((hourData, i) => {
                          const hour = i + 6;
                          // Calculate color intensity based on order count
                          const maxOrderCount = Math.max(
                            ...day.hours.map((h) => h.orderCount)
                          );
                          const intensity =
                            maxOrderCount > 0
                              ? hourData.orderCount / maxOrderCount
                              : 0;
                          const bgColor = `rgba(52, 152, 219, ${intensity.toFixed(
                            1
                          )})`;

                          return (
                            <td key={hour} style={{ backgroundColor: bgColor }}>
                              {hourData.orderCount}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-sm text-right">
              Values represent number of orders
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for the Menu Performance Tab
const MenuPerformanceTab = ({ menuItemPerformance, formatCurrency }) => {
  if (!menuItemPerformance) return <div>No data available</div>;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Menu Item Performance</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty Sold</th>
                <th>Revenue</th>
                <th>Cost</th>
                <th>Profit</th>
                <th>Profit Margin</th>
              </tr>
            </thead>
            <tbody>
              {menuItemPerformance.map((item, index) => {
                const profitMargin =
                  item.totalRevenue > 0
                    ? ((item.profit / item.totalRevenue) * 100).toFixed(1)
                    : 0;

                return (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.totalQuantity}</td>
                    <td>{formatCurrency(item.totalRevenue)}</td>
                    <td>{formatCurrency(item.totalCost)}</td>
                    <td>{formatCurrency(item.profit)}</td>
                    <td
                      className={`${
                        Number(profitMargin) < 15
                          ? "text-error"
                          : "text-success"
                      }`}
                    >
                      {profitMargin}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Component for the Expenses Tab
const ExpensesTab = ({
  expenseAnalysis,
  profitabilityReport,
  formatCurrency,
}) => {
  if (!expenseAnalysis || !profitabilityReport)
    return <div>No data available</div>;

  return (
    <div>
      {/* Profitability Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value">
              {formatCurrency(profitabilityReport.totalSales)}
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Cost of Goods</div>
            <div className="stat-value text-secondary">
              {formatCurrency(profitabilityReport.costOfGoods)}
            </div>
            <div className="stat-desc">
              {(
                (profitabilityReport.costOfGoods /
                  profitabilityReport.totalSales) *
                100
              ).toFixed(1)}
              % of sales
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Expenses</div>
            <div className="stat-value text-error">
              {formatCurrency(profitabilityReport.totalExpenses)}
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Net Profit</div>
            <div className="stat-value text-success">
              {formatCurrency(profitabilityReport.netProfit)}
            </div>
            <div className="stat-desc">
              {profitabilityReport.netProfitMargin.toFixed(1)}% margin
            </div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={profitabilityReport.expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category}: ${percentage.toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="category"
                >
                  {profitabilityReport.expenseBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Expense Details</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {profitabilityReport.expenseBreakdown.map(
                    (expense, index) => (
                      <tr key={index}>
                        <td>{expense.category}</td>
                        <td>{formatCurrency(expense.amount)}</td>
                        <td>{expense.percentage.toFixed(1)}%</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Trends Chart */}
      {expenseAnalysis.expenseTrend && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Expense Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={expenseAnalysis.expenseTrend}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalAmount"
                  stroke="#FF8042"
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for the Staff Performance Tab
const StaffPerformanceTab = ({ staffPerformance, formatCurrency }) => {
  if (!staffPerformance) return <div>No data available</div>;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Staff Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Orders</th>
                  <th>Total Sales</th>
                  <th>Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {staffPerformance.map((staff, index) => (
                  <tr key={index}>
                    <td>{staff.staffName || "Unknown"}</td>
                    <td>{staff.orderCount}</td>
                    <td>{formatCurrency(staff.totalSales)}</td>
                    <td>{formatCurrency(staff.averageOrderValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={staffPerformance}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="staffName" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="totalSales" fill="#82ca9d" name="Total Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
