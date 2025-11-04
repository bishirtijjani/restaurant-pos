import React from "react";
import { useDispatch } from "react-redux";
import { startTour } from "../onboardingSlice";
import { Sparkles } from "lucide-react";

const TourTriggerButton = ({ tourId, children, className = "" }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(startTour(tourId));
  };

  return (
    <button
      onClick={handleClick}
      className={`btn btn-ghost btn-sm gap-2 ${className}`}
      title="Start guided tour"
    >
      <Sparkles className="w-4 h-4" />
      {children || "Take Tour"}
    </button>
  );
};

export default TourTriggerButton;
