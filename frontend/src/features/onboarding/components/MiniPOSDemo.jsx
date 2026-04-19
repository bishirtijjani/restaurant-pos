import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  BoltIcon,
  CheckCircleIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";

function MiniPOSDemo({ itemName, itemPrice, categoryName, onOrderFired }) {
  const [cart, setCart] = useState([]);
  const [isOrderSent, setIsOrderSent] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // Reset demo if needed
  useEffect(() => {
    if (isOrderSent) {
      const timer = setTimeout(() => {
        onOrderFired();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOrderSent, onOrderFired]);

  const addToCart = () => {
    setCart((prev) => {
      // Simple logic: allow only 1 item type for demo clarity, but support qty
      const existing = prev.find((i) => i.name === itemName);
      if (existing) {
        return prev.map((i) =>
          i.name === itemName ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [{ name: itemName, price: parseFloat(itemPrice), qty: 1 }];
    });
    setShowGuide(false); // Dismiss guide after first interaction
  };

  const updateQty = (delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.name === itemName) {
            return { ...item, qty: Math.max(0, item.qty + delta) };
          }
          return item;
        })
        .filter((i) => i.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-6 h-auto md:h-[500px] w-full max-w-5xl mx-auto font-sans">
      {/* LEFT: Menu Area */}
      <div className="flex-1 bg-white border-2 border-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col relative overflow-hidden group min-h-[180px] md:min-h-0 shadow-lg shadow-gray-200/50">
        <div className="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex justify-between items-center mb-3 md:mb-6 z-10">
          <div>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-brand block mb-0.5 md:mb-1">
              Menu Classification
            </span>
            <h3 className="text-base md:text-xl font-bold text-gray-900">{categoryName}</h3>
          </div>
          <div className="px-2 md:px-3 py-0.5 md:py-1 bg-gray-200 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-gray-700">
            Dine-in
          </div>
        </div>

        {/* Demo Item Card */}
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addToCart}
            className="bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-brand rounded-xl md:rounded-2xl p-3 md:p-4 text-left transition-all relative overflow-hidden group/card shadow-sm"
          >
            <div className="absolute top-1 md:top-2 right-1 md:right-2 w-5 h-5 md:w-6 md:h-6 bg-brand/20 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
              <PlusIcon className="w-3 h-3 md:w-4 md:h-4 text-brand" />
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-brand to-orange-600 rounded-lg mb-2 md:mb-3 shadow-lg flex items-center justify-center text-white font-bold text-base md:text-lg">
              {itemName.charAt(0)}
            </div>
            <div className="font-bold text-gray-900 mb-0.5 md:mb-1 truncate text-sm md:text-base">{itemName}</div>
            <div className="text-xs md:text-sm font-bold text-gray-700">
              ${itemPrice}
            </div>

            {/* Guide Overlay for first interaction */}
            {showGuide && cart.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gray-900/80 flex items-center justify-center backdrop-blur-[1px] rounded-xl md:rounded-2xl"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <CursorArrowRaysIcon className="w-6 h-6 md:w-8 md:h-8 text-white mx-auto mb-1 drop-shadow-glow" />
                  </motion.div>
                  <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">
                    Tap to Add
                  </span>
                </div>
              </motion.div>
            )}
          </motion.button>

          {/* Placeholders to make it look like a grid */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-100 border-2 border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 opacity-60 pointer-events-none grayscale"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-lg mb-2 md:mb-3" />
              <div className="h-3 md:h-4 w-16 md:w-20 bg-gray-300 rounded mb-1 md:mb-2" />
              <div className="h-2 md:h-3 w-8 md:w-10 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Ticket/Cart Area */}
      <div className="w-full md:w-96 bg-gray-900 border-2 border-gray-700 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col min-h-[200px] md:min-h-0 shadow-xl">
        <div className="border-b-2 border-gray-700 pb-2 md:pb-4 mb-2 md:mb-4 flex items-center gap-2">
          <ShoppingBagIcon className="w-4 h-4 md:w-5 md:h-5 text-brand" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-300">
            Current Ticket
          </span>
        </div>

        {/* Empty State */}
        {cart.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl md:rounded-2xl m-1 md:m-2">
            <ShoppingBagIcon className="w-8 h-8 md:w-12 md:h-12 mb-1 md:mb-2" />
            <span className="text-xs md:text-sm font-bold">Ticket Empty</span>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 space-y-2 md:space-y-3 overflow-y-auto">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gray-800 rounded-lg md:rounded-xl p-2 md:p-3 flex justify-between items-center group border border-gray-700"
              >
                <div>
                  <div className="font-bold text-white text-xs md:text-sm">
                    {item.name}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-300">
                    ${item.price} x {item.qty}
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={() => updateQty(-1)}
                    className="w-5 h-5 md:w-6 md:h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors border border-gray-600"
                  >
                    <MinusIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  </button>
                  <span className="font-mono font-bold text-white text-sm">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(1)}
                    className="w-5 h-5 md:w-6 md:h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors border border-gray-600"
                  >
                    <PlusIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Totals & Action */}
        <div className="mt-3 md:mt-6 space-y-2 md:space-y-4 pt-3 md:pt-4 border-t-2 border-gray-700">
          <div className="flex justify-between items-end">
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total
            </span>
            <span className="text-xl md:text-2xl font-black text-white">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <button
            disabled={cart.length === 0 || isOrderSent}
            onClick={() => setIsOrderSent(true)}
            className={`w-full py-3 md:py-4 rounded-lg md:rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-1.5 md:gap-2 transition-all relative overflow-hidden text-sm md:text-base ${
              isOrderSent
                ? "bg-green-500 text-gray-900"
                : "bg-brand text-white hover:bg-brand-hover disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-brand/30"
            }`}
          >
            {isOrderSent ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 md:gap-2"
              >
                <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-bold">Sent to Kitchen</span>
              </motion.div>
            ) : (
              <>
                <BoltIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-bold">Send Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MiniPOSDemo;
