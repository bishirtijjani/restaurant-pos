import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Delete, X } from "lucide-react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import ErrorText from "../../../components/Typography/ErrorText";
import InputText from "../../../components/Input/InputText";

const PinLogin = ({ onLogin, onCancel, loading, email, onEmailChange }) => {
  const [pin, setPin] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localError, setLocalError] = useState("");
  const { error } = useSelector((state) => state.auth);

  // Clear PIN when error occurs
  useEffect(() => {
    if (error) {
      setPin("");
    }
  }, [error]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading) return;

      if (e.key >= "0" && e.key <= "9") {
        handleNumberClick(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Delete") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, loading]);

  const handleNumberClick = (num) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const handleSubmit = () => {
    if (pin.length >= 4) {
      onLogin(pin);
    }
  };

  // Update email via the InputText callback
  const updateEmailValue = ({ value }) => {
    setLocalEmail(value);
    if (localError) setLocalError("");
  };

  const handleEmailContinue = () => {
    if (!localEmail.trim()) {
      setLocalError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(localEmail)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    setLocalError("");
    if (onEmailChange) onEmailChange(localEmail);
  };

  // If no email, show email input first
  if (!email && onEmailChange) {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="text-center mb-10 w-full">
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">
            Quick Access
          </h2>
          <p className="text-white/40 font-medium text-sm">
            Enter your email to continue with PIN login
          </p>
        </div>

        <div className="w-full mb-6 relative">
          <EnvelopeIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 z-10" />
          <InputText
            defaultValue={localEmail}
            updateType="email"
            type="email"
            containerStyle="mt-0"
            labelTitle=""
            updateFormValue={updateEmailValue}
            placeholder="Work Email Address"
            className={`pl-14 bg-white/5 border-white/10 focus:border-brand/50 rounded-full text-white py-4 transition-all ${
              localError ? "border-red-500/50" : ""
            }`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEmailContinue();
              } else if (e.key === "Escape") {
                onCancel();
              }
            }}
          />
        </div>

        {localError && (
          <div className="w-full mb-6 py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 transition-all">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold">{localError}</span>
          </div>
        )}

        <div className="flex flex-col w-full gap-4">
          <button
            onClick={handleEmailContinue}
            className="w-full bg-brand text-white hover:bg-brand-hover font-black py-4 rounded-full transition-all flex items-center justify-center gap-2 group shadow-xl shadow-brand/20 active:scale-[0.98]"
          >
            Continue to PIN
          </button>
          <button
            onClick={onCancel}
            className="text-white/30 hover:text-white font-bold uppercase tracking-widest text-xs py-2 transition-colors"
          >
            Use Password Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-center mb-8 w-full">
        <h2 className="text-2xl font-black tracking-tight text-white mb-2">
          Verify Identity
        </h2>
        <div className="flex items-center justify-center gap-2 text-white/40 font-medium text-sm">
          <span>PIN for</span>
          <span className="text-brand font-bold">{email}</span>
        </div>
      </div>

      <div className="flex gap-4 mb-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              pin.length > i
                ? "bg-brand border-brand shadow-[0_0_15px_rgba(255,107,53,0.4)]"
                : "border-white/10 bg-white/5"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xl font-black hover:bg-white/10 hover:border-brand/50 transition-all active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="w-16 h-16 rounded-full flex items-center justify-center text-red-400 hover:bg-red-400/10 transition-all active:scale-95"
        >
          <X size={24} />
        </button>
        <button
          onClick={() => handleNumberClick("0")}
          className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xl font-black hover:bg-white/10 hover:border-brand/50 transition-all active:scale-95"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          <Delete size={24} />
        </button>
      </div>

      {error && <ErrorText styleClass="mt-4">{error}</ErrorText>}

      <div className="flex flex-col w-full gap-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-brand text-white hover:bg-brand-hover disabled:opacity-50 font-black py-4 rounded-full transition-all flex items-center justify-center gap-2 group shadow-xl shadow-brand/20 active:scale-[0.98]"
          disabled={pin.length < 4 || loading}
        >
          {loading ? (
            <span className="loading loading-spinner text-white"></span>
          ) : (
            "Login System"
          )}
        </button>
        <button
          onClick={onCancel}
          className="text-white/30 hover:text-white font-bold uppercase tracking-widest text-xs py-2 transition-colors"
          disabled={loading}
        >
          Use Password Instead
        </button>
      </div>
    </div>
  );
};

export default PinLogin;
