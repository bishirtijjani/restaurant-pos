import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";

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
export default ReservationFormModal;
