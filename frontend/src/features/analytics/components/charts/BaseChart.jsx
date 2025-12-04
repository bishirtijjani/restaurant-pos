import React from "react";
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

function BaseChart({ children, height = 300 }) {
  return (
    <div style={{ width: "100%", height: height }}>
      <ResponsiveContainer>
        {React.cloneElement(children, {
          // Inject common props if needed
        })}
      </ResponsiveContainer>
    </div>
  );
}

// Common Chart Components with Default Styling
export const ChartGrid = (props) => (
  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} {...props} />
);

export const ChartXAxis = (props) => (
  <XAxis
    axisLine={false}
    tickLine={false}
    tick={{ fill: "#6b7280", fontSize: 12 }}
    dy={10}
    {...props}
  />
);

export const ChartYAxis = (props) => (
  <YAxis
    axisLine={false}
    tickLine={false}
    tick={{ fill: "#6b7280", fontSize: 12 }}
    {...props}
  />
);

export const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 p-3 border border-base-200 shadow-xl rounded-lg text-sm">
        <p className="font-bold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="opacity-70">{entry.name}:</span>
            <span className="font-semibold">
              {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartLegend = (props) => (
  <Legend wrapperStyle={{ paddingTop: "20px" }} {...props} />
);

export default BaseChart;
