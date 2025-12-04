import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { AreaChart, Area } from "recharts";

function InventoryValueChart({ data }) {
  const chartData = data || [
    { date: "Week 1", value: 15000 },
    { date: "Week 2", value: 14500 },
    { date: "Week 3", value: 16000 },
    { date: "Week 4", value: 15200 },
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Inventory Value Trend</h3>
        <BaseChart height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ChartGrid />
            <ChartXAxis dataKey="date" />
            <ChartYAxis />
            <ChartTooltip />
            <ChartLegend />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              fillOpacity={1}
              fill="url(#colorValue)"
              name="Stock Value ($)"
            />
          </AreaChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default InventoryValueChart;
