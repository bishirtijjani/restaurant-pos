import React, { useState } from "react";
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
  Tag,
  Printer,
  Edit3,
} from "lucide-react";

// --- Local Components (Copied/Mocked from POS.jsx for isolation) ---

const OrderTypeSelector = ({ orderType, setOrderType }) => (
  <div className="join mb-4 join-vertical lg:join-horizontal w-full">
    {[
      { type: "dine-in", icon: UtensilsCrossed, label: "Dine-in" },
      { type: "takeaway", icon: ShoppingBag, label: "Takeaway" },
      { type: "delivery", icon: Truck, label: "Delivery" },
      { type: "walk-in", icon: User, label: "Walk-In" },
    ].map(({ type, icon: Icon, label }) => (
      <button
        key={type}
        className={`join-item btn btn-sm md:btn-md flex-1 ${
          orderType === type ? "btn-primary" : "btn-outline"
        }`}
        onClick={() => setOrderType(type)}
      >
        <Icon size={18} className="mr-1" /> {label}
      </button>
    ))}
  </div>
);

const CategoryFilter = ({ activeCategory, setActiveCategory, categories }) => (
  <div className="flex overflow-x-auto space-x-2 pb-4 mb-4 scrollbar-thin">
    <button
      className={`btn btn-sm ${
        activeCategory === "All" ? "btn-primary" : "btn-outline"
      } flex-shrink-0`}
      onClick={() => setActiveCategory("All")}
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
      >
        {category.name}
      </button>
    ))}
  </div>
);

