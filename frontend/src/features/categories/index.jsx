// frontend/src/features/categories/index.jsx
import React, { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  CONFIRMATION_MODAL_CLOSE_TYPES,
  MODAL_BODY_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "./categoriesSlice";
import SuspenseContent from "../../containers/SuspenseContent";
import {
  Pencil,
  Trash2,
  PlusCircle,
  RefreshCw,
  MoreVertical,
  Upload,
  Download,
} from "lucide-react";
import importService from "../../services/importService";
import { showNotification } from "../common/headerSlice";
import SearchBar from "../../components/Input/SearchBar";
import { useAuth } from "../../utils/permission";
import Can from "../../components/Auth/Can";
// Lucide imports handled above

const TopSideButtons = ({ searchQuery, setSearchQuery }) => {
  const dispatch = useDispatch();
  const { can } = useAuth();

  const openAddNewCategory = () => {
    dispatch(
      openModal({
        title: "Add New Category",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_CATEGORY,
        size: "lg",
      }),
    );
  };

  const openImportWizard = () => {
    dispatch(
      openModal({
        title: "Import Categories",
        bodyType: MODAL_BODY_TYPES.IMPORT_WIZARD,
        size: "lg",
        extraObject: {
          type: "category",
          title: "Category",
        },
      }),
    );
  };

  const onRefresh = () => {
    dispatch(fetchAllCategories());
  };

  const handleExport = async () => {
    try {
      await importService.exportFile("category", "csv");
      dispatch(
        showNotification({
          message: "Export downloaded successfully!",
          status: 1,
        }),
      );
    } catch (err) {
      dispatch(
        showNotification({ message: "Export failed: " + err, status: 0 }),
      );
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={handleExport}
          className="btn btn-ghost btn-sm btn-circle"
          title="Export Categories"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={onRefresh}
          className="btn btn-ghost btn-sm btn-circle"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <Can do="createCategories">
          <button
            onClick={openImportWizard}
            className="btn btn-ghost btn-sm btn-circle"
            title="Import Categories"
          >
            <Upload className="w-4 h-4" />
          </button>
        </Can>
        <Can do="createCategories">
          <button
            onClick={openAddNewCategory}
            className="btn btn-primary btn-sm gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Category</span>
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
          <li>
            <button onClick={handleExport}>
              <Download className="w-4 h-4" /> Export Categories
            </button>
          </li>
          <Can do="createCategories">
            <li>
              <button onClick={openImportWizard}>
                <Upload className="w-4 h-4" /> Import Categories
              </button>
            </li>
          </Can>
          <div className="divider my-1"></div>
          <Can do="createCategories">
            <li>
              <button
                onClick={openAddNewCategory}
                className="text-primary font-medium"
              >
                <PlusCircle className="w-4 h-4" /> Add Category
              </button>
            </li>
          </Can>
        </ul>
      </div>
    </div>
  );
};

const Categories = () => {
  const dispatch = useDispatch();
  const { can } = useAuth();
  const categories = useSelector((state) => state.categories.categories || []);
  const status = useSelector((state) => state.categories.status);
  const error = useSelector((state) => state.categories.error);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllCategories());
    }
  }, [dispatch, status]);

  if (status === "loading") return <SuspenseContent />;

  if (!can("viewCategories")) {
    return (
      <TitleCard title="Access Denied" topMargin="mt-2">
        <div className="hero min-h-[400px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-error">Access Denied</h1>
              <p className="py-6">
                You do not have permission to view categories.
              </p>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  const filteredCategories = categories.filter((product) =>
    Object.values(product).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const CategoryCard = ({ categoryItem }) => (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 mb-4 border border-base-200">
      <div className="card-body p-6">
        <h2 className="card-title text-lg font-bold">{categoryItem.name}</h2>
        <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
          {categoryItem.description || "No description provided"}
        </p>

        {(can("editCategories") || can("deleteCategories")) && (
          <div className="card-actions mt-4 space-x-2">
            <Can do="editCategories">
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  dispatch(
                    openModal({
                      title: "Edit Category",
                      bodyType: MODAL_BODY_TYPES.EDIT_CATEGORY,
                      extraObject: categoryItem,
                      size: "lg",
                    }),
                  )
                }
              >
                <Pencil className="w-5 h-5 mr-1" />
                Edit
              </button>
            </Can>

            <Can do="deleteCategories">
              <button
                className="btn btn-error btn-sm"
                onClick={() =>
                  dispatch(
                    openModal({
                      title: "Delete Category ?",
                      bodyType: MODAL_BODY_TYPES.CONFIRMATION,
                      extraObject: {
                        message: `Are you sure you want to delete the ${categoryItem.name} category ?`,
                        type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_CATEGORY,
                        id: categoryItem._id,
                      },
                    }),
                  )
                }
              >
                <Trash2 className="w-5 h-5 mr-1" />
                Delete
              </button>
            </Can>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <TitleCard
      title="All Categories"
      TopSideButtons={
        <TopSideButtons
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      }
      topMargin="mt-2"
    >
      <div className="mb-6">
        <SearchBar
          searchText={searchQuery}
          setSearchText={setSearchQuery}
          placeholderText="Search categories by name or description..."
          styleClass="w-full max-w-md"
          inputStyleClass="!h-10"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((categoryItem) => (
            <CategoryCard key={categoryItem._id} categoryItem={categoryItem} />
          ))
        ) : error ? (
          <div className="text-center p-4">{error.message}</div>
        ) : (
          <div className="text-center p-4">No categories found.</div>
        )}
      </div>
    </TitleCard>
  );
};

export default Categories;
