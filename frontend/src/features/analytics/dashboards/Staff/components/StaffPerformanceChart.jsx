import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { BarChart, Bar } from "recharts";

function StaffPerformanceChart({ data }) {
  const chartData = data || [
    { name: "John Doe", sales: 1200, orders: 45 },
    { name: "Jane Smith", sales: 1500, orders: 55 },
    { name: "Bob Johnson", sales: 900, orders: 30 },
    { name: "Alice Brown", sales: 1100, orders: 40 },
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Staff Performance (Sales vs Orders)</h3>
        <BaseChart height={350}>
          <BarChart data={chartData}>
            <ChartGrid />
            <ChartXAxis dataKey="name" />
            <ChartYAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
            <ChartYAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <ChartTooltip />
            <ChartLegend />
            <Bar yAxisId="left" dataKey="sales" fill="#4f46e5" name="Sales ($)" />
            <Bar yAxisId="right" dataKey="orders" fill="#10b981" name="Orders" />
          </BarChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default StaffPerformanceChart;
