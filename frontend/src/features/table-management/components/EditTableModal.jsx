import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTable } from "../tableSlice";
import Modal from "../../../components/Modal";

const EditTableModal = ({ isOpen, onClose, table }) => {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [shape, setShape] = useState("square");
  const dispatch = useDispatch();

  useEffect(() => {
    if (table) {
      setTableNumber(table.tableNumber);
      setCapacity(table.capacity);
      setShape(table.shape);
    }
  }, [table]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      updateTable({
        id: table._id,
        data: { tableNumber, capacity, shape },
      })
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Table: ${table?.tableNumber}`}
    >
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
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTableModal;
