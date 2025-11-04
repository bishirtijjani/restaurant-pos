import { themeChange } from "theme-change";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import BellIcon from "@heroicons/react/24/outline/BellIcon";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import { openRightDrawer } from "../features/common/rightDrawerSlice";
import { RIGHT_DRAWER_TYPES } from "../utils/globalConstantUtil";
import { NavLink, Routes, Link, useLocation } from "react-router-dom";
import UserCircleIcon from "@heroicons/react/24/outline/UserCircleIcon";
import { RefreshCw, Paintbrush, PaletteIcon } from "lucide-react";
import { getTourId } from "../utils/Helpers";
import TourTriggerButton from "../features/onboarding/components/TourTriggerButton";

function Header() {
  const dispatch = useDispatch();
  const { noOfNotifications, pageTitle } = useSelector((state) => state.header);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme")
  );

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

  function logoutUser() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <>
      <div className="navbar sticky top-0 bg-base-100  z-10 shadow-md flex justify-between">
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
          </h1>
        </div>

        <button
          className="btn btn-sm rounded-box btn-outline mx-2 md:btn-md"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>

        <div className="flex-none ">
          {getTourId() && (
            <TourTriggerButton tourId={getTourId()} className="mr-2" />
          )}
          {/* Theme selection dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="theme-div btn btn-sm rounded-box btn-outline mx-2 md:btn-md"
            >
              <PaletteIcon className="h-5 w-5" />
              <span className="text-sm">Theme</span>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
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
              <div className="w-10 rounded-full">
                {/* <img src="#" alt="profile" /> */}
                <UserCircleIcon />
              </div>
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
                <a onClick={logoutUser}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
