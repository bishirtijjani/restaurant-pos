import React, { useState, useRef, useEffect } from "react";

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  isLoading = false,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option name
  const selectedOption = options.find((opt) => opt._id === value);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Handle option selection
  const handleSelect = (option) => {
    onChange({ target: { name: "productId", value: option._id } });
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`input input-bordered flex items-center justify-between cursor-text ${
          disabled ? "bg-gray-100" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
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
          />
        ) : (
          <span className={`${!selectedOption ? "text-gray-500" : ""}`}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${
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
        <div className="absolute z-50 w-full mt-1 bg-base-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No products found</div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option._id}
                className="px-4 py-2 cursor-pointer hover:bg-base-200"
                onClick={() => handleSelect(option)}
              >
                {option.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
