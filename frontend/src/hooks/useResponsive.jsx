// frontend/src/hooks/useResponsive.jsx
import { useState, useEffect } from "react";

/**
 * Custom hook to detect device type and screen size
 * Returns device type, breakpoint info, and helper booleans
 */
export const useResponsive = () => {
  const [state, setState] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    device: "desktop",
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let device = "desktop";
      if (width < 640) {
        device = "mobile";
      } else if (width < 1024) {
        device = "tablet";
      }

      setState({ width, height, device });
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    // Device type
    device: state.device,
    isMobile: state.device === "mobile",
    isTablet: state.device === "tablet",
    isDesktop: state.device === "desktop",

    // Specific breakpoints
    isMobilePortrait: state.width < 640,
    isMobileLandscape: state.width >= 568 && state.width < 768,
    isTabletPortrait: state.width >= 640 && state.width < 768,
    isTabletLandscape: state.width >= 768 && state.width < 1024,

    // Dimensions
    width: state.width,
    height: state.height,

    // Helpers
    isSmallScreen: state.width < 640,
    isMediumScreen: state.width >= 640 && state.width < 1024,
    isLargeScreen: state.width >= 1024,

    // Touch device detection
    isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  };
};

export default useResponsive;
