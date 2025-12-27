import { useState } from "react";
import ErrorText from "../../../components/Typography/ErrorText";
import { useDispatch } from "react-redux";
import { addSupplier } from "../suppliersSlice"; // Action to add a supplier
import { showNotification } from "../../common/headerSlice"; // For notifications

function AddSupplierModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const [supplier, setSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
    setErrorMessage(""); // Reset error message on input change
  };

  const saveSupplier = () => {
    // Validate form fields
    if (!supplier.name.trim())
      return setErrorMessage("Supplier name is required!");
    if (!supplier.phone.trim()) return setErrorMessage("Phone is required!");
    if (!supplier.email.trim()) return setErrorMessage("Email is required!");
    if (!supplier.address.trim())
      return setErrorMessage("Address is required!");

    setLoading(true);
    dispatch(addSupplier(supplier))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "Supplier added successfully!",
            status: 1, // Success status
          })
        );
        closeModal(); // Close the modal after adding the supplier
      })
      .catch(() => {
        setErrorMessage("Failed to add supplier. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="text-lg font-semibold">Add Supplier</h2>
      </div>
      <div className="modal-body">
        {/* Supplier Name */}
        <div className="mt-4">
          <label htmlFor="name" className="block text-sm font-medium">
            Supplier Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={supplier.name}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Supplier Name"
          />
        </div>

        {/* Supplier Phone */}
        <div className="mt-4">
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone Number
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={supplier.phone}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Supplier Phone"
          />
        </div>

        {/* Supplier Email */}
        <div className="mt-4">
          <label htmlFor="email" className="block text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={supplier.email}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Supplier Email"
          />
        </div>

        {/* Supplier Address */}
        <div className="mt-4">
          <label htmlFor="address" className="block text-sm font-medium">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={supplier.address}
            onChange={handleInputChange}
            className="textarea textarea-bordered w-full mt-2"
            placeholder="Enter Supplier Address"
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
        )}
      </div>

      <div className="modal-action">
        <button
          onClick={saveSupplier}
          className={`btn btn-primary ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Supplier"}
        </button>
        <button onClick={closeModal} className="btn btn-error ml-2">
          Close
        </button>
      </div>
    </div>
  );
}

export default AddSupplierModalBody;
