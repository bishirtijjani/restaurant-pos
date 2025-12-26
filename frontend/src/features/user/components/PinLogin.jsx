import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Delete, X } from "lucide-react";
import ErrorText from "../../../components/Typography/ErrorText";

const PinLogin = ({ onLogin, onCancel, loading, email, onEmailChange }) => {
  const [pin, setPin] = useState("");
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
  }, [pin, loading]); // Added pin and loading as dependencies to ensure updated state in handlers

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

  // If no email, show email input first
  if (!email && onEmailChange) {
    return (
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-4">
          Enter your email for PIN login
        </h3>

        <div className="w-full mb-6">
          <input
            type="email"
            placeholder="Email address"
            className="input input-bordered w-full"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                onEmailChange(e.target.value);
              } else if (e.key === "Escape") {
                onCancel();
              }
            }}
          />
        </div>

        <div className="flex flex-col w-full gap-2">
          <button
            onClick={(e) => {
              const input = e.target
                .closest("div")
                .previousElementSibling.querySelector("input");
              if (input && input.value) {
                onEmailChange(input.value);
              }
            }}
            className="btn btn-primary w-full"
          >
            Continue
          </button>
          <button onClick={onCancel} className="btn btn-ghost w-full">
            Use Password Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold mb-4">Enter PIN for {email}</h3>

      <div className="flex gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 border-primary ${
              pin.length > i ? "bg-primary" : "bg-transparent"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className="btn btn-circle btn-lg btn-outline"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="btn btn-circle btn-lg btn-ghost text-error"
        >
          <X size={24} />
        </button>
        <button
          onClick={() => handleNumberClick("0")}
          className="btn btn-circle btn-lg btn-outline"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-circle btn-lg btn-ghost"
        >
          <Delete size={24} />
        </button>
      </div>

      {error && <ErrorText styleClass="mt-4">{error}</ErrorText>}

      <div className="flex flex-col w-full gap-2 mt-4">
        <button
          onClick={handleSubmit}
          className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
          disabled={pin.length < 4 || loading}
        >
          {loading ? "Verifying..." : "Login"}
        </button>
        <button
          onClick={onCancel}
          className="btn btn-ghost w-full"
          disabled={loading}
        >
          Use Password Instead
        </button>
      </div>
    </div>
  );
};

export default PinLogin;
