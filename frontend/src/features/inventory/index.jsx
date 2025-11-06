import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TitleCard from "../../components/Cards/TitleCard";
import SuspenseContent from "../../containers/SuspenseContent";
import { openModal } from "../common/modalSlice";
import { showNotification } from "../common/headerSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import {
  fetchInventoryItems,
  fetchLowStockItems,
  deleteInventoryItem,
  clearError,
  clearSuccess,
} from "./inventorySlice";
import { checkRole } from "../../utils/Helpers";
import {
  Package,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Link as LinkIcon,
  DollarSign,
  Calendar,
  User,
  FileText,
  Grid3x3,
  List,
} from "lucide-react";

const CATEGORIES = [
  "Raw Materials",
  "Beverages",
  "Packaging",
  "Cleaning Supplies",
  "Other",
];

const UNITS = ["kg", "g", "L", "ml", "pcs", "pack", "box", "bag"];

const TopSideButtons = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-2">
      {(checkRole("admin") || checkRole("manager")) && (
        <>
          <button
            onClick={() =>
              dispatch(
                openModal({
                  title: "Add Inventory Item",
                  bodyType: MODAL_BODY_TYPES.ADD_INVENTORY_ITEM,
                  size: "lg",
                })
              )
            }
            className="btn btn-primary btn-sm lg:btn-md gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </button>

          <button
            onClick={() => navigate("/app/purchase-orders/new")}
            className="btn btn-secondary btn-sm lg:btn-md gap-2"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Create PO</span>
          </button>
        </>
      )}

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

