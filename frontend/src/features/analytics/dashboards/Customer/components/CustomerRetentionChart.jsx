import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { LineChart, Line } from "recharts";

function CustomerRetentionChart({ data }) {
  const chartData = data || [];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Customer Retention Rate</h3>
        <BaseChart height={300}>
          <LineChart data={chartData}>
            <ChartGrid />
            <ChartXAxis dataKey="month" />
            <ChartYAxis unit="%" />
            <ChartTooltip />
            <ChartLegend />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#4f46e5"
              strokeWidth={2}
              name="Retention Rate (%)"
            />
          </LineChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default CustomerRetentionChart;
