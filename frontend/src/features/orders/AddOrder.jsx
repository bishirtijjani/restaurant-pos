// frontend/src/features/orders/AddOrder.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormattedNumberInput from "../../components/Input/FormattedNumberInput";
import {
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  PlusCircle,
  MinusCircle,
  X,
  Search,
  User,
  StickyNote,
  Edit3,
  Tag,
} from "lucide-react";
import {
  MODAL_BODY_TYPES,
  RIGHT_DRAWER_TYPES,
} from "../../utils/globalConstantUtil";
import { fetchAllMenuItems } from "../menuItems/menuItemsSlice";
import { fetchAllCategories } from "../categories/categoriesSlice";
import { fetchSettings } from "../settings/generalSettings/generalSettingsSlice";
import TaxBreakdown from "./components/TaxBreakdown";
import DiscountSection from "./components/DiscountSection";
import DiscountBreakdown from "./components/DiscountBreakdown";
import { openRightDrawer } from "../common/rightDrawerSlice";
import { openModal } from "../common/modalSlice";
import { useAuth } from "../../utils/permission";
import { useNavigate } from "react-router-dom";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import CustomerSearch from "../../components/Common/CustomerSearch";

const OrderTypeSelector = ({ orderType, setOrderType, disabled }) => (
  <div className="join mb-4 join-vertical lg:join-horizontal w-full">
    {[
      { type: "dine-in", icon: UtensilsCrossed, label: "Dine-in" },
      { type: "takeaway", icon: ShoppingBag, label: "Takeaway" },
      { type: "delivery", icon: Truck, label: "Delivery" },
    ].map(({ type, icon: Icon, label }) => (
      <button
        key={type}
        className={`join-item btn btn-sm md:btn-md flex-1 ${
          orderType === type ? "btn-primary" : "btn-outline"
        }`}
        onClick={() => setOrderType(type)}
        disabled={disabled}
      >
        <Icon size={18} className="mr-1" /> {label}
      </button>
    ))}
  </div>
);

const CategoryFilter = ({
  activeCategory,
  setActiveCategory,
  categories,
  disabled,
}) => (
  <div className="flex overflow-x-auto space-x-2 pb-4 mb-4 scrollbar-thin">
    <button
      className={`btn btn-sm ${
        activeCategory === "All" ? "btn-primary" : "btn-outline"
      } flex-shrink-0`}
      onClick={() => setActiveCategory("All")}
      disabled={disabled}
    >
      All
    </button>
    {categories.map((category) => (
      <button
        key={category._id}
        className={`btn btn-sm ${
          activeCategory === category.name ? "btn-primary" : "btn-outline"
        } flex-shrink-0`}
        onClick={() => setActiveCategory(category.name)}
        disabled={disabled}
      >
        {category.name}
      </button>
    ))}
  </div>
);

const MenuItem = ({ item, onAdd, currency, disabled }) => {
  const hasAddOns = item.addOnGroups && item.addOnGroups.length > 0;

  return (
    <div
      className={`bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
        !disabled
          ? "cursor-pointer hover:scale-[1.02]"
          : "opacity-50 cursor-not-allowed"
      }`}
      onClick={() => !disabled && onAdd(item)}
    >
      <div className="h-24 w-full bg-base-200 flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-24 w-full object-cover"
          />
        ) : (
          <span className="text-3xl opacity-30">🍽️</span>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-primary font-semibold text-sm">
            {currency}
            {parseFloat(item.price).toFixed(2)}
          </span>
          {hasAddOns && (
            <span className="badge badge-xs badge-secondary">+</span>
          )}
        </div>
      </div>
    </div>
  );
};

