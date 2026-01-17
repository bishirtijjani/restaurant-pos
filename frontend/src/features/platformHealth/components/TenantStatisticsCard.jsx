// frontend/src/features/platformHealth/components/TenantStatisticsCard.jsx
import React from "react";
import { Users, ShoppingBag, DollarSign, Building } from "lucide-react";

const TenantStatisticsCard = ({ metrics }) => {
  const { total, active, activeUsers, totalOrders, totalRevenue } = metrics;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(num);
  };

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-6">
        <h3 className="card-title text-lg flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-info" />
          Tenant Activity
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base-200/50 p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-base-content/60">Organizations</div>
              <div className="font-bold">
                {active}{" "}
                <span className="text-xs font-normal text-base-content/50">
                  / {total}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-base-200/50 p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-full text-secondary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-base-content/60">Active Users</div>
              <div className="font-bold">{formatNumber(activeUsers)}</div>
            </div>
          </div>

          <div className="bg-base-200/50 p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-full text-accent">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-base-content/60">Orders (24h)</div>
              <div className="font-bold">{formatNumber(totalOrders)}</div>
            </div>
          </div>

          <div className="bg-base-200/50 p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-full text-success">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-base-content/60">Revenue (24h)</div>
              <div className="font-bold">{formatCurrency(totalRevenue)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantStatisticsCard;
