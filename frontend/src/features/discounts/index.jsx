// frontend/src/features/discounts/index.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import { MODAL_BODY_TYPES, CONFIRMATION_MODAL_CLOSE_TYPES } from "../../utils/globalConstantUtil";
import {
  fetchDiscounts,
  fetchPromoCodes,
  deleteDiscount,
  deletePromoCode,
  toggleDiscountStatus,
} from "./discountsSlice";
import { showNotification } from "../common/headerSlice";
import SearchBar from "../../components/Input/SearchBar";
import {
  Plus,
  Percent,
  Tag,
  Clock,
  Gift,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
} from "lucide-react";
import SearchableSelect from "../../components/Input/SearchableSelect";
import Can from "../../components/Auth/Can";

const DiscountTypeIcon = ({ type }) => {
  switch (type) {
    case "percentage":
      return <Percent className="w-4 h-4" />;
    case "fixed":
      return <Tag className="w-4 h-4" />;
    case "bogo":
      return <Gift className="w-4 h-4" />;
    default:
      return <Tag className="w-4 h-4" />;
  }
};

const StatusBadge = ({ status, isHappyHour, currentlyActive }) => {
  if (!status && isHappyHour !== undefined) {
    // For discounts
    if (!currentlyActive) {
      return <span className="badge badge-ghost badge-sm">Inactive</span>;
    }
    if (isHappyHour) {
      return <span className="badge badge-warning badge-sm">Happy Hour</span>;
    }
    return <span className="badge badge-success badge-sm">Active</span>;
  }

  // For promo codes
  const badges = {
    active: "badge-success",
    inactive: "badge-ghost",
    expired: "badge-error",
    scheduled: "badge-info",
    exhausted: "badge-warning",
  };

  return (
    <span className={`badge badge-sm ${badges[status] || "badge-ghost"}`}>
      {status}
    </span>
  );
};

