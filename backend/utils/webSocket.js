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

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        console.log("Received message:", data);

        // Handle different message types
        if (data.type === "subscribe") {
          ws.stationId = data.stationId;
          console.log(`Client subscribed to station: ${data.stationId}`);
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

const notifyKDS = (eventType, data, stationId = null) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
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

const notifyTableUpdate = (eventType, data) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

module.exports = { initializeWebSocket, notifyKDS, notifyTableUpdate };
