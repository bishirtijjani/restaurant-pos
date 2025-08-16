import React, { lazy, useEffect } from "react"; // React imports for components and lifecycle hooks
import "./App.css"; // Importing global styles
import {
  BrowserRouter as Router, // For enabling routing in the app
  Route, // Defines individual routes
  Routes, // Groups multiple Route components
  Navigate, // Redirects users to a specific route
} from "react-router-dom"; // Routing library for React
import { themeChange } from "theme-change"; // Library for dynamic theme switching
import checkAuth from "./app/auth"; // Function to check if the user is authenticated
import initializeApp from "./app/init"; // Custom app initialization function

// Importing pages as lazy-loaded components for performance optimization
const Layout = lazy(() => import("./containers/Layout")); // Main app layout (protected)
const Login = lazy(() => import("./pages/Login")); // Login page
const ForgotPassword = lazy(() => import("./pages/ForgotPassword")); // Password recovery page
const ResetPassword = lazy(() => import("./pages/ResetPassword")); // Password recovery page
const Register = lazy(() => import("./pages/Register")); // User registration page
const Home = lazy(() => import("./pages/Home")); // Home page

// Initialize global app configurations
initializeApp();

// Check if the user is authenticated and retrieve their token
const token = checkAuth();

function App() {
  useEffect(() => {
    // Initialize theme-change functionality with Daisy UI
    themeChange(true); // Passing false means themes won't auto-detect
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <>
      {/* Router provides navigation between different pages */}
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />

          {/* Protected routes - place additional protected routes here */}
          <Route path="/app/*" element={<Layout />} />

          {/* Catch-all route for undefined paths such as /hello */}
          <Route
            path="/*"
            element={
              <Navigate
                to={token ? "/app/dashboard" : "/login"} // Changed "/Home" to "/home" to match the defined route
                replace
              />
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
