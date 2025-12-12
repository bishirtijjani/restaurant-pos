import React from "react";
import BaseChart, {
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartLegend,
} from "../../../components/charts/BaseChart";
import { ScatterChart, Scatter, Cell, ZAxis, ReferenceLine } from "recharts";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

function MenuEngineeringMatrix({ data }) {
  const chartData = data || [];
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "$";

  const COLORS = {
    Star: "#10b981", // High Profit, High Pop
    Plowhorse: "#f59e0b", // Low Profit, High Pop
    Puzzle: "#4f46e5", // High Profit, Low Pop
    Dog: "#ef4444", // Low Profit, Low Pop
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-lg mb-4">Menu Engineering Matrix</h3>
        <p className="text-xs text-base-content/60 mb-4">
          X-Axis: Popularity (Qty Sold) | Y-Axis: Profitability ({currency}{" "}
          Profit)
        </p>
        <BaseChart height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartGrid />
            <ChartXAxis
              type="number"
              dataKey="popularity"
              name="Popularity"
              unit=" sold"
            />
            <ChartYAxis
              type="number"
              dataKey="profitability"
              name="Profitability"
              unit={currency}
            />
            <ZAxis
              type="number"
              dataKey="popularity"
              range={[60, 400]}
              name="Volume"
            />
            <ChartTooltip cursor={{ strokeDasharray: "3 3" }} />
            <ChartLegend />

            {/* Quadrant Lines (Mock Averages - Ideally dynamic from backend) */}
            <ReferenceLine x={100} stroke="#ccc" label="Avg Pop" />
            <ReferenceLine y={10} stroke="#ccc" label="Avg Profit" />

            <Scatter name="Menu Items" data={chartData} fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.quadrant] || "#8884d8"}
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
