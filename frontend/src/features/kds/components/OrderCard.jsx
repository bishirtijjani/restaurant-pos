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
  PlayCircle,
} from "lucide-react";
import { updateKDSOrderStatus, recallOrder } from "../kdsSlice";
import { openModal } from "../../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../../utils/globalConstantUtil";
import OrderTimer from "./OrderTimer";
import { getOrderColor, groupItemsByCategory } from "../kdsUtils";
import { showNotification } from "../../common/headerSlice";
import { useAuth } from "../../../utils/permission";
import { DIETARY_TAG_STYLES } from "../../../utils/dietaryConstants";

const OrderCard = ({ order, settings, isCompletedView = false }) => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const orderAge = Math.floor((new Date() - new Date(order.createdAt)) / 60000);

  const priority =
    orderAge >= 15
      ? order.orderStatus == "ready" || "completed"
        ? "completed"
        : "critical"
      : orderAge >= 10
      ? "warning"
      : "normal";
  const cardColor = getOrderColor(priority, settings.colorScheme);

  const groupedItems = groupItemsByCategory(order.orderItems);

  const handleStart = async () => {
    if (!can("updateKDSOrders")) {
      dispatch(
        showNotification({
          message: "You don't have permission to update orders",
          status: 0,
        })
      );
      return;
    }

    setProcessing(true);
    try {
      await dispatch(
        updateKDSOrderStatus({ orderId: order._id, action: "start" })
      ).unwrap();
      dispatch(
        showNotification({
          message: `Order #${order.orderNumber} started`,
          status: 1,
        })
      );
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to start order",
          status: 0,
        })
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!can("updateKDSOrders")) {
      dispatch(
        showNotification({
          message: "You don't have permission to update orders",
          status: 0,
        })
      );
      return;
    }

    setProcessing(true);
    try {
      await dispatch(
        updateKDSOrderStatus({ orderId: order._id, action: "complete" })
      ).unwrap();
      dispatch(
        showNotification({
          message: `Order #${order.orderNumber} completed and ready`,
          status: 1,
        })
      );
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to complete order",
          status: 0,
        })
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleRecall = async () => {
    if (!can("recallKDSOrders")) {
      dispatch(
        showNotification({
          message: "You don't have permission to recall orders",
          status: 0,
        })
      );
      return;
    }

    dispatch(
      openModal({
        title: "Recall Order",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message:
            "Are you sure you want to recall this order back to preparing?",
          type: CONFIRMATION_MODAL_CLOSE_TYPES.RECALL_KDS_ORDER,
          id: order._id, // Pass order ID (in ConfirmationModalBody this maps to 'orderId' usually, but here 'id' matches logic)
        },
      })
    );
  };

  const getFontSize = () => {
    switch (settings.fontSize) {
      case "small":
        return "text-xs md:text-sm";
      case "large":
        return "text-base md:text-lg";
      default:
        return "text-sm md:text-base";
    }
  };

  return (
    <div
      className={`card ${cardColor} border-2 shadow-lg hover:shadow-xl transition-all duration-200 ${getFontSize()}`}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2 md:mb-3">
          <div>
            <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
              <h3 className="font-bold text-xl md:text-2xl">
                #{order.orderNumber}
              </h3>
              {order.orderType === "delivery" && (
                <span className="badge badge-info badge-xs md:badge-sm">
                  Delivery
                </span>
              )}
              {order.orderType === "takeaway" && (
                <span className="badge badge-warning badge-xs md:badge-sm">
                  Takeaway
                </span>
              )}
              {order.orderStatus === "pending" && (
                <span className="badge badge-error badge-xs md:badge-sm">
                  New
                </span>
              )}
              {order.orderStatus === "preparing" && (
                <span className="badge badge-warning badge-sm">
                  In Progress
                </span>
              )}
              {order.orderStatus === "ready" && (
                <span className="badge badge-success badge-sm">Ready</span>
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
              <MapPin className="w-3 h-3 md:w-4 md:h-4 opacity-70" />
              <span className="text-[10px] md:text-xs">
                {order.customerDetails.address}
              </span>
            </div>
          )}
          {order.table && order.table !== "Takeaway" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">
                Table: {order.table}
              </span>
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
                  className="flex items-start justify-between gap-2"
                >
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      {(() => {
                        const baseAllergens = item.menuItemId?.allergens || [];
                        const baseTags = item.menuItemId?.dietaryTags || [];
                        const addOnAllergens = item.addOns?.flatMap(g => g.selectedItems?.flatMap(si => si.allergens || [])) || [];
                        const addOnTags = item.addOns?.flatMap(g => g.selectedItems?.flatMap(si => si.dietaryTags || [])) || [];
                        const allAllergens = [...new Set([...baseAllergens, ...addOnAllergens])];
                        const allTags = [...new Set([...baseTags, ...addOnTags])];

                        if (allAllergens.length > 0 || allTags.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-1 mt-1 mb-1">
                              {allTags.map(tag => {
                                const style = DIETARY_TAG_STYLES[tag] || { color: "bg-base-200 text-base-content" };
                                return (
                                  <span key={tag} className={`badge badge-xs border ${style.color} font-medium`}>
                                    {style.icon && <span className="mr-1">{style.icon}</span>}
                                    {tag}
                                  </span>
                                );
                              })}
                              {allAllergens.length > 0 && (
                                <span className="badge badge-xs bg-red-100 text-red-800 border-red-200 font-bold px-1" title={allAllergens.join(", ")}>
                                  ⚠️ ALLERGY
                                </span>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    {expanded && item.customizations && (
                      <div className="text-xs opacity-70 mt-1 flex items-start gap-1">
                        <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{item.customizations}</span>
                      </div>
                    )}
                    {expanded && item.addOns?.length > 0 && (
                      <div className="text-xs mt-1 space-y-1">
                        {item.addOns.map((group, idx) => (
                          <div key={idx} className="flex flex-col ml-1 border-l-2 border-base-300 pl-2">
                            <span className="opacity-70 italic">{group.groupName}:</span>
                            <span className="font-medium text-primary">
                              {group.selectedItems?.map(si => si.name).join(", ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
          {isCompletedView ? (
            <>
              {can("recallKDSOrders") && (
                <button
                  onClick={handleRecall}
                  className="btn btn-warning flex-1"
                >
                  <RotateCcw size={18} />
                  Recall
                </button>
              )}
            </>
          ) : (
            <>
              {order.orderStatus === "pending" && can("updateKDSOrders") && (
                <button
                  onClick={handleStart}
                  disabled={processing}
                  className={`btn btn-info flex-1 text-white ${
                    processing ? "loading" : ""
                  }`}
                >
                  <PlayCircle size={18} />
                  {processing ? "Starting..." : "Start"}
                </button>
              )}

              {order.orderStatus === "preparing" && can("updateKDSOrders") && (
                <button
                  onClick={handleComplete}
                  disabled={processing}
                  className={`btn btn-success flex-1 text-white ${
                    processing ? "loading" : ""
                  }`}
                >
                  <CheckCircle size={18} />
                  {processing ? "Completing..." : "Ready"}
                </button>
              )}

              {!can("updateKDSOrders") && order.orderStatus !== "ready" && (
                <div className="text-xs text-center opacity-70 flex-1 py-2">
                  View only - No update permission
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