const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="bg-base-100 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <label className="input input-bordered flex items-center gap-2">
            <Search className="w-5 h-5 opacity-70" />
            <input
              type="text"
              className="grow"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            className="select select-bordered select-sm lg:select-md"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm lg:select-md"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          {/* View Toggle */}
          <div className="btn-group">
            <button
              className={`btn btn-sm lg:btn-md ${
                viewMode === "grid" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              className={`btn btn-sm lg:btn-md ${
                viewMode === "list" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryCard = ({ item, onEdit, onDelete, onLink, settings }) => {
  const currency = settings?.currency?.symbol || "₦";
  const stockPercentage = item.minStockLevel
    ? (item.currentStock / item.minStockLevel) * 100
    : 100;
  const isLowStock = item.currentStock <= item.minStockLevel;

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="card-title text-lg font-bold line-clamp-1">
              {item.name}
            </h3>
            {item.sku && (
              <div className="badge badge-outline badge-sm mt-1">
                SKU: {item.sku}
              </div>
            )}
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
            >
              <li>
                <button onClick={() => onEdit(item)} className="text-primary">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </li>
              <li>
                <button onClick={() => onLink(item)} className="text-info">
                  <LinkIcon className="w-4 h-4" />
                  Link Menu
                </button>
              </li>
              <li>
                <button onClick={() => onDelete(item)} className="text-error">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Category */}
        <div className="badge badge-secondary mb-3">{item.category}</div>

        {/* Stock Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-70">Current Stock</span>
            <span className="font-bold text-lg">
              {item.currentStock} {item.unit}
            </span>
          </div>

          {/* Stock Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Stock Level</span>
              <span>{stockPercentage.toFixed(0)}%</span>
            </div>
            <progress
              className={`progress ${
                isLowStock ? "progress-error" : "progress-success"
              } w-full`}
              value={item.currentStock}
              max={item.minStockLevel || 100}
            ></progress>
            <div className="text-xs opacity-60 mt-1">
              Min: {item.minStockLevel} {item.unit}
            </div>
          </div>

          {/* Cost */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm opacity-70">Cost Price</span>
            <span className="font-semibold text-primary">
              {currency}
              {item.costPrice.toLocaleString()}
            </span>
          </div>

          {/* Linked Items */}
          {item.linkedMenuItems && item.linkedMenuItems.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-info">
              <LinkIcon className="w-4 h-4" />
              <span>{item.linkedMenuItems.length} menu items linked</span>
            </div>
          )}

          {/* Last Restock */}
          {item.lastRestockDate && (
            <div className="flex items-center gap-2 text-xs opacity-60">
              <Calendar className="w-3 h-3" />
              <span>
                Last restocked:{" "}
                {new Date(item.lastRestockDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Low Stock Warning */}
        {isLowStock && (
          <div className="alert alert-warning mt-3 p-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Low stock alert!</span>
          </div>
        )}
      </div>
    </div>
  );
};

const InventoryTable = ({ items, onEdit, onDelete, onLink, settings }) => {
  const currency = settings?.currency?.symbol || "₦";

  return (
    <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
      <table className="table table-zebra w-full">
        <thead className="bg-primary text-primary-content">
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Cost Price</th>
            <th>Supplier</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isLowStock = item.currentStock <= item.minStockLevel;
            return (
              <tr key={item._id} className="hover">
                <td>
                  <div>
                    <div className="font-bold">{item.name}</div>
                    {item.sku && (
                      <div className="text-sm opacity-70">SKU: {item.sku}</div>
                    )}
                  </div>
                </td>
                <td>
                  <span className="badge badge-secondary">{item.category}</span>
                </td>
                <td>
                  <div>
                    <div className="font-semibold">
                      {item.currentStock} {item.unit}
                    </div>
                    <div className="text-xs opacity-60">
                      Min: {item.minStockLevel}
                    </div>
                  </div>
                </td>
                <td className="font-semibold text-primary">
                  {currency}
                  {item.costPrice.toLocaleString()}
                </td>
                <td>
                  {item.supplier?.name || (
                    <span className="text-base-content/50">Not set</span>
                  )}
                </td>
                <td>
                  {isLowStock ? (
                    <div className="badge badge-error gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Low Stock
                    </div>
                  ) : (
                    <div className="badge badge-success gap-1">
                      <TrendingUp className="w-3 h-3" />
                      In Stock
                    </div>
                  )}
                </td>
                <td>
                  <div className="flex gap-1">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs text-info"
                      onClick={() => onLink(item)}
                      title="Link Menu Items"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => onDelete(item)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const InventoryManagement = () => {
  const dispatch = useDispatch();
  const { items, loading, error, success, message } = useSelector(
    (state) => state.inventory
  );
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    dispatch(fetchInventoryItems());
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter
        ? item.category === categoryFilter
        : true;

      const matchesStock = (() => {
        if (!stockFilter) return true;
        const isLowStock = item.currentStock <= item.minStockLevel;
        switch (stockFilter) {
          case "low":
            return isLowStock;
          case "in-stock":
            return !isLowStock && item.currentStock > 0;
          case "out-of-stock":
            return item.currentStock === 0;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, searchQuery, categoryFilter, stockFilter]);

  const handleEdit = (item) => {
    dispatch(
      openModal({
        title: "Edit Inventory Item",
        bodyType: MODAL_BODY_TYPES.EDIT_INVENTORY_ITEM,
        extraObject: item,
        size: "lg",
      })
    );
  };

  const handleDelete = (item) => {
    dispatch(
      openModal({
        title: "Delete Item?",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete "${item.name}"?`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_INVENTORY_ITEM,
          id: item._id,
        },
      })
    );
  };

  const handleLink = (item) => {
    dispatch(
      openModal({
        title: "Link Menu Items",
        bodyType: MODAL_BODY_TYPES.LINK_MENU_ITEMS,
        extraObject: item,
        size: "lg",
      })
    );
  };

  if (loading) return <SuspenseContent />;

  return (
    <TitleCard
      title={
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          <span>Inventory Management</span>
          <span className="badge badge-primary">{filteredItems.length}</span>
        </div>
      }
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <Package className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No inventory items found
          </h3>
          <p className="text-base-content/70 max-w-md mx-auto">
            {searchQuery || categoryFilter || stockFilter
              ? "Try adjusting your filters"
              : "Start by adding your first inventory item"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <InventoryCard
              key={item._id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onLink={handleLink}
              settings={settings}
            />
          ))}
        </div>
      ) : (
        <InventoryTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLink={handleLink}
          settings={settings}
        />
      )}
    </TitleCard>
  );
};

export default InventoryManagement;
