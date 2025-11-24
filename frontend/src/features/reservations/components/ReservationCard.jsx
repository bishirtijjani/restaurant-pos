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
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  Edit3,
  Trash2,
  CheckCircle,
  User,
} from "lucide-react";
import Can from "../../components/Auth/Can";

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
            <Can do="editMenu">
              <button
                className="btn btn-xs btn-success gap-1"
                onClick={() => onUpdateStatus(reservation._id, "confirmed")}
              >
                <CheckCircle className="w-3 h-3" />
                Confirm
              </button>
            </Can>
          )}
          {reservation.status === "confirmed" && (
            <Can do="editMenu">
              <button
                className="btn btn-xs btn-info gap-1"
                onClick={() => onUpdateStatus(reservation._id, "seated")}
              >
                Seat
              </button>
            </Can>
          )}
          <Can do="editMenu">
            <button
              className="btn btn-xs btn-outline"
              onClick={() => onEdit(reservation)}
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </Can>
          {["pending", "confirmed"].includes(reservation.status) && (
            <Can do="deleteMenu">
              <button
                className="btn btn-xs btn-outline btn-error"
                onClick={() => onDelete(reservation._id)}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </Can>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
