import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import TaxTrends from "./components/TaxTrends";
import TaxBreakdownTable from "./components/TaxBreakdownTable";
import KPICard from "../../components/cards/KPICard";
import CalculatorIcon from "@heroicons/react/24/solid/CalculatorIcon";
import BanknotesIcon from "@heroicons/react/24/solid/BanknotesIcon";
import PresentationChartLineIcon from "@heroicons/react/24/solid/PresentationChartLineIcon";
import ReceiptPercentIcon from "@heroicons/react/24/solid/ReceiptPercentIcon";
import {
  fetchTaxData,
  selectTaxOverview,
  selectTaxBreakdown,
  selectTaxTrends,
} from "../../slices/taxAnalyticsSlice";
import { selectSettings } from "../../../settings/generalSettings/generalSettingsSlice";

function TaxDashboard() {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.analyticsGlobal);
  const overview = useSelector(selectTaxOverview);
  const breakdown = useSelector(selectTaxBreakdown);
  const trends = useSelector(selectTaxTrends);
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  const { data: kpis, status } = overview;

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(
        fetchTaxData({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      );
    }
  }, [dispatch, dateRange]);

  const isLoading = status === "loading";
  const kpiData = kpis || {
    totalGross: 0,
    totalTax: 0,
    totalServiceCharge: 0,
    totalNet: 0,
    orderCount: 0,
    comparableRevenue: 0,
    totalTips: 0,
    totalRefunds: 0,
  };

  return (
    <AnalyticsContainer>
      <AnalyticsHeader title="Tax Report" breadcrumbs={[{ label: "Tax" }]} />
      <FilterBar />

      {/* KPIs Section 1: Revenue & Tax */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Gross Receipt"
          value={`${currency}${(kpiData.totalGross || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={BanknotesIcon}
          color="primary"
          loading={isLoading}
        />
        <KPICard
          title="Product Revenue"
          value={`${currency}${(kpiData.comparableRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={PresentationChartLineIcon}
          color="success"
          desc="Excl. Tips"
          loading={isLoading}
        />
        <KPICard
          title="Total Tax"
          value={`${currency}${(kpiData.totalTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={ReceiptPercentIcon}
          color="secondary"
          loading={isLoading}
        />
        <KPICard
          title="Service Charges"
          value={`${currency}${(kpiData.totalServiceCharge || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={CalculatorIcon}
          color="accent"
          loading={isLoading}
        />
      </div>

      {/* KPIs Section 2: Deductions & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <KPICard
          title="Total Tips"
          value={`${currency}${(kpiData.totalTips || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={BanknotesIcon}
          color="info"
          loading={isLoading}
        />
        <KPICard
          title="Net (Taxable) Revenue"
          value={`${currency}${(kpiData.totalNet || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={PresentationChartLineIcon}
          desc="Base for tax"
          loading={isLoading}
        />
        <KPICard
          title="Total Refunded"
          value={`${currency}${(kpiData.totalRefunds || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={BanknotesIcon}
          color="error"
          loading={isLoading}
        />
      </div>

      {/* Trends Chart */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <TaxTrends data={trends.data} loading={trends.status === "loading"} />
      </div>

      {/* Breakdown Table */}
      <div className="grid grid-cols-1 gap-6">
        <TaxBreakdownTable
          data={breakdown.data}
          loading={breakdown.status === "loading"}
        />
      </div>
    </AnalyticsContainer>
  );
}

export default TaxDashboard;
