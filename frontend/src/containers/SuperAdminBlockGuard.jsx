import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Guard component that blocks Super Admins from accessing regular app routes
 * UNLESS they are impersonating an organization for support purposes.
 */
function SuperAdminBlockGuard({ children }) {
  const { user } = useSelector((state) => state.auth);

  // Allow super admins if they are impersonating an organization
  const isImpersonating = localStorage.getItem("impersonatingOrg");

  if (user?.isSuperAdmin && !isImpersonating) {
    return <Navigate to="/super-admin" replace />;
  }

  return children;
}

export default SuperAdminBlockGuard;
