// frontend/src/hooks/useUltraFastKeyboard.jsx
import { useEffect, useCallback, useRef } from "react";

export const useUltraFastKeyboard = (shortcuts, isActive = true) => {
  const keySequence = useRef([]);
  const sequenceTimeout = useRef(null);

  const handleKeyPress = useCallback(
    (event) => {
      if (!isActive) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Build key combination string
      let combination = "";
      if (ctrl) combination += "ctrl+";
      if (shift) combination += "shift+";
      if (alt) combination += "alt+";
      combination += key;

      // Check if this matches any shortcut
      const matchedShortcut = shortcuts.find(
        (shortcut) => shortcut.key.toLowerCase() === combination
      );

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
      }

      // Handle sequences (for Konami code style)
      keySequence.current.push(key);

      // Clear old sequence after 1 second
      clearTimeout(sequenceTimeout.current);
      sequenceTimeout.current = setTimeout(() => {
        keySequence.current = [];
      }, 1000);

      // Keep only last 10 keys
      if (keySequence.current.length > 10) {
        keySequence.current.shift();
      }
    },
    [shortcuts, isActive]
  );

  useEffect(() => {
    if (!isActive) return;

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearTimeout(sequenceTimeout.current);
    };
  }, [handleKeyPress, isActive]);

  return keySequence.current;
};
