// frontend/src/features/kds/components/OrderTimer.jsx
import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, AlertTriangle } from "lucide-react";
import { getOrderAge, getOrderPriority, formatTime } from "../kdsUtils";

const OrderTimer = ({ createdAt, warningTime = 10, criticalTime = 15 }) => {
  const [age, setAge] = useState(getOrderAge(createdAt));
  const priority = getOrderPriority(age, warningTime, criticalTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setAge(getOrderAge(createdAt));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [createdAt]);

  const getIcon = () => {
    switch (priority) {
      case "critical":
        return <AlertCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getColorClass = () => {
    switch (priority) {
      case "critical":
        return "text-error font-bold";
      case "warning":
        return "text-warning font-semibold";
      default:
        return "text-base-content/70";
    }
  };

  return (
    <div className={`flex items-center gap-1 ${getColorClass()}`}>
      {getIcon()}
      <span className="text-sm">{formatTime(age)}</span>
    </div>
  );
};

export default OrderTimer;
