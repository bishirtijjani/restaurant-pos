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
import SuspenseContent from "./containers/SuspenseContent";
import StoreGuard from "./containers/StoreGuard";
import SuperAdminGuard from "./containers/SuperAdminGuard";
import SuperAdminBlockGuard from "./containers/SuperAdminBlockGuard";
import ModalLayout from "./containers/ModalLayout";
import InitialSyncOverlay from "./components/InitialSyncOverlay";
import { useOfflinePrefetch } from "./features/common/hooks/useOfflinePrefetch";

const Layout = lazy(() => import("./containers/Layout"));
const SuperAdminLayout = lazy(() => import("./containers/SuperAdminLayout"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Register = lazy(() => import("./pages/Register"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

initializeApp();
initializeOfflineSupport();
setupAxiosInterceptors();

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
];

const checkIsPublicPage = () => {
  const currentPath = window.location.pathname;
  return PUBLIC_PATHS.some(
    (path) => currentPath === path || currentPath.startsWith(path + "/"),
  );
};

const ExternalRedirect = ({ url }) => {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return <SuspenseContent />;
};

function App() {
  // Trigger proactive offline caching (only runs if online & authenticated)
  useOfflinePrefetch();

  const dispatch = useDispatch();
  const {
    user,
    token: authToken,
    loading,
  } = useSelector((state) => state.auth);

  // Determine default redirect based on user type
  const getDefaultRedirect = () => {
    if (user?.isSuperAdmin) {
      return "/super-admin";
    }
    return "/app/dashboard";
  };

  // Use ref to track if we've already fetched user
  const hasFetchedUser = useRef(false);

  useEffect(() => {
    themeChange(false);
  }, []);

  useEffect(() => {
    // Don't fetch settings if we're on a public page to save quota
    if (checkIsPublicPage()) return;

    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    // Only run once
    if (hasFetchedUser.current) return;

    // Don't fetch user if we're on a public page
    if (checkIsPublicPage()) {
      hasFetchedUser.current = true;
      return;
    }

    // Only try to fetch current user if we have a token
    if (authToken) {
      dispatch(getCurrentUser());
    }
    hasFetchedUser.current = true;
  }, [dispatch, authToken]);

  if (loading && !authToken && !checkIsPublicPage()) {
    return <SuspenseContent />;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              authToken ? <Navigate to={getDefaultRedirect()} replace /> : <Login />
            }
          />
          <Route
            path="/forgot-password"
            element={
              authToken ? (
                <Navigate to={getDefaultRedirect()} replace />
              ) : (
                <ForgotPassword />
              )
            }
          />
          <Route
            path="/reset-password"
            element={
              authToken ? (
                <Navigate to={getDefaultRedirect()} replace />
              ) : (
                <ResetPassword />
              )
            }
          />
          <Route
            path="/register"
            element={
              authToken ? (
                <Navigate to={getDefaultRedirect()} replace />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path="/home"
            element={<ExternalRedirect url="https://" />}
          />

          <Route
            path="/onboarding"
            element={
              authToken ? <Onboarding /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/app/*"
            element={
              <SuperAdminBlockGuard>
                <StoreGuard>
                  <Layout />
                </StoreGuard>
              </SuperAdminBlockGuard>
            }
          />
          <Route
            path="/super-admin/*"
            element={
              <SuperAdminGuard>
                <SuperAdminLayout />
              </SuperAdminGuard>
            }
          />
          <Route
            path="/*"
            element={
              <Navigate to={authToken ? getDefaultRedirect() : "/login"} replace />
            }
          />
        </Routes>
      </Router>
      <ModalLayout />
      <InitialSyncOverlay />
    </>
  );
}

export default App;
