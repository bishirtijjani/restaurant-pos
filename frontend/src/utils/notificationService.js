import { store } from "../app/store"; // Adjust the import based on your store setup
import { addNotification } from "../features/common/rightDrawerSlice";

const getWsUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
  const host = baseUrl.replace(/^https?:\/\//, "");
  return `${wsProtocol}://${host}/ws`;
};

const socket = new WebSocket(getWsUrl());

socket.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  store.dispatch(addNotification(notification));
};

export const initNotificationService = () => {
  socket.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };
};
