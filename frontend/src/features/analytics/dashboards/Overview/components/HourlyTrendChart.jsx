import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
} from "../../../components/charts/BaseChart";
import { AreaChart, Area } from "recharts";

function HourlyTrendChart({ data }) {
  // Mock data
  const chartData = data || [
    { time: "10:00", sales: 120 },
    { time: "11:00", sales: 300 },
    { time: "12:00", sales: 800 },
    { time: "13:00", sales: 950 },
    { time: "14:00", sales: 600 },
    { time: "15:00", sales: 400 },
    { time: "16:00", sales: 550 },
    { time: "17:00", sales: 900 },
    { time: "18:00", sales: 1200 },
    { time: "19:00", sales: 1100 },
  ];

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
            <ChartXAxis dataKey="time" />
            <ChartYAxis />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#4f46e5"
              fillOpacity={1}
              fill="url(#colorSales)"
              name="Sales ($)"
            />
          </AreaChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default HourlyTrendChart;
