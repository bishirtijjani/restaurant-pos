import { adminRoutes, managerRoutes, staffRoutes } from "../routes/sidebar";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import ArrowLeftStartOnRectangleIcon from "@heroicons/react/24/outline/ArrowLeftStartOnRectangleIcon";
import { jwtDecode } from "jwt-decode";

// Helpers
const token = localStorage.getItem("token");

function ActiveIndicator({ path }) {
  const location = useLocation();
  return location.pathname === path ? (
    <span
      className="absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-md rounded-br-md"
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
            `flex items-center gap-2 py-2 rounded-lg transition-all duration-200 ${
              isActive ? "bg-base-200 font-semibold" : "hover:bg-base-200"
            }`
          }
        >
          <span className="bg-base-300 rounded-lg p-2">{route.icon}</span>
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

  const closeSidebar = () => {
    const sidebarToggle = document.getElementById("left-sidebar-drawer");
    if (sidebarToggle) sidebarToggle.click();
  };

  function logoutUser() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <div className="drawer-side z-50 border-r border-base-200">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
      <ul className="menu w-70 min-h-full bg-base-100 text-base-content p-0">
        {/* Logo Section */}
        <li className="sticky flex  flex-row justify-between top-0 bg-base-100 py-3 z-40 border-b border-base-300 shadow-sm">
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
        <div className="mt-4 space-y-2 px-2">{SidebarContent}</div>

        {/* Logout Button */}
        <li className="mt-auto px-2 py-6">
          <a
            className="w-full btn bg-error text-white hover:bg-error/90 shadow-md flex items-center justify-center gap-2"
            onClick={logoutUser}
          >
            <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
}

export default LeftSidebar;
