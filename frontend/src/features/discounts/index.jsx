// frontend/src/features/discounts/index.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
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
  PlusCircle,
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
  MoreVertical,
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
      return `${discount.value}% OFF`;
    } else if (discount.type === "fixed") {
      return `${currency}${discount.value} OFF`;
    } else if (discount.type === "bogo") {
      const { buyQuantity, getQuantity, getDiscountPercent } =
        discount.bogoConfig || {};
      return `Buy ${buyQuantity}, Get ${getQuantity} ${
        getDiscountPercent === 100 ? "FREE" : `${getDiscountPercent}% OFF`
      }`;
    }
    return "";
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all duration-200">
      <div className="card-body p-4 sm:p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                discount.isHappyHour ? "bg-warning/15" : "bg-primary/15"
              }`}
            >
              {discount.isHappyHour ? (
                <Clock className="w-5 h-5 text-warning" />
              ) : (
                <div className="text-primary">
                  <DiscountTypeIcon type={discount.type} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base truncate">{discount.name}</h3>
              <p className="text-sm font-semibold text-primary">
                {formatValue()}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge
              isHappyHour={discount.isHappyHour}
              currentlyActive={discount.currentlyActive}
            />
          </div>
        </div>

        {discount.description && (
          <p className="text-xs text-base-content/60 mt-3 line-clamp-2 leading-relaxed">
            {discount.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-3">
          {discount.applicableOrderTypes?.map((type) => (
            <span
              key={type}
              className="badge badge-ghost badge-xs py-2 px-2 capitalize opacity-80"
            >
              {type}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-200">
          <div className="flex items-center gap-2">
            {discount.isHappyHour && discount.happyHourConfig && (
              <div className="flex items-center gap-1.5 bg-warning/10 px-2 py-1 rounded text-[10px] font-medium text-warning-content">
                <Clock className="w-3 h-3" />
                <span>
                  {discount.happyHourConfig.startTime} -{" "}
                  {discount.happyHourConfig.endTime}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggle(discount._id)}
              className="btn btn-ghost btn-xs btn-square"
              title={discount.isActive ? "Deactivate" : "Activate"}
            >
              {discount.isActive ? (
                <ToggleRight className="w-5 h-5 text-success" />
              ) : (
                <ToggleLeft className="w-5 h-5 opacity-40" />
              )}
            </button>
            <button
              onClick={() => onEdit(discount)}
              className="btn btn-ghost btn-xs btn-square"
            >
              <Edit className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => onDelete(discount)}
              className="btn btn-ghost btn-xs btn-square text-error/70 hover:text-error"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromoCodeCard = ({ promo, onEdit, onDelete, onCopy, currency }) => {
  const formatDiscount = () => {
    if (promo.discountType === "percentage") {
      return `${promo.discountValue}% OFF`;
    }
    return `${currency}${promo.discountValue} OFF`;
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4 sm:p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <code className="px-2.5 py-1 bg-secondary/10 rounded font-mono font-bold text-secondary text-sm border border-secondary/20">
                {promo.code}
              </code>
              <button
                onClick={() => onCopy(promo.code)}
                className="btn btn-ghost btn-xs btn-square"
                title="Copy code"
              >
                <div className="p-1 rounded bg-base-200 group-hover:bg-primary/10 transition-colors">
                  <Copy className="w-3 h-3" />
                </div>
              </button>
            </div>
            <p className="text-sm font-semibold text-secondary mt-2">
              {formatDiscount()}
            </p>
          </div>
          <StatusBadge status={promo.status} />
        </div>

        {promo.description && (
          <p className="text-xs text-base-content/60 mt-3 line-clamp-2 leading-relaxed">
            {promo.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-base-200 bg-base-50/50">
          {promo.minimumOrderAmount > 0 && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-base-content/40 font-bold">
                Min Order
              </span>
              <span className="text-sm font-medium">
                {currency}
                {promo.minimumOrderAmount}
              </span>
            </div>
          )}
          {promo.usageLimit && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-base-content/40 font-bold">
                Usage
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-full bg-base-200 rounded-full h-1.5 max-w-[60px]">
                  <div
                    className="bg-secondary h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        (promo.usageCount / promo.usageLimit) * 100,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  {promo.usageCount}/{promo.usageLimit}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card-actions justify-end mt-4">
          <button
            onClick={() => onEdit(promo)}
            className="btn btn-ghost btn-xs btn-square"
          >
            <Edit className="w-4 h-4 opacity-70" />
          </button>
          <button
            onClick={() => onDelete(promo)}
            className="btn btn-ghost btn-xs btn-square text-error/70 hover:text-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TopSideButtons = ({
  onAddDiscount,
  onAddPromoCode,
  onRefresh,
  loading,
}) => (
  <div className="flex items-center gap-2">
    {/* Desktop View */}
    <div className="hidden sm:flex items-center gap-2">
      <button
        onClick={onRefresh}
        className={`btn btn-ghost btn-sm btn-circle ${
          loading ? "animate-spin" : ""
        }`}
        title="Refresh"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
      <Can do="createDiscounts">
        <button
          onClick={onAddDiscount}
          className="btn btn-primary btn-sm gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Discount</span>
        </button>
        <button
          onClick={onAddPromoCode}
          className="btn btn-secondary btn-sm gap-2"
        >
          <Tag className="w-4 h-4" />
          <span>Add Promo</span>
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
          <button onClick={onRefresh} className={loading ? "disabled" : ""}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </li>
        <div className="divider my-1"></div>
        <Can do="createDiscounts">
          <li>
            <button
              onClick={onAddDiscount}
              className="text-primary font-medium"
            >
              <PlusCircle className="w-4 h-4" /> Add Discount
            </button>
          </li>
          <li>
            <button
              onClick={onAddPromoCode}
              className="text-secondary font-medium"
            >
              <Tag className="w-4 h-4" /> Add Promo Code
            </button>
          </li>
        </Can>
      </ul>
    </div>
  </div>
);

const DiscountsManagement = () => {
  const dispatch = useDispatch();
  const { discounts, promoCodes, loading, promoLoading } = useSelector(
    (state) => state.discounts,
  );
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings,
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
      }),
    );
  };

  const handleAddPromoCode = () => {
    dispatch(
      openModal({
        title: "Create Promo Code",
        bodyType: MODAL_BODY_TYPES.ADD_PROMO_CODE,
        size: "lg",
      }),
    );
  };

  const handleEditDiscount = (discount) => {
    dispatch(
      openModal({
        title: "Edit Discount",
        bodyType: MODAL_BODY_TYPES.EDIT_DISCOUNT,
        extraObject: discount,
        size: "lg",
      }),
    );
  };

  const handleEditPromoCode = (promo) => {
    dispatch(
      openModal({
        title: "Edit Promo Code",
        bodyType: MODAL_BODY_TYPES.EDIT_PROMO_CODE,
        extraObject: promo,
        size: "lg",
      }),
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
      }),
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
      }),
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
      showNotification({ message: "Code copied to clipboard", status: 1 }),
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
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <TitleCard
      title="Discounts & Promotions"
      TopSideButtons={
        <TopSideButtons
          onAddDiscount={handleAddDiscount}
          onAddPromoCode={handleAddPromoCode}
          onRefresh={() => {
            dispatch(fetchDiscounts());
            dispatch(fetchPromoCodes());
          }}
          loading={loading || promoLoading}
        />
      }
      topMargin="mt-2"
    >
      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
        <div className="tabs tabs-boxed bg-base-200 p-1 w-full sm:w-auto flex-nowrap shrink-0">
          <button
            className={`tab tab-sm sm:tab-md transition-all rounded-lg flex items-center gap-2 px-4 sm:px-6 ${
              activeTab === "discounts"
                ? "tab-active bg-primary text-primary-content shadow-sm"
                : "hover:bg-base-300"
            }`}
            onClick={() => setActiveTab("discounts")}
          >
            <Percent className="w-4 h-4" />
            <span className="whitespace-nowrap">
              Discounts ({discounts.length})
            </span>
          </button>
          <button
            className={`tab tab-sm sm:tab-md transition-all rounded-lg flex items-center gap-2 px-4 sm:px-6 ${
              activeTab === "promoCodes"
                ? "tab-active bg-secondary text-secondary-content shadow-sm"
                : "hover:bg-base-300"
            }`}
            onClick={() => setActiveTab("promoCodes")}
          >
            <Tag className="w-4 h-4" />
            <span className="whitespace-nowrap">
              Promo Codes ({promoCodes.length})
            </span>
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-4xl">
          <div className="relative flex-1">
            <SearchBar
              searchText={searchQuery}
              setSearchText={setSearchQuery}
              placeholderText={
                activeTab === "discounts"
                  ? "Search discounts..."
                  : "Search promo codes..."
              }
              styleClass="w-full"
              inputStyleClass="!h-10"
            />
          </div>

          {activeTab === "discounts" && (
            <div className="w-full sm:w-52">
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
                className="w-full"
                size="!h-10 text-xs"
                valueKey="value"
                labelKey="name"
              />
            </div>
          )}
        </div>
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
