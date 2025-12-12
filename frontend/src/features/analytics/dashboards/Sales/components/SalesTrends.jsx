import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { LineChart, Line } from "recharts";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function SalesTrends({ data }) {
  const chartData = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

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
              name={`Revenue (${currency})`}
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
