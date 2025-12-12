import React from "react";
import BaseChart, {
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { PieChart, Pie, Cell } from "recharts";

function PaymentMethodsChart({ data }) {
  const chartData = data || [];

  const COLORS = ["#10b981", "#4f46e5", "#f59e0b", "#6366f1"];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Payment Methods</h3>
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

export default PaymentMethodsChart;
