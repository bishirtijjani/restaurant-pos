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
import { showNotification } from "../common/headerSlice";
import {
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import PinLogin from "./components/PinLogin";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [loginObj, setLoginObj] = useState({
    email: localStorage.getItem("lastEmail") || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState("pin");

  const submitForm = async (e) => {
    e.preventDefault();
    const { email, password } = loginObj;
    if (!email || !password) {
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
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-brand/30">
      {/* Immersive Background Engine */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side: Cinematic Branding (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center px-24 border-r border-white/5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-brand/20">
                P
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">
                CODEKET
              </span>
            </div>

            <h1 className="text-7xl font-black tracking-tight leading-[0.9] mb-8">
              Welcome
              <br />
              <span className="text-brand italic">back.</span>
            </h1>

            <p className="text-xl text-white/50 font-medium leading-relaxed max-w-md">
              Access your dashboard to manage your operations with precision and
              clarity.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Authentication Portal */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24 relative overflow-y-auto">
          <div className="w-full max-w-md space-y-12">
            <div className="lg:hidden flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-black text-lg">
                P
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">
                CODEKET
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative"
            >
              {loginMode === "password" && (
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                    Sign In
                  </h2>
                </div>
              )}
              {loginMode === "password" ? (
                <form onSubmit={submitForm} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <InputText
                        defaultValue={loginObj.email}
                        updateType="email"
                        containerStyle="mt-0"
                        labelTitle=""
                        updateFormValue={updateFormValue}
                        placeholder="Email Address"
                        className="pl-14 bg-white/5 border-white/10 focus:border-brand/50 rounded-full"
                      />
                    </div>
                    <div className="relative">
                      <KeyIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <InputText
                        defaultValue={loginObj.password}
                        type={showPassword ? "text" : "password"}
                        updateType="password"
                        labelTitle=""
                        updateFormValue={updateFormValue}
                        placeholder="Password"
                        className="pl-14 bg-white/5 border-white/10 focus:border-brand/50 rounded-full"
                      />
                      <button
                        type="button"
                        className="absolute right-6 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-white/20 hover:text-white/40 transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-white/20 hover:text-white/40 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest px-1">
                    <Link
                      to="/forgot-password"
                      className="text-white/30 hover:text-brand transition-colors"
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
              <p className="text-white/30 font-medium">
                New to the platform?{" "}
                <Link
                  to="/register"
                  className="text-brand font-black hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
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
