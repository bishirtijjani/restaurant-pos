export default function Badge({ children, color = "neutral" }) {
  const colorClasses = {
    primary: "bg-primary text-primary-content",
    secondary: "bg-secondary text-secondary-content",
    success: "bg-success text-success-content",
    error: "bg-error text-error-content",
    warning: "bg-warning text-warning-content",
    neutral: "bg-neutral text-neutral-content",
    ghost: "bg-opacity-20 text-base-content",
  };

  return (
    <span
      className={`${colorClasses[color]} px-2 py-1 rounded-full text-xs font-medium`}
    >
      {children}
    </span>
  );
}
