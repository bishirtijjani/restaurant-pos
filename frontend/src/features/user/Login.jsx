import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  loginUserWithPin,
  clearAuthError,
} from "../../app/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import {
  showNotification,
  removeNotificationMessage,
} from "../common/headerSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import PinLogin from "./components/PinLogin";
import SupportLink from "../../components/Support/SupportLink";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const { newNotificationMessage, newNotificationStatus } = useSelector(
    (state) => state.header,
  );

  const [loginObj, setLoginObj] = useState({
    email: localStorage.getItem("lastEmail") || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState("pin");
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false,
  });

  // Handle toast notifications
  useEffect(() => {
    if (newNotificationMessage !== "") {
      if (newNotificationStatus === 1) toast.success(newNotificationMessage);
      if (newNotificationStatus === 0) toast.error(newNotificationMessage);
      dispatch(removeNotificationMessage());
    }
  }, [newNotificationMessage, newNotificationStatus, dispatch]);

  const submitForm = async (e) => {
    e.preventDefault();
    const { email, password } = loginObj;

    // Reset field errors
    setFieldErrors({ email: false, password: false });

    // Validate fields
    if (!email || !password) {
      setFieldErrors({
        email: !email,
        password: !password,
      });
      dispatch(
        showNotification({ message: "Please fill in all fields", status: 0 }),
      );
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        localStorage.setItem("lastEmail", email);
        navigate("/app/dashboard");
      } else if (loginUser.rejected.match(result)) {
        dispatch(
          showNotification({
            message: result.payload || "Invalid email or password",
            status: 0,
          }),
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "An unexpected error occurred!",
          status: 0,
        }),
      );
    }
  };

  const submitPinLogin = async (pinCode) => {
    const { email } = loginObj;
    if (!email) {
      dispatch(
        showNotification({
          message: "Please enter your email first to use PIN login",
          status: 0,
        }),
      );
      return;
    }

    try {
      const result = await dispatch(loginUserWithPin({ email, pinCode }));
      if (loginUserWithPin.fulfilled.match(result)) {
        localStorage.setItem("lastEmail", email);
        navigate("/app/dashboard");
      } else if (loginUserWithPin.rejected.match(result)) {
        dispatch(
          showNotification({
            message: result.payload || "Invalid PIN",
            status: 0,
          }),
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "An unexpected error occurred!",
          status: 0,
        }),
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
    <div className="relative min-h-screen bg-stone-50 text-gray-900 font-sans selection:bg-brand/30">
      {/* Immersive Background Engine */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side: Cinematic Branding (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center px-24 border-r border-gray-300">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-brand/30">
                <img src="/favicon.png" alt="" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-gray-900">
                RESTAURANT POS
              </span>
            </div>

            <h1 className="text-7xl font-black tracking-tight leading-[0.9] mb-8 text-gray-900">
              Welcome
              <br />
              <span className="text-brand italic">back.</span>
            </h1>

            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-md">
              Access your dashboard to manage your operations with precision and
              clarity.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Authentication Portal */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24 relative">
          <div className="w-full max-w-md space-y-12">
            <div className="lg:hidden flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-black text-lg text-white">
                P
              </div>
              <span className="text-lg font-black tracking-tighter uppercase text-gray-900">
                RESTAURANT POS
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white border-2 border-gray-200 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-gray-300/60 relative"
            >
              {loginMode === "password" && (
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                    Sign In
                  </h2>
                </div>
              )}
              {loginMode === "password" ? (
                <form onSubmit={submitForm} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <EnvelopeIcon
                        className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.email ? "text-error" : "text-gray-400"}`}
                      />
                      <InputText
                        defaultValue={loginObj.email}
                        updateType="email"
                        containerStyle="mt-0"
                        labelTitle=""
                        updateFormValue={(update) => {
                          updateFormValue(update);
                          if (fieldErrors.email)
                            setFieldErrors((prev) => ({
                              ...prev,
                              email: false,
                            }));
                        }}
                        placeholder="Email Address"
                        className={`pl-14 bg-gray-50 border-2 text-gray-900 focus:border-brand rounded-full ${fieldErrors.email ? "border-error" : "border-gray-300"}`}
                      />
                    </div>
                    <div className="relative">
                      <KeyIcon
                        className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.password ? "text-error" : "text-gray-400"}`}
                      />
                      <InputText
                        defaultValue={loginObj.password}
                        type={showPassword ? "text" : "password"}
                        updateType="password"
                        labelTitle=""
                        updateFormValue={(update) => {
                          updateFormValue(update);
                          if (fieldErrors.password)
                            setFieldErrors((prev) => ({
                              ...prev,
                              password: false,
                            }));
                        }}
                        placeholder="Password"
                        className={`pl-14 bg-gray-50 text-gray-900 focus:border-brand/50 rounded-full ${fieldErrors.password ? "border-error" : "border-gray-200"}`}
                      />
                      <button
                        type="button"
                        className="absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest px-1">
                    <Link
                      to="/forgot-password"
                      className="text-gray-500 hover:text-brand transition-colors font-semibold"
                    >
                      Forgot Credentials?
                    </Link>
                    <button
                      type="button"
                      className="text-brand hover:text-brand-hover flex items-center gap-1.5"
                      onClick={switchToPinMode}
                    >
                      <KeyIcon className="w-4 h-4" />
                      PIN Login
                    </button>
                  </div>

                  {error && <ErrorText>{error}</ErrorText>}

                  <button
                    type="submit"
                    className="w-full bg-brand text-white hover:bg-brand-hover font-black py-4 rounded-full transition-all flex items-center justify-center gap-2 group shadow-xl shadow-brand/20"
                  >
                    {loading ? (
                      <span className="loading loading-spinner text-white"></span>
                    ) : (
                      <>
                        Sign In{" "}
                        <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <PinLogin
                  email={loginObj.email}
                  onLogin={submitPinLogin}
                  onCancel={switchToPasswordMode}
                  loading={loading}
                  onEmailChange={(newEmail) => {
                    setLoginObj({ ...loginObj, email: newEmail });
                    localStorage.setItem("lastEmail", newEmail);
                  }}
                />
              )}
            </motion.div>

            <div className="text-center">
              <p className="text-gray-600 font-medium">
                New to the platform?{" "}
                <Link
                  to="/register"
                  className="text-brand font-black hover:text-brand-hover hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <SupportLink />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

// Minimalist local component to avoid missing hero icon if needed
const ChevronRightIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

export default Login;
