import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { ScatterChart, Scatter, Cell, ZAxis, ReferenceLine } from "recharts";

function MenuEngineeringMatrix({ data }) {
  // Mock data: x = Popularity (Sold), y = Profitability (Margin), z = Revenue (Bubble Size)
  const chartData = data || [
    { name: "Burger", x: 120, y: 8.5, z: 1200, category: "Stars" },
    { name: "Fries", x: 200, y: 4.0, z: 800, category: "Plowhorses" },
    { name: "Steak", x: 20, y: 25.0, z: 500, category: "Puzzles" },
    { name: "Salad", x: 30, y: 6.0, z: 180, category: "Dogs" },
    { name: "Soda", x: 150, y: 2.5, z: 375, category: "Plowhorses" },
  ];

  const COLORS = {
    Stars: "#10b981", // High Profit, High Pop
    Plowhorses: "#f59e0b", // Low Profit, High Pop
    Puzzles: "#4f46e5", // High Profit, Low Pop
    Dogs: "#ef4444", // Low Profit, Low Pop
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Menu Engineering Matrix</h3>
        <p className="text-xs text-base-content/60 mb-4">
          X-Axis: Popularity (Qty Sold) | Y-Axis: Profitability ($ Margin)
        </p>
        <BaseChart height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartGrid />
            <ChartXAxis
              type="number"
              dataKey="x"
              name="Popularity"
              unit=" sold"
            />
            <ChartYAxis
              type="number"
              dataKey="y"
              name="Profitability"
              unit="$"
            />
            <ZAxis type="number" dataKey="z" range={[60, 400]} name="Revenue" />
            <ChartTooltip cursor={{ strokeDasharray: "3 3" }} />
            <ChartLegend />
            
            {/* Quadrant Lines (Mock Averages) */}
            <ReferenceLine x={100} stroke="#ccc" label="Avg Pop" />
            <ReferenceLine y={10} stroke="#ccc" label="Avg Profit" />

            <Scatter name="Menu Items" data={chartData} fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.category] || "#8884d8"}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </BaseChart>
      </div>
    </div>
  );
}

export default MenuEngineeringMatrix;
