import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  loginUserWithPin,
  clearAuthError,
} from "../../app/authSlice"; // Import the loginUser thunk
import { Link, useNavigate } from "react-router-dom";
import LoginHeroSection from "./LoginHeroSection";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import { showNotification } from "../common/headerSlice";
import { EyeIcon, EyeSlashIcon, KeyIcon } from "@heroicons/react/24/outline";
import PinLogin from "./components/PinLogin";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth); // Get loading and error from Redux

  const [loginObj, setLoginObj] = useState({
    email: localStorage.getItem("lastEmail") || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState("pin"); // 'password' or 'pin' - PIN is default for quick POS access

  const submitForm = async (e) => {
    e.preventDefault();
    const { email, password } = loginObj;
    if (!email || !password) {
      dispatch(
        showNotification({ message: "Please fill in all fields", status: 0 })
      );
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        localStorage.setItem("lastEmail", email);
        navigate("/app/dashboard");
      } else if (loginUser.rejected.match(result)) {
        // Error is already set in Redux state and will be displayed
        // Also show a notification for better UX
        dispatch(
          showNotification({
            message: result.payload || "Invalid email or password",
            status: 0,
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "An unexpected error occurred!",
          status: 0,
        })
      );
    }
  };

  const submitPinLogin = async (pinCode) => {
    const { email } = loginObj;
    if (!email) {
      dispatch(
        showNotification({
          message: "Email is required for PIN login",
          status: 0,
        })
      );
      setLoginMode("password");
      return;
    }

    try {
      const result = await dispatch(loginUserWithPin({ email, pinCode }));
      if (loginUserWithPin.fulfilled.match(result)) {
        localStorage.setItem("lastEmail", email);
        navigate("/app/dashboard");
      } else if (loginUserWithPin.rejected.match(result)) {
        // Error is already set in Redux state and will be displayed
        // Also show a notification for better UX
        dispatch(
          showNotification({
            message: result.payload || "Invalid PIN",
            status: 0,
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "An unexpected error occurred!",
          status: 0,
        })
      );
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  const switchToPasswordMode = () => {
    dispatch(clearAuthError());
    setLoginMode("password");
  };

  const switchToPinMode = () => {
    dispatch(clearAuthError());
    setLoginMode("pin");
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl overflow-hidden">
          <div className="hidden md:block">
            <LoginHeroSection />
          </div>
          <div className="py-24 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">
              {loginMode === "password" ? "Login" : "PIN Login"}
            </h2>

            {loginMode === "password" ? (
              <form onSubmit={submitForm}>
                <div className="mb-4">
                  <InputText
                    defaultValue={loginObj.email}
                    updateType="email"
                    containerStyle="mt-4"
                    labelTitle="Email"
                    updateFormValue={updateFormValue}
                  />
                  <div className="relative mt-4">
                    <InputText
                      defaultValue={loginObj.password}
                      type={showPassword ? "text" : "password"}
                      updateType="password"
                      labelTitle="Password"
                      updateFormValue={updateFormValue}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-10"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm">
                      Forgot Password?{" "}
                      <Link
                        to="/forgot-password"
                        className="text-primary hover:underline"
                      >
                        Click here
                      </Link>
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-primary gap-2"
                      onClick={switchToPinMode}
                    >
                      <KeyIcon className="w-4 h-4" />
                      Use PIN
                    </button>
                  </div>
                </div>

                {error && <ErrorText>{error}</ErrorText>}
                <button type="submit" className={`btn mt-2 w-full btn-primary`}>
                  <span className={`${loading ? "loading" : ""}`}>Login</span>
                </button>

                <div className="text-center mt-4">
                  Don't have an account?{" "}
                  <Link className="text-primary hover:underline" to="/register">
                    Register
                  </Link>
                </div>
              </form>
            ) : (
              <PinLogin
                email={loginObj.email}
                onLogin={submitPinLogin}
                onCancel={switchToPasswordMode}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
