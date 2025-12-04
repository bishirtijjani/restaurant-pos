import React, { useState, useEffect, useRef } from "react";
import { DateRangePicker } from "react-date-range";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDateRange,
  setDateRange,
} from "../../slices/analyticsGlobalSlice";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import CalendarDaysIcon from "@heroicons/react/24/outline/CalendarDaysIcon";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

function AnalyticsDateRangePicker() {
  const dispatch = useDispatch();
  const { startDate, endDate, label } = useSelector(selectDateRange);
  const [showPicker, setShowPicker] = useState(false);
  const [state, setState] = useState([
    {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      key: "selection",
    },
  ]);

  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (item) => {
    setState([item.selection]);
  };

  const applyDateRange = () => {
    dispatch(
      setDateRange({
        startDate: startOfDay(state[0].startDate).toISOString(),
        endDate: endOfDay(state[0].endDate).toISOString(),
        label: `${format(state[0].startDate, "MMM d")} - ${format(
          state[0].endDate,
          "MMM d"
        )}`,
      })
    );
    setShowPicker(false);
  };

  const presetRanges = [
    {
      label: "Today",
      range: {
        startDate: startOfDay(new Date()),
        endDate: endOfDay(new Date()),
      },
    },
    {
      label: "Yesterday",
      range: {
        startDate: startOfDay(subDays(new Date(), 1)),
        endDate: endOfDay(subDays(new Date(), 1)),
      },
    },
    {
      label: "Last 7 Days",
      range: {
        startDate: startOfDay(subDays(new Date(), 6)),
        endDate: endOfDay(new Date()),
      },
    },
    {
      label: "Last 30 Days",
      range: {
        startDate: startOfDay(subDays(new Date(), 29)),
        endDate: endOfDay(new Date()),
      },
    },
  ];

  const applyPreset = (preset) => {
    setState([
      {
        startDate: preset.range.startDate,
        endDate: preset.range.endDate,
        key: "selection",
      },
    ]);
    dispatch(
      setDateRange({
        startDate: preset.range.startDate.toISOString(),
        endDate: preset.range.endDate.toISOString(),
        label: preset.label,
      })
    );
    setShowPicker(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className="btn btn-sm btn-outline gap-2 normal-case font-normal"
        onClick={() => setShowPicker(!showPicker)}
      >
        <CalendarDaysIcon className="w-4 h-4" />
        {label ||
          `${format(new Date(startDate), "MMM d")} - ${format(
            new Date(endDate),
            "MMM d"
          )}`}
      </button>

      {showPicker && (
        <div className="absolute right-0 top-12 z-50 bg-base-100 shadow-xl rounded-box border border-base-200 p-2 flex flex-col md:flex-row">
          <div className="flex flex-col gap-2 p-2 border-r border-base-200 min-w-[140px]">
            {presetRanges.map((preset) => (
              <button
                key={preset.label}
                className="btn btn-ghost btn-sm justify-start"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div>
            <DateRangePicker
              onChange={handleSelect}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
              months={1}
              ranges={state}
              direction="horizontal"
              rangeColors={["#4f46e5"]} // Primary color
            />
            <div className="flex justify-end gap-2 p-2 border-t border-base-200">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowPicker(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={applyDateRange}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDateRangePicker;
