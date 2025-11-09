// frontend/src/components/Input/FormattedNumberInput.jsx
import React from "react";

const FormattedNumberInput = ({
  value,
  onChange,
  name,
  placeholder = "0.00",
  min = 0,
  step = "0.01",
  className = "",
  disabled = false,
  required = false,
  allowNegative = false,
  ...rest
}) => {
  // Format number with commas for display
  const formatNumberWithCommas = (num) => {
    if (!num && num !== 0) return "";
    const strNum = num.toString();
    const [integer, decimal] = strNum.split(".");
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimal !== undefined
      ? `${formattedInteger}.${decimal}`
      : formattedInteger;
  };

  // Remove commas from formatted number
  const removeCommas = (str) => {
    return str.replace(/,/g, "");
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Remove commas for processing
    const cleanValue = removeCommas(inputValue);

    // Allow empty string
    if (cleanValue === "") {
      onChange({ target: { name, value: "" } });
      return;
    }

    // Allow negative sign if enabled
    if (allowNegative && cleanValue === "-") {
      onChange({ target: { name, value: "-" } });
      return;
    }

    // Validate number format (allow numbers, decimal point, and optional minus)
    const regex = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;

    if (regex.test(cleanValue)) {
      // Pass the clean numeric value to parent
      onChange({ target: { name, value: cleanValue } });
    }
  };

  const handleBlur = (e) => {
    const inputValue = e.target.value;
    const cleanValue = removeCommas(inputValue);

    if (cleanValue === "" || cleanValue === "-") {
      onChange({ target: { name, value: "" } });
      return;
    }

    const numValue = parseFloat(cleanValue);

    if (!isNaN(numValue)) {
      // Check minimum value
      if (numValue < min && !allowNegative) {
        onChange({ target: { name, value: min.toString() } });
      } else {
        // Ensure proper decimal format
        onChange({ target: { name, value: numValue.toString() } });
      }
    }
  };

  // Display value with commas
  const displayValue = formatNumberWithCommas(value);

  return (
    <input
      type="text"
      name={name}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      inputMode="decimal"
      {...rest}
    />
  );
};

export default FormattedNumberInput;
