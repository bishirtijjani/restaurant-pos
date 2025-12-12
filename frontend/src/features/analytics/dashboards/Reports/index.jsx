import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import ReportBuilder from "./components/ReportBuilder";
import SavedReportsList from "./components/SavedReportsList";
import { fetchReports } from "../../slices/customReportsSlice";

function CustomReports() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Custom Reports"
        breadcrumbs={[{ label: "Reports" }]}
      />
      <FilterBar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Saved Reports Sidebar */}
        <div className="lg:col-span-1 h-full">
          <SavedReportsList />
        </div>

        {/* Report Builder Area */}
        <div className="lg:col-span-2 h-full">
          <ReportBuilder />
        </div>
      </div>
    </AnalyticsContainer>
  );
}

export default CustomReports;
