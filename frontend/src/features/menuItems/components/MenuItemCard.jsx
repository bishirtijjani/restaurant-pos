import { showNotification } from "../../common/headerSlice";
import React from "react";
import { openModal } from "../../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../../utils/globalConstantUtil";
import { useDispatch } from "react-redux";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import InformationCircleIcon from "@heroicons/react/24/outline/InformationCircleIcon";
import CheckCircleIcon from "@heroicons/react/24/outline/CheckCircleIcon";
import XCircleIcon from "@heroicons/react/24/outline/XCircleIcon";
import PhotoIcon from "@heroicons/react/24/outline/PhotoIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import { formatCurrency } from "../../../utils/numberFormat";
import { checkRole } from "../../../utils/Helpers";

// Clock icon component
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const MenuItemCard = ({ item, handleToggleAvailability }) => {
  const dispatch = useDispatch();
  const placeholderImage = "https://placehold.co/400x300?text=No+Image";

  const handleStatusToggle = () => {
    dispatch(handleToggleAvailability(item._id))
      .then(() => {
        // Call your custom notification function with success message and status 1 (good)

        dispatch(
          showNotification({
            message: `${item.name} is now ${
              item.isAvailable ? "unavailable" : "available"
            }`,
            status: 1,
          })
        );
      })
      .catch(() => {
        // Call your custom notification function with error message and status 0 (error)
        dispatch(showNotification({ message: "Action failed", status: 0 }));
      });
  };

  return (
    <div className="card border border-neutral bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300">
      <figure className="h-48 relative border-b border-neutral">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-base-200 flex items-center justify-center">
            <PhotoIcon className="w-12 h-12 " />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`badge ${
              item.isAvailable ? "badge-success" : "badge-error"
            } font-medium`}
          >
            {item.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
        {item.popularity > 3 && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-warning font-medium">Popular</span>
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <h2
            className="card-title text-lg font-bold line-clamp-1"
            title={item.name}
          >
            {item.name}
          </h2>
          <div className="text-lg font-bold text-primary">
            {formatCurrency(item.price)}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-base-content/70 mt-1">
          <span className="flex items-center gap-1">
            <DocumentTextIcon className="w-4 h-4" />
            {item.itemCode || "No Code"}
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon /> {item.preparationTime} mins
          </span>
        </div>

        {item.description && (
          <p className="text-sm mt-2 line-clamp-2" title={item.description}>
            {item.description}
          </p>
        )}

        <div className="card-actions justify-end mt-4">
          <div className="flex gap-1">
            <button
              className="btn btn-sm btn-ghost tooltip"
              data-tip="View Details"
              onClick={() =>
                dispatch(
                  openModal({
                    title: "Menu Item Details",
                    bodyType: MODAL_BODY_TYPES.VIEW_MENU_ITEM,
                    extraObject: { ...item },
                  })
                )
              }
            >
              <InformationCircleIcon className="w-5 h-5" />
            </button>

            <button
              className="btn btn-sm btn-ghost tooltip"
              data-tip={
                item.isAvailable ? "Mark Unavailable" : "Mark Available"
              }
              onClick={handleStatusToggle}
            >
              {item.isAvailable ? (
                <XCircleIcon className="w-5 h-5 text-error" />
              ) : (
                <CheckCircleIcon className="w-5 h-5 text-success" />
              )}
            </button>

            {(checkRole("admin") || checkRole("manager")) && (
              <button
                className="btn btn-sm btn-ghost tooltip"
                data-tip="Edit Item"
                onClick={() =>
                  dispatch(
                    openModal({
                      title: "Edit Menu Item",
                      bodyType: MODAL_BODY_TYPES.EDIT_MENU_ITEM,
                      extraObject: item,
                    })
                  )
                }
              >
                <PencilSquareIcon className="w-5 h-5" />
              </button>
            )}

            {checkRole("admin") && (
              <button
                className="btn btn-sm btn-ghost tooltip"
                data-tip="Delete Item"
                onClick={() =>
                  dispatch(
                    openModal({
                      title: "Delete Menu Item",
                      bodyType: MODAL_BODY_TYPES.CONFIRMATION,
                      extraObject: {
                        message: `Are you sure you want to delete ${item.name} from the menu?`,
                        type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_MENU_ITEM,
                        id: item._id,
                      },
                    })
                  )
                }
              >
                <TrashIcon className="w-5 h-5 text-error" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
