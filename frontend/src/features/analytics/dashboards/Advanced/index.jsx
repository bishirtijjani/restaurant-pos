import React from "react";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import SalesHeatmap from "./components/SalesHeatmap";
import SalesForecastChart from "./components/SalesForecastChart";
import KPICard from "../../components/cards/KPICard";
import LightBulbIcon from "@heroicons/react/24/solid/LightBulbIcon";
import ExclamationCircleIcon from "@heroicons/react/24/solid/ExclamationCircleIcon";

function AdvancedInsights() {
  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Advanced Insights"
        breadcrumbs={[{ label: "Advanced" }]}
      />
      <FilterBar />

      {/* AI Insights / Anomalies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg flex items-center gap-2">
              <LightBulbIcon className="h-5 w-5 text-yellow-500" />
              AI Insights
            </h3>
            <ul className="space-y-2 text-sm">
              <li>• Sales are predicted to increase by 15% next weekend.</li>
              <li>• "Spicy Wings" demand correlates with rainy weather.</li>
            </ul>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              Anomalies Detected
            </h3>
            <ul className="space-y-2 text-sm">
              <li>• Unusually low sales on Tuesday evening (-20%).</li>
              <li>• Spike in voided orders on Friday night.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesHeatmap />
        <SalesForecastChart />
      </div>
    </AnalyticsContainer>
  );
}

export default AdvancedInsights;
