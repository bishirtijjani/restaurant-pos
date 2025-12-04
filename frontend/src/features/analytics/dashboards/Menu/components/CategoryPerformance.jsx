import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { BarChart, Bar } from "recharts";

function CategoryPerformance({ data }) {
  const chartData = data || [
    { category: "Main Course", revenue: 5000, profit: 2500 },
    { category: "Appetizers", revenue: 2000, profit: 1200 },
    { category: "Drinks", revenue: 1500, profit: 1000 },
    { category: "Desserts", revenue: 800, profit: 500 },
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Category Performance</h3>
        <BaseChart height={300}>
          <BarChart data={chartData}>
            <ChartGrid />
            <ChartXAxis dataKey="category" />
            <ChartYAxis />
            <ChartTooltip />
            <ChartLegend />
            <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" />
            <Bar dataKey="profit" fill="#10b981" name="Profit" />
          </BarChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default CategoryPerformance;
