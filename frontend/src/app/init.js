import axios from "axios";

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
};

export default initializeApp;
