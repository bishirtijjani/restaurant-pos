// frontend/src/features/tables/components/TableFormModal.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const TableFormModal = ({ table, floorId, onClose, onSave }) => {
  const { users } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    tableNumber: table?.tableNumber || "",
    capacity: table?.capacity || 4,
    shape: table?.shape || "square",
    notes: table?.notes || "",
    assignedStaff: table?.assignedStaff?._id || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      assignedStaff: formData.assignedStaff || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">
              {table ? "Edit Table" : "Create Table"}
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Table Number *</span>
                </label>
                <input
                  type="text"
                  value={formData.tableNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, tableNumber: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="e.g., T1, 101"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Capacity (Seats)</span>
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="input input-bordered"
                  min="1"
                  max="20"
                />
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
                  {users?.map((user) => (
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
                  placeholder="Any special notes"
                />
              </div>
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
              {table ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableFormModal;
