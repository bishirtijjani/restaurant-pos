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
import { checkRole } from "../../utils/helpers";
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
    <div className="flex justify-between w-100 space-x-3">
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

  const [searchQuery, setSearchQuery] = useState(""); // Search query state

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

  const CategoryRows = filteredCategories.map((categoryItem) => (
    <tr className="border-spacing-x-3 border-collapse" key={categoryItem._id}>
      <td className="border-2">{categoryItem.name}</td>
      <td className="border-2">{categoryItem.description || "N/A"}</td>
      {(checkRole("admin") || checkRole("manager")) && (
        <td className="border-2">
          <button
            className="btn btn-sm text-white bg-primary min-w-[70px]"
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
            <div className="flex items-center justify-center space-x-1">
              <PencilSquareIcon className="w-5 h-5" />
              <span className="hidden md:block">Edit</span>
            </div>
          </button>
        </td>
      )}

      {checkRole("admin") && (
        <td className="border-2">
          <button
            className="btn btn-sm text-white btn-error min-w-[70px]"
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
            <div className="flex items-center justify-center space-x-1">
              <TrashIcon className="w-5 h-5" />
              <span className="hidden md:block">Delete</span>
            </div>
          </button>
        </td>
      )}
    </tr>
  ));

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
      <div className="overflow-x-auto w-full">
        <table className="table table-zebra w-full table-pin-rows">
          <thead className="border-b-4 border-primary text-md">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              CategoryRows
            ) : error ? (
              error.message
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </TitleCard>
  );
};

export default Categories;
