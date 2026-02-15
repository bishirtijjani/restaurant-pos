// frontend/src/features/expenses/index.jsx
import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllExpenses } from "./expensesSlice";
import SuspenseContent from "../../containers/SuspenseContent";
import SearchableSelect from "../../components/Input/SearchableSelect";
import {
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  X,
  SortAsc,
  SortDesc,
  MoreVertical,
  Table,
  SquareGanttChart,
} from "lucide-react";
import { useAuth } from "../../utils/permission";
import Can from "../../components/Auth/Can";
import { formatCurrency } from "../../utils/numberFormat";

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
        <Can do="createExpenses">
          <button onClick={onAddNew} className="btn btn-primary btn-sm gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
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
          <Can do="createExpenses">
            <li>
              <button onClick={onAddNew} className="text-primary font-medium">
                <PlusCircle className="w-4 h-4" /> Add Expense
              </button>
            </li>
          </Can>
        </ul>
      </div>
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
  viewMode,
  onViewModeChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const categoryOptions = [
    { value: "", name: "All Categories" },
    ...categories.map((cat) => ({ value: cat, name: cat })),
  ];

  const paymentMethodOptions = [
    { value: "", name: "All Methods" },
    ...paymentMethods.map((method) => ({ value: method, name: method })),
  ];

  const dateRangeOptions = [
    { value: "", name: "All Time" },
    { value: "today", name: "Today" },
    { value: "week", name: "This Week" },
    { value: "month", name: "This Month" },
    { value: "quarter", name: "This Quarter" },
    { value: "year", name: "This Year" },
  ];

  return (
    <div className="mb-6">
      <div className="space-y-4">
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
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

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${
                hasActiveFilters ? "btn-primary" : "btn-outline"
              } flex-nowrap btn-sm h-10 min-h-10 px-4`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="badge badge-primary-content badge-sm ml-1">
                  {
                    [categoryFilter, paymentMethodFilter, dateRange].filter(
                      Boolean,
                    ).length
                  }
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-base-200 rounded-lg p-1 h-10">
              <button
                className={`btn btn-sm btn-ghost h-8 min-h-8 px-4 ${
                  viewMode === "table" ? "bg-base-100 shadow-sm" : "opacity-50"
                }`}
                onClick={() => onViewModeChange("table")}
              >
                <Table className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Table</span>
              </button>
              <button
                className={`btn btn-sm btn-ghost h-8 min-h-8 px-4 ${
                  viewMode === "card" ? "bg-base-100 shadow-sm" : "opacity-50"
                }`}
                onClick={() => onViewModeChange("card")}
              >
                <SquareGanttChart className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Cards</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-ghost btn-sm h-10 min-h-10 px-4"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

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
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Category
                  </span>
                </label>
                <SearchableSelect
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  name="categoryFilter"
                  placeholder="Filter by category"
                  className=""
                  size="!h-9 text-sm"
                  valueKey="value"
                  labelKey="name"
                />
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Payment Method
                  </span>
                </label>
                <SearchableSelect
                  options={paymentMethodOptions}
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  name="paymentMethodFilter"
                  placeholder="Filter by payment"
                  className=""
                  size="!h-9 text-sm"
                  valueKey="value"
                  labelKey="name"
                />
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date Range
                  </span>
                </label>
                <SearchableSelect
                  options={dateRangeOptions}
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  name="dateRange"
                  placeholder="Filter by date"
                  className=""
                  size="!h-9 text-sm"
                  valueKey="value"
                  labelKey="name"
                />
              </div>
            </div>

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

const ExpenseTable = ({ expenses, sortField, sortDirection, onSort }) => {
  const dispatch = useDispatch();
  const { can } = useAuth();

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
            <SortableHeader field="amount">Amount</SortableHeader>
            <SortableHeader field="date">Date</SortableHeader>
            <th>Payment</th>
            <th>Last Action</th>
            {(can("editExpenses") || can("deleteExpenses")) && <th>Actions</th>}
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
                <span className="badge">{expense.category}</span>
              </td>
              <td>
                <div className="font-semibold text-primary">
                  {formatCurrency(expense.amount)}
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
              {(can("editExpenses") || can("deleteExpenses")) && (
                <td>
                  <div className="flex gap-1">
                    <Can do="editExpenses">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() =>
                          dispatch(
                            openModal({
                              title: "Edit Expense",
                              bodyType: MODAL_BODY_TYPES.EDIT_EXPENSE,
                              extraObject: expense,
                            }),
                          )
                        }
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </Can>

                    <Can do="deleteExpenses">
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
                            }),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Can>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const { can } = useAuth();
  const dispatch = useDispatch();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-300">
      <div className="card-body p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="badge badge-primary font-medium mb-1">
              {expense.category}
            </span>
            <div className="font-mono text-xs opacity-60">
              Ref: {expense.invoice || "NIL"}
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
              <MoreVertical className="w-4 h-4" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-200"
            >
              <Can do="editExpenses">
                <li>
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-primary"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </li>
              </Can>
              <Can do="deleteExpenses">
                <li>
                  <button
                    onClick={() => onDelete(expense)}
                    className="text-error font-medium"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </li>
              </Can>
            </ul>
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(expense.amount)}
          </div>
          <p className="text-sm text-base-content/70 italic mt-1 line-clamp-2 min-h-[2.5rem]">
            {expense.description || "No description provided"}
          </p>
        </div>

        <div className="divider my-1 opacity-50"></div>

        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-base-content/60 font-medium whitespace-nowrap">
              <Calendar className="w-4 h-4" /> Date
            </span>
            <span className="font-medium text-right">
              {formatDate(expense.date)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-base-content/60 font-medium whitespace-nowrap">
              <DollarSign className="w-4 h-4" /> Method
            </span>
            <span className="badge badge-outline badge-sm">
              {expense.paymentMethod}
            </span>
          </div>

          {expense?.lastAction?.action && (
            <div className="mt-4 pt-3 border-t border-base-300/50">
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-6 h-6">
                    <span className="text-[10px] uppercase">
                      {expense?.lastAction.performedBy?.fullname?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-base-content/50">
                    {expense?.lastAction.action} BY
                  </div>
                  <div className="text-xs font-semibold truncate max-w-[120px]">
                    {expense?.lastAction.performedBy?.fullname || "Unknown"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Expenses = () => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const expenses = useSelector((state) => state.expenses.expenses || []);
  const status = useSelector((state) => state.expenses.status);
  const error = useSelector((state) => state.expenses.error);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewMode, setViewMode] = useState(
    window.innerWidth > 768 ? "table" : "card",
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllExpenses());
    }
  }, [dispatch, status]);

  const { categories, paymentMethods } = useMemo(() => {
    const cats = [...new Set(expenses.map((e) => e.category))].filter(Boolean);
    const methods = [...new Set(expenses.map((e) => e.paymentMethod))].filter(
      Boolean,
    );
    return { categories: cats, paymentMethods: methods };
  }, [expenses]);

  const filteredAndSearchedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
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
      const matchesCategory =
        !categoryFilter || expense.category === categoryFilter;
      const matchesPayment =
        !paymentMethodFilter || expense.paymentMethod === paymentMethodFilter;

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
              now.getDate(),
            );
            matchesDate = expenseDate >= monthAgo;
            break;
          case "quarter":
            const quarterAgo = new Date(
              now.getFullYear(),
              now.getMonth() - 3,
              now.getDate(),
            );
            matchesDate = expenseDate >= quarterAgo;
            break;
          case "year":
            const yearAgo = new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate(),
            );
            matchesDate = expenseDate >= yearAgo;
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesPayment && matchesDate;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "createdBy") {
        aVal = a.createdBy?.fullname || "";
        bVal = b.createdBy?.fullname || "";
      }

      if (sortField === "date" || sortField === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortField === "amount") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

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

  const totalAmount = filteredAndSearchedExpenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0,
  );
  const avgAmount =
    filteredAndSearchedExpenses.length > 0
      ? totalAmount / filteredAndSearchedExpenses.length
      : 0;

  const handleAddNew = () => {
    dispatch(
      openModal({
        title: "Add New Expense",
        bodyType: MODAL_BODY_TYPES.ADD_EXPENSE,
        size: "md",
      }),
    );
  };

  const handleRefresh = () => {
    dispatch(fetchAllExpenses());
  };

  const handleEdit = (expense) => {
    dispatch(
      openModal({
        title: "Edit Expense",
        bodyType: MODAL_BODY_TYPES.EDIT_EXPENSE,
        extraObject: expense,
      }),
    );
  };

  const handleDelete = (expense) => {
    dispatch(
      openModal({
        title: "Delete Expense?",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete this expense`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_EXPENSE,
          id: expense._id,
        },
      }),
    );
  };

  if (status === "loading") return <SuspenseContent />;

  if (!can("viewExpenses")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to view expenses.
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
                {formatCurrency(totalAmount)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Average</div>
              <div className="stat-value text-lg text-secondary">
                {formatCurrency(avgAmount)}
              </div>
            </div>
          </div>
        </div>
      }
      TopSideButtons={
        <TopSideButtons onRefresh={handleRefresh} onAddNew={handleAddNew} />
      }
      topMargin="mt-2"
    >
      <div className="md:hidden grid grid-cols-2 gap-4 mb-6">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Amount</div>
          <div className="stat-value text-lg text-primary">
            {formatCurrency(totalAmount)}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Average</div>
          <div className="stat-value text-lg text-secondary">
            {formatCurrency(avgAmount)}
          </div>
        </div>
      </div>

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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredAndSearchedExpenses.length > 0 ? (
        viewMode === "table" ? (
          <ExpenseTable
            expenses={filteredAndSearchedExpenses}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSearchedExpenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
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
