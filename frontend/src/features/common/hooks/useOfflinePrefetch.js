import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useOnlineStatus } from "./useOffline";
// import { toast } from "react-toastify"; // Optional: decide if we want notifications

export const useOfflinePrefetch = () => {
  const isOnline = useOnlineStatus();
  // Safe access to auth state, defaulting to null if state.auth is undefined
  const user = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);

  const [prefetched, setPrefetched] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const prefetchData = async () => {
      // Logic: Only run if:
      // 1. Online
      // 2. User is authenticated (has user object + token)
      // 3. Haven't run yet this session (prefetched is false)
      // 4. Not currently running
      if (!isOnline || !user || !token || prefetched || isPrefetching) return;

      try {
        if (isMounted) setIsPrefetching(true);
        console.log("🚀 Starting Proactive Offline Prefetch...");

        // We use a simple strategy: Sequential batches to avoid overwhelming the server
        // The offlineAxios interceptor will automatically cache these responses.

        // Batch 1: Core Config (Lightweight)
        await Promise.allSettled([
          axios.get("/api/general-settings"),
          axios.get("/api/users"), // Staff
          axios.get("/api/tables"),
          axios.get("/api/floors"),
          axios.get("/api/taxes"), // Ensure tax rules are cached
          axios.get("/api/organization"),
          axios.get("/api/stores"),
        ]);

        // Batch 2: Menu & Products (Medium)
        if (!isMounted) return;
        await Promise.allSettled([
          axios.get("/api/categories"),
          axios.get("/api/menu-items"),
          axios.get("/api/add-on-groups"),
          axios.get("/api/discounts"),
          axios.get("/api/brand/menu"), // Brand menu if applicable
        ]);

        // Batch 3: Operations (Heavier)
        if (!isMounted) return;
        // Run these sequentially to be nice to the network
        try {
          await axios.get("/api/inventory");
        } catch (e) {
          console.warn("Prefetch inventory failed", e);
        }
        try {
          await axios.get("/api/suppliers");
        } catch (e) {
          console.warn("Prefetch suppliers failed", e);
        }
        try {
          await axios.get("/api/customers");
        } catch (e) {
          console.warn("Prefetch customers failed", e);
        }
        try {
          await axios.get("/api/reservations");
        } catch (e) {
          console.warn("Prefetch reservations failed", e);
        }

        // Fetch recent active orders
        if (!isMounted) return;
        try {
          await axios.get("/api/orders");
        } catch (e) {
          console.warn("Prefetch orders failed", e);
        }

        // KDS data
        try {
          await axios.get("/api/kds");
        } catch (e) {
          console.warn("Prefetch KDS failed", e);
        }

        if (isMounted) {
          console.log("✅ Proactive Offline Prefetch Complete");
          setPrefetched(true);
        }
      } catch (error) {
        console.error("❌ Proactive Prefetch Failed", error);
        // We don't retry immediately to avoid loops.
      } finally {
        if (isMounted) setIsPrefetching(false);
      }
    };

    // Small delay (3s) to allow initial app load/render to settle and critical UI requests to finish first
    const timer = setTimeout(() => {
      prefetchData();
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOnline, user, token, prefetched, isPrefetching]);

  return { isPrefetching, prefetched };
};
