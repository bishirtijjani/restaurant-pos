import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createTable } from "../tableSlice";
import Modal from "../../../components/Modal";

const AddTableModal = ({ isOpen, onClose, floorId }) => {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [shape, setShape] = useState("square");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createTable({ tableNumber, capacity, shape, floor: floorId }));
    onClose();
    setTableNumber("");
    setCapacity(4);
    setShape("square");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Table">
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Table Number/Name</span>
          </label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="input input-bordered"
            required
          />
        </div>
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Capacity</span>
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
            className="input input-bordered"
            min="1"
            required
          />
        </div>
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Shape</span>
          </label>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="square">Square</option>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="oval">Oval</option>
          </select>
        </div>
        <div className="modal-action mt-6">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Table
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTableModal;
