import React from "react";

function SearchBar({ searchText, setSearchText, placeholderText, styleClass }) {
  const updateSearchInput = (value) => {
    setSearchText(value);
  };

  return (
    <div className={"inline-block " + styleClass}>
      <div className="input-group relative flex flex-wrap items-stretch w-full">
        <input
          type="search"
          value={searchText}
          placeholder={placeholderText || "Search"}
          onChange={(e) => updateSearchInput(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
}

export default SearchBar;
