import { themeChange } from "theme-change";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../app/authSlice";
import { clearActiveStore } from "../features/common/storeSlice";

import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import { openRightDrawer } from "../features/common/rightDrawerSlice";
import { RIGHT_DRAWER_TYPES } from "../utils/globalConstantUtil";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Paintbrush,
  PanelTopOpen,
  PaletteIcon,
  Database,
  WifiOff,
  User,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";
// import { getTourId } from "../utils/Helpers";
// import TourTriggerButton from "../features/onboarding/components/TourTriggerButton";
import {
  useOnlineStatus,
  useSyncQueue,
  useSyncStatus,
} from "../features/common/hooks/useOffline";
import SyncManager from "../components/SyncManager";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { noOfNotifications, pageTitle } = useSelector((state) => state.header);
  const { activeStore } = useSelector((state) => state.commonStore);
  const { user } = useSelector((state) => state.auth);

  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme"),
  );
  const isOnline = useOnlineStatus();
  const { queueStats } = useSyncQueue();
  const { syncing, error } = useSyncStatus();
  const [showSyncManager, setShowSyncManager] = useState(false);

  const location = useLocation();

  useEffect(() => {
    themeChange(false);
    if (currentTheme === null) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setCurrentTheme("dark");
      } else {
        setCurrentTheme("light");
      }
    }
    // 👆 false parameter is required for react project
  }, []);

  // Opening right sidebar for notification
  const openNotification = () => {
    dispatch(
      openRightDrawer({
        header: "Notifications",
        bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION,
      }),
    );
  };

  async function logoutUserHandler() {
    await dispatch(logoutUser());
    dispatch(clearActiveStore());
    navigate("/login");
  }

  // Show store badge only for multi-store users
  const showStoreBadge = user?.stores?.length > 1 && activeStore?.name;

  // Check if impersonating
  const impersonatingOrg = localStorage.getItem("impersonatingOrg");
  const impersonatingOrgName = localStorage.getItem("impersonatingOrgName");
  const isImpersonating = !!impersonatingOrg && user?.isSuperAdmin;

  const exitImpersonation = () => {
    const originalStoreId = localStorage.getItem("originalStoreId");
    localStorage.removeItem("impersonatingOrg");
    localStorage.removeItem("impersonatingOrgName");
    localStorage.removeItem("originalStoreId");
    if (originalStoreId) {
      localStorage.setItem("activeStoreId", originalStoreId);
    }
    window.location.href = "/app/platform-admin";
  };

  return (
    <>
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-warning text-warning-content px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">👁️ Viewing as owner of: {impersonatingOrgName}</span>
            <span className="text-sm opacity-80">(You can perform any action in this restaurant)</span>
          </div>
          <button 
            onClick={exitImpersonation}
            className="btn btn-sm btn-ghost bg-warning-content/10 hover:bg-warning-content/20"
          >
            Exit View
          </button>
        </div>
      )}
      <div className="navbar sticky top-0 bg-base-100 z-[90] shadow-md">
        {/* Navbar Start: Left side items */}
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          {/* Mobile Toggle */}
          <div className="lg:hidden border-x ">
            <label
              htmlFor="left-sidebar-drawer"
              className="btn btn-square btn-ghost btn-sm"
            >
              <Bars3Icon className="h-6 w-6" />
            </label>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:flex items-center overflow-hidden">
            <span className="text-xl font-semibold truncate">
              {pageTitle}
              {showStoreBadge && (
                <span className="ml-2 badge badge-primary badge-sm whitespace-nowrap">
                  {activeStore.name}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Navbar Center: POS Button (Truly Centered via flex-1 sides) */}
        <div className="flex-none flex">
          <Link
            to="/app/pos"
            className="btn btn-primary btn-sm gap-2 rounded-full shadow-md px-6"
          >
            <ShoppingCart className="h-4 w-4" />
            POS
          </Link>
        </div>

        {/* Navbar End: Utilities */}
        <div className="flex-1 flex justify-end items-center gap-2">
          {/* Mobile Sync Indicator (Always Visible) */}
          <div className="lg:hidden mr-2">
            <button
              className={`btn btn-circle btn-ghost btn-sm ${
                !isOnline || queueStats.total > 0
                  ? "text-warning bg-warning/10"
                  : error
                    ? "text-error bg-error/10"
                    : "text-base-content"
              }`}
              onClick={() => setShowSyncManager(true)}
            >
              {!isOnline ? (
                <WifiOff className="h-5 w-5" />
              ) : syncing ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : error ? (
                <WifiOff className="h-5 w-5" />
              ) : (
                <div className="indicator">
                  <Database className="h-5 w-5" />
                  {queueStats.total > 0 && (
                    <span className="badge badge-xs badge-warning indicator-item"></span>
                  )}
                </div>
              )}
            </button>
          </div>

          {/* Mobile View Utils Dropdown */}
          <div className="dropdown dropdown-end lg:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <ChevronDown className="h-6 w-6" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-4"
            >
              <li>
                <button onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </li>
              <li>
                <details>
                  <summary className="flex items-center gap-2">
                    <PaletteIcon className="h-4 w-4" />
                    Theme
                  </summary>
                  <ul className="p-2 bg-base-100 rounded-t-none">
                    <li>
                      <a data-set-theme="codeket-rms">🍽️ Codeket RMS</a>
                    </li>
                    <li>
                      <a data-set-theme="light">☀️ Light</a>
                    </li>
                    <li>
                      <a data-set-theme="dark">🌙 Dark</a>
                    </li>
                    <li>
                      <a data-set-theme="cupcake">🧁 Cupcake</a>
                    </li>
                    <li>
                      <a data-set-theme="winter">❄️ Winter</a>
                    </li>
                    <li>
                      <a data-set-theme="dim">🔅 Dim</a>
                    </li>
                    <li>
                      <a data-set-theme="nord">🏔️ Nord</a>
                    </li>
                    <li>
                      <a data-set-theme="sunset">🌅 Sunset</a>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </div>

          {/* Desktop View Utils */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              className="btn btn-ghost rounded-full btn-outline btn-sm gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              className={`btn rounded-full btn-outline btn-sm gap-2 ${
                !isOnline || queueStats.total > 0
                  ? "bg-warning/10 text-warning border-warning/20"
                  : error
                    ? "bg-error/10 text-error border-error/20"
                    : "btn-ghost hover:bg-base-200/50 hover:border-base-content/5"
              }`}
              onClick={() => setShowSyncManager(true)}
            >
              {!isOnline ? (
                <WifiOff className="h-4 w-4" />
              ) : syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : error ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {!isOnline
                ? "Offline"
                : syncing
                  ? "Syncing..."
                  : queueStats.total > 0
                    ? `Sync (${queueStats.total})`
                    : "Synced"}
            </button>

            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="btn rounded-full btn-outline btn-sm gap-2 whitespace-nowrap"
              >
                <PaletteIcon className="h-4 w-4" />
                Theme
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-4"
              >
                <li>
                  <a data-set-theme="codeket-rms">🍽️ Codeket RMS</a>
                </li>
                <li>
                  <a data-set-theme="light">☀️ Light</a>
                </li>
                <li>
                  <a data-set-theme="dark">🌙 Dark</a>
                </li>
                <li>
                  <a data-set-theme="cupcake">🧁 Cupcake</a>
                </li>
                <li>
                  <a data-set-theme="winter">❄️ Winter</a>
                </li>
                <li>
                  <a data-set-theme="dim">🔅 Dim</a>
                </li>
                <li>
                  <a data-set-theme="nord">🏔️ Nord</a>
                </li>
                <li>
                  <a data-set-theme="sunset">🌅 Sunset</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Profile icon, opening menu on click */}
          <div className="dropdown dropdown-end ml-4">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle border border-base-content/10 bg-base-200 flex items-center justify-center"
            >
              <User className="h-5 w-5 text-base-content" strokeWidth={2} />
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="justify-between">
                <Link to="/app/settings/profile">
                  Profile Settings
                  <span className="badge">New</span>
                </Link>
              </li>
              <li>
                <Link to="/app/settings-billing">Bill History</Link>
              </li>
              <div className="divider mt-0 mb-0"></div>
              <li>
                <button onClick={logoutUserHandler}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showSyncManager && (
        <SyncManager onClose={() => setShowSyncManager(false)} />
      )}
    </>
  );
}

export default Header;
