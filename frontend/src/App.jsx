// frontend/src/App.jsx
import React, { lazy, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { themeChange } from "theme-change";
import checkAuth from "./app/auth";
import initializeApp from "./app/init";
import { initializeOfflineSupport } from "./app/initOffline";
import { fetchSettings } from "./features/settings/generalSettings/generalSettingsSlice";
import { getCurrentUser } from "./app/authSlice";
import OfflineIndicator from "./components/OfflineIndicator";

const Layout = lazy(() => import("./containers/Layout"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));

initializeApp();

// Initialize offline support
initializeOfflineSupport();

const token = checkAuth();

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const authToken = useSelector((state) => state.auth.token);

  useEffect(() => {
    themeChange(false);
  }, []);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/app/*" element={<Layout />} />
          <Route
            path="/*"
            element={
              <Navigate to={token ? "/app/dashboard" : "/login"} replace />
            }
          />
        </Routes>
      </Router>

      {/* Offline Indicator */}
      <OfflineIndicator />
    </>
  );
}

export default App;
