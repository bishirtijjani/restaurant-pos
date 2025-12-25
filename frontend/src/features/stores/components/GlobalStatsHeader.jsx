import React from "react";
import { useSelector } from "react-redux";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

function GlobalStatsHeader() {
  const { globalOverview, globalLoading } = useSelector(
    (state) => state.stores
  );

  if (globalLoading && !globalOverview) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-base-200 animate-pulse rounded-xl"
          ></div>
        ))}
      </div>
    );
  }

  if (!globalOverview || globalOverview.stores.length === 0) return null;

  const { summary, alerts, brandName } = globalOverview;
  const isMultiStore = globalOverview.stores.length > 1;

  const stats = [
    {
      title: isMultiStore ? "Brand Revenue" : "Total Revenue",
      value: `₦${summary.totalRevenue.toLocaleString()}`,
      icon: <CurrencyDollarIcon className="w-6 h-6 text-success" />,
      description: isMultiStore
        ? "Across all locations"
        : "Today's performance",
      color: "text-success",
    },
    {
      title: "Active Load",
      value: summary.activeOrders,
      icon: <ShoppingCartIcon className="w-6 h-6 text-primary" />,
      description: "Live orders currently",
      color: "text-primary",
    },
    {
      title: "Stock Alerts",
      value: summary.lowStockTotal,
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-warning" />,
      description: "Total low stock items",
      color: "text-warning",
    },
    {
      title: "Total Orders",
      value: summary.totalOrders,
      icon: <UsersIcon className="w-6 h-6 text-info" />,
      description: "Successfully processed",
      color: "text-info",
    },
  ];

  return (
    <div className="mb-8">
      {brandName && isMultiStore && (
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-base-content/80">
            {brandName}
          </h2>
          <div className="badge badge-outline badge-sm">Multi-Store Group</div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="card bg-base-100 shadow-sm border border-base-200"
          >
            <div className="card-body p-4 flex-row items-center gap-4">
              <div className="p-3 bg-base-200 rounded-lg">{stat.icon}</div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </h3>
                <p className="text-[10px] text-gray-400">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        >
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex-none flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                alert.severity === "high"
                  ? "bg-error/10 border-error/20 text-error"
                  : "bg-warning/10 border-warning/20 text-warning"
              }`}
            >
              <span className="font-bold uppercase">[{alert.storeName}]</span>
              <span>{alert.message}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default GlobalStatsHeader;
