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
  Coffee,
  Pizza,
  Salad,
  Sandwich,
  Cake,
  User,
} from "lucide-react";
import { RIGHT_DRAWER_TYPES } from "../../utils/globalConstantUtil";
import { fetchAllMenuItems } from "../menuItems/menuItemsSlice";
import { fetchAllCategories } from "../categories/categoriesSlice";
import { fetchSettings } from "../settings/generalSettings/generalSettingsSlice";
import TaxBreakdown from "./components/TaxBreakdown";
import { openRightDrawer } from "../common/rightDrawerSlice";
import { useAuth } from "../../utils/permission";
import { useNavigate } from "react-router-dom";
import TitleCard from "../../components/Cards/TitleCard";

// Component for the order type selector
const OrderTypeSelector = ({ orderType, setOrderType, disabled }) => (
  <div className="join mb-4 join-vertical lg:join-horizontal">
    <button
      className={`join-item btn btn-sm md:btn-md ${
        orderType === "dine-in" ? "btn-primary" : "btn-outline"
      }`}
      onClick={() => setOrderType("dine-in")}
      disabled={disabled}
    >
      <UtensilsCrossed size={18} className="mr-1" /> Dine-in
    </button>
    <button
      className={`join-item btn btn-sm md:btn-md ${
        orderType === "takeaway" ? "btn-primary" : "btn-outline"
      }`}
      onClick={() => setOrderType("takeaway")}
      disabled={disabled}
    >
      <ShoppingBag size={18} className="mr-1" /> Takeaway
    </button>
    <button
      className={`join-item btn btn-sm md:btn-md ${
        orderType === "delivery" ? "btn-primary" : "btn-outline"
      }`}
      onClick={() => setOrderType("delivery")}
      disabled={disabled}
    >
      <Truck size={18} className="mr-1" /> Delivery
    </button>
  </div>
);

