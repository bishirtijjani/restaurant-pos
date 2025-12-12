import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import {
  fetchCustomerData,
  selectCustomerOverview,
  selectCustomerRetention,
  selectCustomerSegmentation,
  selectTopCustomers,
} from "../../slices/customerAnalyticsSlice";
import { selectSettings } from "../../../settings/generalSettings/generalSettingsSlice";

function CustomerInsights() {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.analyticsGlobal);
  const overview = useSelector(selectCustomerOverview);
  const retention = useSelector(selectCustomerRetention);
  const segmentation = useSelector(selectCustomerSegmentation);
  const topCustomers = useSelector(selectTopCustomers);
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  const { data: kpis, status } = overview;

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(
        fetchCustomerData({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        })
      );
    }
  }, [dispatch, dateRange]);

  const isLoading = status === "loading";
  const kpiData = kpis || {
    totalCustomers: 0,
    newCustomers: 0,
    repeatRate: 0,
    avgLTV: 0,
  };

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
          value={kpiData.totalCustomers.toLocaleString()}
          icon={UserGroupIcon}
          trend={true}
          trendValue={12}
          color="primary"
          loading={isLoading}
        />
        <KPICard
          title="New Customers"
          value={kpiData.newCustomers.toLocaleString()}
          icon={UserPlusIcon}
          trend={true}
          trendValue={8}
          color="secondary"
          loading={isLoading}
        />
        <KPICard
          title="Repeat Rate"
          value={`${kpiData.repeatRate}%`}
          icon={ArrowPathIcon}
          trend={true}
          trendValue={2.5}
          color="accent"
          loading={isLoading}
        />
        <KPICard
          title="Avg Lifetime Value"
          value={`${currency}${kpiData.avgLTV.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          trend={true}
          trendValue={5.0}
          color="success"
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomerRetentionChart
          data={retention.data}
          loading={retention.status === "loading"}
        />
        <CustomerSegmentationChart
          data={segmentation.data}
          loading={segmentation.status === "loading"}
        />
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        <TopCustomersTable
          data={topCustomers.data}
          loading={topCustomers.status === "loading"}
        />
      </div>
    </AnalyticsContainer>
  );
}

export default CustomerInsights;
