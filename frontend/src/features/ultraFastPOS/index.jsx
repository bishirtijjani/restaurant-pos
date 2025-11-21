// frontend/src/pages/protected/UltraFastPOS.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  memo,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUltraFastKeyboard } from "../../hooks/useUltraFastKeyboard";
import { fetchAllMenuItems } from "../../features/menuItems/menuItemsSlice";
import { fetchAllCategories } from "../../features/categories/categoriesSlice";
import { fetchSettings } from "../../features/settings/generalSettings/generalSettingsSlice";
import { showNotification } from "../../features/common/headerSlice";
import axios from "axios";

// Memoize cart item component
const CartItem = memo(({ item, currency, onRemove }) => (
  <div className="flex justify-between items-center bg-base-200 p-3 rounded">
    <div className="flex-1">
      <div className="font-semibold">{item.name}</div>
      <div className="text-sm">
        {item.quantity} × {currency}
        {item.price.toFixed(2)}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="font-bold">
        {currency}
        {(item.price * item.quantity).toFixed(2)}
      </div>
      <button
        onClick={() => onRemove(item._id)}
        className="btn btn-error btn-xs btn-circle"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  </div>
));

// Memoize menu item button
const MenuItem = memo(({ item, index, currency, onAdd }) => (
  <button
    onClick={() => onAdd(item)}
    className="btn btn-lg h-24 flex-col btn-outline hover:btn-primary"
  >
    <div className="font-bold">
      [{index + 1}] {item.name}
    </div>
    <div className="text-lg">
      {currency}
      {item.price.toFixed(2)}
    </div>
  </button>
));

import {
  ShoppingCart,
  Trash2,
  Calculator,
  Keyboard as KeyboardIcon,
  X,
  DollarSign,
  CreditCard,
  Banknote,
} from "lucide-react";
import TitleCard from "../../components/Cards/TitleCard";

