// frontend/src/hooks/useOnlineStatus.jsx
import { useEffect, useState } from "react";
import { connectionMonitor } from "../utils/offline/connectionMonitor";

/**
 * Subscribes to connectionMonitor and returns the current online status.
 * Components that gate behavior on connectivity (e.g., disabling card payments
 * while offline) should use this instead of reading navigator.onLine directly,
 * because navigator.onLine is unreliable and doesn't react to API-side outages.
 */
export const useOnlineStatus = () => {
  const [online, setOnline] = useState(() => connectionMonitor.isOnline());

  useEffect(() => {
    const unsubscribe = connectionMonitor.addListener((status) => {
      setOnline(status.online);
    });
    return unsubscribe;
  }, []);

  return online;
};

export default useOnlineStatus;
