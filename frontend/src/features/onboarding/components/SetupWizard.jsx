import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  RocketLaunchIcon,
  BuildingStorefrontIcon,
  Square3Stack3DIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  PresentationChartLineIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { createStore } from "../../stores/storeSlice";
import { setActiveStore } from "../../common/storeSlice";
import { showNotification } from "../../common/headerSlice";

const STEPS = [
  { id: "identity", title: "Restaurant Info", icon: BuildingStorefrontIcon },
  { id: "menu", title: "Initial Menu", icon: Square3Stack3DIcon },
  { id: "flow", title: "System Demo", icon: BoltIcon },
];

function SetupWizard({ closeModal }) {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    storeName: "",
    storeType: "Cafe",
    categoryName: "Mains",
    itemName: "Signature Dish",
    price: "15.00",
  });

  const [orderFired, setOrderFired] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Create Store
      const storeResult = await dispatch(
        createStore({
          name: formData.storeName,
          settings: {},
        }),
      ).unwrap();

      // 2. Set Active Store
      dispatch(setActiveStore(storeResult._id));

      // Note: Category and Item creation would ideally happen here too via API calls
      // but for this MVP wizard, we focus on the "Aha!" moment and creating the store.

      dispatch(
        showNotification({
          message: "Account and store setup completed.",
          status: 1,
        }),
      );
      closeModal();
      window.location.reload();
    } catch (err) {
      dispatch(
        showNotification({
          message: err || "Failed to complete setup",
          status: 0,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepIcon = (Icon, index) => {
    const isActive = index === currentStep;
    const isCompleted = index < currentStep;
    return (
      <div className={`flex flex-col items-center gap-1 relative`}>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
            isActive
              ? "bg-primary text-primary-content scale-110 shadow-lg shadow-primary/20"
              : isCompleted
                ? "bg-success text-success-content"
                : "bg-base-200 text-base-content/30"
          }`}
        >
          {isCompleted ? (
            <CheckCircleIcon className="w-6 h-6" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            isActive ? "text-primary" : "text-base-content/30"
          }`}
        >
          {STEPS[index].title}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-2">
      {/* Header / Stepper */}
      <div className="flex justify-between items-center mb-12 px-8">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            {renderStepIcon(step.icon, i)}
            {i < STEPS.length - 1 && (
              <div
                className={`h-[2px] flex-1 mx-4 transition-all duration-500 ${
                  i < currentStep ? "bg-success" : "bg-base-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-3xl font-black tracking-tight mb-2">
                  Tell us about your restaurant
                </h2>
                <p className="opacity-60">
                  Enter your store name and type to get started.
                </p>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Restaurant Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mama's Kitchen"
                  className="input input-bordered input-lg bg-base-100 focus:input-primary transition-all"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Business Type</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Cafe", "Fine Dining", "Quick Service"].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setFormData({ ...formData, storeType: type })
                      }
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        formData.storeType === type
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-base-200 hover:border-base-300"
                      }`}
                    >
                      <BuildingStorefrontIcon className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase">
                        {type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-3xl font-black tracking-tight mb-2">
                  Add your first items
                </h2>
                <p className="opacity-60">
                  Set up a category and a signature menu item.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Category</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pizzas"
                    className="input input-bordered bg-base-100"
                    value={formData.categoryName}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryName: e.target.value })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Price ($)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="15.00"
                    className="input input-bordered bg-base-100"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Item Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Margherita"
                  className="input input-bordered input-lg bg-base-100"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-3xl font-black tracking-tight mb-2">
                  See how it works
                </h2>
                <p className="opacity-60">
                  Experience real-time sync between the POS and the kitchen.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-base-300/50 p-6 rounded-[32px] border-4 border-base-300">
                {/* Simulated POS */}
                <div className="bg-base-100 p-4 rounded-2xl shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-base-200 pb-2">
                    <ShoppingBagIcon className="w-5 h-5 text-primary" />
                    <span className="font-bold text-xs uppercase tracking-widest">
                      Mobile POS
                    </span>
                  </div>
                  <div className="bg-base-200/50 p-4 rounded-xl flex justify-between items-center border border-dashed border-base-300">
                    <div>
                      <div className="font-black text-sm">
                        {formData.itemName}
                      </div>
                      <div className="text-[10px] opacity-50 uppercase font-bold">
                        {formData.categoryName}
                      </div>
                    </div>
                    <div className="font-black text-primary">
                      ${formData.price}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setOrderFired(true);
                      setTimeout(() => setOrderFired(false), 3000);
                    }}
                    className={`btn btn-primary btn-md gap-2 ${
                      orderFired ? "btn-disabled opacity-50" : ""
                    }`}
                  >
                    <BoltIcon className="w-4 h-4" />
                    FIRE ORDER
                  </button>
                </div>

                {/* Simulated KDS */}
                <div className="bg-neutral p-4 rounded-2xl shadow-xl flex flex-col gap-4 text-neutral-content">
                  <div className="flex items-center gap-2 border-b border-neutral-content/10 pb-2">
                    <PresentationChartLineIcon className="w-5 h-5 text-accent" />
                    <span className="font-bold text-xs uppercase tracking-widest">
                      Kitchen Display (KDS)
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center items-center gap-4 relative">
                    <AnimatePresence>
                      {orderFired ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          className="bg-accent text-accent-content p-4 rounded-xl flex flex-col gap-1 w-full border-2 border-white/20"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-black text-xs uppercase">
                              NEW ORDER #001
                            </span>
                            <span className="badge badge-sm font-bold">
                              NOW
                            </span>
                          </div>
                          <div className="font-black text-lg">
                            {formData.itemName}
                          </div>
                          <div className="h-1 bg-white/20 w-full rounded-full mt-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 2.5 }}
                              className="h-full bg-white"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-center opacity-20 flex flex-col items-center gap-2">
                          <BoltIcon className="w-12 h-12" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Waiting for orders...
                          </span>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="mt-12 flex justify-between items-center pt-6 border-t border-base-200">
        <button
          onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
          className={`btn btn-ghost ${currentStep === 0 ? "invisible" : ""}`}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={(currentStep === 0 && !formData.storeName) || loading}
          className="btn btn-primary btn-wide rounded-full font-black uppercase tracking-widest gap-2"
        >
          {loading && <span className="loading loading-spinner"></span>}
          {currentStep === STEPS.length - 1 ? "Complete Setup" : "Continue"}
          {!loading && <RocketLaunchIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

export default SetupWizard;
