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
import { fetchSettings } from "./features/settings/generalSettings/generalSettingsSlice";
import { getCurrentUser } from "./app/authSlice";

const Layout = lazy(() => import("./containers/Layout"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));

initializeApp();

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
    // Fetch current user if we have a token but no user data
    const storedToken = localStorage.getItem("token");
    if (storedToken && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />

          {/* Protected routes */}
          <Route path="/app/*" element={<Layout />} />

          {/* Catch-all route */}
          <Route
            path="/*"
            element={
              <Navigate to={token ? "/app/dashboard" : "/login"} replace />
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
