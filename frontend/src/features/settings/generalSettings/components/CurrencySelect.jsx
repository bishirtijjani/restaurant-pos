import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { currencies } from "currencies.json";

const CurrencySelect = ({ value, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Convert currencies.json to array format for easier handling
  const currencyList = Object.entries(currencies).map(([code, currency]) => ({
    code,
    name: currency.name,
    symbol: currency.symbol || currency.symbolNative || code,
  }));

  useEffect(() => {
    // Filter currencies based on search term
    const filtered = currencyList.filter(
      (currency) =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCurrencies(filtered);
  }, [searchTerm]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Focus search input when dropdown opens
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (currency) => {
    onChange(currency);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm("");
    }
  };

  const selectedCurrency = value || {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 
          border border-base-300 rounded-lg bg-base-100
          hover:border-primary focus:border-primary focus:outline-none
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{selectedCurrency.symbol}</span>
          <span className="text-sm">{selectedCurrency.name}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-base-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-base-300 rounded-md focus:border-primary focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Currency List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => handleSelect(currency)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-left
                    hover:bg-base-200 transition-colors
                    ${
                      selectedCurrency.code === currency.code
                        ? "bg-primary/10"
                        : ""
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm min-w-[24px]">
                      {currency.symbol}
                    </span>
                    <span className="text-sm">
                      <span className="text-base-content/70">
                        {" "}
                        - {currency.name}
                      </span>
                    </span>
                  </div>
                  {selectedCurrency.code === currency.code && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-base-content/50 text-sm">
                No currencies found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;
