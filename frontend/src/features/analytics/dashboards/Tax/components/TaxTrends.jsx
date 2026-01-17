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

function TaxTrends({ data }) {
  const chartData = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Tax & Service Charge Trends</h3>
        <BaseChart height={350}>
          <LineChart data={chartData}>
            <ChartGrid />
            <ChartXAxis dataKey="date" />
            <ChartYAxis />
            <ChartTooltip
              formatter={(value) => `${currency}${value.toLocaleString()}`}
            />
            <ChartLegend />
            <Line
              type="monotone"
              dataKey="tax"
              stroke="#4f46e5"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              name={`Tax (${currency})`}
            />
            <Line
              type="monotone"
              dataKey="serviceCharge"
              stroke="#10b981"
              strokeWidth={2}
              name={`Service Charge (${currency})`}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2}
              name={`Taxable Revenue (${currency})`}
            />
          </LineChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default TaxTrends;
