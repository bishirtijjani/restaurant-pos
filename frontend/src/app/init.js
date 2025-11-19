// frontend/src/app/init.js
import axios from "axios";
import { connectionMonitor } from "../utils/offline/connectionMonitor";

const initializeApp = () => {
  const token = localStorage.getItem("token");

  if (token) {
    axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
  }

  if (import.meta.env.MODE === "development") {
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
  } else {
    axios.defaults.baseURL = "";
    console.log = () => {};
  }

  // Initialize connection monitoring
  connectionMonitor.setupListeners();

  console.log(
    "🟢 App initialized. Online status:",
    connectionMonitor.isOnline()
  );
};

export default initializeApp;
