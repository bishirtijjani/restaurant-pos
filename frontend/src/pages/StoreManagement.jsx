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

function StoreManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: stores, loading } = useSelector((state) => state.stores);
  const { activeStoreId } = useSelector((state) => state.commonStore);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Store Management" }));
    dispatch(getStores());
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

            return (
              <div
                key={k}
                className={`card w-full bg-base-100 shadow-xl border ${
                  isCurrent ? "border-primary border-2" : "border-base-200"
                }`}
              >
                <div className="card-body">
                  <h2 className="card-title flex justify-between">
                    <div className="flex items-center gap-2">
                      <BuildingStorefrontIcon className="w-6 h-6 text-primary" />
                      {sData.name}
                    </div>
                    {isCurrent && (
                      <div className="badge badge-primary">Active</div>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />{" "}
                    {sData.location || "No location set"}
                  </p>
                  <p className="text-xs mt-2 truncate">{sData._id}</p>

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
                    <button className="btn btn-ghost btn-sm">Settings</button>
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
