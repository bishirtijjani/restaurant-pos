import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BuildingStorefrontIcon,
  RectangleStackIcon,
  PlusIcon,
  BoltIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { createStore } from "../stores/storeSlice";
import { showNotification } from "../common/headerSlice";
import axios from "../../utils/offline/offlineAxios";
import MiniPOSDemo from "./components/MiniPOSDemo";

const STEPS = {
  BRAND: 0,
  MENU: 1,
  ITEM: 2,
  DEMO: 3,
  LAUNCHING: 4,
};

const OnboardingWizard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState(STEPS.BRAND);
  const [loading, setLoading] = useState(false);
  const [orderFired, setOrderFired] = useState(false);

  // Unified data state
  const [data, setData] = useState({
    storeName: "",
    storeType: "Cafe",
    categoryName: "",
    itemName: "",
    itemPrice: "12.00",
  });

  const updateData = (fields) => setData((prev) => ({ ...prev, ...fields }));

  const handleLaunch = async () => {
    setLoading(true);
    setCurrentStep(STEPS.LAUNCHING);
    try {
      // 1. Create Store
      const storeRes = await dispatch(
        createStore({
          name: data.storeName,
          settings: { restaurantName: data.storeName },
        }),
      ).unwrap();

      const storeId = storeRes._id;
      // Persist store ID for subsequent calls in this session
      localStorage.setItem("activeStoreId", storeId);

      // 2. Create Category
      const catRes = await axios.post(
        `/api/categories`,
        {
          name: data.categoryName,
          description: `Primary category for ${data.storeName}`,
        },
        { headers: { "x-store-id": storeId } },
      );
      const categoryId = catRes.data._id;

      // 3. Create Item
      const itemRes = await axios.post(
        `/api/menu-items`,
        {
          name: data.itemName,
          price: parseFloat(data.itemPrice),
          category: categoryId,
          isAvailable: true,
        },
        { headers: { "x-store-id": storeId } },
      );
      const menuItemId = itemRes.data._id;

      // 4. Create Initial Order (The Aha Moment)
      await axios.post(
        `/api/orders`,
        {
          order: {
            table: "Walk-in",
            orderType: "walk-in",
            orderItems: [
              {
                menuItemId: menuItemId,
                quantity: 1,
                price: parseFloat(data.itemPrice),
              },
            ],
            paymentMethod: "cash",
            amountPaid: parseFloat(data.itemPrice),
          },
        },
        { headers: { "x-store-id": storeId } },
      );

      dispatch(
        showNotification({
          message: "Experience initialized successfully.",
          status: 1,
        }),
      );

      // Delay to show the "Success" state then move into the app
      setTimeout(() => {
        window.location.href = "/app/dashboard";
      }, 2000);
    } catch (err) {
      console.error(err);
      dispatch(
        showNotification({
          message: "Configuration failed. Please try again.",
          status: 0,
        }),
      );
      setLoading(false);
      setCurrentStep(STEPS.BRAND); // Reset to first step on error
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Background Engine */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {/* Step 1: BRAND */}
          {currentStep === STEPS.BRAND && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-12 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row gap-16">
                <div className="flex-1 space-y-8">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-brand mb-4 block">
                      Initialization
                    </span>
                    <h2 className="text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                      Name your
                      <br />
                      restaurant.
                    </h2>
                    <p className="text-white/40 text-lg font-medium leading-relaxed">
                      Every great experience starts with an identity. How should
                      we refer to your space?
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <BuildingStorefrontIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                      <input
                        type="text"
                        placeholder="e.g. Blue Lagoon Bistro"
                        className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-16 pr-6 focus:outline-none focus:border-brand/50 text-xl font-bold placeholder:text-white/10 transition-all"
                        value={data.storeName}
                        onChange={(e) =>
                          updateData({ storeName: e.target.value })
                        }
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {["Cafe", "Fine Dining", "Quick Service"].map((type) => (
                        <button
                          key={type}
                          onClick={() => updateData({ storeType: type })}
                          className={`py-4 rounded-full border-2 font-bold text-xs uppercase tracking-widest transition-all ${
                            data.storeType === type
                              ? "border-brand bg-brand/10 text-brand"
                              : "border-white/5 bg-white/5 text-white/20 hover:border-white/20"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!data.storeName}
                    onClick={() => setCurrentStep(STEPS.MENU)}
                    className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-20 font-black py-6 rounded-full transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    Set Identity <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="hidden md:flex w-72 items-center justify-center bg-white/5 rounded-full border border-white/10 relative overflow-hidden">
                  <div className="text-center p-8">
                    <BuildingStorefrontIcon className="w-24 h-24 text-brand opacity-20 mx-auto mb-6" />
                    <div className="h-2 w-32 bg-white/10 rounded-full mx-auto mb-2" />
                    <div className="h-2 w-20 bg-white/5 rounded-full mx-auto" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: MENU (Category) */}
          {currentStep === STEPS.MENU && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-12"
            >
              <div className="max-w-xl mx-auto space-y-12">
                <div className="text-center">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-brand mb-4 block">
                    Organization
                  </span>
                  <h2 className="text-4xl font-black text-white mb-4">
                    First Category
                  </h2>
                  <p className="text-white/40 font-medium">
                    Categories help your kitchen team stay organized. What's the
                    main focus of your menu?
                  </p>
                </div>

                <div className="relative">
                  <RectangleStackIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                  <input
                    type="text"
                    placeholder="e.g. Signature Mains"
                    className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-16 pr-6 focus:outline-none focus:border-brand/50 text-xl font-bold placeholder:text-white/10"
                    value={data.categoryName}
                    onChange={(e) =>
                      updateData({ categoryName: e.target.value })
                    }
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentStep(STEPS.BRAND)}
                    className="py-6 rounded-full border border-white/10 font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    disabled={!data.categoryName}
                    onClick={() => setCurrentStep(STEPS.ITEM)}
                    className="py-6 rounded-full bg-brand text-white font-black uppercase tracking-widest hover:bg-brand-hover transition-all shadow-xl shadow-brand/20"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: ITEM */}
          {currentStep === STEPS.ITEM && (
            <motion.div
              key="item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-12"
            >
              <div className="max-w-xl mx-auto space-y-10">
                <div className="text-center">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-brand mb-4 block">
                    Products
                  </span>
                  <h2 className="text-4xl font-black text-white mb-4">
                    Add a Menu Item
                  </h2>
                  <p className="text-white/40 font-medium">
                    Add your first signature menu item to see the system in
                    action.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 flex-col md:flex-row">
                    <div>
                      <label htmlFor="itemName">Item Name</label>
                      <div className="flex-[3] relative">
                        <PlusIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                        <input
                          type="text"
                          placeholder="Item Name"
                          className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-16 pr-6 focus:outline-none focus:border-brand/50 text-xl font-bold"
                          value={data.itemName}
                          onChange={(e) =>
                            updateData({ itemName: e.target.value })
                          }
                          autoFocus
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="itemPrice">Price</label>
                      <div className="flex-1 relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-10 pr-6 focus:outline-none focus:border-brand/50 text-xl font-bold"
                          value={data.itemPrice}
                          onChange={(e) =>
                            updateData({ itemPrice: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentStep(STEPS.MENU)}
                    className="py-6 rounded-full border border-white/10 font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    disabled={!data.itemName}
                    onClick={() => setCurrentStep(STEPS.DEMO)}
                    className="py-6 rounded-full bg-white text-black font-black uppercase tracking-widest hover:bg-white/90 transition-all"
                  >
                    Preview Loop
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: DEMO (Mini POS) */}
          {currentStep === STEPS.DEMO && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-brand mb-4 block">
                  The Core Loop
                </span>
                <h2 className="text-4xl font-black text-white mb-4">
                  Pulse Test
                </h2>
                <p className="text-white/40 font-medium max-w-lg mx-auto">
                  This is a <strong>Mini-POS</strong>. Select your item, check
                  ticket, and fire it to the kitchen to verify the link.
                </p>
              </div>

              <MiniPOSDemo
                itemName={data.itemName}
                itemPrice={data.itemPrice}
                categoryName={data.categoryName}
                onOrderFired={handleLaunch}
              />
            </motion.div>
          )}

          {/* Step 5: LAUNCHING */}
          {currentStep === STEPS.LAUNCHING && (
            <motion.div
              key="launching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-12"
            >
              <div className="relative">
                <div className="w-32 h-32 bg-brand/20 rounded-full flex items-center justify-center mx-auto border border-brand/30 relative z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-t-2 border-brand rounded-full"
                  />
                  <CheckCircleIcon className="w-16 h-16 text-brand" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tight text-white">
                  Initializing...
                </h2>
                <p className="text-white/30 text-xl font-medium max-w-sm mx-auto">
                  Creating your store, configuring the menu, and calibrating
                  your workspace...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingWizard;
