import React from "react";
import { useSelector } from "react-redux";
import KPICard from "../../../components/cards/KPICard";
import CurrencyDollarIcon from "@heroicons/react/24/solid/CurrencyDollarIcon";
import ShoppingCartIcon from "@heroicons/react/24/solid/ShoppingCartIcon";
import UserGroupIcon from "@heroicons/react/24/solid/UserGroupIcon";
import ClockIcon from "@heroicons/react/24/solid/ClockIcon";
import { selectSettings } from "../../../../settings/generalSettings/generalSettingsSlice";

export default function OverviewKPIs({ data, loading }) {
  const settings = useSelector(selectSettings);
  const currency = settings?.currency?.symbol || "";

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-32 w-full"></div>
        ))}
      </div>
    );
  }

  const { totalRevenue, totalOrders, avgOrderValue, activeStaff } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <KPICard
        title="Net Sales (Today)"
        value={`${currency}${(totalRevenue || 0).toLocaleString()}`}
        icon={CurrencyDollarIcon}
        trend={false}
        color="primary"
      />
      <KPICard
        title="Active Orders"
        value={totalOrders || 0}
        icon={ShoppingCartIcon}
        trend={false}
        color="secondary"
      />
      <KPICard
        title="Avg Order Value"
        value={`${currency}${Math.round(avgOrderValue || 0)}`}
        icon={CurrencyDollarIcon}
        trend={false}
        color="accent"
      />
      <KPICard
        title="Active Staff"
        value={activeStaff || 0}
        icon={UserGroupIcon}
        trend={false}
        color="info"
      />
    </div>
  );
}
