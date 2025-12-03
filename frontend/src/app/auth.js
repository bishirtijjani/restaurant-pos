import axios from "axios";
import { refreshSession } from "./authSlice";
import store from "./store";

const setupAxiosInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
      // Don't show loading indicator for background refresh
      if (!config.url.includes("/refresh")) {
        document.body.classList.add("loading-indicator");
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      document.body.classList.remove("loading-indicator");
      return response;
    },
    async (error) => {
      document.body.classList.remove("loading-indicator");
      const originalRequest = error.config;

      // Handle 401 errors
      if (error.response?.status === 401 && !originalRequest._retry) {
        // If the error comes from the refresh endpoint itself, don't retry
        if (originalRequest.url.includes("/auth/refresh")) {
          localStorage.removeItem("token");
          if (!window.location.pathname.includes("/login")) {
             window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          // Attempt to refresh the session
          const result = await store.dispatch(refreshSession()).unwrap();
          
          // Update the header for the original request
          originalRequest.headers.authorization = `Bearer ${result.token}`;
          
          // Retry the original request
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed - redirect to login
          localStorage.removeItem("token");
           if (!window.location.pathname.includes("/login")) {
             window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
