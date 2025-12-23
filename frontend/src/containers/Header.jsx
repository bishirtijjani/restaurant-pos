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

        <button
          className="btn btn-sm rounded-box mx-2 md:btn-md"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-5 w-5" />
          <span className="hidden md:inline">Refresh</span>
        </button>

        <div className="flex-none ">
          <button
            className={`btn btn-sm rounded-box mx-2 gap-2 ${
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
            <span className="hidden md:inline">
              {!isOnline
                ? "Offline"
                : queueStats.total > 0
                ? `Sync (${queueStats.total})`
                : "Synced"}
            </span>
          </button>
          {/* Tour Button */}
          {getTourId(location.pathname) && (
            <TourTriggerButton
              tourId={getTourId(location.pathname)}
              className="mr-2"
            />
          )}
          {/* Theme selection dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="theme-div btn btn-sm rounded-box shadow-sm mx-2 md:btn-md"
            >
              <PaletteIcon className="h-5 w-5" />
              <span className="hidden md:inline">Theme</span>
              <ChevronDownIcon className="h-5 w-5" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-40"
            >
              <li>
                <a data-set-theme="light" data-act-class="active">
                  Light
                </a>
              </li>
              <li>
                <a data-set-theme="dark" data-act-class="active">
                  Dark
                </a>
              </li>
              <li>
                <a data-set-theme="retro" data-act-class="active">
                  Retro
                </a>
              </li>
              <li>
                <a data-set-theme="lofi" data-act-class="active">
                  Lofi
                </a>
              </li>
              <li>
                <a data-set-theme="black" data-act-class="active">
                  Black
                </a>
              </li>
              <li>
                <a data-set-theme="luxury" data-act-class="active">
                  Luxury
                  <span className="badge badge-ghost">New</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Notification icon */}
          {/* <button
            className="btn btn-ghost ml-4  btn-circle"
            onClick={() => openNotification()}
          >
            <div className="indicator">
              <BellIcon className="h-6 w-6" />
              {noOfNotifications > 0 ? (
                <span className="indicator-item animate-[bounce_3s_linear_4s_infinite_alternate]  badge badge-secondary badge-sm">
                  {noOfNotifications}
                </span>
              ) : null}
            </div>
          </button> */}

          {/* Profile icon, opening menu on click */}
          <div className="dropdown dropdown-end ml-4 " style={{ zIndex: 5000 }}>
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
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
