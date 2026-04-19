import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthError } from "../../app/authSlice";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import ErrorText from "../../components/Typography/ErrorText";
import SupportLink from "../../components/Support/SupportLink";

const STEPS = {
  IDENTITY: 0,
  CREDENTIALS: 1,
  FINISHING: 2,
};

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(STEPS.IDENTITY);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // Clear auth errors on mount
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  // Shake effect trigger
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleNext = () => {
    if (currentStep === STEPS.IDENTITY) {
      if (!formData.email.trim()) {
        setError("Email is required");
        triggerShake();
        return;
      }
      if (!formData.fullname.trim()) {
        setError("Please tell us your name");
        triggerShake();
        return;
      }
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        triggerShake();
        return;
      }

      setError("");
      dispatch(clearAuthError());
      setCurrentStep(STEPS.CREDENTIALS);
    }
  };

  const handleBack = () => {
    if (currentStep === STEPS.CREDENTIALS) {
      setCurrentStep(STEPS.IDENTITY);
      setError(""); // Clear error when going back
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      triggerShake();
      return;
    }
    setError("");
    dispatch(clearAuthError());

    try {
      await dispatch(
        registerUser({
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
        }),
      ).unwrap();

      setCurrentStep(STEPS.FINISHING);
      setTimeout(() => navigate("/app"), 1500);
    } catch (err) {
      // Error handled by authError selector, but trigger shake
      triggerShake();
    }
  };

  const isDuplicateEmailError =
    authError &&
    (authError.toLowerCase().includes("already registered") ||
      authError.toLowerCase().includes("email already in use"));

  return (
    <div className="relative min-h-screen bg-stone-50 text-gray-900 font-sans selection:bg-brand/30">
      {/* Immersive Background Engine */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />

        {/* Animated Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side: Brand Visual (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center px-24 border-r border-gray-300">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-brand/30 text-white">
                C
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900">
                CODEKET
              </span>
            </div>

            <h1 className="text-7xl font-black tracking-tight leading-[0.9] mb-8 text-gray-900">
              Create your
              <br />
              <span className="text-brand">account.</span>
            </h1>

            <div className="space-y-6 max-w-md">
              <p className="text-xl text-gray-700 font-medium leading-relaxed">
                Streamline your restaurant operations with our unified
                management platform.
              </p>

              <div className="flex flex-col gap-4 mt-12">
                {[
                  {
                    icon: ShieldCheckIcon,
                    text: "Secure cloud infrastructure",
                  },
                  {
                    icon: CheckCircleIcon,
                    text: "Real-time data synchronization",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <item.icon className="w-5 h-5 text-brand" />
                    <span className="font-bold text-xs uppercase tracking-widest">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Wizard */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-24">
          <div className="max-w-md w-full mx-auto">
            <AnimatePresence mode="wait">
              {currentStep === STEPS.IDENTITY && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    x: shake ? [-10, 10, -10, 10, 0] : 0,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-brand mb-4 block">
                      Step 1 of 2
                    </span>
                    <h2 className="text-4xl font-black tracking-tight mb-2 text-gray-900">
                      Getting Started
                    </h2>
                    <p className="text-gray-600 font-medium">
                      Tell us a bit about yourself to create your account.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Full Name Input */}
                    <div className="relative">
                      <UserIcon className="absolute left-6 top-[1.125rem] w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullname}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            fullname: e.target.value,
                          });
                          if (error) setError("");
                          dispatch(clearAuthError());
                        }}
                        onKeyPress={(e) => e.key === "Enter" && handleNext()}
                        placeholder="Your Full Name"
                        autoFocus
                        className={`w-full bg-gray-50 border-2 rounded-full py-4 pl-14 pr-6 focus:outline-none focus:bg-white transition-all text-lg font-medium text-gray-900 placeholder:text-gray-500 shadow-inner ${
                          error && error.toLowerCase().includes("name")
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-300 focus:border-brand"
                        }`}
                      />
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-6 top-[1.125rem] w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          });
                          if (error) setError("");
                          dispatch(clearAuthError());
                        }}
                        onKeyPress={(e) => e.key === "Enter" && handleNext()}
                        placeholder="Work Email Address"
                        className={`w-full bg-gray-50 border-2 rounded-full py-4 pl-14 pr-6 focus:outline-none focus:bg-white transition-all text-lg font-medium text-gray-900 placeholder:text-gray-500 shadow-inner ${
                          error &&
                          (error.toLowerCase().includes("email") ||
                            error.toLowerCase().includes("already registered"))
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-300 focus:border-brand"
                        }`}
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl">
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-bold">{error}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full bg-brand hover:bg-brand-hover text-white font-black py-4 rounded-full shadow-xl shadow-brand/20 transition-all flex items-center justify-center gap-2"
                  >
                    Next Step
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {currentStep === STEPS.CREDENTIALS && (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    x: shake ? [-10, 10, -10, 10, 0] : 0,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-3xl border-2 border-gray-300">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand/60">
                          Account Email
                        </span>
                        <span className="font-semibold text-gray-800">
                          {formData.email}
                        </span>
                      </div>
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    </div>

                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group font-semibold"
                    >
                      <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-sm font-bold uppercase tracking-widest">
                        Back & Edit
                      </span>
                    </button>

                    <div>
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-brand mb-4 block">
                        Step 2 of 2
                      </span>
                      <h2 className="text-4xl font-black tracking-tight mb-2 text-gray-900">
                        Account Details
                      </h2>
                      <p className="text-gray-600 font-medium">
                        Set your password for secure access.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                      <KeyIcon className="absolute left-6 top-[1.125rem] w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          });
                          if (authError) dispatch(clearAuthError());
                        }}
                        placeholder="Password"
                        className={`w-full bg-gray-50 border-2 rounded-full py-4 pl-14 pr-6 focus:outline-none transition-all font-semibold text-lg text-gray-900 placeholder:text-gray-500 shadow-inner ${
                          authError
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-300 focus:border-brand"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-[1.125rem] text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {(authError || error) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 text-center space-y-4"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mb-1" />
                            <p className="text-red-800 font-semibold">
                              {authError || error}
                            </p>
                            {isDuplicateEmailError && (
                              <div className="flex gap-4 w-full mt-2">
                                <Link
                                  to="/login"
                                  className="flex-1 bg-gray-900 text-white py-3 rounded-full font-bold hover:bg-gray-800 transition-colors text-sm"
                                >
                                  Log In
                                </Link>
                                <button
                                  type="button"
                                  onClick={handleBack}
                                  className="flex-1 bg-red-100 text-red-700 py-3 rounded-full font-bold hover:bg-red-200 transition-colors text-sm"
                                >
                                  Change Email
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={loading || isDuplicateEmailError}
                      className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-black py-4 rounded-full shadow-xl shadow-brand/20 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "Create Account"
                      )}
                      {!loading && <ChevronRightIcon className="w-5 h-5" />}
                    </button>
                  </form>
                </motion.div>
              )}

              {currentStep === STEPS.FINISHING && (
                <motion.div
                  key="finishing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand/20">
                    <CheckCircleIcon className="w-12 h-12 text-brand" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight text-gray-900">
                    Account Created!
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Entering your workspace...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 pt-8 border-t border-gray-300 text-center">
              <p className="text-gray-600 font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-brand hover:text-brand-hover transition-colors font-black"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <SupportLink />
    </div>
  );
}

export default Register;
