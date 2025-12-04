import React from "react";

function AnalyticsContainer({ children }) {
  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-base-100">
      {children}
    </div>
  );
}

export default AnalyticsContainer;
