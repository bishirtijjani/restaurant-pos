import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandMenu,
  publishMasterItem,
  deleteMasterItem,
  setFilters,
} from "./brandMenuSlice";
import { openModal } from "../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
import {
  Package,
  Plus,
  ArrowUpRight,
  Edit2,
  Trash2,
  ChevronRight,
  Layers,
  Filter,
} from "lucide-react";

function BrandCatalog() {
  const dispatch = useDispatch();
  const { items, isLoading, filters } = useSelector((state) => state.brandMenu);
  const [publishingId, setPublishingId] = useState(null);

  useEffect(() => {
    dispatch(fetchBrandMenu(filters));
  }, [dispatch, filters]);

  const handlePublish = async (id) => {
    if (window.confirm("Publish this item to all stores?")) {
      setPublishingId(id);
      try {
        await dispatch(publishMasterItem(id)).unwrap();
        dispatch({
          type: "header/showNotification",
          payload: {
            message: "Item published! Syncing to stores...",
            status: 1,
          },
        });
      } catch (error) {
        dispatch({
          type: "header/showNotification",
          payload: { message: error, status: 0 },
        });
      } finally {
        setPublishingId(null);
      }
    }
  };

  const handleEdit = (item) => {
    dispatch(
      openModal({
        title: item ? "Edit Master Item" : "Create Master Item",
        bodyType: MODAL_BODY_TYPES.BRAND_MENU_FORM,
        extraObject: item,
        size: "lg",
      })
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this master item?")) {
      try {
        await dispatch(deleteMasterItem(id)).unwrap();
        dispatch({
          type: "header/showNotification",
          payload: { message: "Item deleted", status: 1 },
        });
      } catch (error) {
        dispatch({
          type: "header/showNotification",
          payload: { message: error, status: 0 },
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Catalog</h1>
          <p className="text-base-content/60 text-sm">
            Manage your master menu items and sync them across all locations.
          </p>
        </div>
        <button
          className="btn btn-primary shadow-lg shadow-primary/20 gap-2"
          onClick={() => handleEdit(null)}
        >
          <Plus size={20} />
          Create Master Item
        </button>
      </div>

      {/* Stats/Quick Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stats shadow bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Package size={24} />
            </div>
            <div className="stat-title text-xs font-semibold uppercase">
              Total Items
            </div>
            <div className="stat-value text-2xl">{items.length}</div>
          </div>
        </div>
        <div
          onClick={() =>
            dispatch(setFilters({ ...filters, status: "published" }))
          }
          className={`stats shadow bg-base-100 border transition-all cursor-pointer hover:border-success/50 ${
            filters.status === "published"
              ? "border-success ring-1 ring-success"
              : "border-base-200"
          }`}
        >
          <div className="stat">
            <div className="stat-figure text-success">
              <Layers size={24} />
            </div>
            <div className="stat-title text-xs font-semibold uppercase">
              Published
            </div>
            <div className="stat-value text-2xl text-success">
              {items.filter((i) => i.publishStatus === "published").length}
            </div>
          </div>
        </div>
        <div
          onClick={() => dispatch(setFilters({ ...filters, status: "draft" }))}
          className={`stats shadow bg-base-100 border transition-all cursor-pointer hover:border-warning/50 ${
            filters.status === "draft"
              ? "border-warning ring-1 ring-warning"
              : "border-base-200"
          }`}
        >
          <div className="stat">
            <div className="stat-figure text-warning">
              <Edit2 size={24} />
            </div>
            <div className="stat-title text-xs font-semibold uppercase">
              Drafts
            </div>
            <div className="stat-value text-2xl text-warning">
              {items.filter((i) => i.publishStatus === "draft").length}
            </div>
          </div>
        </div>
        <div className="flex items-center px-4 bg-base-200/50 rounded-2xl border border-dashed border-base-300">
          <div className="flex items-center gap-3 w-full">
            <Filter size={18} className="opacity-50" />
            <select
              className="select select-ghost select-sm w-full focus:bg-transparent"
              value={filters.status}
              onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
            >
              <option value="all">Every Status</option>
              <option value="draft">Only Drafts</option>
              <option value="published">Only Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm opacity-50">Fetching your brand catalog...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card bg-base-100 border-2 border-dashed border-base-300 rounded-3xl p-12">
          <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-6">
              <Package size={40} className="opacity-20" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your Catalog is Empty</h3>
            <p className="text-sm opacity-50 mb-8">
              Looks like you haven't added any master items yet. Create your
              first item to start building your brand menu.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => handleEdit(null)}
            >
              Start Building
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="group card bg-base-100 shadow-sm border border-base-200 hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-base-200 flex items-center justify-center">
                    <Package size={48} className="opacity-10" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <div
                    className={`badge ${
                      item.publishStatus === "published"
                        ? "badge-success text-white"
                        : "badge-warning"
                    } border-none shadow-md font-bold text-[10px] uppercase tracking-wider px-3 py-2`}
                  >
                    {item.publishStatus}
                  </div>
                </div>
                {/* Quick Actions Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <button
                    className="btn btn-circle btn-sm bg-white hover:bg-white text-black border-none"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn btn-circle btn-sm bg-error hover:bg-error text-white border-none"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="card-body p-6">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="card-title text-lg">{item.name}</h2>
                  <div className="text-primary font-bold text-xl">
                    ${item.price}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/70 uppercase tracking-tight mb-3">
                  <ChevronRight size={12} />
                  {item.category}
                </div>

                <p className="text-sm opacity-60 line-clamp-2 h-10 mb-4">
                  {item.description || "No description provided."}
                </p>

                <div className="divider my-0 opacity-10"></div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-40 font-bold">
                      Version
                    </span>
                    <span className="text-xs font-mono">{item.version}.0</span>
                  </div>
                  <button
                    className={`btn btn-sm ${
                      item.publishStatus === "published"
                        ? "btn-ghost"
                        : "btn-primary"
                    } gap-2 rounded-xl px-4`}
                    onClick={() => handlePublish(item._id)}
                    disabled={publishingId === item._id}
                  >
                    {publishingId === item._id ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>
                        <ArrowUpRight size={14} />
                        {item.publishStatus === "published"
                          ? "Update"
                          : "Publish"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrandCatalog;
