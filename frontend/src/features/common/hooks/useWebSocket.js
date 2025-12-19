import { useEffect, useRef, useCallback, useState } from "react";
import { useSelector } from "react-redux";

const WS_URL =
  process.env.NODE_ENV === "production"
    ? `wss://${window.location.host}/ws`
    : "ws://localhost:5000/ws";

const useWebSocket = (onMessage, options = {}) => {
  // Get active storeId from Redux
  const { activeStoreId } = useSelector((state) => state.commonStore);
  const {
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    stationId = null,
    enabled = true,
  } = options;

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Subscribe with storeId and stationId for proper scoping
        const subscriptionMessage = {
          type: "subscribe",
        };

        // Always include storeId for multi-store filtering
        if (activeStoreId) {
          subscriptionMessage.storeId = activeStoreId;
        }

        // Include stationId if specified (for KDS)
        if (stationId) {
          subscriptionMessage.stationId = stationId;
        }

        ws.send(JSON.stringify(subscriptionMessage));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts && enabled) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `Reconnecting... Attempt ${reconnectAttemptsRef.current}`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error("Max reconnection attempts reached");
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error creating WebSocket:", error);
    }
  }, [
    onMessage,
    reconnectInterval,
    maxReconnectAttempts,
    stationId,
    enabled,
    activeStoreId,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { isConnected, send, disconnect };
};

export default useWebSocket;
