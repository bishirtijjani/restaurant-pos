// frontend/src/features/floors/index.jsx - COMPLETE FIX
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchFloors,
  createFloor,
  updateFloor,
  deleteFloor,
  resetFloorState,
} from "./floorSlice";
import { fetchTables } from "../tables/tableSlice";
import TitleCard from "../../components/Cards/TitleCard";
import {
  Plus,
  Edit3,
  Trash2,
  ArrowRight,
  Layers,
  Grid,
  MapPin,
} from "lucide-react";
import { showNotification } from "../common/headerSlice";

const FloorCard = ({ floor, onEdit, onDelete, onViewTables, tablesCount }) => {
  return (
    <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg hover:shadow-xl transition-all border border-primary/20 hover:border-primary/40">
      <div className="card-body p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-xl flex items-center gap-2 mb-2">
              <Layers className="w-6 h-6 text-primary" />
              {floor.name}
            </h3>
            {floor.description && (
              <p className="text-sm text-base-content/70 mb-3">
                {floor.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="badge badge-primary badge-lg gap-2">
                <Grid className="w-3 h-3" />
                {tablesCount} tables
              </div>
              <span className="badge badge-outline">Order: {floor.order}</span>
              {!floor.isActive && (
                <span className="badge badge-warning">Inactive</span>
              )}
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10"
            >
              <li>
                <a onClick={() => onEdit(floor)}>
                  <Edit3 className="w-4 h-4" />
                  Edit
                </a>
              </li>
              <li>
                <a onClick={() => onDelete(floor)} className="text-error">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </a>
              </li>
            </ul>
          </div>
        </div>
        <button
          onClick={() => onViewTables(floor)}
          className="btn btn-primary btn-block mt-4 gap-2"
        >
          Manage Tables
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const FloorFormModal = ({ floor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: floor?.name || "",
    description: floor?.description || "",
    order: floor?.order || 0,
    isActive: floor?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Floor name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-base-100 rounded-lg shadow-2xl max-w-md w-full animate-slideUp">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-base-300">
            <h3 className="text-2xl font-bold">
              {floor ? "Edit Floor" : "Create Floor"}
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Floor Name *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`input input-bordered ${
                  errors.name ? "input-error" : ""
                }`}
                placeholder="e.g., Ground Floor, First Floor"
              />
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.name}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="textarea textarea-bordered"
                rows="2"
                placeholder="Optional description"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Display Order</span>
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                className="input input-bordered"
                min="0"
              />
              <label className="label">
                <span className="label-text-alt">
                  Lower numbers appear first
                </span>
              </label>
            </div>

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
                <span className="label-text font-medium">Active</span>
              </label>
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
              {floor ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FloorManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { floors, loading, error } = useSelector((state) => state.floors);
  const { tables } = useSelector((state) => state.tables);

  const [showModal, setShowModal] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);

  useEffect(() => {
    dispatch(fetchFloors());
    dispatch(fetchTables());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(showNotification({ message: error, status: 0 }));
      dispatch(resetFloorState());
    }
  }, [error, dispatch]);

  const getTableCount = (floorId) => {
    return tables.filter((t) => {
      const tableFloorId =
        typeof t.floorId === "string" ? t.floorId : t.floorId?._id;
      return String(tableFloorId) === String(floorId) && t.isActive;
    }).length;
  };

  const handleCreate = () => {
    setSelectedFloor(null);
    setShowModal(true);
  };

  const handleEdit = (floor) => {
    setSelectedFloor(floor);
    setShowModal(true);
  };

  const handleDelete = async (floor) => {
    if (!window.confirm(`Delete floor "${floor.name}"?`)) return;

    try {
      await dispatch(deleteFloor(floor._id)).unwrap();
      dispatch(showNotification({ message: "Floor deleted", status: 1 }));
      dispatch(fetchFloors());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to delete",
          status: 0,
        })
      );
    }
  };

  const handleSave = async (data) => {
    try {
      if (selectedFloor) {
        await dispatch(
          updateFloor({ id: selectedFloor._id, ...data })
        ).unwrap();
        dispatch(showNotification({ message: "Floor updated", status: 1 }));
      } else {
        await dispatch(createFloor(data)).unwrap();
        dispatch(showNotification({ message: "Floor created", status: 1 }));
      }
      setShowModal(false);
      dispatch(fetchFloors());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Operation failed",
          status: 0,
        })
      );
    }
  };

  const handleViewTables = (floor) => {
    navigate(`/app/floors/${floor._id}/tables`);
  };

  return (
    <TitleCard
      title="Floor Management"
      topMargin="mt-2"
      TopSideButtons={
        <button onClick={handleCreate} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" />
          Add Floor
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : floors.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <Layers className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Floors Yet</h3>
          <p className="text-base-content/70 mb-4">
            Create your first floor to start managing tables
          </p>
          <button onClick={handleCreate} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Create First Floor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {floors.map((floor) => (
            <FloorCard
              key={floor._id}
              floor={floor}
              tablesCount={getTableCount(floor._id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewTables={handleViewTables}
            />
          ))}
        </div>
      )}

      {showModal && (
        <FloorFormModal
          floor={selectedFloor}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </TitleCard>
  );
};

export default FloorManagement;
