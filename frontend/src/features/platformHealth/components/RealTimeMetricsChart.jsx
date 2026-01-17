// frontend/src/features/platformHealth/components/RealTimeMetricsChart.jsx
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RealTimeMetricsChart = ({ data, metricKey, color, label, unit = "" }) => {
  // Simple formatter for time
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-300 p-2 text-xs rounded shadow border border-base-content/10">
          <p className="font-bold">{formatTime(label)}</p>
          <p style={{ color }}>
            {payload[0].value.toFixed(1)}
            {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-base-200/20 rounded-lg h-48 flex items-center justify-center text-sm text-base-content/40">
        No historical data available
      </div>
    );
  }

  // Pre-process data to extract nested keys (e.g., 'system.cpu.usage')
  const chartData = data.map((item) => {
    // Very simple object path resolver
    const getValue = (obj, path) =>
      path.split(".").reduce((acc, part) => acc && acc[part], obj);
    return {
      timestamp: item.timestamp,
      value: getValue(item, metricKey) || 0,
    };
  });

  return (
    <div className="h-48 w-full">
      <h4 className="text-xs uppercase font-bold text-base-content/50 mb-2">
        {label}
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient
              id={`color-${metricKey}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            strokeOpacity={0.1}
          />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            tick={{ fontSize: 10, fill: "gray" }}
            interval="preserveStartEnd"
            minTickGap={30}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "gray" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fillOpacity={1}
            fill={`url(#color-${metricKey})`}
            strokeWidth={2}
            isAnimationActive={false} // Disable animation for smoother real-time updates
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealTimeMetricsChart;