const DiscountCard = ({ discount, onEdit, onDelete, onToggle, currency }) => {
  const formatValue = () => {
    if (discount.type === "percentage") {
      return `${discount.value}% off`;
    } else if (discount.type === "fixed") {
      return `${currency}${discount.value} off`;
    } else if (discount.type === "bogo") {
      const { buyQuantity, getQuantity, getDiscountPercent } =
        discount.bogoConfig || {};
      return `Buy ${buyQuantity}, Get ${getQuantity} ${
        getDiscountPercent === 100 ? "Free" : `${getDiscountPercent}% off`
      }`;
    }
    return "";
  };

  return (
    <div className="card bg-base-100 shadow-md border border-base-200 hover:shadow-lg transition-all">
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                discount.isHappyHour ? "bg-warning/20" : "bg-primary/10"
              }`}
            >
              {discount.isHappyHour ? (
                <Clock className="w-5 h-5 text-warning" />
              ) : (
                <DiscountTypeIcon type={discount.type} />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{discount.name}</h3>
              <p className="text-sm text-base-content/70">{formatValue()}</p>
            </div>
          </div>
          <StatusBadge
            isHappyHour={discount.isHappyHour}
            currentlyActive={discount.currentlyActive}
          />
        </div>

        {discount.description && (
          <p className="text-sm text-base-content/60 mt-2">
            {discount.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          {discount.applicableOrderTypes?.map((type) => (
            <span
              key={type}
              className="badge badge-outline badge-xs capitalize"
            >
              {type}
            </span>
          ))}
        </div>

        {discount.isHappyHour && discount.happyHourConfig && (
          <div className="text-xs text-base-content/60 mt-2">
            <Clock className="w-3 h-3 inline mr-1" />
            {discount.happyHourConfig.startTime} -{" "}
            {discount.happyHourConfig.endTime}
          </div>
        )}

        <div className="card-actions justify-end mt-3">
          <button
            onClick={() => onToggle(discount._id)}
            className={`btn btn-xs ${
              discount.isActive ? "btn-ghost" : "btn-outline"
            }`}
            title={discount.isActive ? "Deactivate" : "Activate"}
          >
            {discount.isActive ? (
              <ToggleRight className="w-4 h-4 text-success" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(discount)}
            className="btn btn-xs btn-ghost"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(discount)}
            className="btn btn-xs btn-ghost text-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PromoCodeCard = ({ promo, onEdit, onDelete, onCopy, currency }) => {
  const formatDiscount = () => {
    if (promo.discountType === "percentage") {
      return `${promo.discountValue}% off`;
    }
    return `${currency}${promo.discountValue} off`;
  };

  return (
    <div className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-primary/10 rounded font-mono font-bold text-primary">
                {promo.code}
              </code>
              <button
                onClick={() => onCopy(promo.code)}
                className="btn btn-xs btn-ghost"
                title="Copy code"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm text-base-content/70 mt-1">
              {formatDiscount()}
            </p>
          </div>
          <StatusBadge status={promo.status} />
        </div>

        {promo.description && (
          <p className="text-sm text-base-content/60 mt-2">
            {promo.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          {promo.minimumOrderAmount > 0 && (
            <div>
              <span className="text-base-content/60">Min order:</span>{" "}
              <span className="font-medium">
                {currency}
                {promo.minimumOrderAmount}
              </span>
            </div>
          )}
          {promo.usageLimit && (
            <div>
              <span className="text-base-content/60">Usage:</span>{" "}
              <span className="font-medium">
                {promo.usageCount}/{promo.usageLimit}
              </span>
            </div>
          )}
        </div>

        <div className="card-actions justify-end mt-3">
          <button
            onClick={() => onEdit(promo)}
            className="btn btn-xs btn-ghost"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(promo)}
            className="btn btn-xs btn-ghost text-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TopSideButtons = ({ onAddDiscount, onAddPromoCode }) => (
  <div className="flex gap-2">
    <Can do="createDiscounts">
      <button onClick={onAddDiscount} className="btn btn-primary btn-sm gap-2">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Discount</span>
      </button>
      <button
        onClick={onAddPromoCode}
        className="btn btn-secondary btn-sm gap-2"
      >
        <Tag className="w-4 h-4" />
        <span className="hidden sm:inline">Add Promo Code</span>
      </button>
    </Can>
  </div>
);

const DiscountsManagement = () => {
  const dispatch = useDispatch();
  const { discounts, promoCodes, loading, promoLoading } = useSelector(
    (state) => state.discounts
  );
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";

  const [activeTab, setActiveTab] = useState("discounts");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    dispatch(fetchDiscounts());
    dispatch(fetchPromoCodes());
  }, [dispatch]);

  const handleAddDiscount = () => {
    dispatch(
      openModal({
        title: "Create Discount",
        bodyType: MODAL_BODY_TYPES.ADD_DISCOUNT,
        size: "lg",
      })
    );
  };

  const handleAddPromoCode = () => {
    dispatch(
      openModal({
        title: "Create Promo Code",
        bodyType: MODAL_BODY_TYPES.ADD_PROMO_CODE,
        size: "lg",
      })
    );
  };

  const handleEditDiscount = (discount) => {
    dispatch(
      openModal({
        title: "Edit Discount",
        bodyType: MODAL_BODY_TYPES.EDIT_DISCOUNT,
        extraObject: discount,
        size: "lg",
      })
    );
  };

  const handleEditPromoCode = (promo) => {
    dispatch(
      openModal({
        title: "Edit Promo Code",
        bodyType: MODAL_BODY_TYPES.EDIT_PROMO_CODE,
        extraObject: promo,
        size: "lg",
      })
    );
  };

  const handleDeleteDiscount = (discount) => {
    dispatch(
      openModal({
        title: "Confirmation",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete discount "${discount.name}"?`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_DISCOUNT,
          id: discount._id,
        },
      })
    );
  };

  const handleDeletePromoCode = (promo) => {
    dispatch(
      openModal({
        title: "Confirmation",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete promo code "${promo.code}"?`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_PROMO_CODE,
          id: promo._id,
        },
      })
    );
  };

  const handleToggleDiscount = async (id) => {
    try {
      await dispatch(toggleDiscountStatus(id)).unwrap();
    } catch (error) {
      dispatch(showNotification({ message: error.message, status: 0 }));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    dispatch(
      showNotification({ message: "Code copied to clipboard", status: 1 })
    );
  };

  const filteredDiscounts = discounts.filter((d) => {
    const matchesSearch = d.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (filterType === "happyHour" && d.isHappyHour) ||
      (filterType === "regular" && !d.isHappyHour) ||
      d.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredPromoCodes = promoCodes.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TitleCard
      title="Discounts & Promotions"
      TopSideButtons={
        <TopSideButtons
          onAddDiscount={handleAddDiscount}
          onAddPromoCode={handleAddPromoCode}
        />
      }
      topMargin="mt-2"
    >
      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6 bg-base-200">
        <button
          className={`tab ${activeTab === "discounts" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("discounts")}
        >
          <Percent className="w-4 h-4 mr-2" />
          Discounts ({discounts.length})
        </button>
        <button
          className={`tab ${activeTab === "promoCodes" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("promoCodes")}
        >
          <Tag className="w-4 h-4 mr-2" />
          Promo Codes ({promoCodes.length})
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <SearchBar
          searchText={searchQuery}
          setSearchText={setSearchQuery}
          placeholderText={
            activeTab === "discounts"
              ? "Search discounts..."
              : "Search promo codes..."
          }
          styleClass="w-full md:w-64"
        />

        {activeTab === "discounts" && (
          <SearchableSelect
            options={[
              { value: "all", name: "All Types" },
              { value: "percentage", name: "Percentage" },
              { value: "fixed", name: "Fixed Amount" },
              { value: "bogo", name: "BOGO" },
              { value: "happyHour", name: "Happy Hour" },
              { value: "regular", name: "Regular" },
            ]}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            name="filterType"
            placeholder="All Types"
            className=""
            size="select-sm"
            valueKey="value"
            labelKey="name"
          />
        )}

        <button
          onClick={() => {
            dispatch(fetchDiscounts());
            dispatch(fetchPromoCodes());
          }}
          className="btn btn-ghost btn-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {activeTab === "discounts" ? (
        loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <h3 className="text-lg font-semibold">No discounts found</h3>
            <p className="text-base-content/60">
              Create your first discount to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDiscounts.map((discount) => (
              <DiscountCard
                key={discount._id}
                discount={discount}
                onEdit={handleEditDiscount}
                onDelete={handleDeleteDiscount}
                onToggle={handleToggleDiscount}
                currency={currency}
              />
            ))}
          </div>
        )
      ) : promoLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredPromoCodes.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold">No promo codes found</h3>
          <p className="text-base-content/60">
            Create your first promo code to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromoCodes.map((promo) => (
            <PromoCodeCard
              key={promo._id}
              promo={promo}
              onEdit={handleEditPromoCode}
              onDelete={handleDeletePromoCode}
              onCopy={handleCopyCode}
              currency={currency}
            />
          ))}
        </div>
      )}
    </TitleCard>
  );
};

export default DiscountsManagement;
