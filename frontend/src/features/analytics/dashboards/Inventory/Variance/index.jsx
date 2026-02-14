import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVarianceData } from "../../../slices/varianceAnalyticsSlice";
import { selectDateRange } from "../../../slices/analyticsGlobalSlice";
import AnalyticsHeader from "../../../components/common/AnalyticsHeader";
import FilterBar from "../../../components/common/FilterBar";
import KPICard from "../../../components/cards/KPICard";
import {
  TrendingDownIcon,
  TrendingUpIcon,
  BarChartIcon,
  AlertTriangleIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import TitleCard from "../../../../../components/Cards/TitleCard";

const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];

const VarianceDashboard = () => {
  const dispatch = useDispatch();
  const { startDate, endDate } = useSelector(selectDateRange);
  const { summary, items, reasons, status } = useSelector(
    (state) => state.varianceAnalytics,
  );

  useEffect(() => {
    dispatch(fetchVarianceData({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const isLoading = status === "loading";

  // Defensive guards
  const safeReasons = reasons || [];
  const safeSummary = summary || {
    totalGain: 0,
    totalLoss: 0,
    netImpact: 0,
    totalAdjustments: 0,
  };
  const safeItems = items || [];

  // Format data for chart
  const reasonChartData = safeReasons.map((r) => ({
    name:
      r.reason?.charAt(0).toUpperCase() +
        r.reason?.slice(1).replace("_", " ") || "Unknown",
    value: Math.abs(r.impact || 0),
  }));

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsHeader
        title="Stock Variance Report"
        breadcrumbs={[
          { label: "Inventory", path: "/app/analytics/inventory" },
          { label: "Variance" },
        ]}
      />
      <FilterBar />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Potential Gain"
          value={`$${(safeSummary.totalGain || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={TrendingUpIcon}
          color="success"
          loading={isLoading}
        />
        <KPICard
          title="Total Shrinkage"
          value={`$${Math.abs(safeSummary.totalLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={TrendingDownIcon}
          color="error"
          loading={isLoading}
        />
        <KPICard
          title="Net Financial Impact"
          value={`${(safeSummary.netImpact || 0) < 0 ? "-" : ""}$${Math.abs(safeSummary.netImpact || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={BarChartIcon}
          color={(safeSummary.netImpact || 0) >= 0 ? "primary" : "warning"}
          loading={isLoading}
        />
        <KPICard
          title="Total Discrepancies"
          value={safeSummary.totalAdjustments || 0}
          icon={AlertTriangleIcon}
          color="accent"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loss by Reason */}
        <TitleCard title="Shrinkage by Reason (Value)">
          <div className="h-80 w-full">
            {reasonChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reasonChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {reasonChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-base-content/50">
                No variance data for this period
              </div>
            )}
          </div>
        </TitleCard>

        {/* Top 10 Loss Items */}
        <TitleCard title="Top 10 Items by Financial Loss">
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th className="text-right">Variance Qty</th>
                  <th className="text-right">Total Loss</th>
                </tr>
              </thead>
              <tbody>
                {safeItems.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>
                      <div className="badge badge-ghost whitespace-nowrap">
                        {item.category}
                      </div>
                    </td>
                    <td
                      className={`text-right font-medium ${item.totalVariance < 0 ? "text-error" : "text-success"}`}
                    >
                      {item.totalVariance > 0 ? "+" : ""}
                      {item.totalVariance}
                    </td>
                    <td
                      className={`text-right font-bold ${item.totalLoss < 0 ? "text-error" : "text-success"}`}
                    >
                      {item.totalLoss < 0 ? "-" : ""}$
                      {Math.abs(item.totalLoss || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {safeItems.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-4 text-base-content/50"
                    >
                      No discrepancies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TitleCard>
      </div>
    </div>
  );
};

export default VarianceDashboard;
