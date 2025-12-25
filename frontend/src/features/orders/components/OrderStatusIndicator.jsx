import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  FlaskConical,
  ShoppingBag,
} from "lucide-react";

const statusConfig = {
  pending: { color: "bg-blue-500", icon: Clock, text: "Pending" },
  new: { color: "bg-blue-500", icon: Clock, text: "New" },
  preparing: { color: "bg-yellow-500", icon: FlaskConical, text: "Preparing" },
  ready: { color: "bg-orange-500", icon: ShoppingBag, text: "Ready" },
  served: { color: "bg-purple-500", icon: Truck, text: "Served" },
  completed: {
    color: "bg-green-500",
    icon: CheckCircle,
    text: "Completed",
  },
  cancelled: { color: "bg-red-500", icon: XCircle, text: "Cancelled" },
};

export default function OrderStatusIndicator({ status, size = "sm" }) {
  const config = statusConfig[status] || statusConfig.pending;
  const { color, icon: Icon, text } = config;

  const sizeClasses = size === "xs" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className="flex items-center gap-1">
      {Icon && (
        <Icon
          className={`${sizeClasses} ${color} text-white p-0.5 rounded-full`}
        />
      )}
      <span
        className={`${
          size === "xs" ? "text-[10px]" : "text-sm"
        } capitalize font-medium`}
      >
        {text || status}
      </span>
    </div>
  );
}
