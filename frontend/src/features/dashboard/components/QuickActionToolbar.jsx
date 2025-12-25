import React from "react";
import {
  Zap,
  ShoppingCart,
  Calendar,
  PlusCircle,
  Package,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActionToolbar = () => {
  const navigate = useNavigate();

  const actions = [
    { label: "POS", icon: PlusCircle, path: "/app/pos", color: "bg-primary" },
    {
      label: "Ultra POS",
      icon: Zap,
      path: "/app/ultra-fast-pos",
      color: "bg-secondary",
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      path: "/app/orders",
      color: "bg-accent",
    },
    {
      label: "Reservations",
      icon: Calendar,
      path: "/app/reservations",
      color: "bg-info",
    },
    {
      label: "Inventory",
      icon: Package,
      path: "/app/inventory",
      color: "bg-warning",
    },
    {
      label: "Expenses",
      icon: FileText,
      path: "/app/expenses",
      color: "bg-neutral",
    },
  ];

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body p-6">
        <h3 className="card-title text-lg mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-secondary" />
          Quick Launch
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-base-200 hover:bg-base-300 transition-all group border border-transparent hover:border-base-content/10"
            >
              <div
                className={`p-2 md:p-3 rounded-lg md:rounded-xl ${action.color} text-white mb-2 shadow-lg transform group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 italic">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionToolbar;
