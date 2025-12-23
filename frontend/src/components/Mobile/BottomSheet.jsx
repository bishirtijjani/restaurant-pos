// frontend/src/components/Mobile/BottomSheet.jsx
import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useSwipe } from "../../hooks/useSwipe";

/**
 * Bottom Sheet Modal Component
 * Slides up from bottom with drag-to-dismiss functionality
 * Supports multiple snap points (peek, half, full)
 */
const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.3, 0.6, 0.9], // Percentage of screen height
  initialSnap = 1, // Index of snapPoints
  showDragHandle = true,
  showCloseButton = true,
  className = "",
}) => {
  const sheetRef = useRef(null);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);

  const snapToPoint = (snapIndex) => {
    const snapPoint = snapPoints[snapIndex];
    const windowHeight = window.innerHeight;
    const targetY = windowHeight * (1 - snapPoint);

    setTranslateY(targetY);
    setCurrentSnap(snapIndex);
  };

  useEffect(() => {
    if (isOpen) {
      snapToPoint(initialSnap);
      // Prevent body scroll when sheet is open
      document.body.style.overflow = "hidden";
    } else {
      setTranslateY(window.innerHeight);
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialSnap]);

  const swipeHandlers = useSwipe({
    onSwipeDown: () => {
      if (currentSnap > 0) {
        snapToPoint(currentSnap - 1);
      } else {
        onClose();
      }
    },
    onSwipeUp: () => {
      if (currentSnap < snapPoints.length - 1) {
        snapToPoint(currentSnap + 1);
      }
    },
    threshold: 30,
  });

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`relative w-full bg-base-100 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${className}`}
        style={{
          transform: `translateY(${translateY}px)`,
          maxHeight: `${snapPoints[snapPoints.length - 1] * 100}vh`,
        }}
        {...swipeHandlers}
      >
        {/* Drag Handle */}
        {showDragHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-base-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
            {title && <h3 className="text-lg font-bold">{title}</h3>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 120px)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
