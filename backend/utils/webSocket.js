const WebSocket = require("ws");

let wss = null;

const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    console.log("WebSocket client connected");

    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);
        console.log("Received message:", data);

        // Handle different message types
        if (data.type === "subscribe") {
          // Authentication check
          if (!data.token) {
            ws.send(
              JSON.stringify({ type: "error", message: "Auth required" })
            );
            return;
          }

          try {
            const jwt = require("jsonwebtoken");
            const mongoose = require("mongoose");
            // Used dynamic require or ensure User model is loaded
            const User = mongoose.model("User");

            const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("stores");

            if (!user) {
              ws.send(
                JSON.stringify({ type: "error", message: "User not found" })
              );
              return;
            }

            // Verify store access
            const hasAccess = user.stores.some(
              (s) =>
                s.storeId.toString() === data.storeId && s.status === "active"
            );

            if (!hasAccess) {
              ws.send(
                JSON.stringify({ type: "error", message: "Access denied" })
              );
              return;
            }

            ws.stationId = data.stationId;
            ws.storeId = data.storeId;
            console.log(
              `Client subscribed to station: ${data.stationId} in store: ${data.storeId} (User: ${user._id})`
            );
          } catch (err) {
            console.error("WS Auth Error:", err);
            ws.send(
              JSON.stringify({ type: "error", message: "Invalid token" })
            );
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  // Heartbeat to detect broken connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  return wss;
};

const notifyKDS = (eventType, data, stationId = null, storeId = null) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Filter by Store ID (CRITICAL)
      // If storeId is provided, only send to clients in that store
      // If client has no storeId (legacy/error), maybe block or allow? Safer to block.
      if (storeId && client.storeId !== storeId) {
        return;
      }

      // If stationId is specified, only send to matching clients
      if (
        stationId === null ||
        client.stationId === stationId ||
        client.stationId === "all"
      ) {
        client.send(message);
      }
    }
  });
};

const notifyTableUpdate = (eventType, data, storeId = null) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Filter by Store ID
      if (storeId && client.storeId !== storeId) {
        return; // Skip clients in other stores
      }
      client.send(message);
    }
  });
};

module.exports = {
  initializeWebSocket,
  notifyKDS,
  notifyTableUpdate,
  notifyFloorUpdate: notifyTableUpdate, // Alias for floor controller compatibility
};
