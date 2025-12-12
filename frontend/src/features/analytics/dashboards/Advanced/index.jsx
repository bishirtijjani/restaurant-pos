import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import SalesHeatmap from "./components/SalesHeatmap";
import SalesForecastChart from "./components/SalesForecastChart";
import KPICard from "../../components/cards/KPICard";
import LightBulbIcon from "@heroicons/react/24/solid/LightBulbIcon";
import ExclamationCircleIcon from "@heroicons/react/24/solid/ExclamationCircleIcon";
import {
  fetchAdvancedData,
  selectHeatmapData,
  selectForecastingData,
  selectAnomalies,
} from "../../slices/advancedAnalyticsSlice";

function AdvancedInsights() {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.analyticsGlobal);
  const heatmap = useSelector(selectHeatmapData);
  const forecasting = useSelector(selectForecastingData);
  const anomalies = useSelector(selectAnomalies);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(
        fetchAdvancedData({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        })
      );
    }
  }, [dispatch, dateRange]);

  const isLoading = heatmap.status === "loading";

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
              Smart Insights
            </h3>
            <ul className="space-y-2 text-sm">
              {/* Backend now sends dynamic rule-based insights */}
              {forecasting.insights && forecasting.insights.length > 0 ? (
                forecasting.insights.map((insight, idx) => (
                  <li key={idx}>• {insight}</li>
                ))
              ) : (
                <li className="text-base-content/50 italic">
                  Not enough data to generate insights yet.
                </li>
              )}
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
              {anomalies.data && anomalies.data.length > 0 ? (
                anomalies.data.map((anomaly, index) => (
                  <li key={index}>
                    • {anomaly.description || "Anomaly detected"}
                  </li>
                ))
              ) : (
                <li>• No anomalies detected in this period.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesHeatmap data={heatmap.data} loading={isLoading} />
        <SalesForecastChart
          data={forecasting.data}
          loading={forecasting.status === "loading"}
        />
      </div>
    </AnalyticsContainer>
  );
}

export default AdvancedInsights;
