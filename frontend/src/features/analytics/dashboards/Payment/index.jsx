import React from "react";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import PaymentMethodsChart from "./components/PaymentMethodsChart";
import RefundsTable from "./components/RefundsTable";
import KPICard from "../../components/cards/KPICard";
import CreditCardIcon from "@heroicons/react/24/solid/CreditCardIcon";
import BanknotesIcon from "@heroicons/react/24/solid/BanknotesIcon";
import ArrowPathIcon from "@heroicons/react/24/solid/ArrowPathIcon";

function PaymentAnalytics() {
  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Payment Analytics"
        breadcrumbs={[{ label: "Payments" }]}
      />
      <FilterBar />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KPICard
          title="Total Collected"
          value="$12,450"
          icon={BanknotesIcon}
          trend={true}
          trendValue={8.5}
          color="primary"
        />
        <KPICard
          title="Refunds Processed"
          value="$120"
          icon={ArrowPathIcon}
          trend={false}
          color="error"
        />
        <KPICard
          title="Net Revenue"
          value="$12,330"
          icon={CreditCardIcon}
          trend={true}
          trendValue={8.2}
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PaymentMethodsChart />
        {/* Placeholder for another chart or metrics */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-lg mb-4">Cash vs Digital</h3>
            <div className="flex items-center justify-center h-64">
              <p className="text-base-content/50">Chart Placeholder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        <RefundsTable />
      </div>
    </AnalyticsContainer>
  );
}

export default PaymentAnalytics;
