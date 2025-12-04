import React from "react";
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

function SalesOverview() {
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
          value="$12,450"
          icon={CurrencyDollarIcon}
          trend={true}
          trendValue={8.5}
          color="primary"
        />
        <KPICard
          title="Total Orders"
          value="1,240"
          icon={ShoppingBagIcon}
          trend={true}
          trendValue={5.2}
          color="secondary"
        />
        <KPICard
          title="Avg Order Value"
          value="$42.50"
          icon={CreditCardIcon}
          trend={true}
          trendValue={-1.2}
          color="accent"
        />
        <KPICard
          title="Net Profit"
          value="$3,200"
          icon={ChartPieIcon}
          trend={true}
          trendValue={10.5}
          color="success"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SalesTrends />
        </div>
        <div className="lg:col-span-1">
          <SalesByOrderType />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-6">
        <TopSellingItemsTable />
      </div>
    </AnalyticsContainer>
  );
}

export default SalesOverview;
