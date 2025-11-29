import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCustomerNote } from "../customersSlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";

const AddCustomerNoteModalBody = ({ extraObject, closeModal: close }) => {
  const dispatch = useDispatch();
  const { customerId, customerName } = extraObject;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      dispatch(showNotification({ message: "Please enter a note", status: 0 }));
      return;
    }

    setLoading(true);
    try {
      await dispatch(addCustomerNote({
        id: customerId,
        content
      })).unwrap();
      
      dispatch(showNotification({ message: "Note added successfully", status: 1 }));
      close();
    } catch (error) {
      dispatch(showNotification({ message: error.message || "Failed to add note", status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-base-content/70">
        Adding note for <span className="font-bold">{customerName}</span>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Note Content *</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-32"
          placeholder="Enter note details here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        ></textarea>
      </div>

      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={() => close()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm"></span> : "Add Note"}
        </button>
      </div>
    </form>
  );
};

export default AddCustomerNoteModalBody;
