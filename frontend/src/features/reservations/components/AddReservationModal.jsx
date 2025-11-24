import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createReservation,
  getAvailableTables,
  selectAvailableTables,
} from "../reservationSlice";
import Modal from "../../../components/Modal";
import Select from "react-select";

const AddReservationModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const availableTables = useSelector(selectAvailableTables);

  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("19:00");
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (step === 2) {
      dispatch(getAvailableTables({ date, time, partySize }));
    }
  }, [step, date, time, partySize, dispatch]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const reservationData = {
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      table: selectedTable.value,
      date,
      time,
      partySize,
      specialRequests,
    };
    dispatch(createReservation(reservationData));
    onClose();
    // Reset form
    setStep(1);
    // ... reset other states
  };

  const tableOptions = availableTables.map((table) => ({
    value: table._id,
    label: `${table.tableNumber} (Capacity: ${table.capacity}, Floor: ${table.floor.name})`,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Reservation">
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold mb-4">Step 1: Reservation Details</h3>
            <div className="form-control">
              <label className="label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input input-bordered"
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input input-bordered"
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">Party Size</label>
              <input
                type="number"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value, 10))}
                className="input input-bordered"
                min="1"
              />
            </div>
            <div className="modal-action mt-6">
              <button type="button" className="btn" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                Find Table
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-bold mb-4">Step 2: Select a Table</h3>
            <Select
              options={tableOptions}
              onChange={setSelectedTable}
              placeholder="Select an available table..."
              isClearable
            />
            <div className="modal-action mt-6">
              <button type="button" className="btn" onClick={handleBack}>
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!selectedTable}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-bold mb-4">Step 3: Customer Details</h3>
            <div className="form-control">
              <label className="label">Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">Email (Optional)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input input-bordered"
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">Special Requests (Optional)</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="textarea textarea-bordered"
              ></textarea>
            </div>
            <div className="modal-action mt-6">
              <button type="button" className="btn" onClick={handleBack}>
                Back
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Reservation
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default AddReservationModal;
