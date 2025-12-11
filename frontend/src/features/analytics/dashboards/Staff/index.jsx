import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import StaffPerformanceChart from "./components/StaffPerformanceChart";
import StaffTable from "./components/StaffTable";
import KPICard from "../../components/cards/KPICard";
import UserGroupIcon from "@heroicons/react/24/solid/UserGroupIcon";
import CurrencyDollarIcon from "@heroicons/react/24/solid/CurrencyDollarIcon";
import ClockIcon from "@heroicons/react/24/solid/ClockIcon";
import { fetchStaffData, selectStaffPerformance, selectLaborCost, selectStaffList } from "../../slices/staffAnalyticsSlice";

function StaffAnalytics() {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.analyticsGlobal);
  const performance = useSelector(selectStaffPerformance);
  const laborCost = useSelector(selectLaborCost);
  const staffList = useSelector(selectStaffList);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(fetchStaffData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }));
    }
  }, [dispatch, dateRange]);

  const isLoading = performance.status === "loading";
  const activeStaff = performance.data.length;

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
          value={activeStaff || 0}
          icon={UserGroupIcon}
          trend={false}
          color="primary"
          loading={isLoading}
        />
        <KPICard
          title="Rev. / Active Staff"
          value={`$${(activeStaff > 0 && performance.data 
            ? Math.round(performance.data.reduce((acc, curr) => acc + curr.sales, 0) / activeStaff) 
            : 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          trend={false}
          color="secondary"
          loading={isLoading}
        />
        <KPICard
          title="Top Performer Sales"
          value={`$${(performance.data && performance.data.length > 0 
            ? performance.data[0].sales.toLocaleString() 
            : "0")}`}
          icon={CurrencyDollarIcon}
          trend={true}
          trendValue={null} 
          color="success"
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <StaffPerformanceChart data={performance.data} loading={isLoading} />
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        <StaffTable data={staffList.data} loading={staffList.status === "loading"} />
      </div>
    </AnalyticsContainer>
  );
}

export default StaffAnalytics;
