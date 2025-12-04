import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import MenuEngineeringMatrix from "./components/MenuEngineeringMatrix";
import CategoryPerformance from "./components/CategoryPerformance";
import KPICard from "../../components/cards/KPICard";
import TagIcon from "@heroicons/react/24/solid/TagIcon";
import StarIcon from "@heroicons/react/24/solid/StarIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon";
import { fetchMenuData, selectMenuMatrix, selectCategoryPerformance } from "../../slices/menuAnalyticsSlice";

function MenuIntelligence() {
  const dispatch = useDispatch();
  const { dateRange } = useSelector((state) => state.analyticsGlobal);
  const matrix = useSelector(selectMenuMatrix);
  const categoryPerformance = useSelector(selectCategoryPerformance);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(fetchMenuData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }));
    }
  }, [dispatch, dateRange]);

  const isLoading = matrix.status === "loading";
  
  // Calculate KPIs from data
  const totalItems = matrix.data.length;
  const starItems = matrix.data.filter(i => i.quadrant === "Star").length;
  const dogItems = matrix.data.filter(i => i.quadrant === "Dog").length;

  return (
    <AnalyticsContainer>
      <AnalyticsHeader
        title="Menu Intelligence"
        breadcrumbs={[{ label: "Menu" }]}
      />
      <FilterBar />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KPICard
          title="Total Menu Items"
          value={totalItems || 0}
          icon={TagIcon}
          trend={false}
          color="primary"
          loading={isLoading}
        />
        <KPICard
          title="Star Items (High Profit/Pop)"
          value={starItems || 0}
          icon={StarIcon}
          trend={true}
          trendValue={2}
          color="success"
          loading={isLoading}
        />
        <KPICard
          title="Dog Items (Low Profit/Pop)"
          value={dogItems || 0}
          icon={ExclamationTriangleIcon}
          trend={false}
          color="error"
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MenuEngineeringMatrix data={matrix.data} loading={isLoading} />
        <CategoryPerformance data={categoryPerformance.data} loading={categoryPerformance.status === "loading"} />
      </div>

      {/* Analysis Text / Recommendations */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h3 className="card-title text-lg">Recommendations</h3>
          <ul className="list-disc list-inside text-sm text-base-content/80 space-y-2">
            <li>
              Promote <strong>Steak</strong> (Puzzle): High profit but low sales. Consider a special offer.
            </li>
            <li>
              Review <strong>Salad</strong> (Dog): Low profit and low sales. Consider removing or reformulating.
            </li>
            <li>
              Maintain <strong>Burger</strong> (Star): Doing great! Ensure consistent quality.
            </li>
          </ul>
        </div>
      </div>
    </AnalyticsContainer>
  );
}

export default MenuIntelligence;
