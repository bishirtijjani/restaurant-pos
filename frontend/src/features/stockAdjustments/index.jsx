import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import SuspenseContent from "../../containers/SuspenseContent";
import { openModal } from "../common/modalSlice";
import { showNotification } from "../common/headerSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
import {
  fetchStockAdjustments,
  clearError,
  clearSuccess,
} from "./stockAdjustmentsSlice";
import { fetchInventoryItems } from "../inventory/inventorySlice";
import { checkRole } from "../../utils/Helpers";
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  AlertCircle,
  Eye,
} from "lucide-react";

const ADJUSTMENT_TYPES = {
  addition: { icon: TrendingUp, color: "text-success", label: "Addition" },
  subtraction: {
    icon: TrendingDown,
    color: "text-error",
    label: "Subtraction",
  },
  correction: { icon: AlertCircle, color: "text-warning", label: "Correction" },
};

const REASON_LABELS = {
  wastage: "Wastage",
  damage: "Damage",
  theft: "Theft",
  return: "Return",
  donation: "Donation",
  correction: "Stock Correction",
  stock_take: "Stock Take",
  other: "Other",
};

const TopSideButtons = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-wrap gap-2">
      {(checkRole("admin") || checkRole("manager")) && (
        <button
          onClick={() =>
            dispatch(
              openModal({
                title: "New Stock Adjustment",
                bodyType: MODAL_BODY_TYPES.ADD_STOCK_ADJUSTMENT,
                size: "lg",
              })
            )
          }
          className="btn btn-primary btn-sm lg:btn-md gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Adjustment</span>
        </button>
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
  typeFilter,
  setTypeFilter,
  itemFilter,
  setItemFilter,
  inventoryItems,
}) => {
  return (
    <div className="bg-base-100 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="input input-bordered flex items-center gap-2">
            <Search className="w-5 h-5 opacity-70" />
            <input
              type="text"
              className="grow"
              placeholder="Search by adjustment number, item, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="select select-bordered select-sm lg:select-md"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="addition">Addition</option>
            <option value="subtraction">Subtraction</option>
            <option value="correction">Correction</option>
          </select>

          <select
            className="select select-bordered select-sm lg:select-md"
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
          >
            <option value="">All Items</option>
            {inventoryItems.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const AdjustmentCard = ({ adjustment, onView, settings }) => {
  const currency = settings?.currency?.symbol || "$";
  const typeConfig = ADJUSTMENT_TYPES[adjustment.type];
  const TypeIcon = typeConfig?.icon || AlertCircle;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
      <div className="card-body p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TypeIcon className={`w-5 h-5 ${typeConfig?.color}`} />
              {adjustment.adjustmentNumber}
            </h3>
            <p className="text-sm text-base-content/70 mt-1">
              {adjustment.inventoryItem?.name || "Unknown Item"}
            </p>
          </div>
          <span className={`badge ${typeConfig?.color} gap-1`}>
            {typeConfig?.label}
          </span>
        </div>

        <div className="divider my-2"></div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base-content/70 text-sm">Quantity</span>
            <span className="font-semibold">
              {adjustment.quantity} {adjustment.inventoryItem?.unit}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base-content/70 text-sm">Previous Stock</span>
            <span className="text-sm">{adjustment.previousStock}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base-content/70 text-sm">New Stock</span>
            <span className="text-sm font-semibold text-primary">
              {adjustment.newStock}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base-content/70 text-sm">Reason</span>
            <span className="text-sm">{REASON_LABELS[adjustment.reason]}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base-content/70 text-sm flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Date
            </span>
            <span className="text-sm">{formatDate(adjustment.createdAt)}</span>
          </div>

          {adjustment.performedBy && (
            <div className="flex justify-between items-center">
              <span className="text-base-content/70 text-sm">Performed By</span>
              <span className="text-sm">{adjustment.performedBy.fullname}</span>
            </div>
          )}
        </div>

        {adjustment.notes && (
          <div className="mt-3 pt-3 border-t border-base-300">
            <p className="text-sm text-base-content/70">
              <span className="font-medium">Notes: </span>
              {adjustment.notes}
            </p>
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-sm btn-outline btn-primary"
            onClick={() => onView(adjustment)}
          >
            <Eye className="w-4 h-4 mr-1" /> View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const StockAdjustmentsManagement = () => {
  const dispatch = useDispatch();
  const { adjustments, loading, error, success, message } = useSelector(
    (state) => state.stockAdjustments
  );
  const inventoryItems = useSelector((state) => state.inventory.items || []);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");

  useEffect(() => {
    dispatch(fetchStockAdjustments());
    dispatch(fetchInventoryItems());
  }, [dispatch]);

  useEffect(() => {
    if (success && message) {
      dispatch(showNotification({ message, status: 1 }));
      dispatch(clearSuccess());
      dispatch(fetchStockAdjustments());
    }
    if (error) {
      dispatch(
        showNotification({ message: error.message || error, status: 0 })
      );
      dispatch(clearError());
    }
  }, [success, message, error, dispatch]);

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((adjustment) => {
      const matchesSearch =
        adjustment.adjustmentNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        adjustment.inventoryItem?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        adjustment.reason?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter ? adjustment.type === typeFilter : true;
      const matchesItem = itemFilter
        ? adjustment.inventoryItem?._id === itemFilter
        : true;

      return matchesSearch && matchesType && matchesItem;
    });
  }, [adjustments, searchQuery, typeFilter, itemFilter]);

  const handleView = (adjustment) => {
    dispatch(
      openModal({
        title: "Adjustment Details",
        bodyType: MODAL_BODY_TYPES.VIEW_STOCK_ADJUSTMENT,
        extraObject: adjustment,
      })
    );
  };

  if (loading) return <SuspenseContent />;

  return (
    <TitleCard
      title={
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          <span>Stock Adjustments</span>
          <span className="badge badge-primary">
            {filteredAdjustments.length}
          </span>
        </div>
      }
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        itemFilter={itemFilter}
        setItemFilter={setItemFilter}
        inventoryItems={inventoryItems}
      />

      {filteredAdjustments.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <ClipboardList className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No stock adjustments found
          </h3>
          <p className="text-base-content/70 max-w-md mx-auto">
            {searchQuery || typeFilter || itemFilter
              ? "Try adjusting your filters"
              : "Stock adjustments will appear here when you make changes to inventory"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdjustments.map((adjustment) => (
            <AdjustmentCard
              key={adjustment._id}
              adjustment={adjustment}
              onView={handleView}
              settings={settings}
            />
          ))}
        </div>
      )}
    </TitleCard>
  );
};

export default StockAdjustmentsManagement;
