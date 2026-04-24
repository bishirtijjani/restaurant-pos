import React, { useState, useEffect } from "react";
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
  ChevronLeftIcon,
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

const STEP_CONFIG = [
  { id: STEPS.BRAND, label: "Brand", icon: BuildingStorefrontIcon },
  { id: STEPS.MENU, label: "Menu", icon: RectangleStackIcon },
  { id: STEPS.ITEM, label: "Item", icon: PlusIcon },
  { id: STEPS.DEMO, label: "Demo", icon: BoltIcon },
  { id: STEPS.LAUNCHING, label: "Launch", icon: RocketLaunchIcon },
];

const OnboardingWizard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState(STEPS.BRAND);
  const [loading, setLoading] = useState(false);
  const [orderFired, setOrderFired] = useState(false);

  // Redirect super admins to platform admin dashboard
  useEffect(() => {
    if (user?.isSuperAdmin) {
      navigate("/super-admin", { replace: true });
    }
  }, [user, navigate]);

  // Unified data state
  const [data, setData] = useState({
    storeName: "",
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
          settings: {},
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
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6">
        {/* Step Progress Indicator */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 md:p-6 shadow-xl shadow-gray-300/40">
            {/* Progress Bar */}
            <div className="relative mb-6">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2" />
              <motion.div
                className="absolute top-1/2 left-0 h-1 bg-brand rounded-full -translate-y-1/2 transition-all duration-500"
                style={{ width: `${(currentStep / (STEP_CONFIG.length - 1)) * 100}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between items-center relative">
              {STEP_CONFIG.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isClickable = currentStep > step.id; // Can go back to completed steps

                return (
                  <div key={step.id} className="flex flex-col items-center gap-2">
                    <motion.button
                      whileHover={isClickable ? { scale: 1.1 } : {}}
                      whileTap={isClickable ? { scale: 0.95 } : {}}
                      onClick={() => isClickable && setCurrentStep(step.id)}
                      disabled={!isClickable && !isCurrent}
                      className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-brand text-white shadow-lg shadow-brand/30 cursor-pointer"
                          : isCurrent
                            ? "bg-gray-900 text-white shadow-lg shadow-gray-900/30 ring-4 ring-gray-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                      )}
                      {isCurrent && (
                        <motion.div
                          layoutId="currentStep"
                          className="absolute -inset-1 rounded-full border-2 border-brand/30"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    <span
                      className={`text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors ${
                        isCompleted
                          ? "text-brand"
                          : isCurrent
                            ? "text-gray-900"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step Info & Back Button */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {currentStep > STEPS.BRAND && currentStep < STEPS.LAUNCHING && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors group"
                  >
                    <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back
                  </button>
                )}
              </div>
              <span className="text-gray-500 font-semibold text-xs md:text-sm">
                Step {currentStep + 1} of {STEP_CONFIG.length}
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: BRAND */}
          {currentStep === STEPS.BRAND && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-gray-200 rounded-2xl md:rounded-[40px] p-6 md:p-12 shadow-2xl shadow-gray-300/60"
            >
              <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                <div className="flex-1 space-y-6 md:space-y-8">
                  <div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-brand mb-3 md:mb-4 block">
                      Initialization
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3 md:mb-4 leading-tight">
                      Name your
                      <br />
                      restaurant.
                    </h2>
                    <p className="text-gray-600 text-sm md:text-lg font-medium leading-relaxed">
                      Every great experience starts with an identity. How should
                      we refer to your space?
                    </p>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <div className="relative">
                      <BuildingStorefrontIcon className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                      <input
                        type="text"
                        placeholder="e.g. Blue Lagoon Bistro"
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-full py-4 md:py-6 pl-12 md:pl-16 pr-4 md:pr-6 focus:outline-none focus:border-brand text-base md:text-xl font-bold text-gray-900 placeholder:text-gray-500 transition-all shadow-inner"
                        value={data.storeName}
                        onChange={(e) =>
                          updateData({ storeName: e.target.value })
                        }
                        autoFocus
                      />
                    </div>

                  </div>

                  <div className="flex gap-3 md:gap-4">
                    <button
                      disabled={!data.storeName}
                      onClick={() => setCurrentStep(STEPS.MENU)}
                      className="flex-1 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed font-black py-4 md:py-6 rounded-full transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg"
                    >
                      Set Identity <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
                <div className="hidden md:flex w-72 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border-2 border-gray-300 relative overflow-hidden shadow-inner">
                  <div className="text-center p-8">
                    <BuildingStorefrontIcon className="w-24 h-24 text-brand/50 mx-auto mb-6" />
                    <div className="h-2 w-32 bg-gray-300 rounded-full mx-auto mb-2" />
                    <div className="h-2 w-20 bg-gray-200 rounded-full mx-auto" />
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
              className="bg-white border border-gray-200 rounded-2xl md:rounded-[40px] p-6 md:p-12 shadow-2xl shadow-gray-300/60"
            >
              <div className="max-w-xl mx-auto space-y-6 md:space-y-12">
                <div className="text-center">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-brand mb-3 md:mb-4 block">
                    Organization
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 md:mb-4">
                    First Category
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base font-medium">
                    Categories help your kitchen team stay organized. What's the
                    main focus of your menu?
                  </p>
                </div>

                <div className="relative">
                  <RectangleStackIcon className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                  <input
                    type="text"
                    placeholder="e.g. Signature Mains"
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-full py-4 md:py-6 pl-12 md:pl-16 pr-4 md:pr-6 focus:outline-none focus:border-brand text-base md:text-xl font-bold text-gray-900 placeholder:text-gray-500 shadow-inner"
                    value={data.categoryName}
                    onChange={(e) =>
                      updateData({ categoryName: e.target.value })
                    }
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <button
                    onClick={() => setCurrentStep(STEPS.BRAND)}
                    className="py-4 md:py-6 rounded-full border-2 border-gray-300 font-black uppercase tracking-widest text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    disabled={!data.categoryName}
                    onClick={() => setCurrentStep(STEPS.ITEM)}
                    className="py-4 md:py-6 rounded-full bg-brand text-white font-black uppercase tracking-widest hover:bg-brand-hover transition-all shadow-xl shadow-brand/30 text-sm md:text-base"
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
              className="bg-white border border-gray-200 rounded-2xl md:rounded-[40px] p-6 md:p-12 shadow-2xl shadow-gray-300/60"
            >
              <div className="max-w-xl mx-auto space-y-6 md:space-y-10">
                <div className="text-center">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-brand mb-3 md:mb-4 block">
                    Products
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 md:mb-4">
                    Add a Menu Item
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base font-medium">
                    Add your first signature menu item to see the system in
                    action.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 md:gap-4 flex-col md:flex-row">
                    <div className="flex-[3]">
                      <label className="text-[10px] md:text-xs uppercase tracking-wider text-gray-600 mb-1 block font-bold">Item Name</label>
                      <div className="relative">
                        <PlusIcon className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                        <input
                          type="text"
                          id="itemName"
                          placeholder="Item Name"
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-full py-3 md:py-4 pl-12 md:pl-16 pr-4 md:pr-6 focus:outline-none focus:border-brand text-base md:text-lg font-bold text-gray-900 placeholder:text-gray-500 shadow-inner"
                          value={data.itemName}
                          onChange={(e) =>
                            updateData({ itemName: e.target.value })
                          }
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] md:text-xs uppercase tracking-wider text-gray-600 mb-1 block font-bold">Price</label>
                      <div className="relative">
                        <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm md:text-base">
                          $
                        </span>
                        <input
                          type="number"
                          id="itemPrice"
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-full py-3 md:py-4 pl-10 md:pl-10 pr-4 md:pr-6 focus:outline-none focus:border-brand text-base md:text-lg font-bold text-gray-900 shadow-inner"
                          value={data.itemPrice}
                          onChange={(e) =>
                            updateData({ itemPrice: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <button
                    onClick={() => setCurrentStep(STEPS.MENU)}
                    className="py-4 md:py-6 rounded-full border-2 border-gray-300 font-black uppercase tracking-widest text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    disabled={!data.itemName}
                    onClick={() => setCurrentStep(STEPS.DEMO)}
                    className="py-4 md:py-6 rounded-full bg-gray-900 text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg text-sm md:text-base"
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
              <div className="text-center mb-4 md:mb-8">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-brand mb-2 md:mb-4 block">
                  The Core Loop
                </span>
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 md:mb-4">
                  Pulse Test
                </h2>
                <p className="text-gray-600 text-sm md:text-base font-medium max-w-lg mx-auto px-4">
                  This is a <strong className="text-gray-900">Mini-POS</strong>. Select your item, check
                  ticket, and fire it to the kitchen to verify the link.
                </p>
              </div>

              <MiniPOSDemo
                itemName={data.itemName}
                itemPrice={data.itemPrice}
                categoryName={data.categoryName}
                onOrderFired={handleLaunch}
              />

              {/* Back Button for Demo Step */}
              <div className="flex justify-center mt-4 md:mt-6">
                <button
                  onClick={() => setCurrentStep(STEPS.ITEM)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors group bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md"
                >
                  <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Back to Item Setup
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: LAUNCHING */}
          {currentStep === STEPS.LAUNCHING && (
            <motion.div
              key="launching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6 md:space-y-12 px-4"
            >
              <div className="relative">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-brand/10 rounded-full flex items-center justify-center mx-auto border border-brand/20 relative z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-t-2 border-brand rounded-full"
                  />
                  <CheckCircleIcon className="w-10 h-10 md:w-16 md:h-16 text-brand" />
                </div>
              </div>

              <div className="space-y-2 md:space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">
                  Initializing...
                </h2>
                <p className="text-gray-600 text-base md:text-xl font-medium max-w-sm mx-auto">
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
