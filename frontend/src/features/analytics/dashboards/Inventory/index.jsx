import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import InventoryValueChart from "./components/InventoryValueChart";
import WasteByReasonChart from "./components/WasteByReasonChart";
import LowStockAlerts from "./components/LowStockAlerts";
import TopWastedItems from "./components/TopWastedItems";
import KPICard from "../../components/cards/KPICard";
import ArchiveBoxIcon from "@heroicons/react/24/solid/ArchiveBoxIcon";
import CurrencyDollarIcon from "@heroicons/react/24/solid/CurrencyDollarIcon";
import ArrowPathIcon from "@heroicons/react/24/solid/ArrowPathIcon";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import {
  fetchInventoryData,
  selectInventoryOverview,
  selectInventoryTrends,
  selectWasteAnalytics,
  selectLowStockItems,
} from "../../slices/inventoryAnalyticsSlice";
import { selectSettings } from "../../../settings/generalSettings/generalSettingsSlice";

function InventoryAnalytics() {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.analyticsGlobal);
  const overview = useSelector(selectInventoryOverview);
  const trends = useSelector(selectInventoryTrends);
  const waste = useSelector(selectWasteAnalytics);
  const lowStock = useSelector(selectLowStockItems);
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  const { data: kpis, status } = overview;

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(
        fetchInventoryData({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        })
      );
    }
  }, [dispatch, dateRange]);

  const isLoading = status === "loading";
  const kpiData = kpis || {
    totalValue: 0,
    foodCostPercentage: 0,
    turnoverRate: 0,
    totalWaste: 0,
  };

  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Inventory & Cost Analytics"
        breadcrumbs={[{ label: "Inventory" }]}
      />
      <FilterBar />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Total Inventory Value"
          value={`${currency}${kpiData.totalValue.toLocaleString()}`}
          icon={ArchiveBoxIcon}
          trend={true}
          trendValue={2.5}
          color="primary"
          loading={isLoading}
        />
        <KPICard
          title="Food Cost %"
          value={`${kpiData.foodCostPercentage}%`}
          icon={CurrencyDollarIcon}
          trend={true}
          trendValue={-1.2}
          color="success"
          loading={isLoading}
        />
        <KPICard
          title="Stock Turnover Rate"
          value={`${kpiData.turnoverRate}x`}
          icon={ArrowPathIcon}
          trend={true}
          trendValue={0.5}
          color="secondary"
          loading={isLoading}
        />
        <KPICard
          title="Total Waste Value"
          value={`${currency}${kpiData.totalWaste.toLocaleString()}`}
          icon={TrashIcon}
          trend={false}
          color="error"
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <InventoryValueChart
            data={trends.data}
            loading={trends.status === "loading"}
          />
        </div>
        <div className="lg:col-span-1">
          <WasteByReasonChart
            data={waste.byReason}
            loading={waste.status === "loading"}
          />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlerts
          data={lowStock.data}
          loading={lowStock.status === "loading"}
        />
        <TopWastedItems
          data={waste.topItems}
          loading={waste.status === "loading"}
        />
      </div>
    </AnalyticsContainer>
  );
}

export default InventoryAnalytics;
