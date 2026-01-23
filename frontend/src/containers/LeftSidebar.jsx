import { adminRoutes, managerRoutes, staffRoutes } from "../routes/sidebar";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import ArrowLeftStartOnRectangleIcon from "@heroicons/react/24/outline/ArrowLeftStartOnRectangleIcon";
import { jwtDecode } from "jwt-decode";
import SessionExpired from "../features/common/components/SessionExpiredModalBody";
import StoreSwitcher from "../features/common/components/StoreSwitcher";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../app/authSlice";
import { useState } from "react";
import SyncStatusModal from "../features/common/components/SyncStatusModal";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";

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

function renderSidebarRoutes(routes) {
  return routes.map((route, k) => {
    return (
      <li className="mx-2 my-0.5 list-none " key={k}>
        {route.submenu ? (
          <SidebarSubmenu {...route} />
        ) : (
          <NavLink
            end
            to={route.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl group hover:border-l-2 hover:border-primary ${
                isActive
                  ? "glass-pill font-bold border-l-2 border-accent bg-primary text-primary-content"
                  : "hover:bg-base-200/50 text-base-content hover:text-base-content font-medium"
              }`
            }
          >
            <div className="p-1.5 rounded-lg transition-all duration-300 group-hover:bg-base-300/50 group-hover:scale-110">
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

const SidebarContent = (() => {
  try {
    const { role } = jwtDecode(token);
    if (role === "admin") return renderSidebarRoutes(adminRoutes);
    if (role === "manager") return renderSidebarRoutes(managerRoutes);
    return renderSidebarRoutes(staffRoutes);
  } catch (err) {
    return <SessionExpired />;
  }
})();

function LeftSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const closeSidebar = () => {
    const sidebarToggle = document.getElementById("left-sidebar-drawer");
    if (sidebarToggle) sidebarToggle.click();
  };

  function logoutUserHandler() {
    dispatch(logoutUser());
    navigate("/login");
  }

  return (
    <div className="drawer-side z-50">
      <label
        htmlFor="left-sidebar-drawer"
        className="drawer-overlay backdrop-blur-sm"
      ></label>
      <ul className="menu w-72 min-h-full glass-premium text-base-content p-0 border-r border-base-content/5 shadow-2xl overflow-y-auto overflow-x-hidden flex flex-col gap-0.5">
        {/* Logo Section */}
        <li className="sticky top-0 glass-premium py-6 px-6 z-40 border-b border-base-content/5 flex flex-row items-center justify-between mb-2">
          <Link to="/dashboard" className="flex items-center gap-3 soft-lift">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-center w-6 h-6 text-primary-content font-black text-xl">
                R
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-base-content uppercase leading-none">
                Resto<span className="text-primary">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">
                Pro System
              </span>
            </div>
          </Link>
          <button
            className="btn btn-ghost btn-circle btn-sm lg:hidden bg-base-200/50"
            onClick={closeSidebar}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </li>

        {/* Store Switcher wrapped in li to maintain rhythm */}
        <li className="mx-2 mb-4 list-none">
          <StoreSwitcher />
        </li>

        {SidebarContent}

        {/* Sync Button */}
        <li className="mt-auto px-2 pb-2 list-none">
          <button
            className="w-full btn btn-ghost justify-start gap-3 px-4 py-3 border border-base-content/5 rounded-xl hover:bg-base-200/50 transition-all duration-300 soft-lift"
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

        {/* Logout Button */}
        <li className="px-4 py-8 list-none">
          <button
            className="btn btn-error btn-outline border-2 text-base-content font-bold w-full rounded-2xl hover:bg-error hover:text-white hover:border-error soft-lift flex items-center justify-center gap-3 transition-all duration-300"
            onClick={logoutUserHandler}
          >
            <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
            <span className="tracking-widest uppercase text-[10px] font-black">
              Sign Out
            </span>
          </button>
        </li>
      </ul>
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}

export default LeftSidebar;
