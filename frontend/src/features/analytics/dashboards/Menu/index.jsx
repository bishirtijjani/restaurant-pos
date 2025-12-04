import React from "react";
import AnalyticsContainer from "../../components/common/AnalyticsContainer";
import AnalyticsHeader from "../../components/common/AnalyticsHeader";
import FilterBar from "../../components/common/FilterBar";
import MenuEngineeringMatrix from "./components/MenuEngineeringMatrix";
import CategoryPerformance from "./components/CategoryPerformance";
import KPICard from "../../components/cards/KPICard";
import TagIcon from "@heroicons/react/24/solid/TagIcon";
import StarIcon from "@heroicons/react/24/solid/StarIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon";

function MenuIntelligence() {
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
          value="45"
          icon={TagIcon}
          trend={false}
          color="primary"
        />
        <KPICard
          title="Star Items (High Profit/Pop)"
          value="8"
          icon={StarIcon}
          trend={true}
          trendValue={2}
          color="success"
        />
        <KPICard
          title="Dog Items (Low Profit/Pop)"
          value="5"
          icon={ExclamationTriangleIcon}
          trend={false}
          color="error"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MenuEngineeringMatrix />
        <CategoryPerformance />
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
