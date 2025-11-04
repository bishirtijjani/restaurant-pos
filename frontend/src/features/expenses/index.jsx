import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllExpenses } from "./expensesSlice";
import { fetchSettings } from "../settings/generalSettings/generalSettingsSlice";
import SuspenseContent from "../../containers/SuspenseContent";
import {
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  User,
  FileText,
  ChevronDown,
  X,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { checkRole } from "../../utils/Helpers";

const TopSideButtons = () => {
  const dispatch = useDispatch();

  const openAddNewExpense = () => {
    dispatch(
      openModal({
        title: "Add New Expense",
        bodyType: MODAL_BODY_TYPES.ADD_EXPENSE,
        size: "md",
      })
    );
  };

  return (
    <div className="flex gap-2">
      {(checkRole("admin") || checkRole("manager")) && (
        <button
          onClick={openAddNewExpense}
          className="btn btn-primary flex-nowrap"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      )}

      <button
        onClick={() => location.reload()}
        className="btn btn-ghost flex-nowrap"
      >
        <RefreshCw className="h-4 w-4" />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  );
};

const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  dateRange,
  setDateRange,
  clearFilters,
  hasActiveFilters,
  categories,
  paymentMethods,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-base-100 border-b border-base-300 -mx-6 px-6 py-4 mb-6">
      <div className="space-y-4">
        {/* Search Bar and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/60" />
            <input
              type="text"
              placeholder="Search expenses by invoice, category, amount, or description..."
              className="input input-bordered w-full pl-10 pr-4 focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${
                hasActiveFilters ? "btn-primary" : "btn-outline"
              } flex-nowrap`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="badge badge-primary-content badge-sm ml-1">
                  {
                    [categoryFilter, paymentMethodFilter, dateRange].filter(
                      Boolean
                    ).length
                  }
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-ghost flex-nowrap"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-base-200/30 rounded-xl p-4 border border-base-300/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Options
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm"
                  title="Reset all filters"
                >
                  <X className="h-4 w-4" />
                  Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Category
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm focus:ring-2 focus:ring-primary/20"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Payment Method
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm focus:ring-2 focus:ring-primary/20"
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                >
                  <option value="">All Methods</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date Range
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm focus:ring-2 focus:ring-primary/20"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-4 pt-3 border-t border-base-300/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-base-content/70">
                    Active filters:
                  </span>
                  {categoryFilter && (
                    <span className="badge badge-primary badge-sm gap-1">
                      Category: {categoryFilter}
                      <button
                        onClick={() => setCategoryFilter("")}
                        className="hover:bg-primary-focus rounded-full p-0.5"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </span>
                  )}
                  {paymentMethodFilter && (
                    <span className="badge badge-secondary badge-sm gap-1">
                      Payment: {paymentMethodFilter}
                      <button
                        onClick={() => setPaymentMethodFilter("")}
                        className="hover:bg-secondary-focus rounded-full p-0.5"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </span>
                  )}
                  {dateRange && (
                    <span className="badge badge-accent badge-sm gap-1">
                      Date: {dateRange}
                      <button
                        onClick={() => setDateRange("")}
                        className="hover:bg-accent-focus rounded-full p-0.5"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ExpenseTable = ({
  expenses,
  sortField,
  sortDirection,
  onSort,
  settings,
}) => {
  const dispatch = useDispatch();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const SortableHeader = ({ field, children }) => (
    <th
      className="cursor-pointer hover:bg-base-200 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortDirection === "asc" ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          ))}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <table className="table table-zebra w-full">
        <thead className="bg-primary text-primary-content">
          <tr>
            <th>#</th>
            <SortableHeader field="invoice">Ref/Invoice No.</SortableHeader>
            <SortableHeader field="category">Category</SortableHeader>
            <SortableHeader field="amount">
              Amount ({settings.currency.symbol})
            </SortableHeader>
            <SortableHeader field="date">Date</SortableHeader>
            <th>Payment</th>
            <th>Last Action</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={expense._id} className="hover">
              <td>{index + 1}</td>
              <td>
                <div className="font-mono text-sm">
                  {expense.invoice || "NIL"}
                </div>
              </td>
              <td>
                <span className={`badge`}>{expense.category}</span>
              </td>
              <td>
                <div className="font-semibold text-primary">
                  {expense.amount.toLocaleString()}
                </div>
              </td>
              <td>{formatDate(expense.date)}</td>
              <td>
                <span className="badge badge-outline">
                  {expense.paymentMethod}
                </span>
              </td>
              <td>
                {expense?.lastAction?.action ? (
                  <div className="space-y-1">
                    <span className="badge badge-info badge-sm capitalize">
                      {expense?.lastAction.action}
                    </span>
                    {expense?.lastAction.performedBy && (
                      <div className="text-xs text-base-content/70">
                        By: {expense?.lastAction.performedBy.fullname}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-base-content/40">
                    No action
                  </span>
                )}
              </td>
              <td>
                <div className="flex gap-1">
                  {(checkRole("admin") || checkRole("manager")) && (
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() =>
                        dispatch(
                          openModal({
                            title: "Edit Expense",
                            bodyType: MODAL_BODY_TYPES.EDIT_EXPENSE,
                            extraObject: expense,
                          })
                        )
                      }
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}

                  {checkRole("admin") && (
                    <button
                      className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content"
                      onClick={() =>
                        dispatch(
                          openModal({
                            title: "Delete Expense?",
                            bodyType: MODAL_BODY_TYPES.CONFIRMATION,
                            extraObject: {
                              message: `Are you sure you want to delete this expense`,
                              type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_EXPENSE,
                              id: expense._id,
                            },
                          })
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Expenses = () => {
  const dispatch = useDispatch();
  const expenses = useSelector((state) => state.expenses.expenses || []);
  const status = useSelector((state) => state.expenses.status);
  const error = useSelector((state) => state.expenses.error);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    dispatch(fetchSettings());
    if (status === "idle") {
      dispatch(fetchAllExpenses());
    }
  }, [dispatch, status]);

  // Get unique categories and payment methods for filters
  const { categories, paymentMethods } = useMemo(() => {
    const cats = [...new Set(expenses.map((e) => e.category))].filter(Boolean);
    const methods = [...new Set(expenses.map((e) => e.paymentMethod))].filter(
      Boolean
    );
    return { categories: cats, paymentMethods: methods };
  }, [expenses]);

  // Filter and search logic
  const filteredAndSearchedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      // Search filter
      const searchText = [
        expense._id,
        expense.category,
        expense.amount?.toString(),
        expense.invoice,
        expense.description,
        expense?.lastAction?.performedBy?.fullname,
        expense.paymentMethod,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        !categoryFilter || expense.category === categoryFilter;

      // Payment method filter
      const matchesPayment =
        !paymentMethodFilter || expense.paymentMethod === paymentMethodFilter;

      // Date range filter
      let matchesDate = true;
      if (dateRange) {
        const expenseDate = new Date(expense.date);
        const now = new Date();

        switch (dateRange) {
          case "today":
            matchesDate = expenseDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = expenseDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              now.getDate()
            );
            matchesDate = expenseDate >= monthAgo;
            break;
          case "quarter":
            const quarterAgo = new Date(
              now.getFullYear(),
              now.getMonth() - 3,
              now.getDate()
            );
            matchesDate = expenseDate >= quarterAgo;
            break;
          case "year":
            const yearAgo = new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate()
            );
            matchesDate = expenseDate >= yearAgo;
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesPayment && matchesDate;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle nested properties
      if (sortField === "createdBy") {
        aVal = a.createdBy?.fullname || "";
        bVal = b.createdBy?.fullname || "";
      }

      // Handle dates
      if (sortField === "date" || sortField === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Handle numbers
      if (sortField === "amount") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      // Handle strings
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    expenses,
    searchQuery,
    categoryFilter,
    paymentMethodFilter,
    dateRange,
    sortField,
    sortDirection,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setPaymentMethodFilter("");
    setDateRange("");
  };

  const hasActiveFilters =
    searchQuery || categoryFilter || paymentMethodFilter || dateRange;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Calculate summary stats
  const totalAmount = filteredAndSearchedExpenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  );
  const avgAmount =
    filteredAndSearchedExpenses.length > 0
      ? totalAmount / filteredAndSearchedExpenses.length
      : 0;

  if (status === "loading") return <SuspenseContent />;

  return (
    <TitleCard
      title={
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="text-2xl font-bold">Expenses Overview</h2>
            <div className="text-sm text-base-content/70 mt-1">
              {filteredAndSearchedExpenses.length} of {expenses.length} expenses
              {hasActiveFilters && " (filtered)"}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="stat">
              <div className="stat-title">Total</div>
              <div className="stat-value text-lg text-primary">
                {settings.currency.symbol}
                {totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Average</div>
              <div className="stat-value text-lg text-secondary">
                {settings.currency.symbol}
                {avgAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      }
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      {/* Mobile Summary Stats */}
      <div className="md:hidden grid grid-cols-2 gap-4 mb-6">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Amount</div>
          <div className="stat-value text-lg text-primary">
            {settings.currency.symbol}
            {totalAmount.toLocaleString()}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Average</div>
          <div className="stat-value text-lg text-secondary">
            {settings.currency.symbol}
            {avgAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        categories={categories}
        paymentMethods={paymentMethods}
      />

      {/* Content */}
      {filteredAndSearchedExpenses.length > 0 ? (
        <ExpenseTable
          expenses={filteredAndSearchedExpenses}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          settings={settings}
        />
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-error text-lg font-semibold mb-2">
            Error Loading Expenses
          </div>
          <div className="text-base-content/70">{error.message}</div>
        </div>
      ) : hasActiveFilters ? (
        <div className="text-center py-12">
          <div className="text-lg font-semibold mb-2">
            No expenses match your filters
          </div>
          <div className="text-base-content/70 mb-4">
            Try adjusting your search criteria
          </div>
          <button onClick={clearFilters} className="btn btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-lg font-semibold mb-2">No expenses found</div>
          <div className="text-base-content/70">
            Start by adding your first expense
          </div>
        </div>
      )}
    </TitleCard>
  );
};

export default Expenses;
