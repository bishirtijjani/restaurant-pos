// frontend/src/hooks/useOrientation.jsx
import { useState, useEffect } from "react";

/**
 * Custom hook to detect device orientation
 * Returns orientation state and helper booleans
 */
export const useOrientation = () => {
  const getOrientation = () => {
    if (typeof window === "undefined") return "portrait";

    // Check screen orientation API first
    if (window.screen?.orientation?.type) {
      return window.screen.orientation.type.includes("portrait")
        ? "portrait"
        : "landscape";
    }

    // Fallback to window dimensions
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  };

  const [orientation, setOrientation] = useState(getOrientation());

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(getOrientation());
    };

    // Listen to both orientation change and resize
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === "portrait",
    isLandscape: orientation === "landscape",
  };
};

export default useOrientation;
