// frontend/src/App.jsx
import React, { lazy, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { themeChange } from "theme-change";
import setupAxiosInterceptors from "./app/auth";
import initializeApp from "./app/init";
import { initializeOfflineSupport } from "./app/initOffline";
import { fetchSettings } from "./features/settings/generalSettings/generalSettingsSlice";
import { getCurrentUser, setUserFromToken } from "./app/authSlice";
import OfflineIndicator from "./components/OfflineIndicator";
import OfflineIndicator from "./components/OfflineIndicator";
import SuspenseContent from "./containers/SuspenseContent";
import StoreGuard from "./containers/StoreGuard";

const Layout = lazy(() => import("./containers/Layout"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));

initializeApp();
initializeOfflineSupport();
setupAxiosInterceptors();

function App() {
  const dispatch = useDispatch();
  const {
    user,
    token: authToken,
    loading,
  } = useSelector((state) => state.auth);

  // Use ref to track if we've already fetched user
  const hasFetchedUser = useRef(false);

  useEffect(() => {
    themeChange(false);
  }, []);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    // Only run once
    if (hasFetchedUser.current) return;

    // Don't fetch user if we're on a public page
    const publicPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/home",
    ];
    const isPublicPage = publicPaths.some((path) =>
      window.location.pathname.includes(path)
    );

    if (isPublicPage) {
      hasFetchedUser.current = true;
      return;
    }

    // Only try to fetch current user if we have a token
    if (authToken) {
      dispatch(getCurrentUser());
    }
    hasFetchedUser.current = true;
  }, [dispatch, authToken]);

  if (loading && !authToken) {
    return <SuspenseContent />;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              authToken ? <Navigate to="/app/dashboard" replace /> : <Login />
            }
          />
          <Route
            path="/forgot-password"
            element={
              authToken ? (
                <Navigate to="/app/dashboard" replace />
              ) : (
                <ForgotPassword />
              )
            }
          />
          <Route
            path="/reset-password"
            element={
              authToken ? (
                <Navigate to="/app/dashboard" replace />
              ) : (
                <ResetPassword />
              )
            }
          />
          <Route
            path="/register"
            element={
              authToken ? (
                <Navigate to="/app/dashboard" replace />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path="/home"
            element={
              authToken ? <Navigate to="/app/dashboard" replace /> : <Home />
            }
          />
          <Route
            path="/app/*"
            element={
              <StoreGuard>
                <Layout />
              </StoreGuard>
            }
          />
          <Route
            path="/*"
            element={
              <Navigate to={authToken ? "/app/dashboard" : "/login"} replace />
            }
          />
        </Routes>
      </Router>

      <OfflineIndicator />
    </>
  );
}

export default App;
