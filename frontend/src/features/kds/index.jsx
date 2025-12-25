import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RefreshCw,
  Maximize,
  Minimize,
  AlertCircle,
  Wifi,
  WifiOff,
  Settings,
  Eye,
  EyeOff,
  Volume2,
} from "lucide-react";
import { fetchKDSOrders, playSound } from "./kdsSlice";
import { playNotificationSound } from "./kdsUtils";
import {
  fetchStations,
  setCurrentStation,
} from "../kdsStations/kdsStationsSlice";
import OrderCard from "./components/OrderCard";
import StationSelector from "./components/StationSelector";
import SuspenseContent from "../../containers/SuspenseContent";
import { openModal } from "../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
import useWebSocket from "../common/hooks/useWebSocket";
import TitleCard from "../../components/Cards/TitleCard";
import { useAuth } from "../../utils/permission";
import { useNavigate } from "react-router-dom";

const KDS = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can, role } = useAuth();

  const { orders, settings, loading, error, lastUpdate } = useSelector(
    (state) => state.kds
  );
  const { stations, currentStation } = useSelector(
    (state) => state.kdsStations
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [manualRefresh, setManualRefresh] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [canViewKDS, setCanViewKDS] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const kdsContainerRef = useRef(null);

  // Check permissions once on mount
  useEffect(() => {
    const hasPermission = can("viewKDS");
    setCanViewKDS(hasPermission);
    setPermissionChecked(true);
  }, [can, role]);

  // Initialize stations (only if has permission)
  useEffect(() => {
    if (permissionChecked && canViewKDS) {
      dispatch(fetchStations());
    }
  }, [dispatch, permissionChecked, canViewKDS]);

  // Set initial station
  useEffect(() => {
    if (stations.length > 0 && !currentStation && canViewKDS) {
      // Default to "all" stations as requested by user
      const stationId = "all";

      const station =
        stationId === "all"
          ? { name: "All Stations", type: "all" }
          : stations.find((s) => s._id === stationId);

      if (station) {
        dispatch(setCurrentStation(station));
      }
    }
  }, [stations, currentStation, dispatch, canViewKDS]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback(
    (data) => {
      if (!canViewKDS) return;

      const { type, data: orderData } = data;

      switch (type) {
        case "order:created":
          if (settings.soundEnabled && !showCompleted) {
            dispatch(playSound());
          }
          if (currentStation) {
            const stationId =
              currentStation.type === "all" ? "all" : currentStation._id;
            dispatch(fetchKDSOrders({ stationId, showCompleted }));
          }
          break;

        case "order:updated":
        case "order:statusChanged":
        case "order:recalled":
        case "order:cancelled":
          if (currentStation) {
            const stationId =
              currentStation.type === "all" ? "all" : currentStation._id;
            dispatch(fetchKDSOrders({ stationId, showCompleted }));
          }
          break;

        default:
          break;
      }
    },
    [currentStation, showCompleted, settings.soundEnabled, dispatch, canViewKDS]
  );

  // WebSocket connection (only if has permission and station is set)
  const { isConnected: wsConnected } = useWebSocket(handleWebSocketMessage, {
    stationId: currentStation?.type === "all" ? "all" : currentStation?._id,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    enabled: canViewKDS && !!currentStation,
  });

  // Initial fetch and refresh when filters change
  useEffect(() => {
    if (!canViewKDS || !currentStation) {
      return;
    }

    const stationId =
      currentStation.type === "all" ? "all" : currentStation._id;

    dispatch(fetchKDSOrders({ stationId, showCompleted }))
      .unwrap()
      .then(() => {
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      });
  }, [currentStation, showCompleted, dispatch, canViewKDS, isInitialLoad]);

  // Online/Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!canViewKDS) return;

    try {
      if (!document.fullscreenElement) {
        await kdsContainerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  const handleManualRefresh = () => {
    if (!currentStation || !canViewKDS) return;

    setManualRefresh(true);
    const stationId =
      currentStation.type === "all" ? "all" : currentStation._id;
    dispatch(fetchKDSOrders({ stationId, showCompleted }));
    setTimeout(() => setManualRefresh(false), 1000);
  };

  const handleStationChange = (stationId) => {
    if (!canViewKDS) return;

    const station =
      stationId === "all"
        ? { name: "All Stations", type: "all" }
        : stations.find((s) => s._id === stationId);

    if (station) {
      dispatch(setCurrentStation(station));
      localStorage.setItem("kdsCurrentStation", stationId);
    }
  };

  const getGridColumns = () => {
    const cols = settings.columns;
    return {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
      6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    }[cols];
  };

  // Show loading while checking permissions
  if (!permissionChecked) {
    return <SuspenseContent />;
  }

  // Access Denied UI
  if (!canViewKDS) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to view the Kitchen Display System.
              </p>
              <p className="text-sm opacity-70 mb-4">
                Your role: <span className="font-bold">{role}</span>
              </p>
              <p className="text-sm opacity-70">
                Contact your administrator if you believe this is an error.
              </p>
              <button
                onClick={() => navigate("/app/dashboard")}
                className="btn btn-primary mt-4"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  // Show loading during initial data fetch
  if (isInitialLoad && loading) {
    return <SuspenseContent />;
  }

  // Audio Context Unlock Overlay
  if (!isAudioUnlocked && canViewKDS) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100 bg-opacity-95 backdrop-blur-sm">
        <div className="text-center max-w-lg p-8">
          <div className="mb-6 flex justify-center">
            <Volume2 size={64} className="text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Start Kitchen Display</h1>
          <p className="mb-8 opacity-70">
            Click the button below to enable sound notifications and start the
            session.
          </p>
          <button
            onClick={() => {
              playNotificationSound(0); // Play silent sound to unlock audio
              setIsAudioUnlocked(true);
            }}
            className="btn btn-primary btn-lg gap-2"
          >
            <PlayCircle size={24} />
            Start Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={kdsContainerRef}
      className="min-h-screen bg-base-200 flex flex-col"
    >
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="flex-1">
          <h1 className="text-2xl font-bold ml-4">Kitchen Display</h1>
          <div className="ml-4 flex items-center gap-2">
            {wsConnected && isOnline ? (
              <Wifi size={16} className="text-success" />
            ) : (
              <WifiOff size={16} className="text-error" />
            )}
            <span className="text-sm opacity-70">
              {wsConnected && isOnline ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex-none gap-2">
          <StationSelector
            stations={stations}
            currentStation={currentStation}
            onStationChange={handleStationChange}
          />

          <div className="form-control">
            <label className="label cursor-pointer gap-2 px-4">
              <span className="label-text hidden md:inline">
                {showCompleted ? "Completed" : "Active"}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
              />
            </label>
          </div>

          <div className="badge badge-primary badge-lg gap-2">
            <span className="font-bold">{orders.length}</span>
            <span className="hidden md:inline">
              {showCompleted
                ? "Completed"
                : orders.length === 1
                ? "Order"
                : "Orders"}
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            className={`btn btn-ghost btn-circle ${
              manualRefresh ? "animate-spin" : ""
            }`}
            title="Refresh Orders"
            disabled={!currentStation}
          >
            <RefreshCw size={20} />
          </button>

          {can("editKDSSettings") && (
            <button
              className="btn btn-ghost btn-circle"
              title="KDS Settings"
              onClick={() => {
                dispatch(
                  openModal({
                    title: "KDS Settings",
                    bodyType: MODAL_BODY_TYPES.KDS_SETTINGS,
                    size: "lg",
                  })
                );
              }}
            >
              <Settings size={20} />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="btn btn-ghost btn-circle"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          {lastUpdate && (
            <div className="hidden lg:block text-xs opacity-70">
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mx-4 mt-4">
          <AlertCircle size={20} />
          <span>{error.message || error}</span>
          <button onClick={handleManualRefresh} className="btn btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Status Indicator */}
      {showCompleted && (
        <div className="alert alert-info mx-4 mt-4">
          <Eye size={20} />
          <span>Viewing completed orders ready for serving</span>
        </div>
      )}

      {/* Orders Grid */}
      <div className="flex-1 overflow-auto p-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold mb-2">
              {showCompleted ? "No Completed Orders" : "No Active Orders"}
            </h2>
            <p className="text-base-content/70 mb-4">
              {showCompleted
                ? "Completed orders will appear here"
                : "New orders will appear here automatically"}
            </p>
            {currentStation && currentStation.type !== "all" && (
              <p className="text-sm opacity-60">
                Showing orders for: {currentStation.name}
              </p>
            )}
          </div>
        ) : (
          <div className={`grid ${getGridColumns()} gap-4 auto-rows-max`}>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                settings={settings}
                isCompletedView={showCompleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KDS;
