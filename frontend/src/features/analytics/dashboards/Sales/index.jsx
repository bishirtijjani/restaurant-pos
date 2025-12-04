import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import SalesTrends from "./components/SalesTrends";
import SalesByOrderType from "./components/SalesByOrderType";
import TopSellingItemsTable from "./components/TopSellingItemsTable";
import KPICard from "../../components/cards/KPICard";
import CurrencyDollarIcon from "@heroicons/react/24/solid/CurrencyDollarIcon";
import ShoppingBagIcon from "@heroicons/react/24/solid/ShoppingBagIcon";
import CreditCardIcon from "@heroicons/react/24/solid/CreditCardIcon";
import ChartPieIcon from "@heroicons/react/24/solid/ChartPieIcon";
import { fetchSalesData, selectSalesOverview, selectSalesTrends, selectSalesByOrderType, selectTopSellingItems } from "../../slices/salesAnalyticsSlice";

function SalesOverview() {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.analyticsGlobal);
  const overview = useSelector(selectSalesOverview);
  const trends = useSelector(selectSalesTrends);
  const byOrderType = useSelector(selectSalesByOrderType);
  const topItems = useSelector(selectTopSellingItems);

  const { data: kpis, status } = overview;

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(fetchSalesData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }));
    }
  }, [dispatch, dateRange]);

  const isLoading = status === "loading";
  const kpiData = kpis || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, netProfit: 0 };

  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Sales Overview"
        breadcrumbs={[{ label: "Sales" }]}
      />
      <FilterBar />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Total Revenue"
          value={`$${kpiData.totalRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          trend={true}
          trendValue={8.5} // Calculate trend if available
          color="primary"
          loading={isLoading}
        />
        <KPICard
          title="Total Orders"
          value={kpiData.totalOrders.toLocaleString()}
          icon={ShoppingBagIcon}
          trend={true}
          trendValue={5.2}
          color="secondary"
          loading={isLoading}
        />
        <KPICard
          title="Avg Order Value"
          value={`$${kpiData.avgOrderValue.toFixed(2)}`}
          icon={CreditCardIcon}
          trend={true}
          trendValue={-1.2}
          color="accent"
          loading={isLoading}
        />
        <KPICard
          title="Net Profit"
          value={`$${kpiData.netProfit.toLocaleString()}`}
          icon={ChartPieIcon}
          trend={true}
          trendValue={10.5}
          color="success"
          loading={isLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SalesTrends data={trends.data} loading={trends.status === "loading"} />
        </div>
        <div className="lg:col-span-1">
          <SalesByOrderType data={byOrderType.data} loading={byOrderType.status === "loading"} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-6">
        <TopSellingItemsTable data={topItems.data} loading={topItems.status === "loading"} />
      </div>
    </AnalyticsContainer>
  );
}

export default SalesOverview;
