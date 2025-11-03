// frontend/src/features/kds/components/OrderCard.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  CheckCircle,
  Clock,
  User,
  MapPin,
  Phone,
  MessageSquare,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { bumpOrder, recallOrder, updateOrderItemStatus } from "../kdsSlice";
import OrderTimer from "./OrderTimer";
import { getOrderColor, groupItemsByCategory } from "../kdsUtils";
import { showNotification } from "../../common/headerSlice";

const OrderCard = ({ order, settings }) => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [bumping, setBumping] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});

  const orderAge = Math.floor((new Date() - new Date(order.createdAt)) / 60000);
  const priority =
    orderAge >= 15 ? "critical" : orderAge >= 10 ? "warning" : "normal";
  const cardColor = getOrderColor(priority, settings.colorScheme);

  const groupedItems = groupItemsByCategory(order.orderItems);

  const handleBump = async () => {
    if (window.confirm("Mark this order as complete?")) {
      setBumping(true);
      try {
        await dispatch(
          bumpOrder({ orderId: order._id, reason: "Completed in kitchen" })
        ).unwrap();
        dispatch(
          showNotification({
            message: `Order #${order.orderNumber} completed`,
            status: 1,
          })
        );
      } catch (error) {
        dispatch(
          showNotification({
            message: error.message || "Failed to bump order",
            status: 0,
          })
        );
      } finally {
        setBumping(false);
      }
    }
  };

  const handleRecall = async () => {
    if (window.confirm("Recall this order back to preparing?")) {
      try {
        await dispatch(
          recallOrder({
            orderId: order._id,
            reason: "Recalled for modification",
          })
        ).unwrap();
        dispatch(
          showNotification({
            message: `Order #${order.orderNumber} recalled`,
            status: 1,
          })
        );
      } catch (error) {
        dispatch(
          showNotification({
            message: error.message || "Failed to recall order",
            status: 0,
          })
        );
      }
    }
  };

  const handleItemToggle = async (item) => {
    // Use the subdocument _id
    const itemId = item._id;
    const currentStatus = item.itemStatus || "pending";
    const newStatus = currentStatus === "completed" ? "preparing" : "completed";

    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    try {
      await dispatch(
        updateOrderItemStatus({
          orderId: order._id,
          itemId: itemId,
          status: newStatus,
        })
      ).unwrap();

      dispatch(
        showNotification({
          message: `Item marked as ${newStatus}`,
          status: 1,
        })
      );
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to update item status",
          status: 0,
        })
      );
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const getFontSize = () => {
    switch (settings.fontSize) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  return (
    <div
      className={`card ${cardColor} border-2 shadow-lg hover:shadow-xl transition-all duration-200 ${getFontSize()}`}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-2xl">#{order.orderNumber}</h3>
              {order.orderType === "delivery" && (
                <span className="badge badge-info badge-sm">Delivery</span>
              )}
              {order.orderType === "takeaway" && (
                <span className="badge badge-warning badge-sm">Takeaway</span>
              )}
            </div>
            <OrderTimer
              createdAt={order.createdAt}
              warningTime={10}
              criticalTime={15}
            />
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
              {order.customerDetails?.name || "Walk-in Customer"}
            </span>
          </div>
          {order.customerDetails?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 opacity-70" />
              <span>{order.customerDetails.phone}</span>
            </div>
          )}
          {order.orderType === "delivery" && order.customerDetails?.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 opacity-70" />
              <span className="text-xs">{order.customerDetails.address}</span>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-2">
              {expanded && (
                <div className="text-xs font-bold uppercase opacity-70 border-b pb-1">
                  {category}
                </div>
              )}
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start justify-between gap-2 group"
                >
                  <button
                    onClick={() => handleItemToggle(item)}
                    disabled={updatingItems[item._id]}
                    className="flex-1 flex items-start gap-2 text-left hover:bg-base-200/50 p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          item.itemStatus === "completed"
                            ? "bg-success border-success"
                            : "border-base-300 group-hover:border-success"
                        } ${updatingItems[item._id] ? "animate-pulse" : ""}`}
                      >
                        {item.itemStatus === "completed" && (
                          <CheckCircle className="w-4 h-4 text-success-content" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            item.itemStatus === "completed"
                              ? "line-through opacity-50"
                              : ""
                          }`}
                        >
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                      {expanded && item.customizations && (
                        <div className="text-xs opacity-70 mt-1 flex items-start gap-1">
                          <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{item.customizations}</span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Note */}
        {order.note && expanded && (
          <div className="bg-base-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
              <p className="text-sm">{order.note}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {order.orderStatus === "ready" ? (
            <button
              onClick={handleRecall}
              className="btn btn-outline btn-warning flex-1"
            >
              <RotateCcw size={18} />
              Recall
            </button>
          ) : (
            <button
              onClick={handleBump}
              disabled={bumping}
              className={`btn btn-success flex-1 text-white ${
                bumping ? "loading" : ""
              }`}
            >
              <CheckCircle size={18} />
              {bumping ? "Bumping..." : "Bump"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
