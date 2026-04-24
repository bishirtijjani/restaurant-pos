import { adminRoutes, managerRoutes, staffRoutes } from "../routes/sidebar";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import ArrowLeftStartOnRectangleIcon from "@heroicons/react/24/outline/ArrowLeftStartOnRectangleIcon";
import QuestionMarkCircleIcon from "@heroicons/react/24/outline/QuestionMarkCircleIcon";
import { jwtDecode } from "jwt-decode";
import SessionExpired from "../features/common/components/SessionExpiredModalBody";
import StoreSwitcher from "../features/common/components/StoreSwitcher";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../app/authSlice";
import { openModal } from "../features/common/modalSlice";
import { MODAL_BODY_TYPES } from "../utils/globalConstantUtil";
import { useState } from "react";
import SyncStatusModal from "../features/common/components/SyncStatusModal";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import { clearActiveStore } from "../features/common/storeSlice";

const token = localStorage.getItem("token");

function ActiveIndicator({ path }) {
  const location = useLocation();
  return location.pathname === path ? (
    <div
      className="absolute right-2 w-1.5 h-1.5 active-indicator-dot"
      aria-hidden="true"
    ></div>
  ) : null;
}

function renderSidebarRoutes(routes, closeSidebar) {
  return routes.map((route, k) => {
    return (
      <li className="mx-2 my-0.5 list-none " key={k}>
        {route.submenu ? (
          <SidebarSubmenu {...route} closeSidebar={closeSidebar} />
        ) : (
          // LeftSidebar.jsx fixes
          <NavLink
            end
            to={route.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl group border-l-2 border-transparent hover:border-primary ${
                isActive
                  ? "glass-pill font-bold border-accent bg-primary text-primary-content"
                  : "hover:bg-base-200/50 text-base-content hover:text-base-content font-medium"
              }`
            }
            onClick={closeSidebar}
          >
            <div className="p-1.5 rounded-lg transition-colors bg-primary/20 duration-200 group-hover:bg-primary/30">
              {route.icon}
            </div>
            <span className="flex-1 tracking-wide text-[14px]">
              {route.name}
            </span>
            <ActiveIndicator path={route.path} />
          </NavLink>
        )}
      </li>
    );
  });
}

const getSidebarContent = (closeSidebar) => {
  try {
    const { role } = jwtDecode(token);
    let routes = role === "admin" ? adminRoutes : role === "manager" ? managerRoutes : staffRoutes;

    return renderSidebarRoutes(routes, closeSidebar);
  } catch (err) {
    return <SessionExpired />;
  }
};

function LeftSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const closeSidebar = () => {
    const sidebarToggle = document.getElementById("left-sidebar-drawer");
    if (sidebarToggle) sidebarToggle.click();
  };

  async function logoutUserHandler() {
    await dispatch(logoutUser());
    dispatch(clearActiveStore());
    navigate("/login");
  }

  return (
    <div className="drawer-side z-[100]" style={{ backdropFilter: "none" }}>
      <label
        htmlFor="left-sidebar-drawer"
        className="drawer-overlay backdrop-blur-sm lg:hidden"
      ></label>
      <div className="w-72 min-h-full glass-premium-sidebar text-base-content border-r border-base-content/5 shadow-2xl flex flex-col">
        {/* Logo Section - Fixed at top */}
        <div className="py-2 px-6 z-40 border-b border-base-content/5 flex flex-row items-center justify-between shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
            onClick={closeSidebar}
          >
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <div className="flex items-center justify-center w-6 h-6 text-primary-content font-black text-xl">
                C
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-base-content uppercase leading-none">
                Codeket<span className="text-primary">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">
                Restaurant
              </span>
            </div>
          </Link>
          <button
            className="btn btn-ghost btn-circle btn-sm lg:hidden bg-base-200"
            onClick={closeSidebar}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <ul className="menu p-0 flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-0.5">
          {/* Store Switcher wrapped in li to maintain rhythm */}
          <li className="mx-2 mb-4 list-none mt-2">
            <StoreSwitcher />
          </li>

          {getSidebarContent(closeSidebar)}

          {/* Sync Button */}
          <li className="mt-auto px-2 pb-2 list-none">
            <button
              className="w-full btn btn-ghost justify-start gap-3 px-4 py-3 border border-base-content/5 rounded-xl hover:bg-base-200/50 transition-colors duration-200"
              onClick={() => setIsSyncModalOpen(true)}
            >
              <div className="p-1.5 bg-base-300/30 rounded-lg">
                <ArrowPathIcon className="h-4 w-4 text-base-content/60" />
              </div>
              <span className="font-bold tracking-tight text-xs uppercase opacity-70">
                Sync Status
              </span>
            </button>
          </li>

          {/* Help & Support Button */}
          <li className="px-4 pt-4 list-none">
            <button
              className="btn btn-success btn-outline border-2 text-base-content font-bold w-full rounded-2xl hover:bg-success hover:text-white hover:border-success flex items-center justify-center gap-3 transition-colors duration-200"
              onClick={() => {
                dispatch(
                  openModal({
                    title: "Get Help",
                    bodyType: MODAL_BODY_TYPES.SUPPORT_MODAL,
                    size: "lg",
                  }),
                );
              }}
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
              <span className="tracking-widest uppercase text-[10px] font-black">
                Help & Support
              </span>
            </button>
          </li>

          {/* Logout Button */}
          <li className="px-4 py-8 list-none">
            <button
              className="btn btn-error btn-outline border-2 text-base-content font-bold w-full rounded-2xl hover:bg-error hover:text-white hover:border-error flex items-center justify-center gap-3 transition-colors duration-200"
              onClick={logoutUserHandler}
            >
              <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
              <span className="tracking-widest uppercase text-[10px] font-black">
                Sign Out
              </span>
            </button>
          </li>
        </ul>
      </div>
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}

export default LeftSidebar;
