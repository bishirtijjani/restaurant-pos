import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import OverviewKPIs from "./components/OverviewKPIs";
import HourlyTrendChart from "./components/HourlyTrendChart";
import RecentActivity from "./components/RecentActivity";
import { setDateRange } from "../../slices/analyticsGlobalSlice";
import { startOfDay, endOfDay } from "date-fns";

function AnalyticsOverview() {
  const dispatch = useDispatch();

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

  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Today's Snapshot"
        breadcrumbs={[{ label: "Overview" }]}
      />
      
      {/* 
          For "Today's Snapshot", we might not need the full DateRangePicker 
          if it's strictly "Today", but the design said "Interaction with global filters (locked to Today)".
          We can hide the date picker or disable it. 
          For now, I'll show it but it will be set to Today.
      */}
      <FilterBar showDateRange={false}>
        <div className="badge badge-primary badge-lg">Live View</div>
      </FilterBar>

      <OverviewKPIs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HourlyTrendChart />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </AnalyticsContainer>
  );
}

export default AnalyticsOverview;
