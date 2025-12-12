import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
} from "../../../components/charts/BaseChart";
import { AreaChart, Area } from "recharts";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function HourlyTrendChart({ data }) {
  const chartData = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "$";

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Hourly Sales Trend</h3>
        <BaseChart height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ChartGrid />
            <ChartXAxis dataKey="hour" />
            <ChartYAxis />
            <ChartTooltip formatter={(value) => `${currency}${value}`} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              fillOpacity={1}
              fill="url(#colorSales)"
              name={`Sales (${currency})`}
            />
          </AreaChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default HourlyTrendChart;
