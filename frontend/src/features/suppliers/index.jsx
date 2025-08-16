import React, { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSuppliers } from "./suppliersSlice"; // Adjusted import to suppliers
import SuspenseContent from "../../containers/SuspenseContent";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import { checkRole } from "../../utils/helpers";

// Top-side button to open the add new supplier modal
const TopSideButtons = () => {
  const dispatch = useDispatch();

  const openAddNewSupplier = () => {
    dispatch(
      openModal({
        title: "Add New Supplier",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_SUPPLIER, // Adjusted modal type
        size: "xl",
      })
    );
  };

  return (
    <div className="flex justify-between w-100 space-x-3">
      {/* for admin and manager only */}
      {(checkRole("admin") || checkRole("manager")) && (
        <button onClick={openAddNewSupplier} className="btn btn-primary">
          <PlusCircleIcon className="w-6 h-6" /> Add New Supplier
        </button>
      )}

      <button onClick={() => location.reload()} className="btn btn-primary">
        <ArrowPathIcon className="w-6 h-6" /> Reload
      </button>
    </div>
  );
};

const Suppliers = () => {
  const dispatch = useDispatch();
  const suppliers = useSelector((state) => state.suppliers.suppliers || []); // Adjusted state path
  const status = useSelector((state) => state.suppliers.status);
  const error = useSelector((state) => state.suppliers.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllSuppliers()); // Fetch all suppliers on idle status
    }
  }, [dispatch, status]);

  if (status === "loading") return <SuspenseContent />; // Show loader when data is fetching

  const SupplierRows = suppliers.map((supplier) => (
    <tr className="border-spacing-x-3 border-collapse" key={supplier._id}>
      <td className="border-2">{supplier.name}</td>
      <td className="border-2">{supplier.phone}</td>
      <td className="border-2">{supplier.email}</td>
      <td className="border-2">{supplier.address}</td>

      {/* for admin and manager only */}
      {(checkRole("admin") || checkRole("manager")) && (
        <td className="border-2">
          <button
            className="btn btn-sm text-white bg-primary min-w-[70px]"
            onClick={() =>
              dispatch(
                openModal({
                  title: "Edit Supplier",
                  bodyType: MODAL_BODY_TYPES.EDIT_SUPPLIER, // Adjusted modal type
                  extraObject: supplier,
                  size: "xl",
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

      {/* for admin only */}
      {checkRole("admin") && (
        <td className="border-2">
          <button
            className="btn btn-sm text-white btn-error min-w-[70px]"
            onClick={() =>
              dispatch(
                openModal({
                  title: "Delete Supplier ?",
                  bodyType: MODAL_BODY_TYPES.CONFIRMATION,
                  extraObject: {
                    message: `Are you sure you want to delete the supplier  "${supplier.name}"  ?`,
                    type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_SUPPLIER,
                    id: supplier._id,
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
      title="All Suppliers" // Title updated to "All Suppliers"
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      <div className="overflow-x-auto w-full">
        <table className="table table-zebra w-full table-pin-rows">
          <thead className="border-b-4 border-primary text-md">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length > 0 ? (
              SupplierRows
            ) : error ? (
              error.message
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </TitleCard>
  );
};

export default Suppliers;
