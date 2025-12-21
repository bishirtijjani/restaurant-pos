import React, { useState } from "react";
import { Delete, X } from "lucide-react";

const PinLogin = ({ onLogin, onCancel, loading, email }) => {
  const [pin, setPin] = useState("");

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

      <div className="flex flex-col w-full gap-2">
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
