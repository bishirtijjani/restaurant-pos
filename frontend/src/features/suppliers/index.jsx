// frontend/src/features/suppliers/index.jsx
import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";

import { useDispatch, useSelector } from "react-redux";
import { fetchAllSuppliers } from "./suppliersSlice";
import SuspenseContent from "../../containers/SuspenseContent";
import { useAuth } from "../../utils/permission";
import Can from "../../components/Auth/Can";
import SearchBar from "../../components/Input/SearchBar";
import SearchableSelect from "../../components/Input/SearchableSelect";
import {
  PlusCircle,
  RefreshCw,
  MoreVertical,
  Edit3,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Table,
  SquareGanttChart,
} from "lucide-react";

const TopSideButtons = ({ onRefresh, onAddNew }) => {
  const { can } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="btn btn-ghost btn-sm btn-circle"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <Can do="editInventory">
          <button onClick={onAddNew} className="btn btn-primary btn-sm gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </Can>
      </div>

      {/* Mobile View - Single Dropdown */}
      <div className="sm:hidden dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
          <MoreVertical className="w-5 h-5" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52 mt-2 z-[1000] border border-base-200"
        >
          <li>
            <button onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" /> Refresh Data
            </button>
          </li>
          <div className="divider my-1"></div>
          <Can do="editInventory">
            <li>
              <button onClick={onAddNew} className="text-primary font-medium">
                <PlusCircle className="w-4 h-4" /> Add Supplier
              </button>
            </li>
          </Can>
        </ul>
      </div>
    </div>
  );
};

const SupplierCard = ({ supplier, onEdit, onDelete }) => {
  const { can } = useAuth();

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
      <div className="card-body p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                <span className="text-lg font-semibold">
                  {supplier.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h3 className="card-title text-lg font-bold">{supplier.name}</h3>
              <div className="badge badge-outline badge-sm">
                ID: {supplier._id.slice(-6)}
              </div>
            </div>
          </div>
          <Can do="editInventory">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
              >
                <li>
                  <button
                    onClick={() => onEdit(supplier)}
                    className="text-primary"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onDelete(supplier)}
                    className="text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          </Can>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-secondary" />
            <span className="font-medium">{supplier.phone}</span>
          </div>

          {supplier.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-secondary" />
              <span className="truncate">{supplier.email}</span>
            </div>
          )}

          {supplier.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-secondary" />
              <span className="truncate">{supplier.address}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <Calendar className="w-4 h-4" />
            <span>
              Created: {new Date(supplier.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupplierTable = ({ suppliers, onEdit, onDelete }) => {
  const { can } = useAuth();

  return (
    <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
      <table className="table table-zebra w-full">
        <thead className="bg-primary text-primary-content">
          <tr>
            <th className="font-bold">Supplier</th>
            <th className="font-bold">Contact</th>
            <th className="font-bold">Address</th>

            <th className="font-bold">Created</th>
            <Can do="editInventory">
              <th className="font-bold">Actions</th>
            </Can>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr
              key={supplier._id}
              className="hover:bg-base-200 transition-colors"
            >
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                      <span className="text-lg font-semibold">
                        {supplier.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{supplier.name}</div>
                    <div className="text-sm opacity-70">
                      ID: {supplier._id.slice(-6)}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="w-3 h-3" />
                    {supplier.phone}
                  </div>
                  {supplier.email && (
                    <div className="flex items-center gap-1 text-sm opacity-70">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">
                        {supplier.email}
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">
                    {supplier.address || "Not provided"}
                  </span>
                </div>
              </td>

              <td>
                <div className="text-sm">
                  {new Date(supplier.createdAt).toLocaleDateString()}
                </div>
              </td>
              <Can do="editInventory">
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary btn-sm gap-1"
                      onClick={() => onEdit(supplier)}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden lg:inline">Edit</span>
                    </button>
                    <button
                      className="btn btn-error btn-sm gap-1"
                      onClick={() => onDelete(supplier)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden lg:inline">Delete</span>
                    </button>
                  </div>
                </td>
              </Can>
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

  return (
    <div className="bg-base-100 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            searchText={searchTerm}
            setSearchText={onSearchChange}
            placeholderText="Search suppliers by name, phone, or email..."
            styleClass="w-full"
            inputStyleClass="!h-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="form-control">
            <SearchableSelect
              options={sortOptions}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              name="sortBy"
              placeholder="Sort by"
              className="w-full md:w-56"
              size="!h-10"
              valueKey="value"
              labelKey="name"
            />
          </div>

          <div className="flex items-center bg-base-200 rounded-lg p-1 h-10">
            <button
              className={`btn btn-sm btn-ghost h-8 min-h-8 px-4 ${
                viewMode === "table" ? "bg-base-100 shadow-sm" : "opacity-50"
              }`}
              onClick={() => onViewModeChange("table")}
            >
              <Table className="w-4 h-4" />
              <span className="inline ml-2">Table</span>
            </button>
            <button
              className={`btn btn-sm btn-ghost h-8 min-h-8 px-4 ${
                viewMode === "card" ? "bg-base-100 shadow-sm" : "opacity-50"
              }`}
              onClick={() => onViewModeChange("card")}
            >
              <SquareGanttChart className="w-4 h-4" />
              <span className="inline ml-2">Cards</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Suppliers = () => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const suppliers = useSelector((state) => state.suppliers.suppliers || []);
  const status = useSelector((state) => state.suppliers.status);
  const error = useSelector((state) => state.suppliers.error);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [viewMode, setViewMode] = useState(
    window.innerWidth > 768 ? "table" : "card",
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllSuppliers());
    }
  }, [dispatch, status]);

  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone?.includes(searchTerm) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "date_desc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [suppliers, searchTerm, sortBy]);

  const handleAddNew = () => {
    dispatch(
      openModal({
        title: "Add New Supplier",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_SUPPLIER,
        size: "md",
      }),
    );
  };

  const handleRefresh = () => {
    dispatch(fetchAllSuppliers());
  };

  const handleEdit = (supplier) => {
    dispatch(
      openModal({
        title: "Edit Supplier",
        bodyType: MODAL_BODY_TYPES.EDIT_SUPPLIER,
        extraObject: supplier,
        size: "md",
      }),
    );
  };

  const handleDelete = (supplier) => {
    dispatch(
      openModal({
        title: "Delete Supplier?",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete the supplier "${supplier.name}"?`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_SUPPLIER,
          id: supplier._id,
        },
      }),
    );
  };

  if (status === "loading") return <SuspenseContent />;

  // Authorization check using the proper permission system
  if (!can("viewInventory")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to view suppliers.
              </p>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  return (
    <div className="space-y-6">
      <TitleCard
        title={`All Suppliers (${filteredAndSortedSuppliers.length})`}
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
        ) : filteredAndSortedSuppliers.length > 0 ? (
          viewMode === "table" ? (
            <SupplierTable
              suppliers={filteredAndSortedSuppliers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier._id}
                  supplier={supplier}
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
                <div className="text-6xl mb-4">🏢</div>
                <h1 className="text-2xl font-bold">No suppliers found</h1>
                <p className="py-4">
                  {searchTerm || sortBy
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first supplier"}
                </p>
                <Can do="editInventory">
                  <button
                    onClick={handleAddNew}
                    className="btn btn-primary gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add First Supplier
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

export default Suppliers;
