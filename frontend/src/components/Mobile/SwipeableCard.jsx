// frontend/src/components/Mobile/SwipeableCard.jsx
import React, { useRef, useState } from "react";
import { Trash2, Edit3 } from "lucide-react";

/**
 * Swipeable Card Component
 * Reveals action buttons when swiped left or right
 */
const SwipeableCard = ({
  children,
  onDelete,
  onEdit,
  leftActions = [],
  rightActions = [],
  className = "",
}) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Limit swipe distance
    const maxSwipe = 100;
    const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff));

    setOffset(limitedDiff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Determine action based on swipe distance
    const threshold = 50;

    if (offset < -threshold && onDelete) {
      // Swiped left - delete
      onDelete();
    } else if (offset > threshold && onEdit) {
      // Swiped right - edit
      onEdit();
    }

    // Reset position
    setOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left Actions (revealed when swiping right) */}
      {onEdit && (
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-info flex items-center justify-center">
          <Edit3 size={20} className="text-info-content" />
        </div>
      )}

      {/* Right Actions (revealed when swiping left) */}
      {onDelete && (
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-error flex items-center justify-center">
          <Trash2 size={20} className="text-error-content" />
        </div>
      )}

      {/* Main Content */}
      <div
        className={`relative bg-base-100 transition-transform ${
          isDragging ? "duration-0" : "duration-300"
        } ${className}`}
        style={{
          transform: `translateX(${offset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
