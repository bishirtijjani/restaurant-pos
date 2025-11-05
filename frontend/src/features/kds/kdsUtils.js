// frontend/src/features/kds/kdsUtils.js
export const getOrderAge = (createdAt) => {
  const now = new Date();
  const orderTime = new Date(createdAt);
  const diffMs = now - orderTime;
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins;
};

export const getOrderPriority = (age, warningTime, criticalTime) => {
  if (age >= criticalTime) return "critical";
  if (age >= warningTime) return "warning";
  return "normal";
};

export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const getOrderColor = (priority, colorScheme = "default") => {
  const schemes = {
    default: {
      normal: "bg-base-100 border-base-300",
      warning: "bg-warning/10 border-warning",
      critical: "bg-error/10 border-error animate-pulse",
      completed: "bg-success/10 border-success",
    },
    colorblind: {
      normal: "bg-base-100 border-base-300",
      warning: "bg-blue-100 border-blue-500",
      critical: "bg-orange-100 border-orange-500 animate-pulse",
    },
    "high-contrast": {
      normal: "bg-white border-black",
      warning: "bg-yellow-200 border-yellow-900",
      critical: "bg-red-200 border-red-900 animate-pulse",
    },
  };

  return schemes[colorScheme]?.[priority] || schemes.default[priority];
};

export const playNotificationSound = (volume = 0.7) => {
  try {
    const audio = new Audio("/notification.mp3");
    audio.volume = volume;
    audio.play();
  } catch (error) {
    console.error("Failed to play sound:", error);
  }
};

export const groupItemsByCategory = (items) => {
  return items.reduce((acc, item) => {
    const category = item.menuItemId?.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});
};
