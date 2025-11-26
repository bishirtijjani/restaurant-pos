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
} from "./reservationSlice";
import { fetchTables } from "../tables/tableSlice";
import { fetchAllUsers } from "../users/usersSlice";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
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
import Datepicker from "react-tailwindcss-datepicker";

const ReservationCard = ({ reservation, onEdit, onUpdateStatus, onDelete }) => {
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
              {reservation.customerName}
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
            <button
              className="btn btn-xs btn-info gap-1"
              onClick={() => onUpdateStatus(reservation._id, "seated")}
            >
              Seat
            </button>
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

const ReservationFormModal = ({ reservation, onClose, onSave, tables }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    tableId: reservation?.tableId?._id || "",
    customerName: reservation?.customerName || "",
    customerPhone: reservation?.customerPhone || "",
    customerEmail: reservation?.customerEmail || "",
    partySize: reservation?.partySize || 2,
    reservationDate: reservation?.reservationDate
      ? new Date(reservation.reservationDate).toISOString().split("T")[0]
      : "",
    reservationTime: reservation?.reservationTime || "",
    duration: reservation?.duration || 120,
    notes: reservation?.notes || "",
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.tableId) newErrors.tableId = "Table is required";
    if (!formData.customerName.trim())
      newErrors.customerName = "Customer name is required";
    if (!formData.customerPhone.trim())
      newErrors.customerPhone = "Phone is required";
    if (!formData.partySize || formData.partySize < 1)
      newErrors.partySize = "Party size must be at least 1";
    if (!formData.reservationDate)
      newErrors.reservationDate = "Date is required";
    if (!formData.reservationTime)
      newErrors.reservationTime = "Time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-base-300 flex items-center justify-between">
            <h3 className="text-2xl font-bold">
              {reservation ? "Edit Reservation" : "New Reservation"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Table *</span>
                </label>
                <select
                  value={formData.tableId}
                  onChange={(e) => {
                    setFormData({ ...formData, tableId: e.target.value });
                    if (errors.tableId) setErrors({ ...errors, tableId: "" });
                  }}
                  className={`select select-bordered ${
                    errors.tableId ? "select-error" : ""
                  }`}
                >
                  <option value="">Select table...</option>
                  {tables
                    ?.filter((t) => t.isActive)
                    .map((table) => (
                      <option key={table._id} value={table._id}>
                        Table {table.tableNumber} (Capacity: {table.capacity})
                      </option>
                    ))}
                </select>
                {errors.tableId && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.tableId}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Party Size *</span>
                </label>
                <input
                  type="number"
                  value={formData.partySize}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      partySize: parseInt(e.target.value) || 1,
                    });
                    if (errors.partySize)
                      setErrors({ ...errors, partySize: "" });
                  }}
                  className={`input input-bordered ${
                    errors.partySize ? "input-error" : ""
                  }`}
                  min="1"
                />
                {errors.partySize && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.partySize}
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Customer Name *</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => {
                  setFormData({ ...formData, customerName: e.target.value });
                  if (errors.customerName)
                    setErrors({ ...errors, customerName: "" });
                }}
                className={`input input-bordered ${
                  errors.customerName ? "input-error" : ""
                }`}
                placeholder="Full name"
              />
              {errors.customerName && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.customerName}
                  </span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone *</span>
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => {
                    setFormData({ ...formData, customerPhone: e.target.value });
                    if (errors.customerPhone)
                      setErrors({ ...errors, customerPhone: "" });
                  }}
                  className={`input input-bordered ${
                    errors.customerPhone ? "input-error" : ""
                  }`}
                  placeholder="+1234567890"
                />
                {errors.customerPhone && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.customerPhone}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email (Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date *</span>
                </label>
                <input
                  type="date"
                  value={formData.reservationDate}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      reservationDate: e.target.value,
                    });
                    if (errors.reservationDate)
                      setErrors({ ...errors, reservationDate: "" });
                  }}
                  className={`input input-bordered ${
                    errors.reservationDate ? "input-error" : ""
                  }`}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.reservationDate && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.reservationDate}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Time *</span>
                </label>
                <input
                  type="time"
                  value={formData.reservationTime}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      reservationTime: e.target.value,
                    });
                    if (errors.reservationTime)
                      setErrors({ ...errors, reservationTime: "" });
                  }}
                  className={`input input-bordered ${
                    errors.reservationTime ? "input-error" : ""
                  }`}
                />
                {errors.reservationTime && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.reservationTime}
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Duration (minutes)</span>
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 120,
                  })
                }
                className="input input-bordered"
                min="30"
                step="15"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Notes</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="textarea textarea-bordered"
                rows="3"
                placeholder="Special requests, dietary restrictions, etc."
              />
            </div>
          </div>

          <div className="flex gap-2 p-6 pt-0">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {reservation ? "Update" : "Create"}
            </button>
          </div>
        </form>
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
    setSelectedReservation(null);
    setShowForm(true);
  };
  const handleEdit = (reservation) => {
    setSelectedReservation(reservation);
    setShowForm(true);
  };
  const handleSave = async (data) => {
    try {
      if (selectedReservation) {
        await dispatch(
          updateReservation({ id: selectedReservation._id, data })
        ).unwrap();
        dispatch(
          showNotification({ message: "Reservation updated", status: 1 })
        );
      } else {
        await dispatch(createReservation(data)).unwrap();
        dispatch(
          showNotification({ message: "Reservation created", status: 1 })
        );
      }
      setShowForm(false);
      dispatch(getReservations());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Operation failed",
          status: 0,
        })
      );
    }
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
            />
          ))}
        </div>
      )}

      {showForm && (
        <ReservationFormModal
          reservation={selectedReservation}
          tables={tables}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </TitleCard>
  );
};
export default ReservationManagement;
