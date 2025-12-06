import React, { useState, useRef, useEffect } from "react";
import SuspenseContent from "../../containers/SuspenseContent";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  name = "productId", // Default to productId for backward compatibility
  placeholder = "Search...",
  isLoading = false,
  className = "",
  disabled = false,
  required = false,
  error = "",
  size = "", // Support DaisyUI sizes: select-sm, select-lg
  labelKey = "name", // Key to display in dropdown
  valueKey = "_id", // Key to use as value (supports both _id and value)
  emptyText = "No options found",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const optionsRef = useRef([]);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option?.[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option
  const selectedOption = options.find(
    (opt) => opt[valueKey] === value || opt.value === value || opt._id === value
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, filteredOptions, highlightedIndex]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  // Handle option selection
  const handleSelect = (option) => {
    const optionValue = option[valueKey] || option.value || option._id;
    onChange({ target: { name, value: optionValue } });
    setSearchTerm("");
    setIsOpen(false);
  };

  // Determine size classes
  const sizeClasses = size ? size : "";
  const errorClasses = error ? "border-error" : "";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`input input-bordered flex items-center justify-between cursor-text ${sizeClasses} ${errorClasses} ${
          disabled ? "input-disabled bg-base-200 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-none focus:outline-none bg-transparent"
            placeholder={placeholder}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            disabled={disabled}
          />
        ) : (
          <span className={`${!selectedOption ? "text-gray-500" : ""} truncate`}>
            {selectedOption ? selectedOption[labelKey] : placeholder}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {isLoading ? (
            <SuspenseContent />
          ) : filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">{emptyText}</div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option[valueKey] || option.value || option._id || index}
                ref={(el) => (optionsRef.current[index] = el)}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  index === highlightedIndex
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200"
                } ${
                  (option[valueKey] || option.value || option._id) === value
                    ? "bg-base-200 font-semibold"
                    : ""
                }`}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={
                  (option[valueKey] || option.value || option._id) === value
                }
              >
                {option[labelKey]}
              </div>
            ))
          )}
        </div>
      )}

      {error && <span className="text-error text-sm mt-1">{error}</span>}
    </div>
  );
};

export default SearchableSelect;
