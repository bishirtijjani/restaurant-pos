// frontend/src/features/kds/components/FullScreenMode.jsx
import React, { useEffect, useState } from "react";
import { X, Clock } from "lucide-react";

const FullScreenMode = ({ onExit }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 right-0 p-4 z-50 flex items-center gap-4">
      <div className="flex items-center gap-2 bg-base-100/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
        <Clock size={20} />
        <span className="font-mono text-xl">
          {currentTime.toLocaleTimeString()}
        </span>
      </div>
      <button
        onClick={onExit}
        className="btn btn-circle btn-error"
        title="Exit Fullscreen"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default FullScreenMode;
