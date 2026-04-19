import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import SupportLink from "../../components/Support/SupportLink";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        setLoading(false);
        return;
      }

      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        setErrorMessage("Invalid or missing token.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        navigate("/login");
      } else {
        setErrorMessage(data.message || "Error resetting password.");
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-stone-50 text-gray-900 overflow-hidden font-sans selection:bg-brand/30">
      {/* Immersive Background Engine */}
      <div className="absolute inset-0 z-0 pointer-events-none">
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

      <div className="flex min-h-screen items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-gray-200 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-gray-300/60 relative"
          >
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand border border-brand/20">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                New Identity
              </h2>
              <p className="text-gray-600 font-semibold">
                Establish your new secure credentials
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleResetPassword();
              }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="relative">
                  <KeyIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <InputText
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    updateType="password"
                    containerStyle="mt-0"
                    labelTitle=""
                    placeholder="New Password"
                    updateFormValue={({ value }) => setNewPassword(value)}
                    className="pl-14 bg-gray-50 border-2 border-gray-300 focus:border-brand rounded-full text-gray-900 shadow-inner"
                  />
                  <button
                    type="button"
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <KeyIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <InputText
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    updateType="confirmPassword"
                    containerStyle="mt-0"
                    labelTitle=""
                    placeholder="Confirm New Password"
                    updateFormValue={({ value }) => setConfirmPassword(value)}
                    className="pl-14 bg-gray-50 border-2 border-gray-300 focus:border-brand rounded-full text-gray-900 shadow-inner"
                  />
                  <button
                    type="button"
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand text-white hover:bg-brand-hover font-black py-4 rounded-full transition-all shadow-xl shadow-brand/30 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="loading loading-spinner text-white"></span>
                ) : (
                  <>
                    Update Password{" "}
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      <SupportLink />
    </div>
  );
}

export default ResetPassword;
