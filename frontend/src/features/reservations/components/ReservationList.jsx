import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getReservations,
  selectReservations,
  selectLoading,
  selectError,
} from "../reservationSlice";
import AddReservationModal from "./AddReservationModal";
import EditReservationModal from "./EditReservationModal";
import { format } from "date-fns";

const ReservationList = () => {
  const dispatch = useDispatch();
  const reservations = useSelector(selectReservations);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState(null);

  useEffect(() => {
    dispatch(getReservations({}));
  }, [dispatch]);

  const handleEdit = (reservation) => {
    setReservationToEdit(reservation);
    setEditModalOpen(true);
  };

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Current Reservations</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setAddModalOpen(true)}
        >
          New Reservation
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Table</th>
              <th>Party Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res._id}>
                <td>{format(new Date(res.date), "PPP")}</td>
                <td>{res.time}</td>
                <td>{res.customer.name}</td>
                <td>{res.table.tableNumber}</td>
                <td>{res.partySize}</td>
                <td>
                  <span className={`badge badge-sm badge-${res.status}`}>
                    {res.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => handleEdit(res)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddReservationModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      {reservationToEdit && (
        <EditReservationModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          reservation={reservationToEdit}
        />
      )}
    </div>
  );
};

export default ReservationList;
