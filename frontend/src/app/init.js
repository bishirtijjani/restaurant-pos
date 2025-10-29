import axios from "axios";

const initializeApp = () => {
  const token = localStorage.getItem("token");
  // Setting base URL for all API requests via axios
  // axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.baseURL = "";
  if (token) {
    axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
  }
  if (import.meta.env.MODE === "development") {
    // dev code
  } else {
    // Prod build code

    // Removing console.log from prod
    console.log = () => {};

    // init analytics here
  }
};

export default initializeApp;
