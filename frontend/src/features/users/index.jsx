import React, { useEffect } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "./usersSlice";
import SuspenseContent from "../../containers/SuspenseContent";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import { checkRole } from "../../utils/helpers";

const TopSideButtons = () => {
  const dispatch = useDispatch();

  const openAddNewUser = () => {
    dispatch(
      openModal({
        title: "Add New User",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_USER,
        size: "xl",
      })
    );
  };

  return (
    <div className="flex justify-between w-100 space-x-3">
      {/* for admin and manager only */}
      {checkRole("admin") && (
        <>
          <button onClick={openAddNewUser} className="btn btn-primary">
            <PlusCircleIcon className="w-6 h-6" /> Add New User
          </button>
          <button onClick={() => location.reload()} className="btn btn-primary">
            <ArrowPathIcon className="w-6 h-6" /> Reload
          </button>
        </>
      )}
    </div>
  );
};

const Users = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users || []);
  const status = useSelector((state) => state.users.status);
  const error = useSelector((state) => state.users.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, status]);

  if (status === "loading") return <SuspenseContent />;

  const UserRows = users.map((user) => (
    <tr className="border-spacing-x-3 border-collapse" key={user._id}>
      <td className="border-2">{user.fullname}</td>
      <td className="border-2">{user.email}</td>
      <td className="border-2">
        <span
          className={`capitalize badge ${
            user.role === "admin"
              ? "badge-primary"
              : user.role === "manager"
              ? "badge-secondary"
              : "badge-accent"
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="border-2">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="border-2">
        <button
          className="btn btn-sm text-white bg-primary min-w-[70px]"
          onClick={() =>
            dispatch(
              openModal({
                title: "Edit User",
                bodyType: MODAL_BODY_TYPES.EDIT_USER,
                extraObject: user,
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
                title: "Delete User?",
                bodyType: MODAL_BODY_TYPES.CONFIRMATION,
                extraObject: {
                  message: `Are you sure you want to delete the user "${user.fullname}"?`,
                  type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_USER,
                  id: user._id,
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
      title="All Users"
      TopSideButtons={<TopSideButtons />}
      topMargin="mt-2"
    >
      {/* for admin  only */}
      {checkRole("admin") ? (
        <div className="overflow-x-auto w-full">
          <table className="table table-zebra w-full table-pin-rows">
            <thead className="border-b-4 border-primary text-md">
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                UserRows
              ) : error ? (
                error.message
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-error font-bold text-2xl">
          Access Denied, You are not an Admin
        </div>
      )}
    </TitleCard>
  );
};

export default Users;