const UltraFastPOS = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = useSelector((state) => state.menuItems.menuItems || []);
  const categories = useSelector((state) => state.categories.categories || []);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const keyboardSettings = useSelector(
    (state) => state.ultraFastPOS.keyboardSettings
  );

  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorValue, setCalculatorValue] = useState("");

  const cartRef = useRef(cart);

  // Keep ref updated
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Preload data
  useEffect(() => {
    dispatch(fetchAllMenuItems());
    dispatch(fetchAllCategories());
    dispatch(fetchSettings());
  }, [dispatch]);

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [menuItems, activeCategory]);

  // Calculate total
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  // Cart operations (instant, no delays)
  const addToCart = useCallback((item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i._id === item._id);
      if (existing) {
        return prevCart.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart((prevCart) => prevCart.filter((i) => i._id !== itemId));
  }, []);

  const voidLastItem = useCallback(() => {
    setCart((prevCart) => {
      if (prevCart.length === 0) return prevCart;
      return prevCart.slice(0, -1);
    });
  }, []);

  const clearCart = useCallback(() => {
    if (cart.length > 0) {
      if (window.confirm("Clear entire cart?")) {
        setCart([]);
      }
    }
  }, [cart.length]);

  // Instant sale completion
  const finalizeSale = useCallback(
    async (paymentMethod = "cash") => {
      if (cartRef.current.length === 0) {
        dispatch(
          showNotification({
            message: "Cart is empty!",
            status: 0,
          })
        );
        return;
      }

      setIsProcessing(true);

      try {
        // Use existing order creation endpoint
        const orderData = {
          order: {
            orderType: "takeaway",
            orderItems: cartRef.current.map((item) => ({
              menuItemId: item._id,
              quantity: item.quantity,
            })),
            amountPaid: total,
            paymentMethod,
          },
        };

        const response = await axios.post("/api/orders", orderData);
        const order = response.data.data;

        // Auto-print instantly (no dialog)
        await printReceipt(order);

        // Clear cart
        setCart([]);

        dispatch(
          showNotification({
            message: `Sale completed! Order #${order.orderNumber}`,
            status: 1,
          })
        );
      } catch (error) {
        dispatch(
          showNotification({
            message: "Failed to complete sale",
            status: 0,
          })
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [total, dispatch]
  );

  // Instant print (no delays)
  const printReceipt = async (order) => {
    try {
      // Use existing print endpoint
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt #${order.orderNumber}</title>
            <style>
              body { font-family: monospace; width: 300px; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 5px; text-align: left; }
              .total { font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <h2>Receipt #${order.orderNumber}</h2>
            <p>Date: ${new Date().toLocaleString()}</p>
            <hr>
            <table>
              ${order.orderItems
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${settings.currency.symbol}${item.subtotal.toFixed(
                    2
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </table>
            <hr>
            <p class="total">Total: ${
              settings.currency.symbol
            }${order.totalAmount.toFixed(2)}</p>
            <p>Paid: ${settings.currency.symbol}${order.amountPaid.toFixed(
        2
      )}</p>
            <hr>
            <p style="text-align: center;">Thank you!</p>
            <script>
              window.onload = () => {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Print error:", error);
    }
  };

  // Define shortcuts
  const shortcuts = useMemo(() => {
    const base = [
      // Payment
      {
        key: keyboardSettings?.finalizeSale || "f9",
        action: () => finalizeSale("cash"),
      },
      {
        key: keyboardSettings?.payCash || "f1",
        action: () => finalizeSale("cash"),
      },
      {
        key: keyboardSettings?.payCard || "f2",
        action: () => finalizeSale("card"),
      },
      {
        key: keyboardSettings?.payTransfer || "f3",
        action: () => finalizeSale("Transfer"),
      },

      // Actions
      {
        key: keyboardSettings?.cancelSale || "escape",
        action: clearCart,
      },
      {
        key: keyboardSettings?.voidLastItem || "backspace",
        action: voidLastItem,
      },
      {
        key: keyboardSettings?.openCalculator || "ctrl+c",
        action: () => setShowCalculator((prev) => !prev),
      },
    ];

    // Add number keys for items
    filteredItems.slice(0, 9).forEach((item, index) => {
      base.push({
        key: `${index + 1}`,
        action: () => addToCart(item),
      });
    });

    // Add category shortcuts
    categories.slice(0, 9).forEach((cat, index) => {
      base.push({
        key: keyboardSettings?.[`category${index + 1}`] || `alt+${index + 1}`,
        action: () => setActiveCategory(cat.name),
      });
    });

    return base;
  }, [
    keyboardSettings,
    finalizeSale,
    clearCart,
    voidLastItem,
    filteredItems,
    categories,
    addToCart,
  ]);

  // Activate keyboard handler
  useUltraFastKeyboard(shortcuts, true);

  return (
    <TitleCard
      title="Fast POS Mode"
      //   TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      <div className="fixed inset-0 bg-base-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-base-100 border-b border-base-300 p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <KeyboardIcon className="w-6 h-6 text-primary" />
            Ultra-Fast POS Mode
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/app/settings/keyboard")}
              className="btn btn-ghost btn-sm"
            >
              <KeyboardIcon className="w-4 h-4" />
              Keyboard Settings
            </button>
            <button
              onClick={() => navigate("/app/orders/new")}
              className="btn btn-outline btn-sm"
            >
              <X className="w-4 h-4" />
              Exit Fast Mode
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveCategory("All")}
                className={`btn btn-sm ${
                  activeCategory === "All" ? "btn-primary" : "btn-outline"
                }`}
              >
                All
              </button>
              {categories.map((cat, index) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`btn btn-sm ${
                    activeCategory === cat.name ? "btn-primary" : "btn-outline"
                  }`}
                >
                  [{index + 1}] {cat.name}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-3 gap-2">
              {filteredItems.slice(0, 9).map((item, index) => (
                <button
                  key={item._id}
                  onClick={() => addToCart(item)}
                  className="btn btn-lg h-24 flex-col btn-outline hover:btn-primary"
                >
                  <div className="font-bold">
                    [{index + 1}] {item.name}
                  </div>
                  <div className="text-lg">
                    {settings.currency.symbol}
                    {item.price.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Cart */}
          <div className="w-96 bg-base-100 border-l border-base-300 flex flex-col">
            {/* Cart Header */}
            <div className="p-4 border-b border-base-300 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart ({cart.length})
              </h2>
              <button
                onClick={clearCart}
                className="btn btn-error btn-sm btn-circle"
                disabled={cart.length === 0}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center text-base-content/50 mt-8">
                  Cart is empty
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center bg-base-200 p-3 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm">
                          {item.quantity} × {settings.currency.symbol}
                          {item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold">
                          {settings.currency.symbol}
                          {(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="btn btn-error btn-xs btn-circle"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="p-4 border-t border-base-300 bg-base-200">
              <div className="text-3xl font-bold text-center mb-4">
                Total: {settings.currency.symbol}
                {total.toFixed(2)}
              </div>

              {/* Payment Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  onClick={() => finalizeSale("cash")}
                  className="btn btn-success"
                  disabled={cart.length === 0 || isProcessing}
                >
                  <Banknote className="w-4 h-4" />
                  <div className="text-xs">[F1] Cash</div>
                </button>
                <button
                  onClick={() => finalizeSale("card")}
                  className="btn btn-info"
                  disabled={cart.length === 0 || isProcessing}
                >
                  <CreditCard className="w-4 h-4" />
                  <div className="text-xs">[F2] Card</div>
                </button>
                <button
                  onClick={() => finalizeSale("Transfer")}
                  className="btn btn-warning"
                  disabled={cart.length === 0 || isProcessing}
                >
                  <DollarSign className="w-4 h-4" />
                  <div className="text-xs">[F3] Transfer</div>
                </button>
              </div>

              <button
                onClick={() => finalizeSale("cash")}
                className="btn btn-primary btn-lg w-full"
                disabled={cart.length === 0 || isProcessing}
              >
                {isProcessing ? "Processing..." : "[F9] Complete Sale"}
              </button>

              <div className="text-xs text-center mt-2 text-base-content/50">
                ESC: Clear | Backspace: Void Last
              </div>
            </div>
          </div>
        </div>

        {/* Calculator Modal */}
        {showCalculator && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 p-6 rounded-lg w-96">
              <h3 className="text-xl font-bold mb-4">Quick Calculator</h3>
              <input
                type="text"
                value={calculatorValue}
                onChange={(e) => setCalculatorValue(e.target.value)}
                className="input input-bordered w-full mb-4 text-2xl text-right"
                autoFocus
              />
              <button
                onClick={() => setShowCalculator(false)}
                className="btn btn-block"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </TitleCard>
  );
};

export default UltraFastPOS;
