// frontend/src/hooks/useLongPress.jsx
import { useRef, useCallback } from "react";

/**
 * Custom hook for long press gesture detection
 * Triggers callback after holding for specified duration
 */
export const useLongPress = (
  callback,
  { threshold = 500, onStart, onFinish, onCancel, onClick } = {}
) => {
  const timeout = useRef(null);
  const target = useRef(null);
  const isLongPress = useRef(false);

  const start = useCallback(
    (event) => {
      // Don't prevent default here to allow scrolling/clicking
      // event.preventDefault();

      isLongPress.current = false;
      target.current = event.target;
      onStart?.(event);

      timeout.current = setTimeout(() => {
        isLongPress.current = true;
        callback(event);
        onFinish?.(event);
      }, threshold);
    },
    [callback, threshold, onStart, onFinish]
  );

  const clear = useCallback(
    (event, shouldTriggerCancel = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }

      if (shouldTriggerCancel && !isLongPress.current) {
        onCancel?.(event);
      }

      target.current = null;
    },
    [onCancel]
  );

  const handleClick = useCallback(
    (event) => {
      if (isLongPress.current) {
        // Long press occurred, suppress click
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    },
    [onClick]
  );

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: (e) => clear(e, true),
    onTouchStart: start,
    onTouchEnd: clear,
    onClick: handleClick,
    onContextMenu: (e) => e.preventDefault(), // Prevent native menu
    onTouchMove: (e) => {
      // Cancel if finger moves too much
      if (target.current) {
        const touch = e.touches[0];
        const rect = target.current.getBoundingClientRect();
        const isOutside =
          touch.clientX < rect.left ||
          touch.clientX > rect.right ||
          touch.clientY < rect.top ||
          touch.clientY > rect.bottom;

        if (isOutside) {
          clear(e, true);
        }
      }
    },
  };
};

export default useLongPress;
