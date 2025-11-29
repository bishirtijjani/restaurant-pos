import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createReservation, updateReservation } from "../reservationSlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import ErrorText from "../../../components/Typography/ErrorText";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";

const AddReservationModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.reservations);
  const { tables } = useSelector((state) => state.tables);
  
  const isEdit = !!extraObject;
  const reservationToEdit = extraObject || {};

  const [formData, setFormData] = useState({
    tableId: reservationToEdit.tableId?._id || reservationToEdit.tableId || "",
    customerName: reservationToEdit.customerName || "",
    customerPhone: reservationToEdit.customerPhone || "",
    customerEmail: reservationToEdit.customerEmail || "",
    partySize: reservationToEdit.partySize || 2,
    reservationDate: reservationToEdit.reservationDate
      ? new Date(reservationToEdit.reservationDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    reservationTime: reservationToEdit.reservationTime || "",
    duration: reservationToEdit.duration || 120,
    notes: reservationToEdit.notes || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.tableId) newErrors.tableId = "Table is required";
    if (!formData.customerName.trim()) newErrors.customerName = "Customer name is required";
    if (!formData.customerPhone.trim()) newErrors.customerPhone = "Phone is required";
    if (!formData.partySize || formData.partySize < 1) newErrors.partySize = "Party size must be at least 1";
    if (!formData.reservationDate) newErrors.reservationDate = "Date is required";
    if (!formData.reservationTime) newErrors.reservationTime = "Time is required";
    return newErrors;
  };

  const { items: reservations } = useSelector((state) => state.reservations);
  const [conflicts, setConflicts] = useState([]);

  const checkConflicts = () => {
      const newConflicts = [];
      if (!formData.tableId || !formData.reservationDate || !formData.reservationTime) {
          setConflicts([]);
          return;
      }

      const table = tables.find(t => t._id === formData.tableId);
      if (!table) return;

      // 1. Status Check
      const status = table.status ? table.status.toLowerCase() : "available";
      if (["occupied", "dirty", "blocked", "out of service"].includes(status)) {
          newConflicts.push(`Table is currently ${status}`);
      }

      // 2. Capacity Check
      if (formData.partySize > table.capacity) {
          newConflicts.push(`Party size (${formData.partySize}) exceeds table capacity (${table.capacity})`);
      }

      // 3. Time Overlap Check
      const newStart = new Date(`${formData.reservationDate}T${formData.reservationTime}`).getTime();
      const duration = parseInt(formData.duration) || 120;
      const newEnd = newStart + duration * 60000;

      const hasOverlap = reservations.some(res => {
          if (res.tableId?._id !== table._id && res.tableId !== table._id) return false;
          if (isEdit && res._id === reservationToEdit._id) return false;
          if (res.status === 'cancelled' || res.status === 'completed') return false;
          
          const existingStart = new Date(`${res.reservationDate.split('T')[0]}T${res.reservationTime}`).getTime();
          const existingDuration = res.duration || 120;
          const existingEnd = existingStart + existingDuration * 60000;

          return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasOverlap) {
          newConflicts.push("This time slot overlaps with another reservation");
      }

      setConflicts(newConflicts);
  };

  useEffect(() => {
      checkConflicts();
  }, [formData.tableId, formData.reservationDate, formData.reservationTime, formData.duration, formData.partySize, tables, reservations]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Block if there are conflicts (except capacity warning? User said "warn or prevent". Let's prevent for overlap/status, maybe warn for capacity? 
    // "The user cannot accidentally save conflicting reservations unless allowed per design."
    // Let's block for now if there are conflicts, or maybe just show them and allow save with confirmation?
    // "Conflict messages must appear immediately... The user cannot accidentally save..."
    // I'll block save if there are conflicts, but maybe allow override?
    // For now, I will just display them. If I want to block, I should check conflicts length.
    // Let's block for overlap and status, but maybe just warn for capacity.
    // Actually, let's just show the conflicts and if the user clicks save, we can ask for confirmation or block.
    // Requirement: "Conflict messages must appear immediately... The user cannot accidentally save conflicting reservations unless allowed per design."
    // I will block if there are conflicts.
    
    if (conflicts.length > 0) {
        if (!window.confirm("There are conflicts with this reservation. Are you sure you want to proceed?")) {
            return;
        }
    }

    setIsSubmitting(true);

    try {
      if (isEdit) {
          await dispatch(updateReservation({ id: reservationToEdit._id, data: formData })).unwrap();
          dispatch(showNotification({ message: "Reservation updated successfully", status: 1 }));
      } else {
          await dispatch(createReservation(formData)).unwrap();
          dispatch(showNotification({ message: "Reservation created successfully", status: 1 }));
      }
      dispatch(closeModal());
    } catch (error) {
      console.error("Reservation operation error:", error);
      dispatch(showNotification({ message: error.message || "Operation failed", status: 0 }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {conflicts.length > 0 && (
          <div className="alert alert-warning shadow-lg">
              <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div>
                      <h3 className="font-bold">Warning: Conflicts Detected</h3>
                      <ul className="list-disc list-inside text-sm">
                          {conflicts.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                  </div>
              </div>
          </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Table Selection */}
        <div className="form-control md:col-span-2">
            <label className="label">
                <span className="label-text">Table *</span>
            </label>
            <select
                name="tableId"
                value={formData.tableId}
                onChange={handleChange}
                className={`select select-bordered w-full ${errors.tableId ? "select-error" : ""}`}
                disabled={isSubmitting}
            >
                <option value="">Select table...</option>
                {tables?.filter(t => t.isActive || t._id === formData.tableId).map(table => (
                    <option key={table._id} value={table._id}>
                        Table {table.tableNumber} (Capacity: {table.capacity})
                    </option>
                ))}
            </select>
            {errors.tableId && <ErrorText>{errors.tableId}</ErrorText>}
        </div>

        {/* Customer Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Customer Name *</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className={`input input-bordered ${errors.customerName ? "input-error" : ""}`}
            placeholder="Full name"
            disabled={isSubmitting}
          />
          {errors.customerName && <ErrorText>{errors.customerName}</ErrorText>}
        </div>

        {/* Party Size */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Party Size *</span>
          </label>
          <FormattedNumberInput
            name="partySize"
            value={formData.partySize}
            onChange={handleChange}
            className={`input input-bordered ${errors.partySize ? "input-error" : ""}`}
            min="1"
            disabled={isSubmitting}
          />
          {errors.partySize && <ErrorText>{errors.partySize}</ErrorText>}
        </div>

        {/* Phone */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Phone *</span>
          </label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            className={`input input-bordered ${errors.customerPhone ? "input-error" : ""}`}
            placeholder="+1234567890"
            disabled={isSubmitting}
          />
          {errors.customerPhone && <ErrorText>{errors.customerPhone}</ErrorText>}
        </div>

        {/* Email */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email (Optional)</span>
          </label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            className="input input-bordered"
            placeholder="email@example.com"
            disabled={isSubmitting}
          />
        </div>

        {/* Date */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Date *</span>
          </label>
          <input
            type="date"
            name="reservationDate"
            value={formData.reservationDate}
            onChange={handleChange}
            className={`input input-bordered ${errors.reservationDate ? "input-error" : ""}`}
            min={new Date().toISOString().split("T")[0]}
            disabled={isSubmitting}
          />
          {errors.reservationDate && <ErrorText>{errors.reservationDate}</ErrorText>}
        </div>

        {/* Time */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Time *</span>
          </label>
          <input
            type="time"
            name="reservationTime"
            value={formData.reservationTime}
            onChange={handleChange}
            className={`input input-bordered ${errors.reservationTime ? "input-error" : ""}`}
            disabled={isSubmitting}
          />
          {errors.reservationTime && <ErrorText>{errors.reservationTime}</ErrorText>}
        </div>

        {/* Duration */}
        <div className="form-control">
            <label className="label">
                <span className="label-text">Duration (minutes)</span>
            </label>
            <FormattedNumberInput
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input input-bordered"
                min="30"
                step="15"
                disabled={isSubmitting}
            />
        </div>

        {/* Notes */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Notes</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="textarea textarea-bordered"
            rows="3"
            placeholder="Special requests, dietary restrictions, etc."
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="modal-action">
        <button
          type="button"
          onClick={() => dispatch(closeModal())}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : (isEdit ? "Update Reservation" : "Create Reservation")}
        </button>
      </div>
    </form>
  );
};

export default AddReservationModalBody;
