import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createFloor } from "../floorSlice";
import Modal from "../../../components/Modal"; // Assuming a generic modal component

const AddFloorModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createFloor({ name, description }));
    onClose();
    setName("");
    setDescription("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Floor">
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Floor Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered"
            required
          />
        </div>
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Description (Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered"
          ></textarea>
        </div>
        <div className="modal-action mt-6">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Floor
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFloorModal;
