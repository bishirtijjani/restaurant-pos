// frontend/src/features/reservations/index.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getReservations,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
  checkInReservation,
} from "./reservationSlice";
import { fetchTables } from "../tables/tableSlice";
import { fetchAllUsers } from "../users/usersSlice";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import { openModal } from "../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";

const ReservationCard = ({ reservation, onEdit, onUpdateStatus, onDelete, onCheckIn }) => {
  const statusColors = {
    pending: "badge-warning",
    confirmed: "badge-info",
    seated: "badge-success",
    completed: "badge-neutral",
    cancelled: "badge-error",
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {reservation.customerId ? (
                  <Link to={`/app/customers/${reservation.customerId._id || reservation.customerId}`} className="link link-hover hover:text-primary">
                    {reservation.customerName}
                  </Link>
              ) : (
                  <span>{reservation.customerName}</span>
              )}
            </h3>
            <span
              className={`badge badge-sm ${statusColors[reservation.status]}`}
            >
              {reservation.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-base-content/70">
              Table {reservation.tableId?.tableNumber}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-base-content/80">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(reservation.reservationDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-base-content/80">
            <Clock className="w-4 h-4" />
            <span>{reservation.reservationTime}</span>
          </div>
          <div className="flex items-center gap-2 text-base-content/80">
            <Users className="w-4 h-4" />
            <span>{reservation.partySize} guests</span>
          </div>
          <div className="flex items-center gap-2 text-base-content/80">
            <Phone className="w-4 h-4" />
            <span>{reservation.customerPhone}</span>
          </div>
          {reservation.customerEmail && (
            <div className="flex items-center gap-2 text-base-content/80">
              <Mail className="w-4 h-4" />
              <span className="truncate">{reservation.customerEmail}</span>
            </div>
          )}
        </div>

        {reservation.notes && (
          <div className="mt-2 p-2 bg-base-200 rounded text-xs italic">
            {reservation.notes}
          </div>
        )}

        <div className="card-actions justify-end mt-3 flex-wrap gap-1">
          {reservation.status === "pending" && (
            <button
              className="btn btn-xs btn-success gap-1"
              onClick={() => onUpdateStatus(reservation._id, "confirmed")}
            >
              <CheckCircle className="w-3 h-3" />
              Confirm
            </button>
          )}
          {reservation.status === "confirmed" && (
            <>
              <button
                className="btn btn-xs btn-success gap-1"
                onClick={() => onCheckIn(reservation._id)}
              >
                Check-in
              </button>
              <button
                className="btn btn-xs btn-info gap-1"
                onClick={() => onUpdateStatus(reservation._id, "seated")}
              >
                Seat
              </button>
            </>
          )}
          <button
            className="btn btn-xs btn-outline"
            onClick={() => onEdit(reservation)}
          >
            <Edit3 className="w-3 h-3" />
          </button>
          {["pending", "confirmed"].includes(reservation.status) && (
            <button
              className="btn btn-xs btn-outline btn-error"
              onClick={() => onDelete(reservation._id)}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};




const ReservationManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: reservations, loading } = useSelector(
    (state) => state.reservations
  );
  const { tables } = useSelector((state) => state.tables);
  const [showForm, setShowForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    date: null,
  });
  useEffect(() => {
    dispatch(getReservations());
    dispatch(fetchTables());
    dispatch(fetchAllUsers());
  }, [dispatch]);
  const handleCreate = () => {
    dispatch(
      openModal({
        title: "New Reservation",
        bodyType: MODAL_BODY_TYPES.ADD_RESERVATION,
      })
    );
  };
  const handleEdit = (reservation) => {
    dispatch(
      openModal({
        title: "Edit Reservation",
        bodyType: MODAL_BODY_TYPES.EDIT_RESERVATION,
        extraObject: reservation,
      })
    );
  };
  const handleUpdateStatus = async (id, status) => {
    try {
      await dispatch(updateReservationStatus({ id, status })).unwrap();
      dispatch(showNotification({ message: "Status updated", status: 1 }));
      dispatch(getReservations());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to update status",
          status: 0,
        })
      );
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reservation?")) return;
    try {
      await dispatch(deleteReservation(id)).unwrap();
      dispatch(showNotification({ message: "Reservation deleted", status: 1 }));
      dispatch(getReservations());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to delete",
          status: 0,
        })
      );
    }
  };
  
  const handleCheckIn = async (id) => {
    try {
      const result = await dispatch(checkInReservation(id)).unwrap();
      dispatch(showNotification({ message: "Reservation checked in successfully", status: 1 }));
      
      // Navigate to POS with pre-filled data
      const reservation = result;
      navigate("/app/pos", {
        state: {
          orderType: "dine-in",
          table: reservation.tableId,
          customerDetails: {
            customerId: reservation.customerId?._id || null,
            name: reservation.customerName,
            phone: reservation.customerPhone,
            email: reservation.customerEmail || "",
          },
        },
      });
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to check in reservation",
          status: 0,
        })
      );
    }
  };
  const filteredReservations = reservations.filter((r) => {
    if (filters.status && r.status !== filters.status) return false;
    if (
      filters.date &&
      new Date(r.reservationDate).toDateString() !==
        new Date(filters.date).toDateString()
    )
      return false;
    return true;
  });

  return (
    <TitleCard
      title="Reservations"
      topMargin="mt-2"
      TopSideButtons={
        <button onClick={handleCreate} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" />
          New Reservation
        </button>
      }
    >
      {/* Filters */}
      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="select select-bordered select-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="seated">Seated</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={filters.date || ""}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="input input-bordered input-sm"
          />
          <button
            onClick={() => setFilters({ status: "", date: null })}
            className="btn btn-ghost btn-sm"
          >
            Clear
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Reservations</h3>
          <p className="text-base-content/70 mb-4">
            {reservations.length === 0
              ? "Create your first reservation"
              : "No reservations match your filters"}
          </p>
          <button onClick={handleCreate} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" />
            New Reservation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map((reservation) => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
              onEdit={handleEdit}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
              onCheckIn={handleCheckIn}
            />
          ))}
        </div>
      )}
    </TitleCard>
  );
};
export default ReservationManagement;
