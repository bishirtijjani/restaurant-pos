import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import OrderStatusIndicator from "../../orders/components/OrderStatusIndicator";

const DashboardRecentOrders = ({ orders }) => {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 h-full">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="card-title text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Recent Orders
          </h3>
          <Link to="/app/orders" className="btn btn-ghost btn-xs gap-1 group">
            View All{" "}
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="space-y-4">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-base-200 transition-all border border-transparent hover:border-base-content/5"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <span className="text-xs font-black text-primary">
                      #{order.orderNumber}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {order.table && order.table !== "Takeaway"
                        ? `Table ${order.table}`
                        : order.customerDetails?.name || "Counter Order"}
                    </p>
                    <p className="text-[10px] opacity-50 font-bold uppercase tracking-tight">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-extrabold pr-1">
                    ${order.totalAmount.toLocaleString()}
                  </span>
                  <OrderStatusIndicator status={order.orderStatus} size="xs" />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 opacity-30">
              <ShoppingBag className="w-12 h-12 mb-2" />
              <p className="text-sm font-bold">No orders yet today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardRecentOrders;
