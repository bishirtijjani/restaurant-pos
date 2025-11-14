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
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import SearchBar from "../../components/Input/SearchBar";
import { useAuth } from "../../utils/permission";
import Can from "../../components/Auth/Can";

const TopSideButtons = ({ searchQuery, setSearchQuery }) => {
  const dispatch = useDispatch();
  const { can } = useAuth();

  const openAddNewCategory = () => {
    dispatch(
      openModal({
        title: "Add New Category",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_CATEGORY,
        size: "xl",
      })
    );
  };

  return (
    <div className="flex justify-between flex-wrap gap-2 w-100 space-x-3">
      <SearchBar
        searchText={searchQuery}
        setSearchText={setSearchQuery}
        placeholderText="Search categories..."
        styleClass=""
      />

      <Can do="createCategories">
        <button
          onClick={openAddNewCategory}
          className="btn btn-primary btn-sm lg:btn-md"
        >
          <PlusCircleIcon className="w-6 h-6" />
          <span className="hidden sm:inline">Add New Category</span>
        </button>
      </Can>

      <button
        onClick={() => location.reload()}
        className="btn btn-primary btn-sm lg:btn-md"
      >
        <ArrowPathIcon className="w-6 h-6" />
        <span className="hidden sm:inline">Reload</span>
      </button>
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
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const CategoryCard = ({ categoryItem }) => (
    <div className="card bg-base-100 shadow-xl mb-4 border border-base-content/30">
      <div className="card-body">
        <h2 className="card-title">{categoryItem.name}</h2>
        <p>{categoryItem.description || "N/A"}</p>

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
                    })
                  )
                }
              >
                <PencilSquareIcon className="w-5 h-5 mr-1" />
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
                    })
                  )
                }
              >
                <TrashIcon className="w-5 h-5 mr-1" />
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
