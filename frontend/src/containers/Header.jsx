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
  ChevronDownIcon,
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

  return (
    <>
      <div className="navbar sticky top-0 bg-base-100 z-10 shadow-md">
        {/* Menu toggle for mobile view or small screen */}
        <div className="flex-none lg:hidden">
          <label
            htmlFor="left-sidebar-drawer"
            className="btn btn-square btn-ghost"
          >
            <Bars3Icon className="h-6 inline-block w-6" />
          </label>
        </div>

        <div className="flex-1">
          <span className="text-xl font-semibold">
            {pageTitle}
            {showStoreBadge && (
              <span className="ml-2 badge badge-primary badge-sm">
                {activeStore.name}
              </span>
            )}
          </span>
          <span className="text-sm text-base-content/60 ml-2 hidden sm:inline">
            Management System
          </span>
        </div>

        {/* Right side utility buttons and profile */}
        <div className="flex-none">
          {/* Mobile View Utils Dropdown */}
          <div className="dropdown dropdown-end lg:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <PanelTopOpen className="h-6 w-6" />
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
                <button
                  className={`${!isOnline || queueStats.total > 0 ? "text-warning" : ""} ${error ? "text-error" : ""}`}
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
              </li>
              <li>
                <details>
                  <summary className="flex items-center gap-2">
                    <PaletteIcon className="h-4 w-4" />
                    Theme
                  </summary>
                  <ul className="p-2 bg-base-100 rounded-t-none">
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
                className="btn rounded-full btn-outline btn-sm gap-2"
              >
                <PaletteIcon className="h-4 w-4" />
                Theme
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-4"
              >
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
                <Link to="/app/settings-profile">
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
