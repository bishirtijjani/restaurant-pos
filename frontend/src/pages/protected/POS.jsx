import React, { useState } from "react";
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
  CreditCard,
  DollarSign,
  Receipt,
} from "lucide-react";

// Mock data moved to separate files in a real application
import { menuItems, categories } from "../../utils/MockData";

// Component for the order type selector
const OrderTypeSelector = ({ orderType, setOrderType }) => (
  <div className="join mb-4">
    <button
      className={`join-item btn ${
        orderType === "dine-in" ? "btn-primary" : "btn-outline"
      }`}
      onClick={() => setOrderType("dine-in")}
    >
      <UtensilsCrossed size={18} className="mr-1" /> Dine-in
    </button>
    <button
      className={`join-item btn ${
        orderType === "takeaway" ? "btn-primary" : "btn-outline"
      }`}
      onClick={() => setOrderType("takeaway")}
    >
      <ShoppingBag size={18} className="mr-1" /> Takeaway
    </button>
    <button
      className={`join-item btn ${
        orderType === "delivery" ? "btn-primary" : "btn-outline"
      }`}
      onClick={() => setOrderType("delivery")}
    >
      <Truck size={18} className="mr-1" /> Delivery
    </button>
  </div>
);

// Component for category filters
const CategoryFilter = ({ activeCategory, setActiveCategory }) => (
  <div className="flex overflow-x-auto space-x-2 pb-4 mb-4">
    {categories.map((category) => (
      <button
        key={category.name}
        className={`btn ${
          activeCategory === category.name ? "btn-primary" : "btn-outline"
        } flex-shrink-0`}
        onClick={() => setActiveCategory(category.name)}
      >
        {category.icon}
        <span className="ml-2">{category.name}</span>
      </button>
    ))}
  </div>
);

// Component for a single menu item
const MenuItem = ({ item, addToCart }) => (
  <div
    className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => addToCart(item)}
  >
    <img
      src={item.image || item.category.icon}
      alt={item.name}
      className="h-32 w-full object-cover"
    />
    <div className="p-3">
      <h3 className="font-medium text-lg">{item.name}</h3>
      <div className="flex justify-between items-center mt-2">
        <span className="text-primary font-semibold">
          ₦{item.price.toFixed(2)}
        </span>
        <button className="btn btn-sm btn-primary btn-circle">
          <PlusCircle size={16} />
        </button>
      </div>
    </div>
  </div>
);

// Component for a cart item
const CartItem = ({ item, updateQuantity }) => (
  <div className="flex items-center justify-between border-b pb-3">
    <div className="flex items-center">
      <img
        src={item.image}
        alt={item.name}
        className="w-12 h-12 rounded-md object-cover mr-3"
      />
      <div>
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-primary font-semibold">₦{item.price.toFixed(2)}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button
        className="btn btn-sm btn-circle btn-ghost"
        onClick={(e) => {
          e.stopPropagation();
          updateQuantity(item.id, item.quantity - 1);
        }}
      >
        <MinusCircle size={16} />
      </button>
      <span className="w-6 text-center font-medium">{item.quantity}</span>
      <button
        className="btn btn-sm btn-circle btn-ghost"
        onClick={(e) => {
          e.stopPropagation();
          updateQuantity(item.id, item.quantity + 1);
        }}
      >
        <PlusCircle size={16} />
      </button>
      <button
        className="btn btn-sm btn-circle btn-ghost text-error ml-2"
        onClick={(e) => {
          e.stopPropagation();
          updateQuantity(item.id, 0);
        }}
      >
        <X size={16} />
      </button>
    </div>
  </div>
);

