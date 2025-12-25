import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import SearchableSelect from "../../components/Input/SearchableSelect";
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
  Key,
} from "lucide-react";
import SuspenseContent from "../../containers/SuspenseContent";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";

const TopSideButtons = ({ onRefresh, onAddNew }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Can do="manageUsers">
        <button
          onClick={onAddNew}
          className="btn btn-primary btn-sm lg:btn-md gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </Can>
      <button
        onClick={onRefresh}
        className="btn btn-ghost btn-sm lg:btn-md gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  );
};

const UserCard = ({ user, onView, onEdit, onDelete }) => {
  const { can } = useAuth();
  const currentUser = useSelector((state) => state.auth.user);

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "badge-primary";
      case "manager":
        return "badge-secondary";
      default:
        return "badge-ghost";
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
      <div className="card-body p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-12 h-12">
                <span className="text-lg font-semibold">
                  {user.fullname?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h3 className="card-title text-lg font-bold">{user.fullname}</h3>
              <div
                className={`badge ${getRoleColor(
                  user.role
                )} badge-sm capitalize`}
              >
                {user.role}
              </div>
            </div>
          </div>
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
                <button onClick={() => onView(user)}>
                  <Eye className="w-4 h-4" /> View
                </button>
              </li>
              <Can do="manageUsers">
                <li>
                  <button
                    onClick={() => onEdit(user, "access")}
                    className="text-secondary"
                  >
                    <Key className="w-4 h-4" /> Access
                  </button>
                </li>
              </Can>
              <Can do="manageUsers">
                <li>
                  <button
                    onClick={() => onEdit(user, "permissions")}
                    className="text-accent"
                  >
                    <Shield className="w-4 h-4" /> Permissions
                  </button>
                </li>
              </Can>
              <Can do="manageUsers">
                <li>
                  <button onClick={() => onEdit(user)} className="text-primary">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </li>
                {currentUser?._id !== user._id && (
                  <li>
                    <button
                      onClick={() => onDelete(user)}
                      className="text-error"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </li>
                )}
              </Can>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-secondary" />
            <span className="truncate">{user.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <Calendar className="w-4 h-4" />
            <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserTable = ({ users, onView, onEdit, onDelete }) => {
  const { can } = useAuth();
  const currentUser = useSelector((state) => state.auth.user);

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "badge-primary";
      case "manager":
        return "badge-secondary";
      default:
        return "badge-ghost";
    }
  };

  return (
    <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
      <table className="table table-zebra w-full">
        <thead className="bg-primary text-primary-content">
          <tr>
            <th className="font-bold">User</th>
            <th className="font-bold">Role</th>
            <th className="font-bold">Email</th>
            <th className="font-bold">Joined</th>
            <th className="font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-base-200 transition-colors">
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-12 h-12">
                      <span className="text-lg font-semibold">
                        {user.fullname?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{user.fullname}</div>
                  </div>
                </div>
              </td>
              <td>
                <div
                  className={`badge ${getRoleColor(
                    user.role
                  )} badge-sm capitalize`}
                >
                  {user.role}
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1 text-sm">
                  <Mail className="w-5 h-5 text-base-content/70" />
                  {user.email}
                </div>
              </td>
              <td>
                <div className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost gap-1"
                    onClick={() => onView(user)}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <Can do="manageUsers">
                    <button
                      className="btn btn-ghost gap-1 text-primary"
                      onClick={() => onEdit(user)}
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      className="btn btn-ghost gap-1 text-secondary"
                      onClick={() => onEdit(user, "access")}
                      title="Manage Store Access"
                    >
                      <Key className="w-5 h-5" />
                    </button>
                    <button
                      className="btn btn-ghost gap-1 text-accent"
                      onClick={() => onEdit(user, "permissions")}
                      title="Manage Granular Permissions"
                    >
                      <Shield className="w-5 h-5" />
                    </button>
                    {currentUser?._id !== user._id && (
                      <button
                        className="btn btn-ghost gap-1 text-error"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </Can>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  roleFilter,
  onRoleFilterChange,
  viewMode,
  onViewModeChange,
}) => {
  const sortOptions = [
    { value: "", name: "Sort by..." },
    { value: "name", name: "Name (A-Z)" },
    { value: "name_desc", name: "Name (Z-A)" },
    { value: "date", name: "Newest First" },
    { value: "date_desc", name: "Oldest First" },
  ];

  const roleOptions = [
    { value: "", name: "All Roles" },
    { value: "admin", name: "Admin" },
    { value: "manager", name: "Manager" },
    { value: "staff", name: "Staff" },
  ];

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="form-control w-full">
            <label className="input input-bordered flex items-center gap-2 w-full">
              <Search className="w-5 h-5 text-info" />
              <input
                type="search"
                className="grow"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="form-control">
            <SearchableSelect
              options={sortOptions}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              name="sortBy"
              placeholder="Sort by"
              className="w-full max-w-xs"
              valueKey="value"
              labelKey="name"
            />
          </div>

          <div className="form-control">
            <SearchableSelect
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              name="roleFilter"
              placeholder="Filter by Role"
              className="w-full max-w-xs"
              valueKey="value"
              labelKey="name"
            />
          </div>

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
};

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

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Filter by search term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullname?.toLowerCase().includes(lowerTerm) ||
          u.email?.toLowerCase().includes(lowerTerm) ||
          u.role?.toLowerCase().includes(lowerTerm)
      );
    }

    // Filter by role
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Sort
    if (sortBy) {
      result.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.fullname || "").localeCompare(b.fullname || "");
          case "name_desc":
            return (b.fullname || "").localeCompare(a.fullname || "");
          case "date":
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case "date_desc":
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [users, searchTerm, roleFilter, sortBy]);

  const handleAddNew = () => {
    dispatch(
      openModal({
        title: "Add New User",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_USER,
        size: "xl",
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
        size: "xl",
      })
    );
  };

  const handleEdit = (user, mode = "edit") => {
    if (mode === "access") {
      dispatch(
        openModal({
          title: "Manage Store Access",
          bodyType: MODAL_BODY_TYPES.MANAGE_STORE_ACCESS,
          extraObject: user,
          size: "lg",
        })
      );
    } else if (mode === "permissions") {
      dispatch(
        openModal({
          title: "Manage Security Permissions",
          bodyType: MODAL_BODY_TYPES.MANAGE_USER_PERMISSIONS,
          extraObject: user,
          size: "xl",
        })
      );
    } else {
      dispatch(
        openModal({
          title: "Edit User",
          bodyType: MODAL_BODY_TYPES.EDIT_USER,
          extraObject: user,
          size: "xl",
        })
      );
    }
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
