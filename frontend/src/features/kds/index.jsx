// frontend/src/features/kds/index.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RefreshCw,
  Maximize,
  Minimize,
  AlertCircle,
  Wifi,
  WifiOff,
  Settings,
} from "lucide-react";
import {
  fetchKDSOrders,
  fetchStations,
  setCurrentStation,
  playSound,
} from "./kdsSlice";
import OrderCard from "./components/OrderCard";
import StationSelector from "./components/StationSelector";
import SuspenseContent from "../../containers/SuspenseContent";
import { openModal } from "../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";

const KDS = () => {
  const dispatch = useDispatch();
  const {
    orders,
    stations,
    currentStation,
    settings,
    loading,
    error,
    lastUpdate,
  } = useSelector((state) => state.kds);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [manualRefresh, setManualRefresh] = useState(false);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);

  // Ref for the fullscreen container
  const kdsContainerRef = useRef(null);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("kdsSettings");
    if (savedSettings) {
      // Settings are already loaded in the slice initialState
    }
  }, []);

  // Fetch stations on mount
  useEffect(() => {
    dispatch(fetchStations());
  }, [dispatch]);

  // Set initial station
  useEffect(() => {
    if (stations.length > 0 && !currentStation) {
      const savedStationId = localStorage.getItem("kdsCurrentStation");
      const stationId = savedStationId || "all";
      handleStationChange(stationId);
    }
  }, [stations, currentStation]);

  // Fetch orders
  const fetchOrders = useCallback(() => {
    if (currentStation) {
      const stationId =
        currentStation.type === "all" ? "all" : currentStation._id;
      dispatch(fetchKDSOrders({ stationId }));
    }
  }, [dispatch, currentStation]);

  // Initial fetch
  useEffect(() => {
    if (currentStation) {
      fetchOrders();
    }
  }, [currentStation, fetchOrders]);

  // Auto refresh
  useEffect(() => {
    if (!settings.autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, settings.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval, fetchOrders]);

  // Play sound for new orders
  useEffect(() => {
    if (orders.length > previousOrderCount && previousOrderCount > 0) {
      if (settings.soundEnabled) {
        dispatch(playSound());
      }
    }
    setPreviousOrderCount(orders.length);
  }, [orders.length, previousOrderCount, settings.soundEnabled, dispatch]);

  // Online/offline detection
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

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = async () => {
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

  // Manual refresh
  const handleManualRefresh = () => {
    setManualRefresh(true);
    fetchOrders();
    setTimeout(() => setManualRefresh(false), 1000);
  };

  // Station change handler
  const handleStationChange = (stationId) => {
    const station =
      stationId === "all"
        ? { name: "All Stations", type: "all" }
        : stations.find((s) => s._id === stationId);

    if (station) {
      dispatch(setCurrentStation(station));
      localStorage.setItem("kdsCurrentStation", stationId);
    }
  };

  // Grid columns class
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

  if (loading && !orders.length) {
    return <SuspenseContent />;
  }

  return (
    <div
      ref={kdsContainerRef}
      className={`min-h-screen bg-base-200 flex flex-col ${
        isFullscreen ? "fullscreen-mode" : ""
      }`}
    >
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="flex-1">
          <h1 className="text-2xl font-bold ml-4">Kitchen Display</h1>
          <div className="ml-4 flex items-center gap-2">
            {isOnline ? (
              <Wifi size={16} className="text-success" />
            ) : (
              <WifiOff size={16} className="text-error" />
            )}
            <span className="text-sm opacity-70">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex-none gap-2">
          {/* Station Selector */}
          <StationSelector
            stations={stations}
            currentStation={currentStation}
            onStationChange={handleStationChange}
          />

          {/* Order Count */}
          <div className="badge badge-primary badge-lg gap-2">
            <span className="font-bold">{orders.length}</span>
            <span className="hidden md:inline">
              {orders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            className={`btn btn-ghost btn-circle ${
              manualRefresh ? "animate-spin" : ""
            }`}
            title="Refresh Orders"
          >
            <RefreshCw size={20} />
          </button>

          {/* Settings */}
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

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="btn btn-ghost btn-circle"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          {/* Last Update */}
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

      {/* Orders Grid */}
      <div className="flex-1 overflow-auto p-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold mb-2">No Active Orders</h2>
            <p className="text-base-content/70 mb-4">
              New orders will appear here automatically
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
              <OrderCard key={order._id} order={order} settings={settings} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KDS;
