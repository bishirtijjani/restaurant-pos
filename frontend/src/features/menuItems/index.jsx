import React, { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllMenuItems,
  toggleMenuItemAvailability,
} from "./menuItemsSlice";
import SuspenseContent from "../../containers/SuspenseContent";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import InformationCircleIcon from "@heroicons/react/24/outline/InformationCircleIcon";
import CheckCircleIcon from "@heroicons/react/24/outline/CheckCircleIcon";
import XCircleIcon from "@heroicons/react/24/outline/XCircleIcon";
import FunnelIcon from "@heroicons/react/24/outline/FunnelIcon";
import PhotoIcon from "@heroicons/react/24/outline/PhotoIcon";
import ExclamationCircleIcon from "@heroicons/react/24/outline/ExclamationCircleIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import { formatCurrency } from "../../utils/numberFormat";
import { checkRole } from "../../utils/Helpers";
import SearchBar from "../../components/Input/SearchBar";
import { showNotification } from "../common/headerSlice";
import MenuItemCard from "./components/MenuItemCard";

const TopSideButtons = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  categories,
  setSelectedCategory,
  viewMode,
  setViewMode,
}) => {
  const dispatch = useDispatch();

  const openAddNewMenuItem = () => {
    dispatch(
      openModal({
        title: "Add New Menu Item",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_MENU_ITEM,
        size: "xl",
      })
    );
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center w-full gap-2 lg:gap-4 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full">
        <div className="w-full md:w-64">
          <SearchBar
            searchText={searchQuery}
            setSearchText={setSearchQuery}
            placeholderText="Search menu items..."
            styleClass="w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-sm btn-outline">
              <FunnelIcon className="w-4 h-4 mr-1" />
              {selectedCategory ? selectedCategory : "All Categories"}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-auto"
            >
              <li>
                <a
                  className={selectedCategory === "" ? "active" : ""}
                  onClick={() => setSelectedCategory("")}
                >
                  All Categories
                </a>
              </li>
              {categories.map((category, index) => (
                <li key={index}>
                  <a
                    className={selectedCategory === category ? "active" : ""}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="btn-group">
            <button
              className={`btn btn-sm ${
                viewMode === "grid" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              className={`btn btn-sm ${
                viewMode === "list" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("list")}
            >
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* for admin and manager only */}
        {(checkRole("admin") || checkRole("manager")) && (
          <button
            onClick={openAddNewMenuItem}
            className="btn btn-primary btn-sm md:btn-md"
          >
            <PlusCircleIcon className="w-5 h-5 mr-1" /> New Item
          </button>
        )}
        <button
          onClick={() => dispatch(fetchAllMenuItems())}
          className="btn btn-outline btn-sm md:btn-md"
          aria-label="Refresh"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const MenuItems = () => {
  const dispatch = useDispatch();
  const menuItems = useSelector((state) => state.menuItems.menuItems || []);
  const status = useSelector((state) => state.menuItems.status);
  const error = useSelector((state) => state.menuItems.error);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllMenuItems());
    }
  }, [dispatch, status]);

  // Extract unique categories
  const categories = [
    ...new Set(menuItems.map((item) => item.category || "Uncategorized")),
  ].sort();

  const handleToggleAvailability = (id) => {
    return dispatch(toggleMenuItemAvailability(id));
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  // Group menu items by category
  const groupedItems = {};
  filteredMenuItems.forEach((item) => {
    const cat = item.category || "Uncategorized";
    if (!groupedItems[cat]) {
      groupedItems[cat] = [];
    }
    groupedItems[cat].push(item);
  });

  // Error display component
  const ErrorDisplay = () => (
    <div className="bg-error bg-opacity-10 rounded-lg p-6 text-center">
      <ExclamationCircleIcon className="w-12 h-12 text-error mx-auto mb-3" />
      <h3 className="text-lg font-semibold mb-2">Error Loading Menu Items</h3>
      <p className="text-base-content/70 mb-4">
        {error?.message || "An unknown error occurred"}
      </p>
      <button
        onClick={() => dispatch(fetchAllMenuItems())}
        className="btn btn-error btn-sm"
      >
        <ArrowPathIcon className="w-4 h-4 mr-2" /> Try Again
      </button>
    </div>
  );

  // Grid view component
  const GridView = () => (
    <>
      {Object.keys(groupedItems).length > 0 ? (
        Object.keys(groupedItems)
          .sort()
          .map((category) => (
            <div key={category} className="mb-10">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedItems[category].map((item) => (
                  <MenuItemCard
                    key={item._id}
                    item={item}
                    handleToggleAvailability={handleToggleAvailability}
                  />
                ))}
              </div>
            </div>
          ))
      ) : (
        <EmptyState
          message="No menu items match your search"
          icon={<FunnelIcon className="w-12 h-12 text-base-content/30" />}
          helpText="Try changing your search or filter criteria"
        />
      )}
    </>
  );

  // List view component
  const ListView = () => (
    <>
      {Object.keys(groupedItems).length > 0 ? (
        Object.keys(groupedItems)
          .sort()
          .map((category) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">
                {category}
              </h3>
              <div className="overflow-x-auto w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Code</th>
                      <th>Prep Time</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedItems[category].map((item) => (
                      <tr key={item._id} className="hover">
                        <td className="font-medium">{item.name}</td>
                        <td>{item.category || "Uncategorized"}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.itemCode || "-"}</td>
                        <td>{item.preparationTime} mins</td>
                        <td>
                          <span
                            className={`badge ${
                              item.isAvailable ? "badge-success" : "badge-error"
                            } gap-1`}
                          >
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-center space-x-1">
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
                                item.isAvailable
                                  ? "Mark Unavailable"
                                  : "Mark Available"
                              }
                              onClick={() => handleToggleAvailability(item._id)}
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
      ) : (
        <EmptyState
          message="No menu items match your search"
          icon={<FunnelIcon className="w-12 h-12 text-base-content/30" />}
          helpText="Try changing your search or filter criteria"
        />
      )}
    </>
  );

  // Empty state component
  const EmptyState = ({ message, icon, helpText }) => (
    <div className="text-center py-16 bg-base-200 bg-opacity-50 rounded-lg">
      <div className="mx-auto w-16 h-16 mb-4 text-base-content/50">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      <p className="text-base-content/70 mb-6">{helpText}</p>
      {(checkRole("admin") || checkRole("manager")) && (
        <button
          onClick={() =>
            dispatch(
              openModal({
                title: "Add New Menu Item",
                bodyType: MODAL_BODY_TYPES.ADD_NEW_MENU_ITEM,
                size: "xl",
              })
            )
          }
          className="btn btn-primary"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Menu Item
        </button>
      )}
    </div>
  );

  return (
    <TitleCard title="Menu Items" topMargin="mt-2">
      <TopSideButtons
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {error ? (
        <ErrorDisplay />
      ) : filteredMenuItems.length === 0 &&
        !selectedCategory &&
        !searchQuery ? (
        <EmptyState
          message="No menu items found"
          icon={<DocumentTextIcon className="w-full h-full" />}
          helpText="Start by adding your first menu item"
        />
      ) : viewMode === "grid" ? (
        <GridView />
      ) : (
        <ListView />
      )}
    </TitleCard>
  );
};

export default MenuItems;
