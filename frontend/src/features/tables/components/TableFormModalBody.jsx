// frontend/src/features/tables/components/TableFormModal.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

const TableFormModal = ({ table, floorId, onClose, onSave }) => {
  const { users } = useSelector((state) => state.users);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tableNumber: table?.tableNumber || "",
    capacity: table?.capacity || 4,
    shape: table?.shape || "square",
    notes: table?.notes || "",
    assignedStaff: table?.assignedStaff?._id || "",
    isActive: table?.isActive ?? true,
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.tableNumber.trim()) {
      newErrors.tableNumber = "Table number is required";
    }
    if (formData.capacity < 1 || formData.capacity > 20) {
      newErrors.capacity = "Capacity must be between 1 and 20";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...formData,
      assignedStaff: formData.assignedStaff || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-base-300 flex items-center justify-between">
            <h3 className="text-2xl font-bold">
              {table ? "Edit Table" : "Create Table"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Table Number *</span>
              </label>
              <input
                type="text"
                value={formData.tableNumber}
                onChange={(e) => {
                  setFormData({ ...formData, tableNumber: e.target.value });
                  if (errors.tableNumber) {
                    setErrors({ ...errors, tableNumber: "" });
                  }
                }}
                className={`input input-bordered ${
                  errors.tableNumber ? "input-error" : ""
                }`}
                placeholder="e.g., T1, 101"
              />
              {errors.tableNumber && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.tableNumber}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Capacity (Seats)</span>
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value) || 1,
                  });
                  if (errors.capacity) {
                    setErrors({ ...errors, capacity: "" });
                  }
                }}
                className={`input input-bordered ${
                  errors.capacity ? "input-error" : ""
                }`}
                min="1"
                max="20"
              />
              {errors.capacity && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.capacity}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Shape</span>
              </label>
              <select
                value={formData.shape}
                onChange={(e) =>
                  setFormData({ ...formData, shape: e.target.value })
                }
                className="select select-bordered"
              >
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="rectangle">Rectangle</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Assigned Staff</span>
              </label>
              <select
                value={formData.assignedStaff}
                onChange={(e) =>
                  setFormData({ ...formData, assignedStaff: e.target.value })
                }
                className="select select-bordered"
              >
                <option value="">None</option>
                {users
                  ?.filter((u) => ["waiter", "staff"].includes(u.role))
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullname}
                    </option>
                  ))}
              </select>
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
                rows="2"
                placeholder="Any special notes (window seat, VIP, etc.)"
              />
            </div>

            {table && (
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Active</span>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-6 pt-0">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {table ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableFormModal;
