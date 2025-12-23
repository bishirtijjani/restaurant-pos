// frontend/src/features/orders/mobile/MoreTab.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  HelpCircle,
  Clock,
  WifiOff,
  Wifi,
  RefreshCw,
  LogOut,
  User,
  Store,
  Bell,
  Shield,
  Info,
  ChevronRight,
} from "lucide-react";
import { useHaptic } from "../../../hooks/useHaptic";
import { logoutUser as logout } from "../../../app/authSlice";
import { addRecentOrder, setOfflineMode } from "../mobilePOSSlice";

/**
 * More Tab - Settings, quick actions, and app info
 * Features: Recent orders, settings, offline mode, help
 */
const MoreTab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const haptic = useHaptic();

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const { offlineMode, pendingOrders, recentOrders } = useSelector(
    (state) => state.mobilePOS
  );
  const { currentStore } = useSelector((state) => state.stores);

  // Quick actions
  const quickActions = [
    {
      icon: Clock,
      label: "Recent Orders",
      description: "View order history",
      onClick: () => {
        haptic.light();
        navigate("/app/orders");
      },
      badge: recentOrders.length > 0 ? recentOrders.length : null,
    },
    {
      icon: Settings,
      label: "Settings",
      description: "App preferences",
      onClick: () => {
        haptic.light();
        navigate("/app/settings/general");
      },
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get assistance",
      onClick: () => {
        haptic.light();
        // TODO: Open help modal
      },
    },
  ];

  // Account actions
  const accountActions = [
    {
      icon: User,
      label: "Profile",
      value: user?.name || "User",
      onClick: () => {
        haptic.light();
        navigate("/app/settings/profile");
      },
    },
    {
      icon: Store,
      label: "Current Store",
      value: currentStore?.name || "Store",
      onClick: () => {
        haptic.light();
        navigate("/app/stores");
      },
    },
    {
      icon: Shield,
      label: "Permissions",
      value: user?.role || "Role",
      onClick: () => {
        haptic.light();
        navigate("/app/users");
      },
    },
  ];

  // Handle offline toggle
  const handleOfflineToggle = () => {
    haptic.medium();
    dispatch(setOfflineMode(!offlineMode));
  };

  // Handle sync pending orders
  const handleSyncOrders = () => {
    haptic.success();
    // TODO: Implement sync logic
  };

  // Handle logout
  const handleLogout = () => {
    haptic.heavy();
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="h-full flex flex-col bg-base-200 overflow-y-auto">
      {/* Header */}
      <div className="bg-base-100 p-4 shadow-sm">
        <h2 className="text-xl font-bold">More</h2>
        <p className="text-sm text-base-content/60">
          Settings and quick actions
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Offline Mode */}
        <div className="bg-base-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {offlineMode ? (
                <WifiOff size={24} className="text-warning" />
              ) : (
                <Wifi size={24} className="text-success" />
              )}
              <div>
                <h3 className="font-semibold">Offline Mode</h3>
                <p className="text-xs text-base-content/60">
                  {offlineMode
                    ? "Orders will be queued"
                    : "Connected to server"}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={offlineMode}
              onChange={handleOfflineToggle}
              className="toggle toggle-primary"
            />
          </div>

          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div className="mt-3 p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {pendingOrders.length} pending{" "}
                  {pendingOrders.length === 1 ? "order" : "orders"}
                </span>
                <button
                  onClick={handleSyncOrders}
                  className="btn btn-sm btn-warning gap-2"
                >
                  <RefreshCw size={14} />
                  Sync Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-base-300">
            <h3 className="font-semibold">Quick Actions</h3>
          </div>
          <div className="divide-y divide-base-300">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-4 p-4 hover:bg-base-200 transition-colors"
                >
                  <Icon size={24} className="text-primary" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-base-content/60">
                      {action.description}
                    </div>
                  </div>
                  {action.badge && (
                    <span className="badge badge-primary">{action.badge}</span>
                  )}
                  <ChevronRight size={20} className="text-base-content/40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-base-300">
            <h3 className="font-semibold">Account</h3>
          </div>
          <div className="divide-y divide-base-300">
            {accountActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-4 p-4 hover:bg-base-200 transition-colors"
                >
                  <Icon size={24} className="text-base-content/60" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-base-content/60">
                      {action.value}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-base-content/40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-base-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Info size={20} className="text-info" />
            <h3 className="font-semibold">App Information</h3>
          </div>
          <div className="space-y-2 text-sm text-base-content/70">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span className="font-mono">2025.12.23</span>
            </div>
            <div className="flex justify-between">
              <span>Mode</span>
              <span className="badge badge-sm badge-primary">Mobile POS</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn btn-outline btn-error w-full gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>

        {/* Footer Spacing */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default MoreTab;
