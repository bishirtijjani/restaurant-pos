import axios from "axios";

const initializeApp = () => {
  const token = localStorage.getItem("token");
  // Setting base URL for all API requests via axios

  if (token) {
    axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
  }
  if (import.meta.env.MODE === "development") {
    // dev code
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
  } else {
    // Prod build code
    axios.defaults.baseURL = "";

    // Removing console.log from prod
    console.log = () => {};

    // init analytics here
  }
};

export default initializeApp;
