// frontend/src/features/floors/index.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchFloors,
  createFloor,
  updateFloor,
  deleteFloor,
} from "./floorSlice";
import { fetchTables } from "./tableSlice";
import TitleCard from "../../components/Cards/TitleCard";
import { Plus, Edit3, Trash2, ArrowRight, Layers } from "lucide-react";
import { showNotification } from "../common/headerSlice";
import Can from "../../components/Auth/Can";
import { useAuth } from "../../utils/permission";

const FloorCard = ({ floor, onEdit, onDelete, onViewTables, tablesCount }) => {
  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all border border-base-200">
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {floor.name}
            </h3>
            {floor.description && (
              <p className="text-sm text-base-content/70 mt-1">
                {floor.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="badge badge-sm badge-outline">
                {tablesCount} tables
              </span>
              {!floor.isActive && (
                <span className="badge badge-sm badge-warning">Inactive</span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Can do="editMenu">
              <button
                onClick={() => onEdit(floor)}
                className="btn btn-sm btn-ghost btn-circle"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(floor)}
                className="btn btn-sm btn-ghost btn-circle text-error"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Can>
          </div>
        </div>
        <button
          onClick={() => onViewTables(floor)}
          className="btn btn-primary btn-sm mt-4 gap-2"
        >
          View Tables <ArrowRight className="w-4 h-4" />
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">
              {floor ? "Edit Floor" : "Create Floor"}
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Floor Name *</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="e.g., Ground Floor, First Floor"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
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
                  <span className="label-text">Display Order</span>
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="input input-bordered"
                  min="0"
                />
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
                  <span className="label-text">Active</span>
                </label>
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
  const { can } = useAuth();
  const { floors, loading } = useSelector((state) => state.floors);
  const { tables } = useSelector((state) => state.tables);

  const [showModal, setShowModal] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);

  useEffect(() => {
    if (can("viewMenu")) {
      dispatch(fetchFloors());
      dispatch(fetchTables());
    }
  }, [dispatch, can]);

  const getTableCount = (floorId) => {
    return tables.filter((t) => t.floorId === floorId && t.isActive).length;
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

  if (!can("viewMenu")) {
    return (
      <TitleCard title="Access Denied">
        <div className="text-center py-12">
          <p className="text-error">You don't have permission to view floors</p>
        </div>
      </TitleCard>
    );
  }

  return (
    <TitleCard
      title="Floor Management"
      topMargin="mt-2"
      TopSideButtons={
        <Can do="createMenu">
          <button
            onClick={handleCreate}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Floor
          </button>
        </Can>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : floors.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Floors Yet</h3>
          <p className="text-base-content/70 mb-4">
            Create your first floor to start managing tables
          </p>
          <Can do="createMenu">
            <button onClick={handleCreate} className="btn btn-primary gap-2">
              <Plus className="w-4 h-4" />
              Create First Floor
            </button>
          </Can>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
