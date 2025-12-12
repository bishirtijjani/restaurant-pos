import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { BarChart, Bar } from "recharts";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function CategoryPerformance({ data }) {
  const chartData = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

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
            <Bar
              dataKey="revenue"
              fill="#4f46e5"
              name={`Revenue (${currency})`}
            />
            <Bar
              dataKey="profit"
              fill="#10b981"
              name={`Profit (${currency})`}
            />
          </BarChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default CategoryPerformance;