const MenuItem = ({ item, onAdd, currency }) => {
  return (
    <div
      className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
      onClick={() => onAdd(item)}
    >
      <div className="h-24 w-full bg-base-200 flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-4xl">{item.emoji || "🍽️"}</div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-primary font-semibold text-sm">
            {currency}
            {parseFloat(item.price).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, updateQuantity, removeItem, currency }) => {
  return (
    <div className="border-b border-base-300 pb-3 mb-3 last:border-b-0">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{item.name}</h4>
          <p className="text-xs text-base-content/70">
            {currency}
            {item.price.toFixed(2)}
          </p>
          {item.itemNote && (
            <div className="mt-1 flex items-center gap-1 text-xs text-warning">
              <StickyNote size={10} />
              <span className="italic truncate max-w-[120px]">
                {item.itemNote}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="btn btn-xs btn-circle btn-ghost"
            onClick={() => updateQuantity(item._id, item.quantity - 1)}
          >
            <MinusCircle size={14} />
          </button>
          <span className="w-6 text-center text-sm font-medium">
            {item.quantity}
          </span>
          <button
            className="btn btn-xs btn-circle btn-ghost"
            onClick={() => updateQuantity(item._id, item.quantity + 1)}
          >
            <PlusCircle size={14} />
          </button>
          <button
            className="btn btn-xs btn-circle btn-ghost text-error ml-1"
            onClick={() => removeItem(item._id)}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="text-right text-sm font-semibold text-primary mt-1">
        {currency}
        {(item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
};

const CustomerDetailsForm = ({ orderType }) => {
  return (
    <div className="bg-base-200 rounded-lg p-3 mb-4 space-y-2">
      <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
        <User size={14} /> Customer Details
      </h3>
      <input
        type="text"
        className="input input-sm input-bordered w-full"
        defaultValue="Sarah Johnson"
        placeholder="Customer name"
      />
      <input
        type="tel"
        className="input input-sm input-bordered w-full"
        defaultValue="+1 555-0123"
        placeholder="Phone number"
      />
      {orderType === "delivery" && (
        <textarea
          className="textarea textarea-sm textarea-bordered w-full"
          placeholder="Delivery address"
          defaultValue="123 Park Avenue, New York, NY"
          rows="2"
        />
      )}
    </div>
  );
};

const DiscountSection = ({ currency }) => (
  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-semibold flex items-center gap-1">
        <Tag className="w-3 h-3" /> Discount Applied
      </span>
      <button className="btn btn-xs btn-ghost text-error">Remove</button>
    </div>
    <div className="flex justify-between text-xs">
      <span className="opacity-70">Loyalty Member (10%)</span>
      <span className="font-bold">- {currency}4.05</span>
    </div>
  </div>
);

// --- Mock Data ---

const MOCK_CATEGORIES = [
  { _id: "1", name: "Starters" },
  { _id: "2", name: "Pub Classics" },
  { _id: "3", name: "Mains" },
  { _id: "4", name: "Drinks" },
];

const MOCK_ITEMS = [
  {
    _id: "101",
    name: "Prawn Cocktail",
    price: 7.5,
    category: "Starters",
    image: "/menu-items/Prawn Cocktail.jpeg",
    emoji: "🍤",
  },
  {
    _id: "102",
    name: "Garlic Mushrooms",
    price: 6.95,
    category: "Starters",
    image: "/menu-items/Garlic Mushrooms.jpeg",
    emoji: "🍄",
  },
  {
    _id: "201",
    name: "Fish & Chips",
    price: 15.5,
    category: "Pub Classics",
    image: "/menu-items/Fish & Chips.jpeg",
    emoji: "🐟",
  },
  {
    _id: "202",
    name: "Steak & Kidney Pie",
    price: 14.5,
    category: "Pub Classics",
    image: "/menu-items/Steak & Kidney Pie.jpeg",
    emoji: "🥧",
  },
  {
    _id: "301",
    name: "Sunday Roast - Beef",
    price: 17.5,
    category: "Mains",
    image:
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=400&h=300&q=80",
    emoji: "🥩",
  },
  {
    _id: "302",
    name: "Classic Beef Burger",
    price: 13.95,
    category: "Mains",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&h=300&q=80",
    emoji: "🍔",
  },
  {
    _id: "401",
    name: "Elderflower Pressé",
    price: 3.5,
    category: "Drinks",
    image: "/menu-items/Elderflower Pressé.jpeg",
    emoji: "🍹",
  },
  {
    _id: "402",
    name: "Sparkling Water (330ml)",
    price: 2.5,
    category: "Drinks",
    image: "/menu-items/Sparkling Water.jpeg",
    emoji: "💧",
  },
];

const INITIAL_CART = [
  {
    _id: "301",
    name: "Sunday Roast - Beef",
    price: 17.5,
    quantity: 2,
    itemNote: "One with no parsnips",
  },
  {
    _id: "201",
    name: "Fish & Chips",
    price: 15.5,
    quantity: 1,
    itemNote: "Extra tartare sauce",
  },
  {
    _id: "402",
    name: "Sparkling Water (330ml)",
    price: 2.5,
    quantity: 2,
    itemNote: "Chilled with lemon",
  },
];

export default function MockPOS() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [cart, setCart] = useState(INITIAL_CART);
  const currency = "£";

  const filteredItems = MOCK_ITEMS.filter(
    (item) =>
      (activeCategory === "All" || item.category === activeCategory) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddToCart = (item) => {
    const existing = cart.find((c) => c._id === item._id);
    if (existing) {
      handleUpdateQuantity(item._id, existing.quantity + 1);
    } else {
      setCart([...cart, { ...item, quantity: 1, itemNote: "" }]);
    }
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty < 1) {
      handleRemoveItem(id);
      return;
    }
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: newQty } : item,
      ),
    );
  };

  const handleRemoveItem = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const totals = cart.reduce(
    (acc, item) => ({
      ...acc,
      subtotal: acc.subtotal + item.price * item.quantity,
      itemCount: acc.itemCount + item.quantity,
    }),
    { subtotal: 0, itemCount: 0 },
  );

  const discount = totals.subtotal * 0.1;
  const taxableSubtotal = totals.subtotal - discount;
  const tax = taxableSubtotal * 0.2;
  const serviceCharge = taxableSubtotal * 0.125;
  const packagingFee = orderType === "dine-in" ? 0 : 1.5;
  const deliveryFee = orderType === "delivery" ? 3.5 : 0;
  const grandTotal =
    taxableSubtotal + tax + serviceCharge + packagingFee + deliveryFee;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_26rem] bg-base-200 gap-4 p-2">
      {/* Left - Menu */}
      <div className="bg-base-100 rounded-xl shadow-lg p-4 flex flex-col h-full overflow-hidden border border-base-300">
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-3 text-base-content/50"
            size={18}
          />
          <input
            type="text"
            placeholder="Search premium menu..."
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <CategoryFilter
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categories={MOCK_CATEGORIES}
        />

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 overflow-y-auto flex-1 pr-2 content-start">
          {filteredItems.map((item) => (
            <MenuItem
              key={item._id}
              item={item}
              onAdd={handleAddToCart}
              currency={currency}
            />
          ))}
        </div>
      </div>

      {/* Right - Cart / Summary */}
      <div className="bg-base-100 rounded-xl shadow-lg p-4 flex flex-col h-full overflow-hidden border border-base-300">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="text-primary" size={20} />
            Current Order
          </h2>
          <button className="btn btn-xs btn-ghost gap-1 opacity-70 hover:opacity-100">
            <Printer size={14} /> Reprint Last
          </button>
        </div>

        <OrderTypeSelector orderType={orderType} setOrderType={setOrderType} />

        {/* Scrollable Summary Panel */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 pt-2">
          {/* Detailed Table Card (Dine-in Only) */}
          {orderType === "dine-in" && (
            <div className="bg-base-200 p-3 rounded-xl border border-primary/20 flex justify-between items-center">
              <div>
                <p className="text-xs uppercase opacity-50 font-black tracking-wider">
                  Table
                </p>
                <h3 className="text-xl font-black">
                  Table 12 <span className="text-accent">(VIP)</span>
                </h3>
                <p className="text-xs opacity-70">4 seats • Server: Mark A.</p>
              </div>
              <button className="btn btn-xs btn-circle btn-ghost">
                <Edit3 size={14} />
              </button>
            </div>
          )}

          {/* Customer Details Form (Takeaway/Delivery) */}
          {(orderType === "takeaway" || orderType === "delivery") && (
            <CustomerDetailsForm orderType={orderType} />
          )}

          {/* Cart Items */}
          <div className="space-y-1">
            <h3 className="text-xs uppercase opacity-50 font-black tracking-wider mb-2">
              Order Items
            </h3>
            {cart.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                updateQuantity={handleUpdateQuantity}
                removeItem={handleRemoveItem}
                currency={currency}
              />
            ))}
          </div>

          {/* Order Note */}
          <div className="pt-2">
            <h3 className="text-xs uppercase opacity-50 font-black tracking-wider mb-2">
              Order Note
            </h3>
            <textarea
              className="textarea textarea-bordered w-full textarea-sm leading-tight"
              placeholder="Allergies, door codes, etc..."
              rows="2"
              defaultValue="Customer requested extra napkins and no ice in the water."
            />
          </div>

          <div className="divider my-1"></div>

          {/* Discounts & Fees */}
          <DiscountSection currency={currency} />

          {orderType !== "dine-in" && (
            <div className="flex items-center justify-between text-sm px-1">
              <span className="opacity-70">Packaging Fee</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {currency}
                  {packagingFee.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          {orderType === "delivery" && (
            <div className="flex items-center justify-between text-sm px-1">
              <span className="opacity-70">Delivery Fee</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {currency}
                  {deliveryFee.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Financial Summary */}
        <div className="mt-4 pt-4 border-t-2 border-dashed border-base-300 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="opacity-60">
              Subtotal ({totals.itemCount} items)
            </span>
            <span className="font-medium line-through opacity-40">
              {currency}
              {totals.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-success font-semibold">
            <span>Discount (10%)</span>
            <span>
              - {currency}
              {discount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-60">VAT (20%)</span>
            <span className="font-medium">
              {currency}
              {tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-60">Service Charge (12.5%)</span>
            <span className="font-medium">
              {currency}
              {serviceCharge.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xl font-black text-primary mt-3 py-2 border-y border-base-200">
            <span>TOTAL</span>
            <span>
              {currency}
              {grandTotal.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {orderType === "dine-in" && (
              <button className="btn btn-outline btn-secondary font-bold">
                Send to Kitchen
              </button>
            )}
            <button
              className={`btn btn-primary font-black shadow-lg shadow-primary/20 ${orderType === "dine-in" ? "" : "col-span-2"}`}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
