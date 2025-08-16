const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "bg-gray-700" : "bg-gray-800", // Dark mode background
    borderColor: state.isFocused ? "border-blue-500" : "rgba(200,200,200,0.3)",
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "",
    "&:hover": {
      borderColor: "border-blue-500",
    },
    padding: "0.5rem",
    borderRadius: "1.5rem", // Apply rounded corners like Tailwind's rounded-md
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgb(255,0,255)"
      : state.isFocused
      ? "rgb(90,90,200)"
      : "bg-gray-800", // Dark mode for options
    color: state.isSelected
      ? "rgb(255,255,255)"
      : state.isFocused
      ? "rgb(240,240,240)"
      : "rgb(20,20,20)",
    padding: "0.5rem 1rem",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgb(200,200,200)", // Background color for selected values
    color: "rgb(20,20,20)",
    fontSize: "1.2rem",
    border: "3px solid rgb(50,50,200)",
    borderRadius: "0.25rem", // rounded-sm
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "text-white",
    backgroundColor: "bg-gray-500",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "text-white",
    ":hover": {
      backgroundColor: "bg-red-500",
      color: "white",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "rgb(200,200,200)", // Dark mode for the dropdown menu
    zIndex: "10000",
  }),
  placeholder: (base) => ({
    ...base,
    color: "text-gray-500", // Placeholder text color
  }),
  singleValue: (base) => ({
    ...base,
    color: "text-white", // Selected value text color
  }),
};

export default selectStyles;
