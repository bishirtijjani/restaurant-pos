// frontend/src/features/addOnGroups/index.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import SuspenseContent from "../../containers/SuspenseContent";
import { openModal } from "../common/modalSlice";
import { showNotification } from "../common/headerSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import {
  fetchAddOnGroups,
  deleteAddOnGroup,
  clearError,
  clearSuccess,
} from "./addOnGroupsSlice";
import { useAuth } from "../../utils/permission";
import Can from "../../components/Auth/Can";
import {
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Search,
  Tag,
  Grid3x3,
  List as ListIcon,
} from "lucide-react";

const TopSideButtons = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-wrap gap-2">
      <Can do="editMenu">
        <button
          onClick={() =>
            dispatch(
              openModal({
                title: "Create Add-On Group",
                bodyType: MODAL_BODY_TYPES.ADD_ADDON_GROUP,
                size: "lg",
              })
            )
          }
          className="btn btn-primary btn-sm lg:btn-md gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Group</span>
        </button>
      </Can>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-ghost btn-sm lg:btn-md gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  );
};

const AddOnGroupCard = ({ group, onEdit, onDelete }) => {
  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
      <div className="card-body p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="card-title text-lg font-bold">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-base-content/70 mt-1">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <span
              className={`badge ${
                group.isActive ? "badge-success" : "badge-error"
              }`}
            >
              {group.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-base-content/70">Type:</span>
            <span className="badge badge-primary">
              {group.selectionType === "single" ? "Single" : "Multiple"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-base-content/70">Required:</span>
            <span className="text-sm font-medium">
              {group.isRequired ? "Yes" : "No"}
            </span>
          </div>

          {group.selectionType === "multiple" && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-base-content/70">Min:</span>
                <span className="text-sm font-medium">
                  {group.minSelections || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-base-content/70">Max:</span>
                <span className="text-sm font-medium">
                  {group.maxSelections || "Unlimited"}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-base-content/70">Items:</span>
            <span className="text-sm font-medium">{group.items?.length}</span>
          </div>
        </div>

        {group.items?.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-base-content/70 mb-2">Add-ons:</div>
            <div className="flex flex-wrap gap-1">
              {group.items.slice(0, 3).map((item, idx) => (
                <span key={idx} className="badge badge-sm badge-outline">
                  {item.name}
                </span>
              ))}
              {group.items.length > 3 && (
                <span className="badge badge-sm">
                  +{group.items.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <Can do="editMenu">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => onEdit(group)}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              className="btn btn-sm btn-ghost text-error"
              onClick={() => onDelete(group)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Can>
        </div>
      </div>
    </div>
  );
};

const AddOnGroupsManagement = () => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const { groups, loading, error, success, message } = useSelector(
    (state) => state.addOnGroups
  );

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAddOnGroups());
  }, [dispatch]);

  useEffect(() => {
    if (success && message) {
      dispatch(showNotification({ message, status: 1 }));
      dispatch(clearSuccess());
    }
    if (error) {
      dispatch(
        showNotification({ message: error.message || error, status: 0 })
      );
      dispatch(clearError());
    }
  }, [success, message, error, dispatch]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  const handleEdit = (group) => {
    dispatch(
      openModal({
        title: "Edit Add-On Group",
        bodyType: MODAL_BODY_TYPES.EDIT_ADDON_GROUP,
        extraObject: group,
        size: "lg",
      })
    );
  };

  const handleDelete = (group) => {
    dispatch(
      openModal({
        title: "Delete Add-On Group?",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete "${group.name}"? ${
            group.items?.length
              ? "This will also remove all associated add-on items."
              : ""
          }`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_ADDON_GROUP,
          id: group._id,
        },
      })
    );
  };

  if (loading) return <SuspenseContent />;

  if (!can("viewMenu")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to view add-on groups.
              </p>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  return (
    <TitleCard
      title={
        <div className="flex items-center gap-2">
          <Tag className="w-6 h-6" />
          <span>Add-On Groups</span>
          <span className="badge badge-primary">{filteredGroups.length}</span>
        </div>
      }
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      {/* Search Bar */}
      <div className="bg-base-100 rounded-lg shadow-md p-4 mb-6">
        <label className="input input-bordered flex items-center gap-2">
          <Search className="w-5 h-5 opacity-70" />
          <input
            type="text"
            className="grow"
            placeholder="Search add-on groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <Tag className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No add-on groups found</h3>
          <p className="text-base-content/70 max-w-md mx-auto">
            {searchQuery
              ? "Try adjusting your search"
              : "Create your first add-on group to get started"}
          </p>
          <Can do="editMenu">
            <button
              onClick={() =>
                dispatch(
                  openModal({
                    title: "Create Add-On Group",
                    bodyType: MODAL_BODY_TYPES.ADD_ADDON_GROUP,
                    size: "lg",
                  })
                )
              }
              className="btn btn-primary mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Group
            </button>
          </Can>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <AddOnGroupCard
              key={group._id}
              group={group}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </TitleCard>
  );
};

export default AddOnGroupsManagement;
