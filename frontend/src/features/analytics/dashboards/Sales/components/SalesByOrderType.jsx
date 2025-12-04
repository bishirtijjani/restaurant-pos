import React from "react";
import BaseChart, {
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { PieChart, Pie, Cell } from "recharts";

function SalesByOrderType({ data }) {
  const chartData = data || [
    { name: "Dine-in", value: 400 },
    { name: "Takeaway", value: 300 },
    { name: "Delivery", value: 300 },
    { name: "Online", value: 200 },
  ];

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Sales by Order Type</h3>
        <BaseChart height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <ChartTooltip />
            <ChartLegend />
          </PieChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default SalesByOrderType;
