import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import { showNotification } from "../common/headerSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "./usersSlice";
import { useAuth } from "../../utils/permission";
import Can from "../../components/Auth/Can";
import {
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Table,
  Grid3X3,
  Mail,
  User,
  Shield,
  Calendar,
  Crown,
  UserCheck,
  Settings,
  Eye,
} from "lucide-react";

// ... (skipping TopSideButtons to UserCard components)

const Users = () => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const currentUser = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.users.users || []);
  const status = useSelector((state) => state.users.status);
  const error = useSelector((state) => state.users.error);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, status]);

  // ... (skipping filteredAndSortedUsers logic)

  const handleAddNew = () => {
    dispatch(
      openModal({
        title: "Add New User",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_USER,
        size: "md",
      })
    );
  };

  const handleRefresh = () => {
    dispatch(fetchAllUsers());
  };

  const handleView = (user) => {
    dispatch(
      openModal({
        title: "View User Details",
        bodyType: MODAL_BODY_TYPES.VIEW_USER,
        extraObject: user,
        size: "md",
      })
    );
  };

  const handleEdit = (user) => {
    dispatch(
      openModal({
        title: "Edit User",
        bodyType: MODAL_BODY_TYPES.EDIT_USER,
        extraObject: user,
        size: "md",
      })
    );
  };

  const handleDelete = (user) => {
    if (currentUser && currentUser._id === user._id) {
      dispatch(
        showNotification({
          message: "You cannot delete your own account!",
          status: 0,
        })
      );
      return;
    }

    dispatch(
      openModal({
        title: "Delete User?",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete the user "${user.fullname}"?`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_USER,
          id: user._id,
        },
      })
    );
  };

  if (status === "loading") return <SuspenseContent />;

  // Authorization check using the proper permission system
  if (!can("manageUsers")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">You do not have permission to view users.</p>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  return (
    <div className="space-y-6">
      <TitleCard
        title={`All Users (${filteredAndSortedUsers.length})`}
        TopSideButtons={
          <TopSideButtons onRefresh={handleRefresh} onAddNew={handleAddNew} />
        }
        topMargin="mt-2"
      >
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {error ? (
          <div className="alert alert-error">
            <svg
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error.message}</span>
          </div>
        ) : filteredAndSortedUsers.length > 0 ? (
          viewMode === "table" ? (
            <UserTable
              users={filteredAndSortedUsers}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        ) : (
          <div className="hero min-h-[300px] bg-base-200 rounded-lg">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4">👤</div>
                <h1 className="text-2xl font-bold">No users found</h1>
                <p className="py-4">
                  {searchTerm || sortBy || roleFilter
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first user"}
                </p>
                <Can do="manageUsers">
                  <button
                    onClick={handleAddNew}
                    className="btn btn-primary gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add First User
                  </button>
                </Can>
              </div>
            </div>
          </div>
        )}
      </TitleCard>
    </div>
  );
};

export default Users;
