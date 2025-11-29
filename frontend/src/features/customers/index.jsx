// frontend/src/features/customers/index.jsx
import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCustomers } from "./customersSlice";
import { fetchSettings } from "../settings/generalSettings/generalSettingsSlice";
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
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Eye,
} from "lucide-react";
import { useAuth } from "../../utils/permission";
import Can from "../../components/Auth/Can";
import { Link } from "react-router-dom";

const TopSideButtons = ({ onRefresh, onAddNew }) => {
  const { can } = useAuth();

  return (
    <div className="flex flex-wrap gap-2">
      <Can do="createCustomers">
        <button
          onClick={onAddNew}
          className="btn btn-primary btn-sm lg:btn-md gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Customer</span>
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

const CustomerCard = ({ customer, onEdit, onDelete, settings }) => {
  const { can } = useAuth();

  return (
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
              <h3 className="card-title text-lg font-bold">
                {customer.fullname}
              </h3>
              <div className="badge badge-outline badge-sm">
                ID: {customer._id.slice(-6)}
              </div>
            </div>
          </div>

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
                    <Link to={`/app/customers/${customer._id}`} className="text-info">
                        <Eye className="w-4 h-4" />
                        View
                    </Link>
                </li>
                <Can do="editCustomers">
                  <li>
                    <button
                      onClick={() => onEdit(customer)}
                      className="text-primary"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </li>
                </Can>
                <Can do="deleteCustomers">
                  <li>
                    <button
                      onClick={() => onDelete(customer)}
                      className="text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </li>
                </Can>
              </ul>
            </div>

          {!(can("editCustomers") || can("deleteCustomers")) && (
             <Link to={`/app/customers/${customer._id}`} className="btn btn-ghost btn-sm btn-circle">
                <Eye className="w-4 h-4" />
             </Link>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-primary" />
            <span className="font-medium">{customer.phone}</span>
          </div>

          {customer.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}

          {customer.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>
              Debt Limit:{" "}
              <span className="font-bold text-success">
                {settings?.currency.symbol}
                {customer.debtLimit?.toLocaleString() || 0}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <Calendar className="w-4 h-4" />
            <span>
              Created: {new Date(customer.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerTable = ({ customers, onEdit, onDelete, settings }) => {
  const { can } = useAuth();

  return (
    <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
      <table className="table table-zebra w-full">
        <thead className="bg-primary text-primary-content">
          <tr>
            <th className="font-bold">Customer</th>
            <th className="font-bold">Contact</th>
            <th className="font-bold">Address</th>
            <th className="font-bold">Debt Limit</th>
            <th className="font-bold">Created</th>
            {(can("editCustomers") || can("deleteCustomers")) && (
              <th className="font-bold">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer._id}
              className="hover:bg-base-200 transition-colors"
            >
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-10 h-10">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{customer.fullname}</div>
                    <div className="text-sm opacity-70">
                      ID: {customer._id.slice(-6)}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="w-3 h-3" />
                    {customer.phone}
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-1 text-sm opacity-70">
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">
                    {customer.address || "Not provided"}
                  </span>
                </div>
              </td>
              <td>
                <div className="badge badge-success font-bold">
                  {settings?.currency.symbol}
                  {customer.debtLimit?.toLocaleString() || 0}
                </div>
              </td>
              <td>
                <div className="text-sm">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </div>
              </td>
              {(can("editCustomers") || can("deleteCustomers")) ? (
                <td>
                  <div className="flex gap-2">
                    <Link
                        to={`/app/customers/${customer._id}`}
                        className="btn btn-ghost btn-sm gap-1"
                    >
                        <Eye className="w-4 h-4" />
                        <span className="hidden lg:inline">View</span>
                    </Link>
                    <Can do="editCustomers">
                      <button
                        className="btn btn-primary btn-sm gap-1"
                        onClick={() => onEdit(customer)}
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden lg:inline">Edit</span>
                      </button>
                    </Can>
                    <Can do="deleteCustomers">
                      <button
                        className="btn btn-error btn-sm gap-1"
                        onClick={() => onDelete(customer)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden lg:inline">Delete</span>
                      </button>
                    </Can>
                  </div>
                </td>
              ) : (
                <td>
                    <Link
                        to={`/app/customers/${customer._id}`}
                        className="btn btn-ghost btn-sm gap-1"
                    >
                        <Eye className="w-4 h-4" />
                        <span className="hidden lg:inline">View</span>
                    </Link>
                </td>
              )}
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
  debtLimitFilter,
  onDebtLimitFilterChange,
  viewMode,
  onViewModeChange,
  settings,
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
              placeholder="Search customers by name, phone, or email..."
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
            <option value="debt_limit">Debt Limit (Low-High)</option>
            <option value="debt_limit_desc">Debt Limit (High-Low)</option>
          </select>
        </div>

        <div className="form-control">
          <select
            className="select select-bordered w-full max-w-xs"
            value={debtLimitFilter}
            onChange={(e) => onDebtLimitFilterChange(e.target.value)}
          >
            <option value="">All Debt Limits</option>
            <option value="low">{`${settings?.currency.symbol}0 - ${settings?.currency.symbol}50,000`}</option>
            <option value="medium">{`${settings?.currency.symbol}50,001 - ${settings?.currency.symbol}200,000`}</option>
            <option value="high">{`${settings?.currency.symbol}200,001+`}</option>
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

const Customers = () => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const customers = useSelector((state) => state.customers.customers || []);
  const status = useSelector((state) => state.customers.status);
  const error = useSelector((state) => state.customers.error);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [debtLimitFilter, setDebtLimitFilter] = useState("");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllCustomers());
    }
  }, [dispatch, status]);

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter((customer) => {
      const matchesSearch =
        customer.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDebtLimit = (() => {
        const limit = customer.debtLimit || 0;
        switch (debtLimitFilter) {
          case "low":
            return limit <= 50000;
          case "medium":
            return limit > 50000 && limit <= 200000;
          case "high":
            return limit > 200000;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesDebtLimit;
    });

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
        case "debt_limit":
          return (a.debtLimit || 0) - (b.debtLimit || 0);
        case "debt_limit_desc":
          return (b.debtLimit || 0) - (a.debtLimit || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [customers, searchTerm, sortBy, debtLimitFilter]);

  const handleAddNew = () => {
    dispatch(
      openModal({
        title: "Add New Customer",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_CUSTOMER,
        size: "md",
      })
    );
  };

  const handleRefresh = () => {
    dispatch(fetchAllCustomers());
  };

  const handleEdit = (customer) => {
    dispatch(
      openModal({
        title: "Edit Customer",
        bodyType: MODAL_BODY_TYPES.EDIT_CUSTOMER,
        extraObject: customer,
        size: "md",
      })
    );
  };

  const handleDelete = (customer) => {
    dispatch(
      openModal({
        title: "Delete Customer?",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete the customer "${customer.fullname}"?`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_CUSTOMER,
          id: customer._id,
        },
      })
    );
  };

  if (status === "loading") return <SuspenseContent />;

  if (!can("viewCustomers")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to view customers.
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
        title={`All Customers (${filteredAndSortedCustomers.length})`}
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
          debtLimitFilter={debtLimitFilter}
          onDebtLimitFilterChange={setDebtLimitFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          settings={settings}
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
        ) : filteredAndSortedCustomers.length > 0 ? (
          viewMode === "table" ? (
            <CustomerTable
              customers={filteredAndSortedCustomers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              settings={settings}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCustomers.map((customer) => (
                <CustomerCard
                  key={customer._id}
                  customer={customer}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  settings={settings}
                />
              ))}
            </div>
          )
        ) : (
          <div className="hero min-h-[300px] bg-base-200 rounded-lg">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4">👥</div>
                <h1 className="text-2xl font-bold">No customers found</h1>
                <p className="py-4">
                  {searchTerm || sortBy || debtLimitFilter
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first customer"}
                </p>
                <Can do="createCustomers">
                  <button
                    onClick={handleAddNew}
                    className="btn btn-primary gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Customer
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

export default Customers;
