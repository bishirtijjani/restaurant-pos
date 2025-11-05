import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, Trash2, Monitor, Eye, EyeOff, Power } from "lucide-react";
import TitleCard from "../../components/Cards/TitleCard";
import {
  fetchStations,
  deleteStation,
  updateStation,
} from "./kdsStationsSlice";
import { fetchAllUsers } from "../users/usersSlice";
import { openModal } from "../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
import { showNotification } from "../common/headerSlice";
import SuspenseContent from "../../containers/SuspenseContent";

const StationsManagement = () => {
  const dispatch = useDispatch();
  const { stations, loading } = useSelector((state) => state.kdsStations);
  const [showInactive, setShowInactive] = useState(true);

  useEffect(() => {
    dispatch(fetchStations());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleToggleActive = async (station) => {
    try {
      await dispatch(
        updateStation({
          id: station._id,
          isActive: !station.isActive,
        })
      ).unwrap();

      dispatch(
        showNotification({
          message: `Station ${
            station.isActive ? "deactivated" : "activated"
          } successfully`,
          status: 1,
        })
      );
      dispatch(fetchStations());
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to update station",
          status: 0,
        })
      );
    }
  };

  const handleDelete = (station) => {
    dispatch(
      openModal({
        title: "Delete Station",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete "${station.name}"? This action cannot be undone.`,
          type: "DELETE_STATION",
          id: station._id,
          onConfirm: async () => {
            try {
              await dispatch(deleteStation(station._id)).unwrap();
              dispatch(
                showNotification({
                  message: "Station deleted successfully",
                  status: 1,
                })
              );
              dispatch(fetchStations());
            } catch (error) {
              dispatch(
                showNotification({
                  message: error.message || "Failed to delete station",
                  status: 0,
                })
              );
            }
          },
        },
      })
    );
  };

  // Separate active and inactive stations
  const activeStations = stations.filter((s) => s.isActive);
  const inactiveStations = stations.filter((s) => !s.isActive);
  const displayStations = showInactive ? stations : activeStations;

  if (loading) return <SuspenseContent />;

  return (
    <TitleCard
      title="Kitchen Stations"
      topMargin="mt-2"
      TopSideButtons={
        <div className="flex gap-2">
          {inactiveStations.length > 0 && (
            <button
              className={`btn btn-sm btn-outline gap-2 ${
                !showInactive ? "btn-ghost" : ""
              }`}
              onClick={() => setShowInactive(!showInactive)}
            >
              <EyeOff size={16} />
              {showInactive ? "Hide" : "Show"} Inactive (
              {inactiveStations.length})
            </button>
          )}
          <button
            className="btn btn-primary btn-sm gap-2"
            onClick={() =>
              dispatch(
                openModal({
                  title: "Create New Station",
                  bodyType: MODAL_BODY_TYPES.ADD_KDS_STATION,
                  size: "lg",
                })
              )
            }
          >
            <Plus size={16} /> Add Station
          </button>
        </div>
      }
    >
      {/* Stats Bar */}
      {stations.length > 0 && (
        <div className="stats stats-vertical lg:stats-horizontal shadow mb-6 w-full">
          <div className="stat">
            <div className="stat-title">Total Stations</div>
            <div className="stat-value text-primary">{stations.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Active</div>
            <div className="stat-value text-success">
              {activeStations.length}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Inactive</div>
            <div className="stat-value text-warning">
              {inactiveStations.length}
            </div>
          </div>
        </div>
      )}

      {stations.length === 0 ? (
        <div className="text-center py-16">
          <Monitor className="w-16 h-16 mx-auto opacity-30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Stations Yet</h3>
          <p className="text-base-content/70 mb-4">
            Create your first kitchen station to get started
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              dispatch(
                openModal({
                  title: "Create New Station",
                  bodyType: MODAL_BODY_TYPES.ADD_KDS_STATION,
                  size: "lg",
                })
              )
            }
          >
            <Plus size={16} /> Create Station
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Stations */}
          {activeStations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Power size={18} className="text-success" />
                Active Stations ({activeStations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeStations.map((station) => (
                  <StationCard
                    key={station._id}
                    station={station}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    dispatch={dispatch}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Stations */}
          {showInactive && inactiveStations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <EyeOff size={18} className="text-warning" />
                Inactive Stations ({inactiveStations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveStations.map((station) => (
                  <StationCard
                    key={station._id}
                    station={station}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    dispatch={dispatch}
                    inactive
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </TitleCard>
  );
};

// Separate StationCard component for cleaner code
const StationCard = ({
  station,
  onToggleActive,
  onDelete,
  dispatch,
  inactive,
}) => {
  return (
    <div
      className={`card bg-base-100 shadow-md border-2 ${
        inactive ? "border-warning opacity-60" : "border-success"
      }`}
    >
      <div className="card-body p-4">
        {/* Header with status indicator */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1">
            <Monitor
              size={20}
              className={inactive ? "text-warning" : "text-primary"}
            />
            <h3 className="font-bold">{station.name}</h3>
          </div>
          <div
            className={`badge badge-sm ${
              inactive ? "badge-warning" : "badge-success"
            } gap-1`}
          >
            {inactive ? <EyeOff size={12} /> : <Eye size={12} />}
            {inactive ? "Inactive" : "Active"}
          </div>
        </div>

        {/* Station Details */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="opacity-70">Type:</span>
            <span className="ml-2 badge badge-sm badge-outline capitalize">
              {station.type}
            </span>
          </div>

          {station.categories?.length > 0 && (
            <div>
              <span className="opacity-70">Categories:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {station.categories.slice(0, 3).map((cat, idx) => (
                  <span
                    key={idx}
                    className="badge badge-sm badge-primary badge-outline"
                  >
                    {cat}
                  </span>
                ))}
                {station.categories.length > 3 && (
                  <span className="badge badge-sm badge-ghost">
                    +{station.categories.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 text-xs opacity-70">
            <span>Cols: {station.displaySettings?.columns || 3}</span>
            <span>•</span>
            <span>Font: {station.displaySettings?.fontSize || "medium"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions justify-between mt-3 pt-3 border-t">
          <button
            onClick={() => onToggleActive(station)}
            className={`btn btn-sm gap-1 ${
              inactive ? "btn-success" : "btn-warning"
            }`}
            title={inactive ? "Activate Station" : "Deactivate Station"}
          >
            <Power size={14} />
            {inactive ? "Activate" : "Deactivate"}
          </button>

          <div className="flex gap-1">
            <button
              onClick={() =>
                dispatch(
                  openModal({
                    title: "Edit Station",
                    bodyType: MODAL_BODY_TYPES.EDIT_KDS_STATION,
                    extraObject: { station },
                    size: "lg",
                  })
                )
              }
              className="btn btn-ghost btn-sm btn-square"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(station)}
              className="btn btn-ghost btn-sm btn-square text-error"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationsManagement;
