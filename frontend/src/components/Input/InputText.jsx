import { useState } from "react";

function InputText({
  labelTitle,
  labelStyle,
  type,
  autoComplete,
  containerStyle,
  defaultValue,
  placeholder,
  updateFormValue,
  updateType,
  className,
  ...rest
}) {
  const [value, setValue] = useState(defaultValue);
  const inputId = labelTitle.toLowerCase().replace(/\s+/g, "-");

  const updateInputValue = (val) => {
    setValue(val);
    updateFormValue({ updateType, value: val });
  };

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      {labelTitle && (
        <label className="label" htmlFor={inputId}>
          <span className={"label-text text-base-content " + labelStyle}>
            {labelTitle}
          </span>
        </label>
      )}
      <input
        id={inputId}
        type={type || "text"}
        autoComplete={autoComplete || "off"}
        value={value}
        placeholder={placeholder || ""}
        onChange={(e) => updateInputValue(e.target.value)}
        className={`input input-bordered w-full ${className}`}
        {...rest}
      />
    </div>
  );
}

export default InputText;
