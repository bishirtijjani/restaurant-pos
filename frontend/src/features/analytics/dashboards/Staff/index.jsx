import React from "react";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import StaffPerformanceChart from "./components/StaffPerformanceChart";
import StaffTable from "./components/StaffTable";
import KPICard from "../../components/cards/KPICard";
import UserGroupIcon from "@heroicons/react/24/solid/UserGroupIcon";
import CurrencyDollarIcon from "@heroicons/react/24/solid/CurrencyDollarIcon";
import ClockIcon from "@heroicons/react/24/solid/ClockIcon";

function StaffAnalytics() {
  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Staff Analytics"
        breadcrumbs={[{ label: "Staff" }]}
      />
      <FilterBar />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KPICard
          title="Active Staff"
          value="12"
          icon={UserGroupIcon}
          trend={false}
          color="primary"
        />
        <KPICard
          title="Labor Cost %"
          value="22%"
          icon={CurrencyDollarIcon}
          trend={true}
          trendValue={-1.5}
          color="secondary"
        />
        <KPICard
          title="Avg Sales / Waiter"
          value="$850"
          icon={CurrencyDollarIcon}
          trend={true}
          trendValue={5.0}
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <StaffPerformanceChart />
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        <StaffTable />
      </div>
    </AnalyticsContainer>
  );
}

export default StaffAnalytics;
