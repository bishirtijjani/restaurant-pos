import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageTitle } from "../features/common/headerSlice";
import { getStores } from "../features/stores/storeSlice";
import { setActiveStore } from "../features/common/storeSlice";
import {
  BuildingStorefrontIcon,
  PlusIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import TitleCard from "../components/Cards/TitleCard";
import { useNavigate } from "react-router-dom";

import { openModal } from "../features/common/modalSlice";
import { MODAL_BODY_TYPES } from "../utils/globalConstantUtil";
import { clearCart } from "../features/orders/posSlice";
import {
  clearCurrentOrder,
  clearFilters,
} from "../features/orders/ordersSlice";
import { clearCurrentItem } from "../features/inventory/inventorySlice";
import { getGlobalOverview } from "../features/stores/storeSlice";
import GlobalStatsHeader from "../features/stores/components/GlobalStatsHeader";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

function StoreManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: stores,
    loading,
    globalOverview,
  } = useSelector((state) => state.stores);
  const { activeStoreId } = useSelector((state) => state.commonStore);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Store Management" }));
    dispatch(getStores());
    dispatch(getGlobalOverview());
  }, [dispatch]);

  const handleSelectStore = (storeId) => {
    // Clear all feature state before switching stores
    dispatch(clearCart());
    dispatch(clearCurrentOrder());
    dispatch(clearFilters());
    dispatch(clearCurrentItem());

    // Update active store
    dispatch(setActiveStore(storeId));

    // Force reload to ensure clean state
    navigate("/app/dashboard");
    window.location.reload();
  };

  const handleOpenAddStore = () => {
    dispatch(
      openModal({
        title: "Add New Store",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_STORE,
      })
    );
  };

  return (
    <TitleCard
      title="Your Stores"
      topMargin="mt-2"
      TopSideButtons={
        <button className="btn btn-primary btn-sm" onClick={handleOpenAddStore}>
          <PlusIcon className="w-5 h-5" /> New Store
        </button>
      }
    >
      <GlobalStatsHeader />

      {loading ? (
        <div className="text-center p-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, k) => {
            const isCurrent =
              (store._id || store.storeId?._id) === activeStoreId;
            // Handle structure difference if populate is deep or shallow
            const sData = store.storeId || store;

            // Link with global analytics data if available
            const liveData = globalOverview?.stores?.find(
              (s) => s.storeId === sData._id
            );

            return (
              <div
                key={k}
                className={`card w-full bg-base-100 shadow-xl border transition-all hover:shadow-2xl ${
                  isCurrent ? "border-primary border-2" : "border-base-200"
                }`}
              >
                <div className="card-body">
                  <h2 className="card-title flex justify-between">
                    <div className="flex items-center gap-2">
                      <BuildingStorefrontIcon className="w-6 h-6 text-primary" />
                      <span className="truncate">{sData.name}</span>
                    </div>
                    {isCurrent && (
                      <div className="badge badge-primary">Active</div>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />{" "}
                    {sData.location || "No location set"}
                  </p>

                  {/* Performance Sparkline */}
                  {liveData?.hourlyTrend && (
                    <div className="h-16 w-full mt-4 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={liveData.hourlyTrend}>
                          <defs>
                            <linearGradient
                              id={`colorRev-${k}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#22c55e"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#22c55e"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#colorRev-${k})`}
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Live Metrics Overlay (if available) */}
                  {liveData && (
                    <div className="grid grid-cols-2 gap-2 mt-4 py-3 bg-base-200/50 rounded-lg px-2">
                      <div className="text-center border-r border-base-300">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">
                          Revenue
                        </p>
                        <p className="text-sm font-bold text-success">
                          ₦{liveData.todayRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">
                          Orders
                        </p>
                        <p className="text-sm font-bold text-primary">
                          {liveData.todayOrderCount}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="card-actions justify-end mt-4">
                    {!isCurrent ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSelectStore(sData._id)}
                      >
                        Select Store
                      </button>
                    ) : (
                      <button className="btn btn-neutral btn-sm" disabled>
                        Selected
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate("/app/settings/general")}
                    >
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Placeholer Card */}
          <div
            onClick={handleOpenAddStore}
            className="card w-full bg-base-100 shadow-xl border border-dashed border-gray-400 flex justify-center items-center cursor-pointer hover:bg-base-200 transition-colors min-h-[200px]"
          >
            <div className="text-center">
              <PlusIcon className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="font-bold text-gray-500 mt-2">Add New Location</h3>
            </div>
          </div>
        </div>
      )}
    </TitleCard>
  );
}

export default StoreManagement;
