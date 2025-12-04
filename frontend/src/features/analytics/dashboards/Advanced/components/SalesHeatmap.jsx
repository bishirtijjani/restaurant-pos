import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { ScatterChart, Scatter, Cell, ZAxis } from "recharts";

function SalesHeatmap({ data }) {
  // Mock data: x=Hour (0-23), y=Day (0-6), z=Intensity
  // Days: 0=Sun, 1=Mon, ..., 6=Sat
  const chartData = data || [
    { day: 1, hour: 12, value: 50 },
    { day: 1, hour: 13, value: 80 },
    { day: 1, hour: 19, value: 90 },
    { day: 5, hour: 20, value: 100 },
    { day: 6, hour: 14, value: 60 },
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatXAxis = (tickItem) => `${tickItem}:00`;
  const formatYAxis = (tickItem) => days[tickItem];

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
              domain={[0, 6]}
              tickFormatter={formatYAxis}
              tickCount={7}
            />
            <ZAxis type="number" dataKey="value" range={[50, 500]} name="Sales" />
            <ChartTooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Sales Intensity" data={chartData} fill="#4f46e5">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`rgba(79, 70, 229, ${Math.min(0.2 + entry.value / 100, 1)})`}
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
