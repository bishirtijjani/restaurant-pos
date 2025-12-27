import React, { useState } from "react";
import { Plus, LayoutGrid, Trash2, Edit2, Calendar } from "lucide-react";
import ReservationSidebar from "./ReservationSidebar";

const FloorSidebarContent = ({
  floors,
  activeFloorId,
  onSelectFloor,
  onAddFloor,
  onEditFloor,
  onDeleteFloor,
  reservations,
  onAddReservation,
  timezone,
}) => {
  const [view, setView] = useState("floors"); // "floors" or "reservations"

  return (
    <div className="flex flex-col h-full bg-base-200 border-r border-base-300 w-full md:w-80">
      {/* Mobile/Compact Toggle Header */}
      <div className="flex border-b border-base-300">
        <button
          className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 ${
            view === "floors"
              ? "bg-base-100 text-primary border-b-2 border-primary"
              : "text-base-content/70 hover:bg-base-100/50"
          }`}
          onClick={() => setView("floors")}
        >
          <LayoutGrid size={16} /> Floors
        </button>
        <button
          className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 ${
            view === "reservations"
              ? "bg-base-100 text-primary border-b-2 border-primary"
              : "text-base-content/70 hover:bg-base-100/50"
          }`}
          onClick={() => setView("reservations")}
        >
          <Calendar size={16} /> Reservations
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Floors View */}
        <div
          className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${
            view === "floors"
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <div className="p-4 flex justify-between items-center bg-base-100 border-b border-base-300">
            <h3 className="font-bold">Floors</h3>
            <button
              className="btn btn-sm btn-primary btn-circle"
              onClick={onAddFloor}
              title="Add Floor"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {floors.map((floor) => (
              <div
                key={floor._id}
                className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all group relative ${
                  activeFloorId === floor._id
                    ? "bg-primary text-primary-content border-primary"
                    : "bg-base-100 border-base-300 hover:border-primary/50"
                }`}
                onClick={() => onSelectFloor(floor._id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">{floor.name}</span>
                  {activeFloorId === floor._id && (
                    <div className="flex gap-1">
                      <button
                        className="btn btn-xs btn-circle btn-ghost text-primary-content/80 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFloor(floor);
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                      {/* Prevent deleting the last floor if needed, or handle in parent */}
                      <button
                        className="btn btn-xs btn-circle btn-ghost text-primary-content/80 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFloor(floor._id);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {floors.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <p>No floors found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reservations View */}
        <div
          className={`absolute inset-0 flex flex-col bg-base-100 transition-opacity duration-300 ${
            view === "reservations"
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <ReservationSidebar
            reservations={reservations}
            onAddReservation={onAddReservation}
            timezone={timezone}
            embedded // New prop to tell sidebar it's embedded
          />
        </div>
      </div>
    </div>
  );
};

export default FloorSidebarContent;
