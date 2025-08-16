import { store } from "../app/store"; // Adjust the import based on your store setup
import { addNotification } from "../features/common/rightDrawerSlice";

const socket = new WebSocket("ws://your-websocket-url");

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
