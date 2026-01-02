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
    <div className="flex flex-col md:flex-row gap-6 h-[500px] w-full max-w-5xl mx-auto font-sans">
      {/* LEFT: Menu Area */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex justify-between items-center mb-6 z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand block mb-1">
              Menu Classification
            </span>
            <h3 className="text-xl font-bold text-white">{categoryName}</h3>
          </div>
          <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/60">
            Dine-in
          </div>
        </div>

        {/* Demo Item Card */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addToCart}
            className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand/50 rounded-2xl p-4 text-left transition-all relative overflow-hidden group/card"
          >
            <div className="absolute top-2 right-2 w-6 h-6 bg-brand/10 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
              <PlusIcon className="w-4 h-4 text-brand" />
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-brand to-orange-600 rounded-lg mb-3 shadow-lg flex items-center justify-center text-white font-bold text-lg">
              {itemName.charAt(0)}
            </div>
            <div className="font-bold text-white mb-1 truncate">{itemName}</div>
            <div className="text-sm font-medium text-white/50">
              ${itemPrice}
            </div>

            {/* Guide Overlay for first interaction */}
            {showGuide && cart.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <CursorArrowRaysIcon className="w-8 h-8 text-white mx-auto mb-1 drop-shadow-glow" />
                  </motion.div>
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                    Click to Add
                  </span>
                </div>
              </motion.div>
            )}
          </motion.button>

          {/* Placeholders to make it look like a grid */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/5 rounded-2xl p-4 opacity-30 pointer-events-none grayscale"
            >
              <div className="w-10 h-10 bg-white/10 rounded-lg mb-3" />
              <div className="h-4 w-20 bg-white/10 rounded mb-2" />
              <div className="h-3 w-10 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Ticket/Cart Area */}
      <div className="w-full md:w-96 bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-col backdrop-blur-md">
        <div className="border-b border-white/10 pb-4 mb-4 flex items-center gap-2">
          <ShoppingBagIcon className="w-5 h-5 text-brand" />
          <span className="text-xs font-black uppercase tracking-widest text-white/60">
            Current Ticket
          </span>
        </div>

        {/* Empty State */}
        {cart.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-2xl m-2">
            <ShoppingBagIcon className="w-12 h-12 mb-2" />
            <span className="text-sm font-medium">Ticket Empty</span>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 rounded-xl p-3 flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    {item.name}
                  </div>
                  <div className="text-xs text-white/50">
                    ${item.price} x {item.qty}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(-1)}
                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <MinusIcon className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-white">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(1)}
                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <PlusIcon className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Totals & Action */}
        <div className="mt-6 space-y-4 pt-4 border-t border-white/10">
          <div className="flex justify-between items-end">
            <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
              Total
            </span>
            <span className="text-2xl font-black text-white">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <button
            disabled={cart.length === 0 || isOrderSent}
            onClick={() => setIsOrderSent(true)}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
              isOrderSent
                ? "bg-success text-black"
                : "bg-brand text-white hover:bg-brand-hover disabled:opacity-20 disabled:cursor-not-allowed shadow-lg shadow-brand/20"
            }`}
          >
            {isOrderSent ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>Sent to Kitchen</span>
              </motion.div>
            ) : (
              <>
                <BoltIcon className="w-5 h-5" />
                <span>Send Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MiniPOSDemo;
