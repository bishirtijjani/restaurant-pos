import React from "react";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import CustomerRetentionChart from "./components/CustomerRetentionChart";
import CustomerSegmentationChart from "./components/CustomerSegmentationChart";
import TopCustomersTable from "./components/TopCustomersTable";
import KPICard from "../../components/cards/KPICard";
import UserGroupIcon from "@heroicons/react/24/solid/UserGroupIcon";
import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";
import ArrowPathIcon from "@heroicons/react/24/solid/ArrowPathIcon";
import CurrencyDollarIcon from "@heroicons/react/24/solid/CurrencyDollarIcon";

function CustomerInsights() {
  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Customer Insights"
        breadcrumbs={[{ label: "Customers" }]}
      />
      <FilterBar />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Total Customers"
          value="1,250"
          icon={UserGroupIcon}
          trend={true}
          trendValue={12}
          color="primary"
        />
        <KPICard
          title="New Customers"
          value="45"
          icon={UserPlusIcon}
          trend={true}
          trendValue={8}
          color="secondary"
        />
        <KPICard
          title="Repeat Rate"
          value="35%"
          icon={ArrowPathIcon}
          trend={true}
          trendValue={2.5}
          color="accent"
        />
        <KPICard
          title="Avg Lifetime Value"
          value="$450"
          icon={CurrencyDollarIcon}
          trend={true}
          trendValue={5.0}
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomerRetentionChart />
        <CustomerSegmentationChart />
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        <TopCustomersTable />
      </div>
    </AnalyticsContainer>
  );
}

export default CustomerInsights;
