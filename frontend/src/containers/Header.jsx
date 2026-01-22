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
// import { getTourId } from "../utils/Helpers";
// import TourTriggerButton from "../features/onboarding/components/TourTriggerButton";
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
    localStorage.getItem("theme"),
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
      }),
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
      <div className="navbar sticky top-0 bg-base-100/80 backdrop-blur-md z-50 shadow-lg transition-all duration-300 flex justify-between">
        {/* Menu toogle for mobile view or small screen */}
        <div className="">
          <label
            htmlFor="left-sidebar-drawer"
            className="btn btn-ghost btn-circle lg:hidden hover:bg-base-200 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
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
                {/* {getTourId(location.pathname) && (
                  <li>
                    <div className="p-0">
                      <TourTriggerButton
                        tourId={getTourId(location.pathname)}
                        className="btn-ghost btn-sm w-full justify-start font-normal"
                      />
                    </div>
                  </li>
                )} */}
                <div className="divider my-1"></div>
                <li className="menu-title">Theme</li>
                <li>
                  <div className="grid grid-cols-2 gap-1 p-2 max-h-64 overflow-y-auto">
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="light"
                    >
                      ☀️ Light
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="dark"
                    >
                      🌙 Dark
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="cupcake"
                    >
                      🧁 Cupcake
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="bumblebee"
                    >
                      🐝 Bumblebee
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="emerald"
                    >
                      💚 Emerald
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="corporate"
                    >
                      🏢 Corporate
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="synthwave"
                    >
                      🌃 Synthwave
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="retro"
                    >
                      📼 Retro
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="cyberpunk"
                    >
                      🤖 Cyberpunk
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="valentine"
                    >
                      💝 Valentine
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="halloween"
                    >
                      🎃 Halloween
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="garden"
                    >
                      🌸 Garden
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="forest"
                    >
                      🌲 Forest
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="aqua"
                    >
                      🌊 Aqua
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="lofi"
                    >
                      📻 Lofi
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="pastel"
                    >
                      🎨 Pastel
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="fantasy"
                    >
                      🧚 Fantasy
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="wireframe"
                    >
                      📐 Wireframe
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="black"
                    >
                      ⚫ Black
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="luxury"
                    >
                      💎 Luxury
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="dracula"
                    >
                      🧛 Dracula
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="cmyk"
                    >
                      🖨️ CMYK
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="autumn"
                    >
                      🍂 Autumn
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="business"
                    >
                      💼 Business
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="acid"
                    >
                      🧪 Acid
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="lemonade"
                    >
                      🍋 Lemonade
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="night"
                    >
                      🌃 Night
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="coffee"
                    >
                      ☕ Coffee
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="winter"
                    >
                      ❄️ Winter
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="dim"
                    >
                      🔅 Dim
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="nord"
                    >
                      🏔️ Nord
                    </button>
                    <button
                      className="btn btn-xs btn-outline"
                      data-set-theme="sunset"
                    >
                      🌅 Sunset
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Desktop View Utils */}
          <div className="hidden lg:flex items-center">
            <button
              className="btn btn-sm btn-ghost rounded-full mx-1 hover:bg-base-200 transition-all duration-200"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-5 w-5" />
              <span className="hidden xl:inline ml-2 font-medium">Refresh</span>
            </button>

            <button
              className={`btn btn-sm rounded-full mx-1 gap-2 transition-all duration-200 ${
                !isOnline
                  ? "btn-error text-white shadow-sm"
                  : queueStats.total > 0
                    ? "btn-warning text-white shadow-sm"
                    : "btn-ghost hover:bg-base-200"
              }`}
              onClick={() => setShowSyncManager(true)}
            >
              {!isOnline ? (
                <WifiOff className="w-4 h-4" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              <span className="hidden xl:inline font-medium">
                {!isOnline
                  ? "Offline"
                  : queueStats.total > 0
                    ? `Sync (${queueStats.total})`
                    : "Synced"}
              </span>
            </button>

            {/* {getTourId(location.pathname) && (
              <TourTriggerButton
                tourId={getTourId(location.pathname)}
                className="mx-1"
              />
            )} */}

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-sm btn-ghost rounded-full shadow-none hover:bg-base-200 mx-1 transition-all duration-200"
              >
                <PaletteIcon className="h-5 w-5" />
                <span className="hidden xl:inline ml-2 font-medium">Theme</span>
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[6000] menu p-3 shadow-2xl bg-base-100 rounded-box w-[600px] mt-2 grid grid-cols-4 gap-1"
              >
                <li>
                  <a
                    data-set-theme="light"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    ☀️ Light
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="dark"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🌙 Dark
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="cupcake"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🧁 Cupcake
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="bumblebee"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🐝 Bumblebee
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="emerald"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    💚 Emerald
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="corporate"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🏢 Corporate
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="synthwave"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🌃 Synthwave
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="retro"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    📼 Retro
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="cyberpunk"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🤖 Cyberpunk
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="valentine"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    💝 Valentine
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="halloween"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🎃 Halloween
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="garden"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🌸 Garden
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="forest"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🌲 Forest
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="aqua"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🌊 Aqua
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="lofi"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    📻 Lofi
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="pastel"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🎨 Pastel
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="fantasy"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🧚 Fantasy
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="wireframe"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    📐 Wireframe
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="black"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    ⚫ Black
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="luxury"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    💎 Luxury
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="dracula"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🧛 Dracula
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="cmyk"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🖨️ CMYK
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="autumn"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🍂 Autumn
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="business"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    💼 Business
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="acid"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🧪 Acid
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="lemonade"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🍋 Lemonade
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="night"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🌃 Night
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="coffee"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    ☕ Coffee
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="winter"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    ❄️ Winter
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="dim"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🔅 Dim
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="nord"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🏔️ Nord
                  </a>
                </li>
                <li>
                  <a
                    data-set-theme="sunset"
                    data-act-class="active"
                    className="py-2 text-xs"
                  >
                    🌅 Sunset
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
              className="btn btn-ghost btn-circle avatar btn-sm md:btn-md hover:bg-base-200 transition-all duration-200 ring-2 ring-transparent hover:ring-primary/20"
            >
              <UserCircle2 className="size-full text-base-content/80" />
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
