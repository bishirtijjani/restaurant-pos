import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import OverviewKPIs from "./components/OverviewKPIs";
import HourlyTrendChart from "./components/HourlyTrendChart";
import RecentActivity from "./components/RecentActivity";
import { setDateRange, fetchOverviewData, selectOverviewData } from "../../slices/analyticsGlobalSlice";
import { startOfDay, endOfDay } from "date-fns";

function AnalyticsOverview() {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.analyticsGlobal);
  const { kpis, hourlyTrend, recentActivity, status } = useSelector(selectOverviewData);

  // Lock date range to Today on mount
  useEffect(() => {
    dispatch(
      setDateRange({
        startDate: startOfDay(new Date()).toISOString(),
        endDate: endOfDay(new Date()).toISOString(),
        label: "Today",
      })
    );
  }, [dispatch]);

  // Fetch data when date range changes
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(fetchOverviewData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        // branchId: "..." // Add branch selection logic later
      }));
    }
  }, [dispatch, dateRange]);

  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Today's Snapshot"
        breadcrumbs={[{ label: "Overview" }]}
      />
      
      <FilterBar showDateRange={false}>
        <div className="badge badge-primary badge-lg">Live View</div>
      </FilterBar>

      <OverviewKPIs data={kpis} loading={status === "loading"} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HourlyTrendChart data={hourlyTrend} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity data={recentActivity} />
        </div>
      </div>
    </AnalyticsContainer>
  );
}

export default AnalyticsOverview;
