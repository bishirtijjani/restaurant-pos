import { lazy } from "react";

const SuperAdminDashboard = lazy(() =>
  import("../features/platformAdmin/SuperAdminDashboard")
);
const PlatformAdminDashboard = lazy(() =>
  import("../features/platformAdmin")
);
const PlatformHealthDashboard = lazy(() =>
  import("../features/platformHealth/PlatformHealthDashboard")
);

// Placeholder components for future features
const UsersManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">All Users</h1>
    <p className="opacity-60">User management across all organizations will be implemented here.</p>
  </div>
);

const GlobalSettings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Global Settings</h1>
    <p className="opacity-60">Platform-wide settings will be implemented here.</p>
  </div>
);

const superAdminRoutes = [
  {
    path: "/",
    component: SuperAdminDashboard,
  },
  {
    path: "/organizations",
    component: PlatformAdminDashboard,
  },
  {
    path: "/users",
    component: UsersManagement,
  },
  {
    path: "/platform-health",
    component: PlatformHealthDashboard,
  },
  {
    path: "/settings",
    component: GlobalSettings,
  },
];

export default superAdminRoutes;
