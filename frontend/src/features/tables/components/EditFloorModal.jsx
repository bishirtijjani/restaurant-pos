import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateFloor, deleteFloor } from "../floorSlice";
import Modal from "../../../components/Modal";

const EditFloorModal = ({ isOpen, onClose, floor }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (floor) {
      setName(floor.name);
      setDescription(floor.description);
    }
  }, [floor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateFloor({ id: floor._id, data: { name, description } }));
    onClose();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete floor "${floor.name}"? This action cannot be undone.`
      )
    ) {
      dispatch(deleteFloor(floor._id));
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Floor: ${floor?.name}`}>
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
        <div className="modal-action mt-6 flex justify-between">
          <button
            type="button"
            className="btn btn-error"
            onClick={handleDelete}
          >
            Delete Floor
          </button>
          <div>
            <button type="button" className="btn mr-2" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditFloorModal;
