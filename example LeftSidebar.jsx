import { adminRoutes, managerRoutes, staffRoutes } from "../routes/sidebar";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation here
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import ArrowLeftStartOnRectangleIcon from "@heroicons/react/24/outline/ArrowLeftStartOnRectangleIcon";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");

const AdminSidebarNavComponents = adminRoutes.map((route, k) => {
  return (
    <li className="mx-2 my-0.5" key={k}>
      {route.submenu ? (
        <SidebarSubmenu {...route} />
      ) : (
        <NavLink
          end
          to={route.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? "bg-primary text-primary-content shadow-md font-bold"
                : "hover:bg-base-200 text-base-content hover:text-base-content font-medium"
            }`
          }
        >
          <div className="p-1.5 rounded-lg transition-colors group-hover:bg-base-300/50">
            {route.icon}
          </div>
          <span className="flex-1 tracking-wide">{route.name}</span>
          <ActiveIndicator path={route.path} />
        </NavLink>
      )}
    </li>
  );
});

const StaffSidebarNavComponents = staffRoutes.map((route, k) => {
  return (
    <li className="mx-2 my-0.5" key={k}>
      {route.submenu ? (
        <SidebarSubmenu {...route} />
      ) : (
        <NavLink
          end
          to={route.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? "bg-primary text-primary-content shadow-md font-bold"
                : "hover:bg-base-200 text-base-content hover:text-base-content font-medium"
            }`
          }
        >
          <div className="p-1.5 rounded-lg transition-colors group-hover:bg-base-300/50">
            {route.icon}
          </div>
          <span className="flex-1 tracking-wide">{route.name}</span>
          {route.path === "/app/dashboard" && (
            <kbd className="kbd kbd-xs">HOME</kbd>
          )}
          <ActiveIndicator path={route.path} />
        </NavLink>
      )}
    </li>
  );
});

const ManagerSidebarNavComponents = managerRoutes.map((route, k) => {
  return (
    <li className="mx-2 my-0.5" key={k}>
      {route.submenu ? (
        <SidebarSubmenu {...route} />
      ) : (
        <NavLink
          end
          to={route.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? "bg-primary text-primary-content shadow-md font-bold"
                : "hover:bg-base-200 text-base-content hover:text-base-content font-medium"
            }`
          }
        >
          <div className="p-1.5 rounded-lg transition-colors group-hover:bg-base-300/50">
            {route.icon}
          </div>
          <span className="flex-1 tracking-wide">{route.name}</span>
          <ActiveIndicator path={route.path} />
        </NavLink>
      )}
    </li>
  );
});

// Component to display active indicator
function ActiveIndicator({ path }) {
  const location = useLocation(); // Hook to get the current location
  return location.pathname === path ? (
    <div
      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-content shadow-[0_0_8px_rgba(255,255,255,0.8)]"
      aria-hidden="true"
    ></div>
  ) : null;
}

const SidebarContent = (() => {
  try {
    const { role } = jwtDecode(token);
    switch (role) {
      case "admin":
        return AdminSidebarNavComponents;
      case "manager":
        return ManagerSidebarNavComponents;
      default:
        return StaffSidebarNavComponents;
    }
  } catch (err) {
    return <SessionExpired />;
  }
})();

function LeftSidebar() {
  const navigate = useNavigate();

  const close = () => {
    const sidebarToggle = document.getElementById("left-sidebar-drawer");
    if (sidebarToggle) {
      sidebarToggle.click();
    }
  };

  function logoutUser() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div className="drawer-side z-30">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
      <ul className="menu w-72 bg-base-100 min-h-full p-4 gap-1 text-base-content border-r border-white/5 shadow-xl">
        <button
          className="btn btn-ghost bg-base-300 btn-circle z-50 right-0 mt-2 mr-2 fixed top-0 lg:hidden shadow-lg"
          onClick={() => close()}
        >
          <XMarkIcon className="h-5 inline-block w-5" />
        </button>

        <li className="mb-2 mt-2">
          <Link
            to="/app/dashboard"
            className="flex items-center gap-3 !bg-transparent hover:!bg-transparent px-2"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-content font-black text-xl shadow-lg ring-4 ring-primary/10 transition-all">
              Z
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-primary">
                ZAMANI
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">
                Pro Store
              </span>
            </div>
          </Link>
        </li>

        {SidebarContent}

        <li className="mt-auto pt-10 px-2 pb-4">
          <button
            className="btn btn-error btn-outline rounded-2xl gap-3 border-2"
            onClick={logoutUser}
          >
            <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
            <span className="font-bold tracking-wide uppercase text-xs">
              Sign Out
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default LeftSidebar;
