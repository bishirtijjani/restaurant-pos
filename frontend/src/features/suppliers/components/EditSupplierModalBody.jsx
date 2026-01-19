import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateSupplier } from "../suppliersSlice"; // Action to update supplier
import { showNotification } from "../../common/headerSlice"; // For notifications

function EditSupplierModalBody({ extraObject, closeModal }) {
  const supplierItem = extraObject;
  const dispatch = useDispatch();
  const [supplier, setSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load supplier data when modal is opened
  useEffect(() => {
    if (supplierItem) {
      setSupplier({
        name: supplierItem.name || "",
        phone: supplierItem.phone || "",
        email: supplierItem.email || "",
        address: supplierItem.address || "",
      });
    }
  }, [supplierItem]);

  const handleInputChange = (e) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
    setErrorMessage(""); // Reset error message on input change
  };

  const saveSupplier = () => {
    // Validate form fields
    if (!supplier.name.trim())
      return setErrorMessage("Supplier name is required!");
    if (!supplier.phone.trim()) return setErrorMessage("Contact is required!");
    if (!supplier.email.trim()) return setErrorMessage("Email is required!");

    setLoading(true);
    dispatch(updateSupplier({ id: supplierItem._id, supplier }))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "Supplier updated successfully!",
            status: 1, // Success status
          }),
        );
        closeModal(); // Close the modal after updating the supplier
      })
      .catch((error) => {
        setErrorMessage(
          error.message || "Failed to update supplier. Please try again.",
        );
        dispatch(
          showNotification({
            message:
              error.message || "Failed to update supplier. Please try again.",
            status: 0,
          }),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="text-lg font-semibold">Edit Supplier</h2>
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

        {/* Supplier Contact */}
        <div className="mt-4">
          <label htmlFor="phone" className="block text-sm font-medium">
            Contact Number
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={supplier.phone}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Supplier Contact"
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
          <div className="mt-2 text-red-500 text-sm">
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="modal-action">
        <button
          onClick={saveSupplier}
          className={`btn btn-primary ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button onClick={closeModal} className="btn btn-error ml-2">
          Close
        </button>
      </div>
    </div>
  );
}

export default EditSupplierModalBody;
