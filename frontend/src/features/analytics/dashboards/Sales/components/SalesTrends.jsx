import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { LineChart, Line } from "recharts";

function SalesTrends({ data }) {
  // Mock data
  const chartData = data || [
    { date: "Mon", revenue: 4000, orders: 240 },
    { date: "Tue", revenue: 3000, orders: 139 },
    { date: "Wed", revenue: 2000, orders: 980 },
    { date: "Thu", revenue: 2780, orders: 390 },
    { date: "Fri", revenue: 1890, orders: 480 },
    { date: "Sat", revenue: 2390, orders: 380 },
    { date: "Sun", revenue: 3490, orders: 430 },
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Revenue Trend</h3>
        <BaseChart height={350}>
          <LineChart data={chartData}>
            <ChartGrid />
            <ChartXAxis dataKey="date" />
            <ChartYAxis yAxisId="left" />
            <ChartYAxis yAxisId="right" orientation="right" />
            <ChartTooltip />
            <ChartLegend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              activeDot={{ r: 8 }}
              name="Revenue ($)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              name="Orders"
            />
          </LineChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default SalesTrends;
