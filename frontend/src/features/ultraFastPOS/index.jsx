// frontend/src/pages/protected/UltraFastPOS.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUltraFastKeyboard } from "../../hooks/useUltraFastKeyboard";
import { fetchAllMenuItems } from "../../features/menuItems/menuItemsSlice";
import { fetchAllCategories } from "../../features/categories/categoriesSlice";
import { fetchSettings } from "../../features/settings/generalSettings/generalSettingsSlice";
import { showNotification } from "../../features/common/headerSlice";
import { openModal } from "../../features/common/modalSlice";
import { MODAL_BODY_TYPES, CONFIRMATION_MODAL_CLOSE_TYPES } from "../../utils/globalConstantUtil";
import axios from "axios";
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

  const cartRef = React.useRef([]);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

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
      dispatch(openModal({
        title: "Clear Cart?",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: "Are you sure you want to clear the entire cart?",
          type: CONFIRMATION_MODAL_CLOSE_TYPES.CLEAR_CART,
          onConfirm: () => setCart([]),
        },
      }));
    }
  }, [cart.length, dispatch]);

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
        // Format order data to match backend expectations
        const orderData = {
          order: {
            table: "Takeaway",
            customerDetails: {
              name: "Walk-in",
              phone: "",
              email: "",
              address: "",
            },
            orderType: "takeaway",
            orderItems: cartRef.current.map((item) => ({
              menuItemId: item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              customizations: "",
              subtotal: item.price * item.quantity,
              preparationTime: item.preparationTime || 15,
            })),
            subtotal: total,
            packagingFee: 0,
            deliveryFee: 0,
            totalAmount: total,
            amountPaid: total,
            paymentMethod,
            paymentStatus: "paid",
            balance: 0,
            note: "",
          },
        };

        const response = await axios.post("/api/orders", orderData);
        const order = response.data.data;

        // Auto-print instantly
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
        console.error("Order creation error:", error);
        dispatch(
          showNotification({
            message: error.response?.data?.message || "Failed to complete sale",
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
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt #${order.orderNumber}</title>
            <style>
              body { font-family: monospace; width: 300px; margin: 0 auto; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 5px; text-align: left; }
              .total { font-weight: bold; font-size: 18px; }
              hr { border: 1px dashed #000; }
            </style>
          </head>
          <body>
            <h2 style="text-align: center;">Receipt #${order.orderNumber}</h2>
            <p>Date: ${new Date().toLocaleString()}</p>
            <hr>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${
                      settings?.currency?.symbol || "₦"
                    }${item.subtotal.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <hr>
            <p class="total">Total: ${
              settings?.currency?.symbol || "₦"
            }${order.totalAmount.toFixed(2)}</p>
            <p>Paid: ${
              settings?.currency?.symbol || "₦"
            }${order.amountPaid.toFixed(2)}</p>
            <p>Method: ${order.paymentMethod}</p>
            <hr>
            <p style="text-align: center;">Thank you!</p>
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
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
    // THIS IS THE KEY FIX - position fixed with z-index to overlay everything
    <div className="fixed inset-0 bg-base-300 flex flex-col overflow-hidden z-[9999]">
      {/* Header */}
      <div className="bg-base-100 border-b-2 border-base-300 shadow-lg p-4 flex justify-between items-center flex-shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <KeyboardIcon className="w-6 h-6 text-primary" />
          Ultra-Fast POS Mode
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/app/settings/keyboard")}
            className="btn btn-ghost btn-sm gap-2"
          >
            <KeyboardIcon className="w-4 h-4" />
            Keyboard Settings
          </button>
          <button
            onClick={() => navigate("/app/pos")}
            className="btn btn-error btn-sm gap-2"
          >
            <X className="w-4 h-4" />
            Exit Fast Mode
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4 sticky top-0 bg-base-300 z-10 pb-4">
            <button
              onClick={() => setActiveCategory("All")}
              className={`btn btn-sm ${
                activeCategory === "All" ? "btn-primary" : "btn-outline"
              }`}
            >
              All Items
            </button>
            {categories.map((cat, index) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat.name)}
                className={`btn btn-sm ${
                  activeCategory === cat.name ? "btn-primary" : "btn-outline"
                }`}
              >
                <span className="opacity-60">[{index + 1}]</span> {cat.name}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredItems.slice(0, 9).map((item, index) => (
              <button
                key={item._id}
                onClick={() => addToCart(item)}
                className="btn btn-lg h-28 flex-col justify-center btn-outline hover:btn-primary hover:scale-105 transition-transform"
              >
                <div className="text-xs opacity-60 mb-1">[{index + 1}]</div>
                <div className="font-bold text-sm mb-1">{item.name}</div>
                <div className="text-lg font-bold text-primary">
                  {settings?.currency?.symbol || "₦"}
                  {item.price.toFixed(2)}
                </div>
              </button>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center text-base-content/50 mt-12">
              <p className="text-xl">No items in this category</p>
            </div>
          )}
        </div>

        {/* Right: Cart */}
        <div className="w-96 bg-base-100 border-l-2 border-base-300 shadow-xl flex flex-col flex-shrink-0">
          {/* Cart Header */}
          <div className="p-4 border-b-2 border-base-300 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
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
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-base-content/50">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg">Cart is empty</p>
                <p className="text-sm mt-2">Use number keys to add items</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, idx) => (
                  <div
                    key={`${item._id}-${idx}`}
                    className="flex justify-between items-center bg-base-200 p-3 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-base-content/70">
                        {item.quantity} × {settings?.currency?.symbol || "₦"}
                        {item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg">
                        {settings?.currency?.symbol || "₦"}
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

          {/* Total & Payment Section */}
          <div className="p-4 border-t-2 border-base-300 bg-base-200 flex-shrink-0">
            <div className="text-4xl font-bold text-center mb-4 text-primary">
              {settings?.currency?.symbol || "₦"}
              {total.toFixed(2)}
            </div>

            {/* Payment Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => finalizeSale("cash")}
                className="btn btn-success btn-sm flex-col h-16"
                disabled={cart.length === 0 || isProcessing}
              >
                <Banknote className="w-5 h-5" />
                <div className="text-xs font-bold">F1: Cash</div>
              </button>
              <button
                onClick={() => finalizeSale("card")}
                className="btn btn-info btn-sm flex-col h-16"
                disabled={cart.length === 0 || isProcessing}
              >
                <CreditCard className="w-5 h-5" />
                <div className="text-xs font-bold">F2: Card</div>
              </button>
              <button
                onClick={() => finalizeSale("Transfer")}
                className="btn btn-warning btn-sm flex-col h-16"
                disabled={cart.length === 0 || isProcessing}
              >
                <DollarSign className="w-5 h-5" />
                <div className="text-xs font-bold">F3: Transfer</div>
              </button>
            </div>

            <button
              onClick={() => finalizeSale("cash")}
              className="btn btn-primary btn-lg w-full"
              disabled={cart.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Processing...
                </>
              ) : (
                "F9: Complete Sale"
              )}
            </button>

            <div className="text-xs text-center mt-3 text-base-content/60 space-y-1">
              <div>ESC: Clear Cart | Backspace: Void Last</div>
              <div>1-9: Add Items | Alt+1-9: Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]">
          <div className="bg-base-100 p-6 rounded-lg w-96 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Quick Calculator
              </h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={calculatorValue}
              onChange={(e) => setCalculatorValue(e.target.value)}
              className="input input-bordered w-full mb-4 text-3xl text-right font-mono"
              placeholder="0"
              autoFocus
            />
            <button
              onClick={() => setShowCalculator(false)}
              className="btn btn-primary btn-block"
            >
              Close (Ctrl+C)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraFastPOS;
