import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  updateReservation,
  updateReservationStatus,
  deleteReservation,
} from "../reservationSlice";
import Modal from "../../../components/Modal";
import { format } from "date-fns";

const EditReservationModal = ({ isOpen, onClose, reservation }) => {
  const dispatch = useDispatch();
  // State for editable fields
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (reservation) {
      setStatus(reservation.status);
    }
  }, [reservation]);

  if (!reservation) return null;

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    dispatch(
      updateReservationStatus({
        id: reservation._id,
        status: newStatus,
      })
    );
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this reservation? This cannot be undone."
      )
    ) {
      dispatch(deleteReservation(reservation._id));
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reservation: ${reservation.reservationNumber}`}
    >
      <div>
        <div className="space-y-4">
          <p>
            <strong>Customer:</strong> {reservation.customer.name} (
            {reservation.customer.phone})
          </p>
          <p>
            <strong>Date & Time:</strong>{" "}
            {format(new Date(reservation.date), "PPP")} at {reservation.time}
          </p>
          <p>
            <strong>Table:</strong> {reservation.table.tableNumber} on{" "}
            {reservation.floor.name}
          </p>
          <p>
            <strong>Party Size:</strong> {reservation.partySize}
          </p>
          <p>
            <strong>Special Requests:</strong>{" "}
            {reservation.specialRequests || "None"}
          </p>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              className="select select-bordered"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="seated">Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-Show</option>
            </select>
          </div>
        </div>

        <div className="modal-action mt-6 flex justify-between">
          <button
            type="button"
            className="btn btn-error"
            onClick={handleDelete}
            disabled={reservation.status !== "pending"}
          >
            Delete
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditReservationModal;
