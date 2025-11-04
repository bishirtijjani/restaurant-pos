import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../utils/Helpers";

// Helper to check if the token is expired
const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 < Date.now(); // Token expiration in milliseconds
  } catch {
    return true;
  }
};

const checkAuth = () => {
  const TOKEN = getToken();
  const PUBLIC_ROUTES = [
    "login",
    "forgot-password",
    "reset-password",
    "register",
    "documentation",
    "home",
  ];

  const isPublicPage = PUBLIC_ROUTES.some((route) =>
    window.location.href.includes(route)
  );

  if (!TOKEN || isTokenExpired(TOKEN)) {
    if (!isPublicPage) {
      window.location.href = "/home";
    }
    return;
  }

  // Redirect to login if no token and not a public page
  if (!TOKEN && !isPublicPage) {
    window.location.href = "/login";
    return;
  }

  // Set up Axios defaults and interceptors if a token exists
  if (TOKEN) {
    axios.interceptors.request.use(
      (config) => {
        document.body.classList.add("loading-indicator");
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => {
        document.body.classList.remove("loading-indicator");
        return response;
      },
      (error) => {
        document.body.classList.remove("loading-indicator");

        // Handle 401 errors globally
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }
    );

    return TOKEN;
  }
};

export default checkAuth;
