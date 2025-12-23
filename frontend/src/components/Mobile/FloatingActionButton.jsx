// frontend/src/components/Mobile/FloatingActionButton.jsx
import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useHaptic } from "../../hooks/useHaptic";

/**
 * Floating Action Button (FAB) with Speed Dial
 * Expands to show multiple action options
 */
const FloatingActionButton = ({ actions = [], className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const haptic = useHaptic();

  const handleToggle = () => {
    haptic.medium();
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action) => {
    haptic.light();
    action.onClick();
    setIsExpanded(false);
  };

  if (actions.length === 0) return null;

  return (
    <div className={`fixed bottom-20 right-4 z-40 ${className}`}>
      {/* Action Items */}
      {isExpanded && (
        <div className="mb-4 space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-end gap-3 animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Label */}
                <span className="bg-base-100 text-base-content px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>

                {/* Action Button */}
                <button
                  onClick={() => handleActionClick(action)}
                  className={`btn btn-circle ${
                    action.color || "btn-primary"
                  } shadow-lg`}
                  aria-label={action.label}
                >
                  <Icon size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={handleToggle}
        className={`btn btn-circle btn-lg btn-primary shadow-2xl transition-transform ${
          isExpanded ? "rotate-45" : "rotate-0"
        }`}
        aria-label={isExpanded ? "Close menu" : "Open menu"}
      >
        {isExpanded ? <X size={24} /> : <Plus size={24} />}
      </button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
