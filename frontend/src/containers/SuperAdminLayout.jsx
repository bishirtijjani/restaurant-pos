import { NavLink, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { Suspense, useState } from "react";
import { BuildingOfficeIcon, UsersIcon, ChartBarIcon, ShieldCheckIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { clearActiveStore } from "../features/common/storeSlice";
import superAdminRoutes from "../routes/superAdminRoutes";
import SuspenseContent from "./SuspenseContent";

function SuperAdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = jwtDecode(token);
  } catch (e) {
    // Invalid token
  }

  const handleBackToApp = () => {
    // Clear impersonation if any
    localStorage.removeItem("impersonatingOrg");
    localStorage.removeItem("impersonatingOrgName");
    dispatch(clearActiveStore());
    navigate("/app/dashboard");
  };

  const navItems = [
    { path: "/super-admin", icon: ChartBarIcon, label: "Dashboard" },
    { path: "/super-admin/organizations", icon: BuildingOfficeIcon, label: "Organizations" },
    { path: "/super-admin/users", icon: UsersIcon, label: "All Users" },
    { path: "/super-admin/platform-health", icon: ShieldCheckIcon, label: "Platform Health" },
    { path: "/super-admin/settings", icon: Cog6ToothIcon, label: "Global Settings" },
  ];

  return (
    <div className="min-h-screen bg-base-100 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="btn btn-ghost btn-circle"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <ShieldCheckIcon className="w-4 h-4 text-primary-content" />
          </div>
          <span className="font-bold">Super Admin</span>
        </div>
        <div className="w-10" /> {/* Spacer for balance */}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-0 w-64 bg-base-200 border-r border-base-300 flex flex-col transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5 text-primary-content" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Super Admin</h1>
              <p className="text-xs opacity-60">System Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden btn btn-ghost btn-circle btn-sm"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/super-admin"}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-300"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Back to App */}
        <div className="p-4 border-t border-base-300 space-y-2">
          <div className="text-sm">
            <p className="font-medium">{user?.fullname || user?.email}</p>
            <p className="text-xs opacity-60">{user?.email}</p>
          </div>
          <button
            onClick={handleBackToApp}
            className="btn btn-ghost btn-sm w-full justify-start gap-2"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Back to App
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-6">
          <Suspense fallback={<SuspenseContent />}>
            <Routes>
              {superAdminRoutes.map((route, key) => (
                <Route
                  key={key}
                  path={route.path}
                  element={<route.component />}
                />
              ))}
              <Route path="*" element={<div className="p-6">Page not found</div>} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
