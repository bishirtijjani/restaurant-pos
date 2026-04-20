import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showNotification } from "../common/headerSlice";
import {
  BuildingOfficeIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

function StatCard({ title, value, icon: Icon, trend, trendValue, color }) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-green-500/10 text-green-600",
    purple: "bg-purple-500/10 text-purple-600",
    orange: "bg-orange-500/10 text-orange-600",
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-60">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {trend && (
              <div className={`flex items-center gap-1 text-sm mt-2 ${trend === "up" ? "text-success" : "text-error"}`}>
                {trend === "up" ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Try to fetch platform stats - this would need a backend endpoint
      // For now, just fetch organizations count
      const res = await axios.get("/api/platform-admin/organizations");
      const orgs = res.data.data || [];
      
      setStats({
        totalOrganizations: orgs.length,
        activeOrganizations: orgs.filter(o => o.status === "active").length,
        suspendedOrganizations: orgs.filter(o => o.status === "suspended").length,
        totalStores: orgs.reduce((sum, o) => sum + (o.storeCount || 0), 0),
      });
    } catch (error) {
      console.error("Error fetching stats", error);
      dispatch(showNotification({ message: "Failed to load dashboard stats", status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-sm opacity-60 mt-1">
          Platform overview and system management
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Organizations"
            value={stats?.totalOrganizations || 0}
            icon={BuildingOfficeIcon}
            color="blue"
          />
          <StatCard
            title="Active Organizations"
            value={stats?.activeOrganizations || 0}
            icon={BuildingOfficeIcon}
            color="green"
          />
          <StatCard
            title="Total Stores"
            value={stats?.totalStores || 0}
            icon={ShoppingBagIcon}
            color="purple"
          />
          <StatCard
            title="Suspended"
            value={stats?.suspendedOrganizations || 0}
            icon={BuildingOfficeIcon}
            color="orange"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-lg">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <a href="/super-admin/organizations" className="btn btn-outline justify-start gap-2">
              <BuildingOfficeIcon className="w-5 h-5" />
              Manage Organizations
            </a>
            <a href="/super-admin/users" className="btn btn-outline justify-start gap-2">
              <UsersIcon className="w-5 h-5" />
              View All Users
            </a>
            <a href="/super-admin/platform-health" className="btn btn-outline justify-start gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5" />
              System Health
            </a>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-lg">Platform Status</h3>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60">Database</span>
                <span className="badge badge-success badge-sm">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60">API Server</span>
                <span className="badge badge-success badge-sm">Running</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60">WebSocket</span>
                <span className="badge badge-success badge-sm">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-lg">Recent Activity</h3>
            <p className="text-sm opacity-60 mt-4">
              Activity logs would appear here - new signups, plan changes, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
