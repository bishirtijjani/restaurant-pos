import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  BeakerIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

const statusConfig = {
  new: { color: "bg-blue-500", icon: ClockIcon, text: "New" },
  preparing: { color: "bg-yellow-500", icon: BeakerIcon, text: "Preparing" },
  ready: { color: "bg-orange-500", icon: ShoppingBagIcon, text: "Ready" },
  served: { color: "bg-purple-500", icon: TruckIcon, text: "Served" },
  completed: {
    color: "bg-green-500",
    icon: CheckCircleIcon,
    text: "Completed",
  },
  cancelled: { color: "bg-red-500", icon: XCircleIcon, text: "Cancelled" },
};

export default function OrderStatusIndicator({ status }) {
  const { color, icon: Icon, text } = statusConfig[status] || {};

  return (
    <div className="flex items-center gap-1">
      <Icon className={`w-4 h-4 ${color} text-white p-0.5 rounded-full`} />
      <span className="text-sm capitalize">{text || status}</span>
    </div>
  );
}
