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
import TitleCard from "../../components/Cards/TitleCard";

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
        // Show success notification
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

  const getStatusBadge = (status) => {
    return status === "published" ? (
      <span className="badge badge-success">Published</span>
    ) : (
      <span className="badge badge-warning">Draft</span>
    );
  };

  return (
    <TitleCard
      title="Brand Catalog"
      topMargin="mt-2"
      TopSideButtons={
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleEdit(null)}
        >
          + Create Master Item
        </button>
      }
    >
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="select select-bordered select-sm"
          value={filters.status}
          onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Grid View */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No master items yet. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="card bg-base-100 shadow-md">
              {item.image && (
                <figure>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-48 w-full object-cover"
                  />
                </figure>
              )}
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title">{item.name}</h2>
                  {getStatusBadge(item.publishStatus)}
                </div>
                <p className="text-sm text-gray-600">{item.category}</p>
                <p className="text-lg font-bold">${item.price}</p>
                {item.description && (
                  <p className="text-sm">{item.description}</p>
                )}
                <div className="text-xs text-gray-500">
                  Version: {item.version} | Last published:{" "}
                  {item.lastPublishedAt
                    ? new Date(item.lastPublishedAt).toLocaleDateString()
                    : "Never"}
                </div>
                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handlePublish(item._id)}
                    disabled={publishingId === item._id}
                  >
                    {publishingId === item._id ? "Publishing..." : "Publish"}
                  </button>
                  <button
                    className="btn btn-sm btn-error btn-ghost"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </TitleCard>
  );
}

export default BrandCatalog;
