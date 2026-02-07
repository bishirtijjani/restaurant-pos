import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  User,
  MapPin,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Wifi,
  RefreshCw,
  Settings,
  Maximize,
  Minimize,
} from "lucide-react";

// --- Mock OrderCard (Simplified without Redux) ---

const MockOrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(true);

  // Determine color based on status/priority (mimicking logic)
  const getCardColor = () => {
    if (order.status === "ready") return "bg-success/10 border-success";
    if (order.priority === "critical")
      return "bg-error/10 border-error animate-pulse";
    if (order.priority === "warning") return "bg-warning/10 border-warning";
    return "bg-base-100 border-base-300";
  };

  return (
    <div
      className={`card ${getCardColor()} border-2 shadow-lg hover:shadow-xl transition-all duration-200`}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2 md:mb-3">
          <div>
            <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
              <h3 className="font-bold text-xl md:text-2xl">
                #{order.orderNumber}
              </h3>
              {order.type === "delivery" && (
                <span className="badge badge-info badge-sm">Delivery</span>
              )}
              {order.type === "takeaway" && (
                <span className="badge badge-warning badge-sm">Takeaway</span>
              )}
              {order.status === "pending" && (
                <span className="badge badge-error badge-sm">New</span>
              )}
              {order.status === "preparing" && (
                <span className="badge badge-warning badge-sm">
                  In Progress
                </span>
              )}
              {order.status === "ready" && (
                <span className="badge badge-success badge-sm">Ready</span>
              )}
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-1 text-xs font-mono font-bold ${
                order.priority === "critical"
                  ? "text-error"
                  : order.priority === "warning"
                    ? "text-warning"
                    : "text-base-content/70"
              }`}
            >
              <Clock size={12} />
              <span>{order.timeElapsed}</span>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Customer Info */}
        <div className="space-y-1 mb-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 opacity-70" />
            <span className="font-medium">
              {order.customerName || "Walk-in Customer"}
            </span>
          </div>
          {order.table && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold badge badge-ghost">
                Table: {order.table}
              </span>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-4">
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">
                      {item.qty}x {item.name}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="text-sm opacity-70 mt-1 flex items-start gap-1 text-warning font-medium">
                      <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{item.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions (Visual Only) */}
        <div className="flex gap-2 pt-2 border-t">
          {order.status === "pending" && (
            <button className="btn btn-info flex-1 text-white btn-sm">
              <PlayCircle size={16} /> Start
            </button>
          )}
          {order.status === "preparing" && (
            <button className="btn btn-success flex-1 text-white btn-sm">
              <CheckCircle size={16} /> Ready
            </button>
          )}
          {order.status === "ready" && (
            <button className="btn btn-ghost flex-1 btn-sm" disabled>
              <CheckCircle size={16} /> Serve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Mock Data ---

const MOCK_ORDERS = [
  {
    _id: "1",
    orderNumber: "2847",
    type: "dine-in",
    status: "preparing", // Critical
    priority: "critical",
    timeElapsed: "12:42",
    customerName: "Table 4",
    table: "4",
    items: [
      { qty: 2, name: "Sunday Roast - Beef", notes: "Extra gravy please" },
      { qty: 1, name: "Fish & Chips", notes: "No mushy peas" },
      { qty: 3, name: "Sparkling Water" },
    ],
  },
  {
    _id: "2",
    orderNumber: "2848",
    type: "dine-in",
    status: "preparing", // Warning
    priority: "warning",
    timeElapsed: "08:15",
    customerName: "Table 12",
    table: "12",
    items: [
      { qty: 2, name: "Classic Beef Burger", notes: "No onions" },
      { qty: 2, name: "Elderflower Pressé" },
    ],
  },
  {
    _id: "3",
    orderNumber: "2849",
    type: "takeaway",
    status: "ready", // Ready
    priority: "normal",
    timeElapsed: "05:30",
    customerName: "Michael C.",
    items: [
      { qty: 1, name: "Steak & Kidney Pie" },
      { qty: 1, name: "Fish & Chips" },
    ],
  },
  {
    _id: "4",
    orderNumber: "2850",
    type: "dine-in",
    status: "pending", // New
    priority: "normal",
    timeElapsed: "01:45",
    customerName: "Table 8",
    table: "8",
    items: [
      { qty: 1, name: "Sunday Roast - Beef" },
      { qty: 1, name: "Classic Beef Burger" },
    ],
  },
  {
    _id: "5",
    orderNumber: "2851",
    type: "delivery",
    status: "preparing",
    priority: "normal",
    timeElapsed: "03:12",
    customerName: "Deliveroo #8821",
    items: [
      { qty: 2, name: "Classic Beef Burger" },
      { qty: 2, name: "Fish & Chips" },
    ],
  },
];

export default function MockKDS() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-20 px-2 lg:px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Kitchen Display System</h1>
          <div className="ml-4 flex items-center gap-2">
            <Wifi size={14} className="text-success" />
            <span className="text-sm opacity-70">Live</span>
          </div>
        </div>
        <div className="flex-none gap-2">
          <div className="badge badge-primary gap-1 p-3">
            <span className="font-bold">5</span>
            <span>Active Orders</span>
          </div>
          <button className="btn btn-ghost btn-circle">
            <RefreshCw size={20} />
          </button>
          <button className="btn btn-ghost btn-circle">
            <Settings size={20} />
          </button>
          <button className="btn btn-ghost btn-circle">
            <Maximize size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
        {MOCK_ORDERS.map((order) => (
          <MockOrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}
