import React, { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  CONFIRMATION_MODAL_CLOSE_TYPES,
  MODAL_BODY_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "./categoriesSlice"; // Adjusted import
import SuspenseContent from "../../containers/SuspenseContent";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import { checkRole } from "../../utils/Helpers";
import SearchBar from "../../components/Input/SearchBar";

const TopSideButtons = ({ searchQuery, setSearchQuery }) => {
  const dispatch = useDispatch();

  const openAddNewCategory = () => {
    dispatch(
      openModal({
        title: "Add New CategoryItem",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_CATEGORY,
        size: "xl",
      })
    );
  };

  return (
    <div className="flex justify-between flex-wrap gap-2 w-100 space-x-3">
      {/* Add SearchBar inside TopSideButtons */}
      <SearchBar
        searchText={searchQuery}
        setSearchText={setSearchQuery}
        placeholderText="Search categories..."
        styleClass=""
      />

      {/* for admin and manager only */}
      {(checkRole("admin") || checkRole("manager")) && (
        <button onClick={openAddNewCategory} className="btn btn-primary">
          <PlusCircleIcon className="w-6 h-6" /> Add New Category
        </button>
      )}
      <button onClick={() => location.reload()} className="btn btn-primary">
        <ArrowPathIcon className="w-6 h-6" /> Reload
      </button>
    </div>
  );
};

const Categories = () => {
  const dispatch = useDispatch();
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

        <div className="card-actions mt-4 space-x-2">
          {(checkRole("admin") || checkRole("manager")) && (
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
          )}

          {checkRole("admin") && (
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
          )}
        </div>
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
      {/* Mobile view (card layout) */}
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