// Component for the empty cart state
const EmptyCart = () => (
  <div className="text-center text-gray-500 py-12">
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
}) => {
  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const packaging =
      orderType === "dine-in" ? 0 : parseFloat(packagingFee) || 0;
    const delivery =
      orderType === "delivery" ? parseFloat(deliveryFee) || 0 : 0;
    return subtotal + packaging + delivery;
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between mb-2">
        <span>Subtotal</span>
        <span>₦{calculateSubtotal().toFixed(2)}</span>
      </div>

      {orderType === "takeaway" && (
        <div className="flex justify-between mb-2 text-info">
          <div className="flex items-center">
            <span className="mr-2">Packaging fee</span>
            <input
              type="number"
              className="input input-bordered input-sm w-20"
              value={packagingFee}
              onChange={(e) => setPackagingFee(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
          <span>₦{parseFloat(packagingFee || 0).toFixed(2)}</span>
        </div>
      )}

      {orderType === "delivery" && (
        <>
          <div className="flex justify-between mb-2 text-info">
            <div className="flex items-center">
              <span className="mr-2">Packaging fee</span>
              <input
                type="number"
                className="input input-bordered input-sm w-20"
                value={packagingFee}
                onChange={(e) => setPackagingFee(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            <span>₦{parseFloat(packagingFee || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2 text-info">
            <div className="flex items-center">
              <span className="mr-2">Delivery fee</span>
              <input
                type="number"
                className="input input-bordered input-sm w-20"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            <span>₦{parseFloat(deliveryFee || 0).toFixed(2)}</span>
          </div>
        </>
      )}

      <div className="border-t border-gray-300 my-2"></div>

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>₦{calculateTotal().toFixed(2)}</span>
      </div>
    </div>
  );
};

// Component for the payment modal
const PaymentModal = ({ onClose, onComplete }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 w-1/2 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payment</h2>
        <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <button className="btn btn-outline flex flex-col items-center justify-center h-32">
          <CreditCard size={32} className="mb-2" />
          <span>Credit Card</span>
        </button>
        <button className="btn btn-outline flex flex-col items-center justify-center h-32">
          <DollarSign size={32} className="mb-2" />
          <span>Cash</span>
        </button>
        <button className="btn btn-outline flex flex-col items-center justify-center h-32">
          <Receipt size={32} className="mb-2" />
          <span>Invoice</span>
        </button>
      </div>

      <div className="text-center">
        <button className="btn btn-primary btn-lg w-1/2" onClick={onComplete}>
          Complete Order
        </button>
      </div>
    </div>
  </div>
);

// Main POS component
export default function POS() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [packagingFee, setPackagingFee] = useState("0.00");
  const [deliveryFee, setDeliveryFee] = useState("3.00");

  // Filter menu items by category and search query
  const filteredItems = menuItems.filter(
    (item) =>
      (activeCategory === "All" || item.category === activeCategory) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Update item quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Calculate total for payment button
  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const packaging =
      orderType === "dine-in" ? 0 : parseFloat(packagingFee) || 0;
    const delivery =
      orderType === "delivery" ? parseFloat(deliveryFee) || 0 : 0;
    return subtotal + packaging + delivery;
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Left side - Menu */}
      <div className="w-3/5 flex flex-col p-4 pr-2">
        <div className="bg-white rounded-xl shadow-lg p-6 flex-grow flex flex-col">
          {/* Search bar */}
          <div className="relative w-64 mb-6">
            <input
              type="text"
              placeholder="Search items..."
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>

          {/* Categories */}
          <CategoryFilter
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />

          {/* Menu items grid */}
          <div className="grid grid-cols-3 gap-4 overflow-y-auto flex-grow">
            {filteredItems.map((item) => (
              <MenuItem key={item.id} item={item} addToCart={addToCart} />
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Order details */}
      <div className="w-2/5 flex flex-col p-4 pl-2">
        <div className="bg-white rounded-xl shadow-lg p-6 flex-grow flex flex-col">
          <h2 className="text-xl font-bold mb-4">Current Order</h2>

          {/* Order type selector - moved here from the left side */}
          <OrderTypeSelector
            orderType={orderType}
            setOrderType={setOrderType}
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
              <div className="badge badge-primary">Table #12</div>
            )}
            {orderType === "delivery" && (
              <button className="btn btn-sm btn-outline">
                Address details
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-grow overflow-scroll mb-4">
            {cart.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="space-y-3 h-1">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
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
          />

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              className="btn btn-outline flex-1"
              onClick={() => setCart([])}
              disabled={cart.length === 0}
            >
              Clear
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
            >
              Pay ₦{calculateTotal().toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onComplete={() => {
            setShowPayment(false);
            setCart([]);
          }}
        />
      )}
    </div>
  );
}
