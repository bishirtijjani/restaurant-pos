import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { ScatterChart, Scatter, Cell, ZAxis } from "recharts";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function SalesHeatmap({ data }) {
  const chartData = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatXAxis = (tickItem) => `${tickItem}:00`;
  const formatYAxis = (tickItem) => days[tickItem - 1] || "";

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Sales Heatmap (Busy Hours)</h3>
        <BaseChart height={350}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartGrid />
            <ChartXAxis
              type="number"
              dataKey="hour"
              name="Hour"
              domain={[0, 23]}
              tickFormatter={formatXAxis}
            />
            <ChartYAxis
              type="number"
              dataKey="day"
              name="Day"
              domain={[1, 7]}
              tickFormatter={formatYAxis}
              tickCount={7}
            />
            <ZAxis
              type="number"
              dataKey="value"
              range={[50, 500]}
              name="Sales"
              unit={currency}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value) => `${currency}${value}`}
            />
            <Scatter name="Sales Intensity" data={chartData} fill="#4f46e5">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`rgba(79, 70, 229, ${Math.min(
                    0.2 + entry.value / 100,
                    1
                  )})`}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default SalesHeatmap;
