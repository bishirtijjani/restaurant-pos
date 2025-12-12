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

function StaffPerformanceChart({ data }) {
  const chartData = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "$";

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">
          Staff Performance (Sales vs Orders)
        </h3>
        <BaseChart height={350}>
          <BarChart data={chartData}>
            <ChartGrid />
            <ChartXAxis dataKey="name" />
            <ChartYAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
            <ChartYAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <ChartTooltip />
            <ChartLegend />
            <Bar
              yAxisId="left"
              dataKey="sales"
              fill="#4f46e5"
              name={`Sales (${currency})`}
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              fill="#10b981"
              name="Orders"
            />
          </BarChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default StaffPerformanceChart;
