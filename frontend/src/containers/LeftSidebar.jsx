import { adminRoutes, managerRoutes, staffRoutes } from "../routes/sidebar";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import ArrowLeftStartOnRectangleIcon from "@heroicons/react/24/outline/ArrowLeftStartOnRectangleIcon";
import { jwtDecode } from "jwt-decode";
import SessionExpired from "../features/common/components/SessionExpiredModalBody";
import StoreSwitcher from "../features/common/components/StoreSwitcher";
import { useDispatch } from "react-redux";
import { logoutUser } from "../app/authSlice";
import { useState } from "react";
import SyncStatusModal from "../features/common/components/SyncStatusModal";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";

const token = localStorage.getItem("token");

function ActiveIndicator({ path }) {
  const location = useLocation();
  return location.pathname === path ? (
    <span
      className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full"
      aria-hidden="true"
    />
  ) : null;
}

function renderSidebarRoutes(routes) {
  return routes.map((route, index) => (
    <li key={index} className="mx-2 my-1 relative">
      {route.submenu ? (
        <SidebarSubmenu {...route} />
      ) : (
        <NavLink
          end
          to={route.path}
          className={({ isActive }) =>
            `flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 group ${
              isActive
                ? "bg-primary text-primary-content font-semibold"
                : "hover:bg-base-200 text-base-content hover:text-base-content"
            }`
          }
        >
          <span className="transition-colors duration-300">{route.icon}</span>
          {route.name}
          <ActiveIndicator path={route.path} />
        </NavLink>
      )}
    </li>
  ));
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
      <ul className="menu w-80 min-h-full bg-base-100/95 backdrop-blur-md text-base-content p-0 border-r border-base-200 shadow-2xl">
        {/* Logo Section */}
        <li className="sticky flex flex-row justify-between top-0 bg-base-100/95 backdrop-blur-md py-4 z-40 border-b border-base-200/50">
          <Link to="/dashboard" className="">
            <img
              src="/icon.svg"
              className="w-8 h-8 m-0 p-0 text-white"
              alt="Codeket Restaurant Logo"
            />
            <span className="text-xl m-0 p-0 font-bold tracking-wide text-base-content">
              Restaurant
            </span>
          </Link>
          {/* Mobile Close Button */}
          <button
            className="btn btn-ghost btn-circle bg-base-200 mx-3  lg:hidden shadow-md"
            onClick={closeSidebar}
          >
            <XMarkIcon className="w-5 h-5 text-error" />
          </button>
        </li>

        {/* Sidebar Items */}
        {/* Store Switcher */}
        <div className="mt-4 px-2">
          <StoreSwitcher />
        </div>
        <div className="mt-2 space-y-2 px-2">{SidebarContent}</div>

        {/* Sync Button */}
        <li className="mt-auto px-2 pb-2">
          <button
            className="w-full btn btn-ghost justify-start gap-2 border border-base-200 rounded-xl hover:bg-base-200 hover:border-base-300 transition-all duration-200"
            onClick={() => setIsSyncModalOpen(true)}
          >
            <ArrowPathIcon className="h-5 w-5 text-base-content/60" />
            <span className="font-medium text-base-content/80">
              Sync Status
            </span>
          </button>
        </li>

        {/* Logout Button */}
        <li className="px-2 py-6 pt-2">
          <a
            className="w-full btn btn-error text-white hover:bg-error/90 shadow-lg hover:shadow-xl rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
            onClick={logoutUserHandler}
          >
            <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
            <span className="font-bold">Logout</span>
          </a>
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