const CartItem = ({
  item,
  cartIndex,
  updateQuantity,
  updateNote,
  removeItem,
  currency,
  disabled,
}) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(item.itemNote || "");

  const handleSaveNote = () => {
    updateNote(cartIndex, noteText);
    setShowNoteInput(false);
  };

  return (
    <div className="border-b border-base-300 pb-3 mb-3 last:border-b-0">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{item.name}</h4>
          <p className="text-xs text-base-content/70">
            {currency}
            {item.price.toFixed(2)}
            {item.addOnsTotal > 0 && (
              <span className="text-success">
                {" "}
                +{currency}
                {item.addOnsTotal.toFixed(2)}
              </span>
            )}
          </p>

          {item.addOns?.length > 0 && (
            <div className="mt-1">
              {item.addOns.map((group, idx) => (
                <p key={idx} className="text-xs text-base-content/60">
                  {group.selectedItems?.map((si) => si.name).join(", ")}
                </p>
              ))}
            </div>
          )}

          {showNoteInput ? (
            <div className="mt-2 flex gap-1">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="input input-xs input-bordered flex-1"
                placeholder="Add note..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
              />
              <button
                onClick={handleSaveNote}
                className="btn btn-xs btn-primary"
              >
                ✓
              </button>
              <button
                onClick={() => setShowNoteInput(false)}
                className="btn btn-xs btn-ghost"
              >
                ×
              </button>
            </div>
          ) : item.itemNote ? (
            <button
              onClick={() => setShowNoteInput(true)}
              className="mt-1 flex items-center gap-1 text-xs text-warning hover:underline"
            >
              <StickyNote size={10} />
              <span className="italic truncate max-w-[120px]">
                {item.itemNote}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setShowNoteInput(true)}
              className="mt-1 text-xs text-base-content/40 hover:text-primary"
              disabled={disabled}
            >
              + Add note
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="btn btn-xs btn-circle btn-ghost"
            onClick={() => updateQuantity(cartIndex, item.quantity - 1)}
            disabled={disabled}
          >
            <MinusCircle size={14} />
          </button>
          <span className="w-6 text-center text-sm font-medium">
            {item.quantity}
          </span>
          <button
            className="btn btn-xs btn-circle btn-ghost"
            onClick={() => updateQuantity(cartIndex, item.quantity + 1)}
            disabled={disabled}
          >
            <PlusCircle size={14} />
          </button>
          <button
            className="btn btn-xs btn-circle btn-ghost text-error ml-1"
            onClick={() => removeItem(cartIndex)}
            disabled={disabled}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="text-right text-sm font-semibold text-primary mt-1">
        {currency}
        {((item.price + (item.addOnsTotal || 0)) * item.quantity).toFixed(2)}
      </div>
    </div>
  );
};

