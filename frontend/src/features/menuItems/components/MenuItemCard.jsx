import { showNotification } from "../../common/headerSlice";
import React from "react";
import { openModal } from "../../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../../utils/globalConstantUtil";
import { useDispatch } from "react-redux";
import {
  Trash2,
  Info,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  FileText,
  Pencil,
  Clock,
  Plus,
} from "lucide-react";
import { formatCurrency } from "../../../utils/numberFormat";
import { useAuth } from "../../../utils/permission";
import Can from "../../../components/Auth/Can";
import { DIETARY_TAG_STYLES } from "../../../utils/dietaryConstants";

const MenuItemCard = ({ item, handleToggleAvailability }) => {
  const dispatch = useDispatch();
  const { can } = useAuth();

  const handleStatusToggle = () => {
    if (!can("viewMenu")) {
      dispatch(
        showNotification({
          message: "You don't have permission to update menu items",
          status: 0,
        })
      );
      return;
    }

    dispatch(handleToggleAvailability(item._id))
      .then(() => {
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
            <ImageIcon className="w-12 h-12 " />
          </div>
        )}
        {item.addOnGroups?.length > 0 && (
          <div className="absolute top-2 left-2">
            <div className="badge badge-secondary gap-1 shadow-sm">
              <Plus className="w-3 h-3" /> Add-ons
            </div>
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
            <FileText className="w-4 h-4" />
            {item.itemCode || "No Code"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {item.preparationTime} mins
          </span>
        </div>

        {item.description && (
          <p className="text-sm mt-2 line-clamp-2" title={item.description}>
            {item.description}
          </p>
        )}

        {/* Dietary Tags & Allergens */}
        <div className="flex flex-wrap gap-1 mt-2">
          {item.dietaryTags?.map((tag) => {
            const style = DIETARY_TAG_STYLES[tag] || {
              icon: "",
              color: "bg-base-200 text-base-content",
            };
            return (
              <span
                key={tag}
                className={`badge badge-sm border ${style.color} font-medium gap-1`}
                title={tag}
              >
                {style.icon && <span>{style.icon}</span>}
                {tag}
              </span>
            );
          })}
          {item.allergens?.length > 0 && (
            <span
              className="badge badge-sm border bg-red-50 text-red-700 border-red-200 font-medium"
              title={`Contains: ${item.allergens.join(", ")}`}
            >
              ⚠️ Allergens
            </span>
          )}
        </div>

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
              <Info className="w-5 h-5" />
            </button>

            {can("viewMenu") && (
              <button
                className="btn btn-sm btn-ghost tooltip"
                data-tip={
                  item.isAvailable ? "Mark Unavailable" : "Mark Available"
                }
                onClick={handleStatusToggle}
              >
                {item.isAvailable ? (
                  <XCircle className="w-5 h-5 text-error" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
              </button>
            )}

            <Can do="editMenu">
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
                <Pencil className="w-5 h-5" />
              </button>
            </Can>

            <Can do="deleteMenu">
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
                <Trash2 className="w-5 h-5 text-error" />
              </button>
            </Can>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
