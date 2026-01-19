import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ErrorText from "../../../components/Typography/ErrorText";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import { updateUser } from "../usersSlice";
import { showNotification } from "../../common/headerSlice";

function EditUserModalBody({ closeModal, extraObject }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = [
    { value: "admin", name: "Admin" },
    { value: "manager", name: "Manager" },
    { value: "cashier", name: "Cashier" },
    { value: "waiter", name: "Waiter" },
    { value: "kitchen", name: "Kitchen" },
    { value: "accountant", name: "Accountant" },
    { value: "staff", name: "Staff" },
  ];

  useEffect(() => {
    if (extraObject) {
      setUser({
        ...extraObject,
        password: "", // Reset password field in edit mode
      });
    }
  }, [extraObject]);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const saveUser = () => {
    // Validate form fields
    if (!user.fullname.trim()) return setErrorMessage("Full name is required!");
    if (!user.email.trim()) return setErrorMessage("Email is required!");
    if (!user.role) return setErrorMessage("Role is required!");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email))
      return setErrorMessage("Please enter a valid email address!");

    // Password validation (only if entered)
    if (user.password.trim() && user.password.length < 6)
      return setErrorMessage("Password must be at least 6 characters long!");

    // Create payload (only include password if it was changed)
    const payload = {
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };
    if (user.password.trim()) {
      payload.password = user.password;
    }
    if (user.pinCode) {
      payload.pinCode = user.pinCode;
    }

    setLoading(true);
    dispatch(updateUser({ id: user._id, user: payload }))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "User updated successfully!",
            status: 1,
          }),
        );
        closeModal();
      })
      .catch((error) => {
        setErrorMessage(
          error.message || "Failed to update user. Please try again.",
        );
        dispatch(
          showNotification({
            message:
              error.message || "Failed to update user. Please try again.",
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
        <h2 className="text-lg font-semibold">Edit User</h2>
      </div>
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
            value={user.fullname}
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
            value={user.email}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter Email Address"
          />
        </div>

        {/* Password */}
        <div className="mt-4">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={user.password}
              autoComplete=""
              onChange={handleInputChange}
              className="input input-bordered w-full mt-2"
              placeholder="Enter new password or leave blank to keep existing"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-5 text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* PIN Code */}
        <div className="mt-4">
          <label htmlFor="pinCode" className="block text-sm font-medium">
            PIN Code (Optional)
          </label>
          <input
            type="text"
            id="pinCode"
            name="pinCode"
            maxLength={6}
            value={user.pinCode || ""}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
            placeholder="Enter 4-6 digit PIN or leave blank"
          />
        </div>

        {/* Role */}
        <div className="mt-4">
          <label htmlFor="role" className="block text-sm font-medium">
            Role
          </label>
          <SearchableSelect
            options={roleOptions}
            value={user.role}
            onChange={handleInputChange}
            name="role"
            placeholder="Select role"
            className="w-full mt-2"
            valueKey="value"
            labelKey="name"
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
        )}
      </div>

      <div className="modal-action">
        <button
          onClick={saveUser}
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

export default EditUserModalBody;
