import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

const MultiSelect = ({
  options = [],
  value = [], // Array of values
  onChange,
  name,
  placeholder = "Select options...",
  className = "",
  disabled = false,
  error = "",
  labelKey = "name",
  valueKey = "value",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Filter out already selected options and apply search term
  const availableOptions = options.filter(
    (option) =>
      !value.includes(option[valueKey]) &&
      option[labelKey].toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSelect = (option) => {
    onChange({
      target: {
        name,
        value: [...value, option[valueKey]],
      },
    });
    setSearchTerm("");
    // Keep open so user can select more
  };

  const handleRemove = (e, optionValue) => {
    e.stopPropagation();
    onChange({
      target: {
        name,
        value: value.filter((v) => v !== optionValue),
      },
    });
  };

  const errorClasses = error ? "border-error" : "";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`input input-bordered min-h-[3rem] h-auto flex flex-wrap items-center gap-1 py-1 px-2 cursor-text ${errorClasses} ${
          disabled ? "input-disabled bg-base-200 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {value.map((val) => {
          const opt = options.find((o) => o[valueKey] === val);
          return (
            <div
              key={val}
              className="badge badge-primary badge-sm gap-1 pl-2 pr-1 py-3"
            >
              {opt ? opt[labelKey] : val}
              <button
                type="button"
                className="hover:bg-primary-focus rounded-full p-0.5"
                onClick={(e) => handleRemove(e, val)}
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          className="flex-1 min-w-[100px] border-none focus:outline-none bg-transparent my-1 text-sm"
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {availableOptions.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-sm">
              No options available
            </div>
          ) : (
            availableOptions.map((option) => (
              <div
                key={option[valueKey]}
                className="px-4 py-2 cursor-pointer hover:bg-base-200 text-sm transition-colors"
                onClick={() => handleSelect(option)}
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

export default MultiSelect;
