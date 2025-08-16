import { useState } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";

export default function DateRangePicker({ startDate, endDate, onDateChange }) {
  const [showPicker, setShowPicker] = useState(false);

  // Safely convert date strings to Date objects
  const parseDate = (date) => {
    if (!date) return null;
    return date instanceof Date ? date : new Date(date);
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    const parsed = parseDate(date);
    return parsed?.toLocaleDateString() || "";
  };

  // Handle date input changes
  const handleDateChange = (type, value) => {
    const newDate = value ? new Date(value) : null;
    const newDates = [
      type === "start" ? newDate : parseDate(startDate),
      type === "end" ? newDate : parseDate(endDate),
    ];
    onDateChange(newDates);
  };

  // Format date for input[type="date"]
  const formatInputDate = (date) => {
    const parsed = parseDate(date);
    return parsed ? parsed.toISOString().split("T")[0] : "";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="btn btn-sm btn-outline"
      >
        <CalendarIcon className="w-4 h-4 mr-1" />
        {startDate || endDate
          ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
          : "Select Dates"}
      </button>

      {showPicker && (
        <div className="absolute z-10 bg-base-100 p-4 shadow-lg rounded-box mt-2">
          <div className="flex gap-2">
            <div>
              <label className="label-text">Start Date</label>
              <input
                type="date"
                value={formatInputDate(startDate)}
                onChange={(e) => handleDateChange("start", e.target.value)}
                className="input input-sm"
              />
            </div>
            <div>
              <label className="label-text">End Date</label>
              <input
                type="date"
                value={formatInputDate(endDate)}
                onChange={(e) => handleDateChange("end", e.target.value)}
                className="input input-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
