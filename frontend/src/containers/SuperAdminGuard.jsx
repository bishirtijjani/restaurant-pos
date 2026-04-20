import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Guard component that only allows Super Admins to access platform routes.
 * Non-SuperAdmins are redirected to the dashboard.
 */
function SuperAdminGuard({ children }) {
  const { user } = useSelector((state) => state.auth);

  if (!user?.isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}

export default SuperAdminGuard;
