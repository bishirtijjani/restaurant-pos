// frontend/src/app/init.js
import axios from "axios";
import offlineAxios from "../utils/offline/offlineAxios"; // Import your offline axios

const initializeApp = () => {
  const token = localStorage.getItem("token");

  // Configure both axios instances
  if (token) {
    axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
    offlineAxios.defaults.headers.common["authorization"] = `Bearer ${token}`;
  }

  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
  axios.defaults.withCredentials = true;
  
  offlineAxios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
  offlineAxios.defaults.withCredentials = true;
};

// clear console logs
if (import.meta.env.PRODUCTION) {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
}

export default initializeApp;
