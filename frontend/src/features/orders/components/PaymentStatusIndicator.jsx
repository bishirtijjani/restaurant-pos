import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const paymentConfig = {
  paid: { color: "bg-green-500", icon: CheckCircleIcon, text: "Paid" },
  partial: { color: "bg-yellow-500", icon: ClockIcon, text: "Partial" },
  pending: { color: "bg-red-500", icon: XCircleIcon, text: "Pending" },
};

export default function PaymentStatusIndicator({ status }) {
  const { color, icon: Icon, text } = paymentConfig[status] || {};

  return (
    <div className="flex items-center gap-1">
      <Icon className={`w-4 h-4 ${color} text-white p-0.5 rounded-full`} />
      <span className="text-sm capitalize">{text || status}</span>
    </div>
  );
}
