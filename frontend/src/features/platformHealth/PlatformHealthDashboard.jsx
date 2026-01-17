// frontend/src/features/platformHealth/PlatformHealthDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPlatformMetrics,
  fetchSystemMetrics,
  fetchDatabaseMetrics,
  fetchAPIMetrics,
  fetchPlatformAlerts,
  setTimeRange,
  updateMetricsRealtime,
  addAlertRealtime,
  updateAlertRealtime,
} from "./platformHealthSlice";
import { RefreshCw, Activity, Calendar } from "lucide-react";

// Components
import SystemMetricsCard from "./components/SystemMetricsCard";
import DatabaseHealthCard from "./components/DatabaseHealthCard";
import APIPerformanceCard from "./components/APIPerformanceCard";
import TenantStatisticsCard from "./components/TenantStatisticsCard";
import AlertsPanel from "./components/AlertsPanel";
import RealTimeMetricsChart from "./components/RealTimeMetricsChart";
import ServiceStatusIndicators from "./components/ServiceStatusIndicators";
import SuspenseContent from "../../containers/SuspenseContent";

const PlatformHealthDashboard = () => {
  const dispatch = useDispatch();
  const {
    metrics,
    historicalData,
    alerts,
    loading,
    error,
    selectedTimeRange,
    lastUpdated,
    health,
  } = useSelector((state) => state.platformHealth);

  // WebSocket connection would typically be managed here or in a custom hook
  // For now we'll simulate real-time updates through polling if WS isn't fully ready

  useEffect(() => {
    // Initial fetch
    dispatch(fetchPlatformMetrics());
    dispatch(fetchPlatformAlerts());
    dispatch(fetchSystemMetrics(selectedTimeRange));
    dispatch(fetchDatabaseMetrics(selectedTimeRange));
    dispatch(fetchAPIMetrics(selectedTimeRange));

    // Poll every 30 seconds as fallback/supplement to WS
    const interval = setInterval(() => {
      dispatch(fetchPlatformMetrics());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, selectedTimeRange]);

  const handleTimeRangeChange = (range) => {
    dispatch(setTimeRange(range));
    dispatch(fetchSystemMetrics(range));
    dispatch(fetchDatabaseMetrics(range));
    dispatch(fetchAPIMetrics(range));
  };

  const handleRefresh = () => {
    dispatch(fetchPlatformMetrics());
    dispatch(fetchPlatformAlerts());
    dispatch(fetchSystemMetrics(selectedTimeRange));
    dispatch(fetchDatabaseMetrics(selectedTimeRange));
    dispatch(fetchAPIMetrics(selectedTimeRange));
  };

  if (loading && !metrics.system.cpu.loadAverage.length) {
    return <SuspenseContent />;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-error">
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
        <p>{error}</p>
        <button className="btn btn-primary mt-4" onClick={handleRefresh}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Platform Health Monitor
          </h1>
          <p className="text-sm text-base-content/60">
            Real-time monitoring for infrastructure and tenant services
          </p>
        </div>

        <div className="flex items-center gap-2 bg-base-100 p-2 rounded-lg shadow-sm">
          <Calendar className="w-4 h-4 text-base-content/50" />
          <div className="join">
            {["1h", "6h", "24h", "7d"].map((range) => (
              <button
                key={range}
                className={`join-item btn btn-xs ${
                  selectedTimeRange === range ? "btn-active" : ""
                }`}
                onClick={() => handleTimeRangeChange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="divider divider-horizontal mx-1 my-0"></div>
          <button
            className="btn btn-xs btn-ghost gap-1"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
          <span className="text-xs text-base-content/40 ml-1 font-mono">
            {lastUpdated
              ? new Date(lastUpdated).toLocaleTimeString()
              : "Syncing..."}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <ServiceStatusIndicators
          metrics={metrics}
          health={
            health || {
              checks: {
                database: "healthy",
                metrics: "healthy",
                monitoring: "healthy",
              },
            }
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Metrics Cards */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SystemMetricsCard metrics={metrics.system} />
            <div className="space-y-6">
              <DatabaseHealthCard metrics={metrics.database} />
              <TenantStatisticsCard metrics={metrics.tenants} />
            </div>
          </div>

          <APIPerformanceCard metrics={metrics.api} />

          {/* Historical Charts */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-6">
              <h3 className="card-title text-lg mb-4">Historical Trends</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RealTimeMetricsChart
                  data={historicalData.system}
                  metricKey="system.cpu.usage"
                  label="CPU Usage"
                  color="#ef4444"
                  unit="%"
                />
                <RealTimeMetricsChart
                  data={historicalData.system}
                  metricKey="system.memory.percentage"
                  label="Memory Usage"
                  color="#8b5cf6"
                  unit="%"
                />
                <RealTimeMetricsChart
                  data={historicalData.api}
                  metricKey="api.requestRate"
                  label="API Request Rate"
                  color="#3b82f6"
                  unit=" req/s"
                />
                <RealTimeMetricsChart
                  data={historicalData.database}
                  metricKey="database.queryLatency.p99"
                  label="DB p99 Latency"
                  color="#f59e0b"
                  unit="ms"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts Panel */}
        <div className="xl:col-span-1 h-full min-h-[600px]">
          <div className="sticky top-6 h-full">
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformHealthDashboard;
