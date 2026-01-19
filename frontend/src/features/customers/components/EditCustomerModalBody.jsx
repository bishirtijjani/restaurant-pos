import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ErrorText from "../../../components/Typography/ErrorText";
import { updateCustomer, fetchAllCustomers } from "../customersSlice";
import { showNotification } from "../../common/headerSlice";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import { fetchSettings } from "../../settings/generalSettings/generalSettingsSlice";

function EditCustomerModalBody({ closeModal, extraObject }) {
  const dispatch = useDispatch();
  const [customer, setCustomer] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    debtLimit: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings,
  );
  const currency = settings.currency.symbol || "$";

  useEffect(() => {
    if (extraObject) {
      setCustomer({
        ...extraObject,
      });
    }
  }, [extraObject]);

  const handleInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const saveCustomer = () => {
    // Validate form fields
    if (!customer.fullname.trim())
      return setErrorMessage("Full name is required!");
    if (!customer.phone.trim())
      return setErrorMessage("Phone number is required!");

    setLoading(true);
    dispatch(updateCustomer({ id: customer._id, customer }))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "Customer updated successfully!",
            status: 1,
          }),
        );
        fetchAllCustomers();
        closeModal();
      })
      .catch((error) => {
        const msg =
          error?.message || "Failed to update customer. Please try again.";
        setErrorMessage(msg);
        dispatch(
          showNotification({
            message: msg,
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
      <div className="modal-body">
        {/* Full Name */}
        <div className="mt-4">
          <label htmlFor="fullname" className="block text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={customer.fullname}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Full Name"
          />
        </div>

        {/* Email */}
        <div className="mt-4">
          <label htmlFor="email" className="block text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={customer.email}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Email Address"
          />
        </div>

        {/* Phone */}
        <div className="mt-4">
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customer.phone}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Phone Number"
          />
        </div>

        {/* Address */}
        <div className="mt-4">
          <label htmlFor="address" className="block text-sm font-medium">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={customer.address}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Full Address"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="debtLimit" className="block text-sm font-medium">
            Debt Limit ({currency})
          </label>
          <FormattedNumberInput
            id="debtLimit"
            name="debtLimit"
            value={customer.debtLimit}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Debt Limit"
            min={0}
          />
        </div>
        {/* Error Message */}
        {errorMessage && (
          <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
        )}
      </div>

      <div className="modal-action">
        <button
          onClick={saveCustomer}
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

export default EditCustomerModalBody;
