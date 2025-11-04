import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "./usersSlice"; // Assuming you have this slice
import SuspenseContent from "../../containers/SuspenseContent";
import {
  Search,
  Filter,
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
} from "lucide-react";
import { checkRole } from "../../utils/Helpers";

const TopSideButtons = ({ onRefresh, onAddNew }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {checkRole("admin") && (
        <>
          <button
            onClick={onAddNew}
            className="btn btn-primary btn-sm lg:btn-md gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add User</span>
          </button>
          <button
            onClick={onRefresh}
            className="btn btn-ghost btn-sm lg:btn-md gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </>
      )}
    </div>
  );
};

const getRoleIcon = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return <Crown className="w-4 h-4" />;
    case "manager":
      return <Shield className="w-4 h-4" />;
    case "staff":
      return <UserCheck className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

const getRoleBadgeClass = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "badge-error";
    case "manager":
      return "badge-warning";
    case "staff":
      return "badge-info";
    default:
      return "badge-ghost";
  }
};

const UserCard = ({ user, onEdit, onDelete }) => (
  <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
    <div className="card-body p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-12 h-12">
              <User className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="card-title text-lg font-bold">{user.fullname}</h3>
            <div className="flex items-center gap-2">
              <div className="badge badge-outline badge-sm">
                ID: {user._id.slice(-6)}
              </div>
              <div
                className={`badge ${getRoleBadgeClass(
                  user.role
                )} badge-sm gap-1`}
              >
                {getRoleIcon(user.role)}
                {user.role?.charAt(0).toUpperCase()} **
              </div>
            </div>
          </div>
        </div>
        {checkRole("admin") && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
            >
              <li>
                <button onClick={() => onEdit(user)} className="text-primary">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </li>
              <li>
                <button onClick={() => onDelete(user)} className="text-error">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-primary" />
          <span className="truncate">{user.email}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-primary" />
          <span>
            Role:{" "}
            <span
              className={`font-bold ${
                user.role === "admin"
                  ? "text-error"
                  : user.role === "manager"
                  ? "text-warning"
                  : "text-info"
              }`}
            >
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-base-content/70">
          <Calendar className="w-4 h-4" />
          <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>

        {user.lastAction?.action && (
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <Settings className="w-4 h-4" />
            <span className="truncate">Last: {user.lastAction.action}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const UserTable = ({ users, onEdit, onDelete }) => (
  <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
    <table className="table table-zebra w-full">
      <thead className="bg-primary text-primary-content">
        <tr>
          <th className="font-bold">User</th>
          <th className="font-bold">Email</th>
          <th className="font-bold">Role</th>
          <th className="font-bold">Last Action</th>
          <th className="font-bold">Joined</th>
          {checkRole("admin") && <th className="font-bold">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id} className="hover:bg-base-200 transition-colors">
            <td>
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-10 h-10">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="font-bold">{user.fullname}</div>
                  <div className="text-sm opacity-70">
                    ID: {user._id.slice(-6)}
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="truncate max-w-[200px]">{user.email}</span>
              </div>
            </td>
            <td>
              <div
                className={`badge ${getRoleBadgeClass(
                  user.role
                )} font-bold gap-1`}
              >
                {getRoleIcon(user.role)}
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </div>
            </td>
            <td>
              <div className="text-sm">
                {user.lastAction?.action ? (
                  <div className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">
                      {user.lastAction.action}
                    </span>
                  </div>
                ) : (
                  <span className="text-base-content/50">
                    No recent activity
                  </span>
                )}
              </div>
            </td>
            <td>
              <div className="text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </td>
            {checkRole("admin") && (
              <td>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm gap-1"
                    onClick={() => onEdit(user)}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden lg:inline">Edit</span>
                  </button>
                  <button
                    className="btn btn-error btn-sm gap-1"
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden lg:inline">Delete</span>
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  roleFilter,
  onRoleFilterChange,
  viewMode,
  onViewModeChange,
}) => (
  <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-6">
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search Bar */}
      <div className="flex-1">
        <div className="form-control w-full">
          <label className="input input-bordered flex items-center gap-2 w-full">
            <Search className="w-5 h-5 text-info" />
            <input
              type="text"
              className="grow"
              placeholder="Search users by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="form-control">
          <select
            className="select select-bordered w-full max-w-xs"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="">Sort by...</option>
            <option value="name">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="date">Newest First</option>
            <option value="date_desc">Oldest First</option>
            <option value="role">Role (Admin First)</option>
            <option value="role_desc">Role (Staff First)</option>
          </select>
        </div>

        <div className="form-control">
          <select
            className="select select-bordered w-full max-w-xs"
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="btn-group">
          <button
            className={`btn btn-sm ${
              viewMode === "table" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => onViewModeChange("table")}
          >
            <Table className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Table</span>
          </button>
          <button
            className={`btn btn-sm ${
              viewMode === "card" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => onViewModeChange("card")}
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Cards</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Users = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users || []);
  const status = useSelector((state) => state.users.status);
  const error = useSelector((state) => state.users.error);

  // Local state for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, status]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter ? user.role === roleFilter : true;

      return matchesSearch && matchesRole;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.fullname.localeCompare(b.fullname);
        case "name_desc":
          return b.fullname.localeCompare(a.fullname);
        case "date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "date_desc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "role":
          const roleOrder = { admin: 3, manager: 2, staff: 1 };
          return (roleOrder[b.role] || 0) - (roleOrder[a.role] || 0);
        case "role_desc":
          const roleOrderDesc = { admin: 1, manager: 2, staff: 3 };
          return (roleOrderDesc[a.role] || 0) - (roleOrderDesc[b.role] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, searchTerm, sortBy, roleFilter]);

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
    location.reload();
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

  if (!checkRole("admin", "manager")) {
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
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
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
                {checkRole("admin") && (
                  <button
                    onClick={handleAddNew}
                    className="btn btn-primary gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add First User
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </TitleCard>
    </div>
  );
};

export default Users;
