import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, X } from "lucide-react";
import { getLogFilters } from "../auditLogsSlice";

const AuditLogFilters = ({ filters, onFilterChange }) => {
  const dispatch = useDispatch();
  const { filters: options } = useSelector((state) => state.auditLogs);
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  useEffect(() => {
    dispatch(getLogFilters());
  }, [dispatch]);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 }); // Reset to page 1 on filter change
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleChange("search", localSearch);
  };

  const clearFilters = () => {
    setLocalSearch("");
    onFilterChange({
      page: 1,
      limit: 20,
      search: "",
      userId: "",
      entityType: "",
      action: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-sm mb-6 space-y-4">
      {/* Top Row: Search and Quick Stats can go here */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Search logs (reason, ID, etc)..."
            className="input input-bordered w-full pl-10"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        {(filters.search ||
          filters.userId ||
          filters.entityType ||
          filters.action ||
          filters.startDate ||
          filters.endDate) && (
          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-ghost text-error"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </button>
        )}
      </form>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">From Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={filters.startDate || ""}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">To Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={filters.endDate || ""}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />
        </div>

        {/* User Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">User</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={filters.userId || ""}
            onChange={(e) => handleChange("userId", e.target.value)}
          >
            <option value="">All Users</option>
            {options.users?.map((u) => (
              <option key={u._id} value={u._id}>
                {u.fullname} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Entity Type Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Entity Type</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={filters.entityType || ""}
            onChange={(e) => handleChange("entityType", e.target.value)}
          >
            <option value="">All Entries</option>
            {options.entityTypes?.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Action</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={filters.action || ""}
            onChange={(e) => handleChange("action", e.target.value)}
          >
            <option value="">All Actions</option>
            {options.actions?.map((a) => (
              <option key={a} value={a}>
                {a.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AuditLogFilters;
