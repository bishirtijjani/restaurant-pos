// frontend/src/features/common/components/EditItemNoteModalBody.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";

const EditItemNoteModalBody = ({ extraObject, closeModal: close }) => {
  const { initialNote = "", onConfirm } = extraObject || {};
  const [note, setNote] = useState(initialNote);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onConfirm) {
      onConfirm(note);
    }
    close();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Item Note</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="textarea textarea-bordered"
          rows="3"
          placeholder="Add special instructions or notes for this item..."
          autoFocus
        />
      </div>

      <div className="modal-action">
        <button
          type="button"
          onClick={() => close()}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Note
        </button>
      </div>
    </form>
  );
};

export default EditItemNoteModalBody;
