import { themeChange } from "theme-change";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../app/authSlice";

import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import { openRightDrawer } from "../features/common/rightDrawerSlice";
import { RIGHT_DRAWER_TYPES } from "../utils/globalConstantUtil";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Paintbrush,
  PaletteIcon,
  Database,
  WifiOff,
  UserCircle2,
  ChevronDownIcon,
} from "lucide-react";
import { getTourId } from "../utils/Helpers";
import TourTriggerButton from "../features/onboarding/components/TourTriggerButton";
import {
  useOnlineStatus,
  useSyncQueue,
} from "../features/common/hooks/useOffline";
import SyncManager from "../components/SyncManager";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { noOfNotifications, pageTitle } = useSelector((state) => state.header);
  const { activeStore } = useSelector((state) => state.commonStore);
  const { user } = useSelector((state) => state.auth);

  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme")
  );
  const isOnline = useOnlineStatus();
  const { queueStats } = useSyncQueue();
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
      })
    );
  };

  async function logoutUserHandler() {
    await dispatch(logoutUser());

    // Clear other session-related storage
    localStorage.removeItem("activeStoreId");
    dispatch({ type: "store/clearActiveStore" });

    navigate("/login");
  }

  // Show store badge only for multi-store users
  const showStoreBadge = user?.stores?.length > 1 && activeStore?.name;

  return (
    <>
      <div className="navbar sticky top-0 bg-base-100  z-50 shadow-md flex justify-between">
        {/* Menu toogle for mobile view or small screen */}
        <div className="">
          <label
            htmlFor="left-sidebar-drawer"
            className="btn btn-primary drawer-button lg:hidden"
          >
            <Bars3Icon className="h-5 inline-block w-5" />
          </label>
          <h1 className="text-2xl font-semibold ml-2 hidden lg:block">
            {pageTitle}
            {showStoreBadge && (
              <span className="badge badge-primary badge-sm ml-3">
                {activeStore.name}
              </span>
            )}
          </h1>
        </div>

        {/* Right side utility buttons and profile */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile View Utils Dropdown */}
          <div className="lg:hidden">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                <RefreshCw className="h-5 w-5" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-3 z-[6000]"
              >
                <li>
                  <button onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4" /> Refresh
                  </button>
                </li>
                <li>
                  <button
                    className={`${
                      !isOnline
                        ? "text-error"
                        : queueStats.total > 0
                        ? "text-warning"
                        : ""
                    }`}
                    onClick={() => setShowSyncManager(true)}
                  >
                    {!isOnline ? (
                      <WifiOff className="w-4 h-4" />
                    ) : (
                      <Database className="w-4 h-4" />
                    )}
                    <span>
                      {!isOnline
                        ? "Offline"
                        : queueStats.total > 0
                        ? `Sync (${queueStats.total})`
                        : "Synced"}
                    </span>
                  </button>
                </li>
                {getTourId(location.pathname) && (
                  <li>
                    <div className="p-0">
                      <TourTriggerButton
                        tourId={getTourId(location.pathname)}
                        className="btn-ghost btn-sm w-full justify-start font-normal"
                      />
                    </div>
                  </li>
                )}
                <div className="divider my-1"></div>
                <li className="menu-title">Theme</li>
                <li>
                  <div className="grid grid-cols-2 gap-1 p-2">
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="light"
                    >
                      Light
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="dark"
                    >
                      Dark
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="retro"
                    >
                      Retro
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="luxury"
                    >
                      Luxury
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Desktop View Utils */}
          <div className="hidden lg:flex items-center">
            <button
              className="btn btn-sm btn-ghost rounded-box mx-1"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-5 w-5" />
              <span className="hidden xl:inline ml-2">Refresh</span>
            </button>

            <button
              className={`btn btn-sm rounded-box mx-1 gap-2 ${
                !isOnline
                  ? "btn-error"
                  : queueStats.total > 0
                  ? "btn-warning"
                  : "btn-ghost"
              }`}
              onClick={() => setShowSyncManager(true)}
            >
              {!isOnline ? (
                <WifiOff className="w-4 h-4" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              <span className="hidden xl:inline">
                {!isOnline
                  ? "Offline"
                  : queueStats.total > 0
                  ? `Sync (${queueStats.total})`
                  : "Synced"}
              </span>
            </button>

            {getTourId(location.pathname) && (
              <TourTriggerButton
                tourId={getTourId(location.pathname)}
                className="mx-1"
              />
            )}

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-sm btn-ghost rounded-box shadow-sm mx-1"
              >
                <PaletteIcon className="h-5 w-5" />
                <span className="hidden xl:inline ml-2">Theme</span>
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[6000] menu p-2 shadow-lg bg-base-100 rounded-box w-40 mt-2"
              >
                <li>
                  <a data-set-theme="light" data-act-class="active">
                    {" "}
                    Light{" "}
                  </a>
                </li>
                <li>
                  <a data-set-theme="dark" data-act-class="active">
                    {" "}
                    Dark{" "}
                  </a>
                </li>
                <li>
                  <a data-set-theme="retro" data-act-class="active">
                    {" "}
                    Retro{" "}
                  </a>
                </li>
                <li>
                  <a data-set-theme="lofi" data-act-class="active">
                    {" "}
                    Lofi{" "}
                  </a>
                </li>
                <li>
                  <a data-set-theme="black" data-act-class="active">
                    {" "}
                    Black{" "}
                  </a>
                </li>
                <li>
                  <a data-set-theme="luxury" data-act-class="active">
                    {" "}
                    Luxury{" "}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Profile icon, opening menu on click */}
          <div
            className="dropdown dropdown-end ml-2 md:ml-4"
            style={{ zIndex: 5000 }}
          >
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar btn-sm md:btn-md"
            >
              <UserCircle2 className="size-full" />
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="justify-between">
                <Link to={"/app/settings/profile"}>
                  Profile Settings
                  <span className="badge">New</span>
                </Link>
              </li>
              <li className="">
                <Link to={"/app/transactions"}>Bill History</Link>
              </li>
              <div className="divider mt-0 mb-0"></div>
              <li>
                <a onClick={logoutUserHandler}>Logout</a>
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