const CustomerDetailsForm = ({
  customerDetails,
  setCustomerDetails,
  orderType,
  disabled,
}) => {
  const handleCustomerSelect = (customer) => {
    if (customer) {
      setCustomerDetails({
        ...customerDetails,
        customerId: customer._id,
        name: customer.fullname,
        phone: customer.phone,
        address: customer.address || customerDetails.address,
      });
    } else {
      setCustomerDetails({
        ...customerDetails,
        customerId: null,
        name: "",
        phone: "",
        address: "",
      });
    }
  };

  return (
    <div className="bg-base-200 rounded-lg p-3 mb-4">
      <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
        <User size={14} /> Customer Details
      </h3>
      
      {!disabled && (
        <div className="mb-3">
            <CustomerSearch 
                onSelect={handleCustomerSelect} 
                label="Link Customer (Optional)" 
                placeholder="Search..."
                initialValue={customerDetails.customerId ? { fullname: customerDetails.name, phone: customerDetails.phone, _id: customerDetails.customerId } : null}
            />
            <div className="divider my-1 text-xs text-base-content/50">OR ENTER MANUALLY</div>
        </div>
      )}

      <div className="space-y-2">
        <input
          type="text"
          className="input input-sm input-bordered w-full"
          value={customerDetails.name}
          onChange={(e) =>
            setCustomerDetails({ ...customerDetails, name: e.target.value })
          }
          placeholder="Customer name"
          disabled={disabled}
        />
        <input
          type="tel"
          className="input input-sm input-bordered w-full"
          value={customerDetails.phone}
          onChange={(e) =>
            setCustomerDetails({ ...customerDetails, phone: e.target.value })
          }
          placeholder="Phone number"
          disabled={disabled}
        />
        {orderType === "delivery" && (
          <textarea
            className="textarea textarea-sm textarea-bordered w-full"
            value={customerDetails.address}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, address: e.target.value })
            }
            placeholder="Delivery address"
            rows="2"
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

export default function AddOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useAuth();

  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "$";
  const menuItems = useSelector((state) => state.menuItems.menuItems);
  const categories = useSelector((state) => state.categories.categories);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [cart, setCart] = useState([]);
  const [orderNote, setOrderNote] = useState("");
  const [packagingFee, setPackagingFee] = useState("0");
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [tableNumber, setTableNumber] = useState("1");
  const [customerDetails, setCustomerDetails] = useState({
    customerId: null,
    name: "",
    phone: "",
    address: "",
  });
  const [orderDiscount, setOrderDiscount] = useState(null);

  const canCreateOrders = can("createOrders");

  useEffect(() => {
    dispatch(fetchAllMenuItems());
    dispatch(fetchAllCategories());
    dispatch(fetchSettings());
  }, [dispatch]);

  const filteredItems = menuItems.filter(
    (item) =>
      (activeCategory === "All" || item.category === activeCategory) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      item.isAvailable
  );

  const addToCart = (item) => {
    if (!canCreateOrders) return;

    if (item.addOnGroups && item.addOnGroups.length > 0) {
      dispatch(
        openModal({
          title: `Customize ${item.name}`,
          bodyType: MODAL_BODY_TYPES.ADDON_SELECTOR,
          extraObject: {
            menuItem: item,
            onConfirm: (addOnData) => addItemToCart(item, addOnData),
          },
          size: "lg",
        })
      );
    } else {
      addItemToCart(item, { addOns: [], itemNote: "", total: item.price });
    }
  };

  const addItemToCart = (item, addOnData) => {
    const cartKey = JSON.stringify({
      id: item._id,
      addOns: addOnData.addOns.map((a) => ({
        groupId: a.groupId,
        items: a.selectedItemIds?.sort(),
      })),
      note: addOnData.itemNote,
    });

    const existingIndex = cart.findIndex((cartItem) => {
      const itemKey = JSON.stringify({
        id: cartItem._id,
        addOns: (cartItem.addOns || []).map((a) => ({
          groupId: a.groupId,
          items: a.selectedItemIds?.sort(),
        })),
        note: cartItem.itemNote,
      });
      return itemKey === cartKey;
    });

    if (existingIndex >= 0) {
      setCart(
        cart.map((c, i) =>
          i === existingIndex ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...item,
          quantity: 1,
          addOns: addOnData.addOns,
          itemNote: addOnData.itemNote,
          addOnsTotal: addOnData.total - item.price,
          cartId: Date.now(),
        },
      ]);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else {
      setCart(
        cart.map((item, i) =>
          i === index ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const updateNote = (index, note) => {
    setCart(
      cart.map((item, i) => (i === index ? { ...item, itemNote: note } : item))
    );
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const itemsSubtotal = cart.reduce(
      (sum, item) =>
        sum + (item.price + (item.addOnsTotal || 0)) * item.quantity,
      0
    );

    // Calculate discount amount
    let discountAmount = 0;
    if (orderDiscount?.enabled) {
      if (orderDiscount.type === "percentage") {
        discountAmount = (itemsSubtotal * orderDiscount.value) / 100;
        if (orderDiscount.maxDiscount) {
          discountAmount = Math.min(discountAmount, orderDiscount.maxDiscount);
        }
      } else if (orderDiscount.type === "fixed") {
        discountAmount = Math.min(orderDiscount.value, itemsSubtotal);
      }
    }

    const discountedSubtotal = itemsSubtotal - discountAmount;

    // Calculate tax on discounted subtotal
    let totalTax = 0;
    if (settings?.taxSettings?.enabled) {
      if (settings.taxSettings.mode === "per-item") {
        cart.forEach((item) => {
          const itemTotal =
            (item.price + (item.addOnsTotal || 0)) * item.quantity;
          const rate = item.customTax?.enabled
            ? item.customTax.rate
            : settings.taxSettings.globalRate;
          totalTax += (itemTotal * rate) / 100;
        });
      } else {
        totalTax = (discountedSubtotal * settings.taxSettings.globalRate) / 100;
      }
    }

    let serviceCharge = 0;
    if (settings?.serviceCharge?.enabled) {
      const applies =
        settings.serviceCharge.applyTo === "all" ||
        settings.serviceCharge.applyTo === orderType;
      if (applies)
        serviceCharge =
          (discountedSubtotal * settings.serviceCharge.rate) / 100;
    }

    const packaging =
      orderType === "dine-in" ? 0 : parseFloat(packagingFee) || 0;
    const delivery =
      orderType === "delivery" ? parseFloat(deliveryFee) || 0 : 0;

    return {
      subtotal: itemsSubtotal,
      discountAmount,
      discountedSubtotal,
      totalTax,
      serviceCharge,
      packaging,
      delivery,
      total:
        discountedSubtotal + totalTax + serviceCharge + packaging + delivery,
    };
  };

  const totals = calculateTotals();

  const handleCheckout = () => {
    if (!canCreateOrders || cart.length === 0) return;

    const orderPayload = {
      table: orderType === "dine-in" ? tableNumber : "Takeaway",
      customerDetails: {
        customerId: customerDetails.customerId || null,
        name: customerDetails.name || "Walk-in",
        phone: customerDetails.phone,
        address: orderType === "delivery" ? customerDetails.address : "",
      },
      orderType,
      orderItems: cart.map((item) => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        itemNote: item.itemNote || "",
        addOns:
          item.addOns?.map((a) => ({
            groupId: a.groupId,
            selectedItemIds: a.selectedItemIds,
          })) || [],
        subtotal: (item.price + (item.addOnsTotal || 0)) * item.quantity,
        preparationTime: item.preparationTime || 15,
      })),
      packagingFee: totals.packaging,
      deliveryFee: totals.delivery,
      totalAmount: totals.total,
      orderNote,
      note: orderNote,
      // Add discount data
      orderDiscount: orderDiscount?.enabled ? orderDiscount : null,
      promoCode: orderDiscount?.promoCode || null,
      taxBreakdown: {
        subtotal: totals.discountedSubtotal,
        totalTax: totals.totalTax,
        serviceCharge: totals.serviceCharge,
      },
    };

    dispatch(
      openRightDrawer({
        title: "Payment Confirmation",
        bodyType: RIGHT_DRAWER_TYPES.CONFIRM_PAYMENT,
        extraObject: orderPayload,
      })
    );
  };

  if (!canCreateOrders) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to create orders.
              </p>
              <button
                onClick={() => navigate("/app/dashboard")}
                className="btn btn-primary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-base-200 gap-4 p-2">
      {/* Left - Menu */}
      <div className="flex-1 bg-base-100 rounded-xl shadow-lg p-4 flex flex-col">
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-3 text-base-content/50"
            size={18}
          />
          <input
            type="text"
            placeholder="Search items..."
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <CategoryFilter
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categories={categories}
          disabled={!canCreateOrders}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto flex-1">
          {filteredItems.map((item) => (
            <MenuItem
              key={item._id}
              item={item}
              onAdd={addToCart}
              currency={currency}
              disabled={!canCreateOrders}
            />
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-base-content/50">
              No items found
            </div>
          )}
        </div>
      </div>

      {/* Right - Cart */}
      <div className="w-full lg:w-96 bg-base-100 rounded-xl shadow-lg p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-3">Current Order</h2>

        <OrderTypeSelector
          orderType={orderType}
          setOrderType={setOrderType}
          disabled={!canCreateOrders}
        />

        {orderType === "dine-in" && (
          <div className="flex items-center gap-2 mb-3 bg-base-200 p-2 rounded-lg">
            <span className="text-sm">Table:</span>
            <input
              type="text"
              className="input input-sm input-bordered w-16"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>
        )}

        {(orderType === "delivery" || orderType === "takeaway") && (
          <CustomerDetailsForm
            customerDetails={customerDetails}
            setCustomerDetails={setCustomerDetails}
            orderType={orderType}
            disabled={!canCreateOrders}
          />
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-base-content/50">
              <ShoppingBag size={40} className="mx-auto mb-2 opacity-50" />
              <p>Your order is empty</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <CartItem
                key={item.cartId || index}
                item={item}
                cartIndex={index}
                updateQuantity={updateQuantity}
                updateNote={updateNote}
                removeItem={removeItem}
                currency={currency}
                disabled={!canCreateOrders}
              />
            ))
          )}
        </div>

        {/* Order Note */}
        <div className="mb-3">
          <textarea
            className="textarea textarea-bordered w-full textarea-sm"
            placeholder="Order note (allergies, special requests...)"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            rows="2"
          />
        </div>

        {/* Discount Section */}
        <DiscountSection
          orderType={orderType}
          subtotal={totals.subtotal}
          appliedDiscount={orderDiscount}
          onApplyDiscount={setOrderDiscount}
          onRemoveDiscount={() => setOrderDiscount(null)}
          currency={currency}
        />

        {/* Fees */}
        {orderType !== "dine-in" && (
          <div className="flex items-center justify-between mb-2 text-sm">
            <label>Packaging Fee:</label>
            <input
              type="number"
              className="input input-xs input-bordered w-20 text-right"
              value={packagingFee}
              onChange={(e) => setPackagingFee(e.target.value)}
              min="0"
            />
          </div>
        )}
        {orderType === "delivery" && (
          <div className="flex items-center justify-between mb-2 text-sm">
            <label>Delivery Fee:</label>
            <input
              type="number"
              className="input input-xs input-bordered w-20 text-right"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              min="0"
            />
          </div>
        )}

        {/* Summary */}
        <div className="bg-base-200 rounded-lg p-3 mb-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span
              className={
                totals.discountAmount > 0
                  ? "line-through text-base-content/50"
                  : ""
              }
            >
              {currency}
              {totals.subtotal.toFixed(2)}
            </span>
          </div>

          {totals.discountAmount > 0 && (
            <>
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {orderDiscount?.name || "Discount"}:
                </span>
                <span>
                  -{currency}
                  {totals.discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>After Discount:</span>
                <span>
                  {currency}
                  {totals.discountedSubtotal.toFixed(2)}
                </span>
              </div>
            </>
          )}

          {totals.totalTax > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>
                {currency}
                {totals.totalTax.toFixed(2)}
              </span>
            </div>
          )}
          {totals.serviceCharge > 0 && (
            <div className="flex justify-between">
              <span>Service:</span>
              <span>
                {currency}
                {totals.serviceCharge.toFixed(2)}
              </span>
            </div>
          )}
          {totals.packaging > 0 && (
            <div className="flex justify-between">
              <span>Packaging:</span>
              <span>
                {currency}
                {totals.packaging.toFixed(2)}
              </span>
            </div>
          )}
          {totals.delivery > 0 && (
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>
                {currency}
                {totals.delivery.toFixed(2)}
              </span>
            </div>
          )}
          <div className="divider my-1"></div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">
              {currency}
              {totals.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="btn btn-outline flex-1"
            onClick={() => setCart([])}
            disabled={cart.length === 0}
          >
            Clear
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Pay {currency}
            {totals.total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
