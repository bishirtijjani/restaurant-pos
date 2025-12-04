import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { LineChart, Line } from "recharts";

function SalesForecastChart({ data }) {
  const chartData = data || [
    { date: "Oct 01", actual: 4000, predicted: 4100 },
    { date: "Oct 02", actual: 3000, predicted: 3200 },
    { date: "Oct 03", actual: 2000, predicted: 2100 },
    { date: "Oct 04", actual: 2780, predicted: 2900 },
    { date: "Oct 05", actual: 1890, predicted: 2000 },
    { date: "Oct 06", actual: null, predicted: 2500 }, // Future
    { date: "Oct 07", actual: null, predicted: 3600 }, // Future
  ];

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Sales Forecast (Next 7 Days)</h3>
        <BaseChart height={300}>
          <LineChart data={chartData}>
            <ChartGrid />
            <ChartXAxis dataKey="date" />
            <ChartYAxis />
            <ChartTooltip />
            <ChartLegend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#4f46e5"
              strokeWidth={2}
              name="Actual Sales"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Predicted Sales"
            />
          </LineChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default SalesForecastChart;
