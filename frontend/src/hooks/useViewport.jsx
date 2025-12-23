// frontend/src/hooks/useViewport.jsx
import { useState, useEffect } from "react";

/**
 * Custom hook to get viewport dimensions including safe areas
 * Useful for handling notches, status bars, and navigation bars
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    safeAreaLeft: 0,
    safeAreaRight: 0,
  });

  useEffect(() => {
    const updateViewport = () => {
      // Get safe area insets from CSS environment variables
      const computedStyle = getComputedStyle(document.documentElement);

      const safeAreaTop = parseInt(
        computedStyle.getPropertyValue("--safe-area-inset-top") || "0"
      );
      const safeAreaBottom = parseInt(
        computedStyle.getPropertyValue("--safe-area-inset-bottom") || "0"
      );
      const safeAreaLeft = parseInt(
        computedStyle.getPropertyValue("--safe-area-inset-left") || "0"
      );
      const safeAreaRight = parseInt(
        computedStyle.getPropertyValue("--safe-area-inset-right") || "0"
      );

      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        safeAreaTop,
        safeAreaBottom,
        safeAreaLeft,
        safeAreaRight,
      });
    };

    // Initial update
    updateViewport();

    // Update on resize and orientation change
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  return {
    ...viewport,
    // Calculate safe viewport dimensions
    safeWidth: viewport.width - viewport.safeAreaLeft - viewport.safeAreaRight,
    safeHeight:
      viewport.height - viewport.safeAreaTop - viewport.safeAreaBottom,
  };
};

export default useViewport;
