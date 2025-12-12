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

function SalesForecastChart({ data }) {
  const chartData = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">
          Sales Forecast (Next 7 Days)
        </h3>
        <BaseChart height={300}>
          <LineChart data={chartData}>
            <ChartGrid />
            <ChartXAxis dataKey="date" />
            <ChartYAxis />
            <ChartTooltip formatter={(value) => `${currency}${value}`} />
            <ChartLegend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#4f46e5"
              strokeWidth={2}
              name={`Actual Sales (${currency})`}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={2}
              name={`Predicted Sales (${currency})`}
            />
          </LineChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default SalesForecastChart;
