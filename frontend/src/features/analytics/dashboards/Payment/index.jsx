import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import PaymentMethodsChart from "./components/PaymentMethodsChart";
import RefundsTable from "./components/RefundsTable";
import KPICard from "../../components/cards/KPICard";
import CreditCardIcon from "@heroicons/react/24/solid/CreditCardIcon";
import BanknotesIcon from "@heroicons/react/24/solid/BanknotesIcon";
import ArrowPathIcon from "@heroicons/react/24/solid/ArrowPathIcon";
import { fetchPaymentData, selectPaymentOverview, selectPaymentMethods, selectRefunds } from "../../slices/paymentAnalyticsSlice";

function PaymentAnalytics() {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.analyticsGlobal);
  const overview = useSelector(selectPaymentOverview);
  const paymentMethods = useSelector(selectPaymentMethods);
  const refunds = useSelector(selectRefunds);

  const { data: kpis, status } = overview;

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(fetchPaymentData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }));
    }
  }, [dispatch, dateRange]);

  const isLoading = status === "loading";
  const kpiData = kpis || { totalCollected: 0, refunds: 0, netRevenue: 0, avgTransaction: 0 };

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
          value={`$${kpiData.totalCollected.toLocaleString()}`}
          icon={BanknotesIcon}
          trend={true}
          trendValue={8.5}
          color="primary"
          loading={isLoading}
        />
        <KPICard
          title="Refunds Processed"
          value={`$${kpiData.refunds.toLocaleString()}`}
          icon={ArrowPathIcon}
          trend={false}
          color="error"
          loading={isLoading}
        />
        <KPICard
          title="Net Revenue"
          value={`$${kpiData.netRevenue.toLocaleString()}`}
          icon={CreditCardIcon}
          trend={true}
          trendValue={8.2}
          color="success"
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PaymentMethodsChart data={paymentMethods.data} loading={paymentMethods.status === "loading"} />
        
        {/* Cash vs Digital Split */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
           <div className="card-body">
              <h3 className="card-title text-lg mb-4">Cash vs Digital Split</h3>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-base-300 rounded w-3/4"></div>
                  <div className="h-4 bg-base-300 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                   {(() => {
                      const total = paymentMethods.data.reduce((acc, curr) => acc + curr.value, 0) || 1;
                      const cash = paymentMethods.data.find(p => p.name.toLowerCase() === 'cash')?.value || 0;
                      const digital = total - cash;
                      
                      const cashPct = Math.round((cash / total) * 100);
                      const digitalPct = 100 - cashPct;

                      return (
                        <>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Cash</span>
                              <span>{cashPct}%</span>
                            </div>
                            <progress className="progress progress-accent w-full" value={cashPct} max="100"></progress>
                            <p className="text-xs text-base-content/60 mt-1">${cash.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Digital (Card/Transfer)</span>
                              <span>{digitalPct}%</span>
                            </div>
                            <progress className="progress progress-primary w-full" value={digitalPct} max="100"></progress>
                            <p className="text-xs text-base-content/60 mt-1">${digital.toLocaleString()}</p>
                          </div>
                        </>
                      );
                   })()}
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        <RefundsTable data={refunds.data} loading={refunds.status === "loading"} />
      </div>
    </AnalyticsContainer>
  );
}

export default PaymentAnalytics;