// Component for category filters
const CategoryFilter = ({
  activeCategory,
  setActiveCategory,
  categories,
  disabled,
}) => {
  const allCategories = [
    { id: "all", name: "All" },
    ...categories.filter((category) => category.name !== "All"),
  ];

  return (
    <div className="flex overflow-x-auto space-x-2 pb-4 mb-4">
      {allCategories.map((category) => (
        <button
          key={category._id || category.name}
          className={`btn ${
            activeCategory === category.name ? "btn-primary" : "btn-outline"
          } flex-shrink-0`}
          onClick={() => setActiveCategory(category.name)}
          disabled={disabled}
        >
          {category.icon && category.icon}
          <span className="ml-2">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

// Component for a single menu item
const MenuItem = ({ item, addToCart, currency, disabled }) => {
  const renderIcon = () => {
    switch (item.category) {
      case "Coffee":
        return <Coffee size={48} />;
      case "Pizza":
        return <Pizza size={48} />;
      case "Salad":
        return <Salad size={48} />;
      case "Sandwich":
        return <Sandwich size={48} />;
      case "Dessert":
        return <Cake size={48} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-base-100 border max-h-min border-base-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        !disabled ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
      }`}
      onClick={() => !disabled && addToCart(item)}
    >
      <div className="h-32 w-full bg-base-200 flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="text-muted">{renderIcon()}</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-lg">{item.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-primary font-semibold">
            {currency}
            {parseFloat(item.price).toFixed(2)}
          </span>
          <button
            className="btn btn-sm btn-primary btn-circle"
            disabled={disabled}
          >
            <PlusCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for a cart item
const CartItem = ({ item, updateQuantity, currency, disabled }) => {
  return (
    <div className="flex items-start justify-between border-b border-base-300 pb-3 mb-3">
      <div className="flex items-start flex-1">
        <div className="w-12 h-12 rounded-md bg-base-200 flex items-center justify-center mr-3 flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <div className="text-muted">
              {item.category === "Coffee" && <Coffee size={24} />}
              {item.category === "Pizza" && <Pizza size={24} />}
              {item.category === "Salad" && <Salad size={24} />}
              {item.category === "Sandwich" && <Sandwich size={24} />}
              {item.category === "Dessert" && <Cake size={24} />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{item.name}</h4>
          <p className="text-primary font-semibold">
            {currency}
            {parseFloat(item.price).toFixed(2)}
          </p>

          {/* Display add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="mt-1 space-y-1">
              {item.addOns.map((addOnGroup, idx) => (
                <div key={idx} className="text-xs text-base-content/70">
                  <span className="font-medium">{addOnGroup.groupName}:</span>{" "}
                  {addOnGroup.selectedItems?.map((si) => si.name).join(", ")}
                </div>
              ))}
            </div>
          )}

          {/* Display item note */}
          {item.itemNote && (
            <div className="mt-1 text-xs italic text-base-content/60">
              Note: {item.itemNote}
            </div>
          )}

          {/* Display add-ons total */}
          {item.addOnsTotal > 0 && (
            <div className="text-xs text-success mt-1">
              +{currency}
              {item.addOnsTotal.toFixed(2)} add-ons
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-2">
        <button
          className="btn btn-sm btn-circle btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            updateQuantity(item._id, item.quantity - 1);
          }}
          disabled={disabled}
        >
          <MinusCircle size={16} />
        </button>
        <span className="w-6 text-center font-medium">{item.quantity}</span>
        <button
          className="btn btn-sm btn-circle btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            updateQuantity(item._id, item.quantity + 1);
          }}
          disabled={disabled}
        >
          <PlusCircle size={16} />
        </button>
        <button
          className="btn btn-sm btn-circle btn-ghost text-error ml-2"
          onClick={(e) => {
            e.stopPropagation();
            updateQuantity(item._id, 0);
          }}
          disabled={disabled}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Component for the empty cart state
const EmptyCart = () => (
  <div className="text-center text-muted py-12">
    <ShoppingBag size={40} className="mx-auto mb-4 opacity-50" />
    <p>Your order is empty</p>
    <p className="text-sm">Add items from the menu</p>
  </div>
);

// Component for order summary
const OrderSummary = ({
  cart,
  orderType,
  packagingFee,
  setPackagingFee,
  deliveryFee,
  setDeliveryFee,
  currency,
  disabled,
}) => {
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );

  const calculateWithTax = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let totalTax = 0;
    const itemTaxes = [];

    if (settings?.taxSettings?.enabled) {
      if (settings.taxSettings.mode === "per-item") {
        cart.forEach((item) => {
          const itemSubtotal = item.price * item.quantity;
          const taxRate = item.customTax?.enabled
            ? item.customTax.rate
            : settings.taxSettings.globalRate;
          const taxAmount = (itemSubtotal * taxRate) / 100;
          totalTax += taxAmount;
          itemTaxes.push({
            name: item.name,
            taxRate,
            taxAmount,
          });
        });
      } else {
        totalTax = (subtotal * settings.taxSettings.globalRate) / 100;
      }
    }

    const packaging =
      orderType === "dine-in" ? 0 : parseFloat(packagingFee) || 0;
    const delivery =
      orderType === "delivery" ? parseFloat(deliveryFee) || 0 : 0;

    let serviceCharge = 0;
    if (settings?.serviceCharge?.enabled) {
      const shouldApply =
        settings.serviceCharge.applyTo === "all" ||
        settings.serviceCharge.applyTo === orderType;
      if (shouldApply) {
        serviceCharge = (subtotal * settings.serviceCharge.rate) / 100;
      }
    }

    return {
      subtotal,
      totalTax,
      serviceCharge,
      packaging,
      delivery,
      total: subtotal + totalTax + serviceCharge + packaging + delivery,
      itemTaxes,
    };
  };

  const taxData = calculateWithTax();

  return (
    <div className="bg-base-200 rounded-lg p-4 space-y-3">
      <TaxBreakdown
        taxBreakdown={{
          subtotal: taxData.subtotal,
          totalTax: taxData.totalTax,
          serviceCharge: taxData.serviceCharge,
          items: taxData.itemTaxes,
        }}
        settings={settings}
      />

      {orderType !== "dine-in" && (
        <div className="flex items-center justify-between">
          <label htmlFor="packagingFee" className="text-sm">
            Packaging Fee ({currency})
          </label>
          <FormattedNumberInput
            id="packagingFee"
            name="packagingFee"
            value={packagingFee}
            onChange={(e) => setPackagingFee(e.target.value)}
            className="input input-bordered input-sm w-24"
            min={0}
            disabled={disabled}
          />
        </div>
      )}

      {orderType === "delivery" && (
        <div className="flex items-center justify-between">
          <label htmlFor="deliveryFee" className="text-sm">
            Delivery Fee ({currency})
          </label>
          <FormattedNumberInput
            id="deliveryFee"
            name="deliveryFee"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            className="input input-bordered input-sm w-24"
            min={0}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

// Customer Details Component for delivery orders
const CustomerDetailsForm = ({
  customerDetails,
  setCustomerDetails,
  disabled,
}) => (
  <div className="bg-base-200 rounded-lg p-4 mb-4">
    <h3 className="font-medium mb-3 flex items-center">
      <User size={16} className="mr-2" /> Customer Details
    </h3>
    <div className="space-y-3">
      <div>
        <label className="text-sm block mb-1">Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={customerDetails.name}
          onChange={(e) =>
            setCustomerDetails({ ...customerDetails, name: e.target.value })
          }
          placeholder="Customer name"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="text-sm block mb-1">Phone</label>
        <input
          type="tel"
          className="input input-bordered w-full"
          value={customerDetails.phone}
          onChange={(e) =>
            setCustomerDetails({ ...customerDetails, phone: e.target.value })
          }
          placeholder="Phone number"
          disabled={disabled}
        />
      </div>
      {customerDetails.address !== undefined && (
        <div>
          <label className="text-sm block mb-1">Address</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={customerDetails.address}
            onChange={(e) =>
              setCustomerDetails({
                ...customerDetails,
                address: e.target.value,
              })
            }
            placeholder="Delivery address"
            rows="2"
            disabled={disabled}
          ></textarea>
        </div>
      )}
    </div>
  </div>
);

// Main POS component
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
  const [note, setNote] = useState("");
  const [packagingFee, setPackagingFee] = useState("0.00");
  const [deliveryFee, setDeliveryFee] = useState("3.00");
  const [tableNumber, setTableNumber] = useState("1");
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Check permissions
  const canCreateOrders = can("createOrders");

  // Fetch menu items on component mount
  useEffect(() => {
    if (!menuItems.length) dispatch(fetchAllMenuItems());
    if (!categories.length) dispatch(fetchAllCategories());
    dispatch(fetchSettings());
  }, [dispatch]);

  // Filter menu items by category and search query
  const filteredItems = menuItems.filter(
    (item) =>
      (activeCategory === "All" || item.category === activeCategory) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      item.isAvailable
  );

  // Add item to cart
  const addToCart = (item) => {
    if (!canCreateOrders) return;

    // Check if item has add-on groups
    if (item.addOnGroups && item.addOnGroups.length > 0) {
      // Open add-on selector modal
      dispatch(
        openModal({
          title: `Customize ${item.name}`,
          bodyType: MODAL_BODY_TYPES.ADDON_SELECTOR,
          extraObject: {
            menuItem: item,
            onConfirm: (addOnData) => {
              addItemToCart(item, addOnData);
            },
          },
          size: "lg",
        })
      );
    } else {
      // Add directly to cart without add-ons
      addItemToCart(item, { addOns: [], itemNote: "", total: item.price });
    }
  };

  // Add new function to actually add item to cart
  const addItemToCart = (item, addOnData) => {
    const existingItemIndex = cart.findIndex((cartItem) => {
      // Check if it's the same item with same add-ons and note
      if (cartItem._id !== item._id) return false;
      if (cartItem.itemNote !== addOnData.itemNote) return false;

      // Compare add-ons
      const cartAddOns = JSON.stringify(
        (cartItem.addOns || []).map((a) => ({
          groupId: a.groupId,
          items: a.selectedItemIds?.sort(),
        }))
      );
      const newAddOns = JSON.stringify(
        (addOnData.addOns || []).map((a) => ({
          groupId: a.groupId,
          items: a.selectedItemIds?.sort(),
        }))
      );

      return cartAddOns === newAddOns;
    });

    if (existingItemIndex >= 0) {
      // Increase quantity of existing item
      setCart(
        cart.map((cartItem, idx) =>
          idx === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      // Add as new cart item
      setCart([
        ...cart,
        {
          ...item,
          quantity: 1,
          addOns: addOnData.addOns,
          itemNote: addOnData.itemNote,
          addOnsTotal: addOnData.total - item.price,
        },
      ]);
    }
  };

  // Update item quantity
  const updateQuantity = (id, newQuantity) => {
    if (!canCreateOrders) return;

    if (newQuantity === 0) {
      setCart(cart.filter((item) => item._id !== id));
    } else {
      setCart(
        cart.map((item) =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Calculate total for payment button
  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const addOnsTotal = (item.addOnsTotal || 0) * item.quantity;
      return sum + itemTotal + addOnsTotal;
    }, 0);

    const packaging =
      orderType === "dine-in" ? 0 : parseFloat(packagingFee) || 0;
    const delivery =
      orderType === "delivery" ? parseFloat(deliveryFee) || 0 : 0;

    return subtotal + packaging + delivery;
  };

  // Handle checkout process
  const handleCheckout = () => {
    if (!canCreateOrders) {
      dispatch(
        showNotification({
          message: "You don't have permission to create orders",
          status: 0,
        })
      );
      return;
    }

    if (cart.length === 0) return;

    const orderItems = cart.map((item) => ({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      itemNote: item.itemNote || "",
      addOns: item.addOns || [],
      subtotal:
        item.price * item.quantity + (item.addOnsTotal || 0) * item.quantity,
      preparationTime: item.preparationTime || 15,
    }));

    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const packagingAmount =
      orderType === "dine-in" ? 0 : parseFloat(packagingFee) || 0;
    const deliveryAmount =
      orderType === "delivery" ? parseFloat(deliveryFee) || 0 : 0;

    const totalAmount = subtotal + packagingAmount + deliveryAmount;

    const orderPayload = {
      table: orderType === "dine-in" ? tableNumber : "Takeaway",
      customerDetails: {
        name: customerDetails.name || "Walk-in",
        phone: customerDetails.phone || "",
        email: "",
        address: orderType === "delivery" ? customerDetails.address : "",
      },
      orderType,
      orderItems,
      subtotal,
      packagingFee: packagingAmount,
      deliveryFee: deliveryAmount,
      totalAmount,
      note,
      menuItems: cart.map((item) => ({
        ...item,
        totalAmount: item.price * item.quantity,
      })),
    };

    dispatch(
      openRightDrawer({
        title: "Payment Confirmation",
        bodyType: RIGHT_DRAWER_TYPES.CONFIRM_PAYMENT,
        extraObject: orderPayload,
      })
    );
  };

  // Update customer details when order type changes
  useEffect(() => {
    if (orderType === "delivery" && !customerDetails.address) {
      setCustomerDetails({ ...customerDetails, address: "" });
    }
  }, [orderType]);

  // Show access denied if user doesn't have permission
  if (!canCreateOrders) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to create orders. Please contact your
                administrator if you believe this is an error.
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
    <div className="flex flex-col md:flex-row min-h-screen bg-base-200 text-base-content">
      {/* Left side - Menu */}
      <div className="w-full md:w-3/5 flex flex-col px-0 md:pr-2 mb-4 md:mb-0">
        <div className="bg-base-100 rounded-xl shadow-lg p-4 md:p-6 flex-grow flex flex-col">
          {/* Search bar */}
          <div className="relative w-full md:w-64 mb-4 md:mb-6">
            <input
              type="text"
              placeholder="Search items..."
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!canCreateOrders}
            />
            <Search className="absolute left-3 top-3 text-muted" size={18} />
          </div>

          {/* Categories */}
          <CategoryFilter
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categories={categories}
            disabled={!canCreateOrders}
          />

          {/* Menu items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 overflow-y-auto flex-grow">
            {filteredItems.map((item) => (
              <MenuItem
                key={item._id}
                item={item}
                addToCart={addToCart}
                currency={currency}
                disabled={!canCreateOrders}
              />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-3 text-center text-muted py-12">
                No items found for this category or search query.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Order details */}
      <div className="w-full md:w-2/5 flex flex-col px-0 md:pl-2">
        <div className="bg-base-100 rounded-xl shadow-lg p-4 md:p-6 flex-grow flex flex-col">
          <h2 className="text-xl font-bold mb-4">Current Order</h2>

          {/* Order type selector */}
          <OrderTypeSelector
            orderType={orderType}
            setOrderType={setOrderType}
            disabled={!canCreateOrders}
          />

          {/* Order type indicator */}
          <div className="bg-base-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center">
              {orderType === "dine-in" && (
                <UtensilsCrossed size={20} className="mr-2 text-primary" />
              )}
              {orderType === "takeaway" && (
                <ShoppingBag size={20} className="mr-2 text-primary" />
              )}
              {orderType === "delivery" && (
                <Truck size={20} className="mr-2 text-primary" />
              )}
              <span className="capitalize font-medium">{orderType}</span>
            </div>
            {orderType === "dine-in" && (
              <div className="flex items-center">
                <span className="mr-2">Table:</span>
                <FormattedNumberInput
                  name="tableNumber"
                  className="input input-bordered input-sm w-16"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  min="1"
                  disabled={!canCreateOrders}
                />
              </div>
            )}
          </div>

          {/* Customer Details Form for delivery orders */}
          {orderType === "delivery" && (
            <CustomerDetailsForm
              customerDetails={customerDetails}
              setCustomerDetails={setCustomerDetails}
              disabled={!canCreateOrders}
            />
          )}

          {/* Cart items */}
          <div className="flex-grow overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="space-y-1">
                {cart.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    updateQuantity={updateQuantity}
                    currency={currency}
                    disabled={!canCreateOrders}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Note textarea */}
          <div className="mb-4">
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Add note (allergies, special requests...)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="2"
              disabled={!canCreateOrders}
            ></textarea>
          </div>

          {/* Order summary with fee inputs */}
          <OrderSummary
            cart={cart}
            orderType={orderType}
            packagingFee={packagingFee}
            setPackagingFee={setPackagingFee}
            deliveryFee={deliveryFee}
            setDeliveryFee={setDeliveryFee}
            currency={currency}
            disabled={!canCreateOrders}
          />

          {/* Action buttons */}
          <div className="flex flex-col md:flex-row md:space-x-3 space-y-2 md:space-y-0">
            <button
              className="btn btn-outline w-full md:flex-1"
              onClick={() => setCart([])}
              disabled={cart.length === 0 || !canCreateOrders}
            >
              Clear
            </button>
            <button
              className="btn btn-primary w-full md:flex-1"
              onClick={handleCheckout}
              disabled={cart.length === 0 || !canCreateOrders}
            >
              Pay {currency}
              {calculateTotal().toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
