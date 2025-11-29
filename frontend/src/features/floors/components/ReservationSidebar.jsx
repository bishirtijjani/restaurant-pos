import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Clock, Users, Calendar, Plus } from "lucide-react";

const DraggableReservation = ({ reservation }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `reservation-${reservation._id}`,
    data: {
      type: "RESERVATION",
      reservation,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="card bg-base-100 shadow-sm border border-base-300 p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-sm">{reservation.customerName}</h4>
        <span className="badge badge-sm badge-ghost">{reservation.status}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-base-content/70">
        <Users className="w-3 h-3" />
        <span>{reservation.guests} guests</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-base-content/70 mt-1">
        <Clock className="w-3 h-3" />
        <span>{new Date(reservation.reservationTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
    </div>
  );
};

const ReservationSidebar = ({ reservations, onAddReservation }) => {
  return (
    <div className="w-80 bg-base-200 border-l border-base-300 flex flex-col h-full">
      <div className="p-4 border-b border-base-300 bg-base-100 flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Reservations
        </h3>
        <button
            className="btn btn-primary btn-sm"
            onClick={onAddReservation}
            title="Add Reservation"
        >
            <Plus className="w-5 h-5 mr-1" /> New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {reservations.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <p>No upcoming reservations</p>
          </div>
        ) : (
          reservations.map((res) => (
            <DraggableReservation key={res._id} reservation={res} />
          ))
        )}
      </div>
    </div>
  );
};

export default ReservationSidebar;
