// frontend/src/hooks/useHaptic.jsx
import { useCallback } from "react";

/**
 * Custom hook for haptic feedback on supported devices
 * Provides different vibration patterns for various interactions
 */
export const useHaptic = () => {
  const vibrate = useCallback((pattern) => {
    // Check if vibration API is supported
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn("Haptic feedback failed:", error);
      }
    }
  }, []);

  return {
    // Light tap - for button presses
    light: useCallback(() => vibrate(10), [vibrate]),

    // Medium tap - for selections
    medium: useCallback(() => vibrate(20), [vibrate]),

    // Heavy tap - for important actions
    heavy: useCallback(() => vibrate(30), [vibrate]),

    // Success pattern - for successful operations
    success: useCallback(() => vibrate([10, 50, 10]), [vibrate]),

    // Error pattern - for errors
    error: useCallback(() => vibrate([20, 100, 20, 100, 20]), [vibrate]),

    // Warning pattern - for warnings
    warning: useCallback(() => vibrate([30, 50, 30]), [vibrate]),

    // Selection pattern - for item selection
    selection: useCallback(() => vibrate([5, 10, 5]), [vibrate]),

    // Custom pattern
    custom: useCallback((pattern) => vibrate(pattern), [vibrate]),

    // Check if haptic is supported
    isSupported: "vibrate" in navigator,
  };
};

export default useHaptic;
