import React from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice"; // Adjust the import path as needed
import { useNavigate } from "react-router-dom"; // To redirect user to the login page

export const SessionExpiredModalBody = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLoginAgain = () => {
    // Close the modal and redirect the user to the login page
    dispatch(closeModal());
    navigate("/login");
  };

  return (
    <div className="p-6 text-center text-error">
      <h3 className="text-2xl font-bold mb-4">Session Expired</h3>
      <p className="mb-6">
        Your session has expired. Please log in again to continue.
      </p>
      <button
        onClick={handleLoginAgain}
        className="btn btn-primary rounded-lg px-6 py-2 font-semibold hover:bg-primary transition duration-200"
      >
        Login Again
      </button>
    </div>
  );
};

export default SessionExpiredModalBody;
