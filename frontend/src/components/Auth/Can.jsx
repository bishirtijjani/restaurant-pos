import { useAuth } from "../../utils/permission";

/**
 * Simple wrapper - only renders if user can perform action
 * Usage: <Can do="editMenu">...</Can>
 */
const Can = ({ do: action, children, fallback = null }) => {
  const { can } = useAuth();
  return can(action) ? <>{children}</> : fallback;
};

export default Can;

// Bonus: Button variant
export const CanButton = ({ do: action, children, hide = false, ...props }) => {
  const { can } = useAuth();
  const allowed = can(action);

  if (hide && !allowed) return null;

  return (
    <button {...props} disabled={!allowed || props.disabled}>
      {children}
    </button>
  );
};
