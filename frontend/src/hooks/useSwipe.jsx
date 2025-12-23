// frontend/src/hooks/useSwipe.jsx
import { useRef, useEffect } from "react";

/**
 * Custom hook for swipe gesture detection
 * Supports horizontal and vertical swipes with configurable threshold
 */
export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50, // Minimum distance for swipe
  velocityThreshold = 0.3, // Minimum velocity
} = {}) => {
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const touchEnd = useRef({ x: 0, y: 0, time: 0 });

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = () => {
    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;

    // Calculate velocity
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // Determine swipe direction
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

    if (isHorizontal) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold && velocityX > velocityThreshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold && velocityY > velocityThreshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    // Reset
    touchStart.current = { x: 0, y: 0, time: 0 };
    touchEnd.current = { x: 0, y: 0, time: 0 };
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

export default useSwipe;
