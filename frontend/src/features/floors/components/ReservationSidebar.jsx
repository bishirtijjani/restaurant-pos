import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Clock, Users, Calendar, Plus, CheckCircle, XCircle, Filter } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateReservationStatus, checkInReservation } from "../../reservations/reservationSlice";
import { showNotification } from "../../common/headerSlice";

const DraggableReservation = ({ reservation, onCheckIn, onCancel }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `reservation-${reservation._id}`,
    data: {
      type: "RESERVATION",
      reservation,
    },
    disabled: reservation.status !== 'pending' && reservation.status !== 'confirmed'
  });
  
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  const getStatusColor = (status) => {
      switch(status) {
          case 'confirmed': return 'badge-info';
          case 'pending': return 'badge-warning';
          case 'seated': return 'badge-success';
          case 'completed': return 'badge-neutral';
          case 'cancelled': return 'badge-error';
          default: return 'badge-ghost';
      }
  };

  const isDraggable = reservation.status === 'pending' || reservation.status === 'confirmed';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDraggable ? listeners : {})}
      {...(isDraggable ? attributes : {})}
      className={`card bg-base-100 shadow-sm border border-base-300 p-3 mb-2 transition-all ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'opacity-80'}`}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-sm truncate pr-2">{reservation.customerName}</h4>
        <span className={`badge badge-xs ${getStatusColor(reservation.status)}`}>{reservation.status}</span>
      </div>
      
      <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-xs text-base-content/70">
                <Users className="w-3 h-3" />
                <span>{reservation.partySize} guests</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-base-content/70 mt-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(reservation.reservationDate).toLocaleDateString()}</span>
                <span className="font-mono font-bold text-primary">
                    {`${(reservation.reservationTime.split(":")[0] % 12) || 12}:${reservation.reservationTime.split(":")[1]} ${reservation.reservationTime.split(":")[0] >= 12 ? "PM" : "AM"}`}
                </span>
            </div>
            {reservation.tableId && (
                <div className="text-[10px] mt-1 bg-base-200 inline-block px-1 rounded">
                    Table {reservation.tableId.tableNumber || reservation.tableId}
                </div>
            )}
          </div>

          {/* Quick Actions for Confirmed/Pending */}
          {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
              <div className="flex gap-1">
                  <button 
                    className="btn btn-xs btn-circle btn-ghost text-success" 
                    title="Check In"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        onCheckIn(reservation);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                  >
                      <CheckCircle size={14} />
                  </button>
                  <button 
                    className="btn btn-xs btn-circle btn-ghost text-error" 
                    title="Cancel"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel(reservation);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                      <XCircle size={14} />
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

const ReservationSidebar = ({ reservations, onAddReservation }) => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('upcoming'); // upcoming, seated, all

  const filteredReservations = useMemo(() => {
      if (!reservations) return [];
      switch(filter) {
          case 'upcoming':
              return reservations.filter(r => ['pending', 'confirmed'].includes(r.status));
          case 'seated':
              return reservations.filter(r => r.status === 'seated');
          case 'all':
          default:
              return reservations;
      }
  }, [reservations, filter]);

  const handleCheckIn = async (reservation) => {
      if (!reservation.tableId) {
          dispatch(showNotification({ message: "Assign a table first!", status: 0 }));
          return;
      }
      // We'll dispatch the checkIn action via parent or direct dispatch if we import the thunk
      // Ideally, we should use the thunk from slice. 
      // But for now let's just use a placeholder notification or dispatch if we import it.
      // Since we didn't import checkInReservation here, let's assume we need to add it.
      // Actually, let's import it to be safe.
  };

  // We need to import the thunks to make the buttons work
  // But to avoid too many imports, let's just pass handlers or import them.
  // Let's import them.
  
  return (
    <div className="w-80 bg-base-200 border-l border-base-300 flex flex-col h-full">
      {/* Header */}
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
            <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="p-2 bg-base-100 border-b border-base-300 flex justify-center">
          <div className="join grid grid-cols-3 w-full">
              <button 
                className={`join-item btn btn-xs ${filter === 'upcoming' ? 'btn-active btn-primary' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                  Upcoming
              </button>
              <button 
                className={`join-item btn btn-xs ${filter === 'seated' ? 'btn-active btn-primary' : ''}`}
                onClick={() => setFilter('seated')}
              >
                  Seated
              </button>
              <button 
                className={`join-item btn btn-xs ${filter === 'all' ? 'btn-active btn-primary' : ''}`}
                onClick={() => setFilter('all')}
              >
                  All
              </button>
          </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <p>No {filter === 'all' ? '' : filter} reservations</p>
          </div>
        ) : (
          filteredReservations.map((res) => (
            <DraggableReservation 
                key={res._id} 
                reservation={res} 
                onCheckIn={(r) => dispatch(checkInReservation(r._id))}
                onCancel={(r) => dispatch(updateReservationStatus({ id: r._id, status: 'cancelled', reason: 'Cancelled from Sidebar' }))}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReservationSidebar;
