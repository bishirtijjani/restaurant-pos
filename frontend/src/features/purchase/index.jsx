import React, { useEffect } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  CONFIRMATION_MODAL_CLOSE_TYPES,
  MODAL_BODY_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPurchases } from "./purchaseSlice"; // Adjusted import
import SuspenseContent from "../../containers/SuspenseContent";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import { checkRole } from "../../utils/helpers";

const TopSideButtons = () => {
  const dispatch = useDispatch();

  const openAddNewPurchase = () => {
    dispatch(
      openModal({
        title: "Add New Purchase",
        bodyType: MODAL_BODY_TYPES.ADD_PURCHASE,
        size: "xl",
      })
    );
  };

  return (
    <div className="flex justify-between w-100 space-x-3">
      {/* for admin and manager only */}
      {(checkRole("admin") || checkRole("manager")) && (
        <button onClick={openAddNewPurchase} className="btn btn-primary">
          <PlusCircleIcon className="w-6 h-6" /> Add New Purchase
        </button>
      )}
      <button onClick={() => location.reload()} className="btn btn-primary">
        <ArrowPathIcon className="w-6 h-6" /> Reload
      </button>
    </div>
  );
};

const Purchases = () => {
  const dispatch = useDispatch();
  const purchases = useSelector((state) => state.purchases.purchases || []);
  const status = useSelector((state) => state.purchases.status);
  const error = useSelector((state) => state.purchases.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllPurchases());
    }
  }, [dispatch, status]);

  if (status === "loading") return <SuspenseContent />;

  const PurchaseRows = purchases.map((purchase) => {
    const totalProducts = purchase.products.length;

    return (
      <tr
        className="border-spacing-x-3 text-center border-collapse "
        key={purchase._id}
      >
        <td className="border-2">
          {new Date(purchase.purchaseDate).toLocaleDateString()}
        </td>
        <td className="border-2">{`${purchase.createdBy.fullname} (${purchase.createdBy.role})`}</td>
        <td className="border-2">
          {purchase.supplier.name || "Unknown Supplier"}
        </td>
        <td className="border-2">{totalProducts}</td>
        {/* for admin and manager only */}
        {(checkRole("admin") || checkRole("manager")) && (
          <td className="border-2">
            <button
              className="btn btn-sm text-white bg-primary min-w-[70px]"
              onClick={() =>
                dispatch(
                  openModal({
                    title: "Edit Purchase",
                    bodyType: MODAL_BODY_TYPES.EDIT_PURCHASE,
                    extraObject: purchase,
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
                    title: "Delete Purchase?",
                    bodyType: MODAL_BODY_TYPES.CONFIRMATION,
                    extraObject: {
                      message: `Are you sure you want to delete this purchase?`,
                      type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_PURCHASE,
                      id: purchase._id,
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
    );
  });

  return (
    <TitleCard
      title="All Purchases"
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      <div className="overflow-x-auto w-full">
        <table className="table table-zebra w-full table-pin-rows">
          <thead className="border-b-4 border-primary text-md">
            <tr>
              <th>Purchase Date</th>
              <th>Created By</th>
              <th>Supplier</th>
              <th>Total Products</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              PurchaseRows
            ) : error ? (
              error.message
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </TitleCard>
  );
};

export default Purchases;
