// frontend/src/components/InitialSyncOverlay.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Loader2, WifiOff } from "lucide-react";
import { offlineStorage } from "../utils/offline/storage";
import { syncManager } from "../utils/offline/syncManager";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

/**
 * Blocks the POS UI on first boot until the baseline data (menu, categories,
 * tables, settings) is in IndexedDB. Without this, an operator could open
 * the app, see an empty menu, and try to take an order against nothing —
 * a confusing failure mode that looks like a broken POS, not a syncing one.
 *
 * Logic:
 *  - On mount, peek into IndexedDB. If menu + categories are both empty,
 *    we treat this as first-boot (or post-logout reset).
 *  - Trigger syncManager.syncAll(); subscribe to its event stream.
 *  - Show a spinner + status text. Dismiss once 'sync:complete' fires
 *    (success OR failure — operator can retry from inside the app).
 *  - If the user is offline at first boot, show a clear "needs internet
 *    first time" message rather than a spinner that never resolves.
 */
const InitialSyncOverlay = () => {
  const user = useSelector((s) => s.auth?.user);
  const token = useSelector((s) => s.auth?.token);
  const isOnline = useOnlineStatus();

  const [needsInitialSync, setNeedsInitialSync] = useState(null); // null = checking
  const [statusText, setStatusText] = useState("Loading menu and settings…");
  const [done, setDone] = useState(false);
  const [errored, setErrored] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // First-boot detection
  useEffect(() => {
    if (!user || !token) {
      setNeedsInitialSync(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [menuItems, categories] = await Promise.all([
          offlineStorage.getAll("menuItems"),
          offlineStorage.getAll("categories"),
        ]);
        if (cancelled) return;
        const fresh = menuItems.length === 0 && categories.length === 0;
        setNeedsInitialSync(fresh);
        if (!fresh) setDone(true);
      } catch {
        if (!cancelled) {
          setNeedsInitialSync(false);
          setDone(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, token]);

  // Drive the sync + listen for events
  useEffect(() => {
    if (!needsInitialSync || done) return;
    if (!isOnline) {
      setStatusText("Waiting for connection — first launch needs internet.");
      return;
    }

    const unsub = syncManager.addListener((event) => {
      if (event.type === "pull:complete" && event.store) {
        setStatusText(`Loaded ${event.store} (${event.count} items)…`);
      }
      if (event.type === "sync:complete") {
        if (event.success === false) {
          setErrored(true);
          setStatusText(event.error || "Initial sync failed");
        }
        setDone(true);
      }
    });

    syncManager.syncAll();

    // Defensive: if syncAll bails early without firing an event
    // (e.g., token expired right between mount and call), surface the
    // retry button after 30s so the operator isn't stuck on a spinner.
    const timeoutId = setTimeout(() => {
      setTimedOut(true);
      setStatusText("Taking longer than expected. Tap retry to try again.");
    }, 30000);

    return () => {
      unsub();
      clearTimeout(timeoutId);
    };
  }, [needsInitialSync, done, isOnline]);

  if (done || needsInitialSync === false || needsInitialSync === null)
    return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-base-100/95 backdrop-blur flex flex-col items-center justify-center px-6 text-center">
      {isOnline ? (
        <Loader2 size={48} className="animate-spin text-primary" />
      ) : (
        <WifiOff size={48} className="text-warning" />
      )}
      <h2 className="text-xl font-semibold mt-6">
        {isOnline ? "Setting up your store…" : "Connection required"}
      </h2>
      <p className="text-sm text-base-content/70 mt-2 max-w-md">{statusText}</p>
      {!isOnline && (
        <p className="text-xs text-base-content/50 mt-4 max-w-md">
          The first launch needs to download your menu, tables, and settings.
          Once cached, the POS works offline.
        </p>
      )}
      {(errored || timedOut) && (
        <button
          className="btn btn-sm btn-outline mt-6"
          onClick={() => {
            setErrored(false);
            setTimedOut(false);
            setDone(false);
            setStatusText("Retrying…");
            syncManager.syncAll();
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default InitialSyncOverlay;
