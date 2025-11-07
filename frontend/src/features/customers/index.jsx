import React, { useEffect } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCustomers } from "./customersSlice";
import SuspenseContent from "../../containers/SuspenseContent";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import { checkRole } from "../../utils/Helpers";

const TopSideButtons = () => {
  const dispatch = useDispatch();

  const openAddNewCustomer = () => {
    dispatch(
      openModal({
        title: "Add New Customer",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_CUSTOMER,
        size: "xl",
      })
    );
  };

  return (
    <div className="flex justify-between w-100 space-x-3">
      {checkRole("admin", "manager") && (
        <>
          <button onClick={openAddNewCustomer} className="btn btn-primary">
            <PlusCircleIcon className="w-6 h-6" /> Add New Customer
          </button>
          <button onClick={() => location.reload()} className="btn btn-primary">
            <ArrowPathIcon className="w-6 h-6" /> Reload
          </button>
        </>
      )}
    </div>
  );
};

const Customers = () => {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.customers || []);
  const status = useSelector((state) => state.customers.status);
  const error = useSelector((state) => state.customers.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllCustomers());
    }
  }, [dispatch, status]);

  if (status === "loading") return <SuspenseContent />;

  const CustomerRows = customers.map((customer) => (
    <tr className="border-spacing-x-3 border-collapse" key={customer._id}>
      <td className="border-2">{customer.fullname}</td>
      <td className="border-2">{customer.email || "NIL"}</td>
      <td className="border-2">{customer.phone}</td>
      <td className="border-2">{customer.address || "NIL"}</td>
      <td className="border-2">{customer.debtLimit || 0}</td>
      <td className="border-2">
        {new Date(customer.createdAt).toLocaleDateString()}
      </td>
      <td className="border-2">
        <button
          className="btn btn-sm text-white bg-primary min-w-[70px]"
          onClick={() =>
            dispatch(
              openModal({
                title: "Edit Customer",
                bodyType: MODAL_BODY_TYPES.EDIT_CUSTOMER,
                extraObject: customer,
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
      <td className="border-2">
        <button
          className="btn btn-sm text-white btn-error min-w-[70px]"
          onClick={() =>
            dispatch(
              openModal({
                title: "Delete Customer?",
                bodyType: MODAL_BODY_TYPES.CONFIRMATION,
                extraObject: {
                  message: `Are you sure you want to delete the customer "${customer.fullname}"?`,
                  type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_CUSTOMER,
                  id: customer._id,
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
    </tr>
  ));

  return (
    <TitleCard
      title="All Customers"
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      {checkRole("admin", "manager") ? (
        <div className="overflow-x-auto w-full">
          <table className="table table-zebra w-full table-pin-rows">
            <thead className="border-b-4 border-primary text-md">
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Debt Limit ($)</th>
                <th>Created At</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {console.log(customers)}
              {customers.length > 0 ? (
                CustomerRows
              ) : error ? (
                error.message
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-error font-bold text-2xl">
          Access Denied, You do not have permission to view customers.
        </div>
      )}
    </TitleCard>
  );
};

export default Customers;
