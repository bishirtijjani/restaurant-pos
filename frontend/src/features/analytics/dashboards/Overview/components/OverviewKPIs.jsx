import React from "react";
import KPICard from "../../../components/cards/KPICard";
import CurrencyDollarIcon from "@heroicons/react/24/solid/CurrencyDollarIcon";
import ShoppingCartIcon from "@heroicons/react/24/solid/ShoppingCartIcon";
import UserGroupIcon from "@heroicons/react/24/solid/UserGroupIcon";
import ClockIcon from "@heroicons/react/24/solid/ClockIcon";

function OverviewKPIs({ data, loading }) {
  // Mock data if loading or null
  const kpis = data || {
    netSales: 1250.5,
    activeOrders: 8,
    occupancy: 45,
    avgWaitTime: 12,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <KPICard
        title="Net Sales (Today)"
        value={`$${kpis.netSales.toLocaleString()}`}
        icon={CurrencyDollarIcon}
        trend={true}
        trendValue={12}
        color="primary"
      />
      <KPICard
        title="Active Orders"
        value={kpis.activeOrders}
        icon={ShoppingCartIcon}
        trend={false}
        color="secondary"
      />
      <KPICard
        title="Occupancy"
        value={`${kpis.occupancy}%`}
        icon={UserGroupIcon}
        trend={true}
        trendValue={-5}
        color="accent"
      />
      <KPICard
        title="Avg Wait Time"
        value={`${kpis.avgWaitTime} min`}
        icon={ClockIcon}
        trend={true}
        trendValue={-2} // Negative wait time is good? Maybe handle color logic
        color="info"
      />
    </div>
  );
}

export default OverviewKPIs;
