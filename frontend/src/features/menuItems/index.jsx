import React, { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import SearchBar from "../../components/Input/SearchBar";
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
import MenuItemCard from "./components/MenuItemCard";
import { formatCurrency } from "../../utils/numberFormat";
import {
  PlusCircle,
  RefreshCw,
  MoreVertical,
  SquareGanttChart,
  Filter,
  AlertCircle,
  Info,
  XCircle,
  CheckCircle,
  Pencil,
  Trash2,
  FileText,
  Table,
} from "lucide-react";
import Can from "../../components/Auth/Can";
import { useAuth } from "../../utils/permission";

const TopSideButtons = () => {
  const dispatch = useDispatch();
  const { can } = useAuth();

  const openAddNewMenuItem = () => {
    dispatch(
      openModal({
        title: "Add New Menu Item",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_MENU_ITEM,
        size: "xl",
      })
    );
  };

  const onRefresh = () => {
    dispatch(fetchAllMenuItems());
  };

  return (
    <div className="flex items-center gap-2">
      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="btn btn-ghost btn-sm btn-circle"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <Can do="editMenu">
          <button
            onClick={openAddNewMenuItem}
            className="btn btn-primary btn-sm gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Item</span>
          </button>
        </Can>
      </div>

      {/* Mobile View - Single Dropdown */}
      <div className="sm:hidden dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
          <MoreVertical className="w-5 h-5" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52 mt-2 z-[1000] border border-base-200"
        >
          <li>
            <button onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" /> Refresh Data
            </button>
          </li>
          <div className="divider my-1"></div>
          <Can do="editMenu">
            <li>
              <button
                onClick={openAddNewMenuItem}
                className="text-primary font-medium"
              >
                <PlusCircle className="w-4 h-4" /> Add New Item
              </button>
            </li>
          </Can>
        </ul>
      </div>
    </div>
  );
};

const MenuItems = () => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const menuItems = useSelector((state) => state.menuItems.menuItems || []);
  const status = useSelector((state) => state.menuItems.status);
  const error = useSelector((state) => state.menuItems.error);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState("cards");

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
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <AlertCircle className="w-12 h-12 text-error mx-auto mb-3" />
      <h3 className="text-lg font-semibold mb-2">Error Loading Menu Items</h3>
      <p className="text-base-content/70 mb-4">
        {error?.message || "An unknown error occurred"}
      </p>
      <button
        onClick={() => dispatch(fetchAllMenuItems())}
        className="btn btn-error btn-sm"
      >
        <RefreshCw className="w-4 h-4 mr-2" /> Try Again
      </button>
    </div>
  );

  // card view component
  const CardView = () => (
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
          icon={<Filter className="w-12 h-12 text-base-content/30" />}
          helpText="Try changing your search or filter criteria"
        />
      )}
    </>
  );

  // Table view component
  const TableView = () => (
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
                              <Info className="w-5 h-5" />
                            </button>

                            {can("viewMenu") && (
                              <button
                                className="btn btn-sm btn-ghost tooltip"
                                data-tip={
                                  item.isAvailable
                                    ? "Mark Unavailable"
                                    : "Mark Available"
                                }
                                onClick={() =>
                                  handleToggleAvailability(item._id)
                                }
                              >
                                {item.isAvailable ? (
                                  <CheckCircle className="w-5 h-5 text-success" />
                                ) : null}
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
          icon={<Filter className="w-12 h-12 text-base-content/30" />}
          helpText="Try changing your search or filter criteria"
        />
      )}
    </>
  );

  // Empty state component
  const EmptyState = ({ message, icon, helpText }) => (
    <div className="text-center py-16 bg-base-200 rounded-lg">
      <div className="mx-auto w-16 h-16 mb-4 text-base-content/50">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      <p className="text-base-content/70 max-w-md mx-auto mt-2">{helpText}</p>
      <Can do="editMenu">
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
          className="btn btn-primary mt-4"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Menu Item
        </button>
      </Can>
    </div>
  );

  if (status === "loading") return <SuspenseContent />;

  // Access check
  if (!can("viewMenu")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to view menu items.
              </p>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  return (
    <TitleCard
      title="Menu Items"
      TopSideButtons={
        <TopSideButtons
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      }
      topMargin="mt-2"
    >
      {/* Filters Row */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-4xl">
          <div className="relative flex-1">
            <SearchBar
              searchText={searchQuery}
              setSearchText={setSearchQuery}
              placeholderText="Search menu items..."
              styleClass="w-full"
              inputStyleClass="!h-10"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="dropdown dropdown-bottom dropdown-start sm:dropdown-end w-full sm:w-auto">
              <label
                tabIndex={0}
                className="btn btn-outline btn-sm h-10 min-h-10 w-full sm:w-auto px-4 justify-between flex-nowrap"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Filter className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {selectedCategory ? selectedCategory : "All Categories"}
                  </span>
                </div>
                <svg
                  className="w-4 h-4 ml-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-20 menu p-2 shadow-xl bg-base-100 rounded-box w-64 max-h-80 overflow-auto border border-base-200 mt-1"
              >
                <li>
                  <button
                    className={selectedCategory === "" ? "active" : ""}
                    onClick={() => setSelectedCategory("")}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((category, index) => (
                  <li key={index}>
                    <button
                      className={selectedCategory === category ? "active" : ""}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* View Toggle */}
            <div className="flex items-center flex-shrink-0 bg-base-200 rounded-lg p-1 h-10">
              <button
                className={`flex-1 sm:flex-none btn btn-sm btn-ghost h-8 min-h-8 px-4 flex-nowrap ${
                  viewMode === "table" ? "bg-base-100 shadow-sm" : "opacity-50"
                }`}
                onClick={() => setViewMode("table")}
              >
                <Table className="w-4 h-4" />
                <span className="ml-2">Table</span>
              </button>
              <button
                className={`flex-1 sm:flex-none btn btn-sm btn-ghost h-8 min-h-8 px-4 flex-nowrap ${
                  viewMode === "cards" ? "bg-base-100 shadow-sm" : "opacity-50"
                }`}
                onClick={() => setViewMode("cards")}
              >
                <SquareGanttChart className="w-4 h-4" />
                <span className="ml-2">Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <ErrorDisplay />
      ) : filteredMenuItems.length === 0 &&
        !selectedCategory &&
        !searchQuery ? (
        <EmptyState
          message="No menu items found"
          icon={<FileText className="w-full h-full" />}
          helpText="Start by adding your first menu item"
        />
      ) : viewMode === "cards" ? (
        <CardView />
      ) : (
        <TableView />
      )}
    </TitleCard>
  );
};

export default MenuItems;
