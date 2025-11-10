import { useState } from "react";
import { useDispatch } from "react-redux";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ErrorText from "../../../components/Typography/ErrorText";
import { addUser } from "../usersSlice";
import { showNotification } from "../../common/headerSlice";

function AddUserModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "staff", // Default role
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    if (!user.password.trim()) return setErrorMessage("Password is required!");
    if (!user.role) return setErrorMessage("Role is required!");

    setLoading(true);
    dispatch(addUser(user))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "User added successfully!",
            status: 1,
          })
        );
        closeModal();
      })
      .catch(() => {
        setErrorMessage("Failed to add user. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="text-lg font-semibold">Add User</h2>
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
              onChange={handleInputChange}
              className="input input-bordered w-full mt-2"
              placeholder="Enter Password"
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

        {/* Role */}
        <div className="mt-4">
          <label htmlFor="role" className="block text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={user.role}
            onChange={handleInputChange}
            className="select select-bordered w-full mt-2"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="waiter">Waiter</option>
            <option value="kitchen">Kitchen</option>
            <option value="accountant">Accountant</option>
            <option value="staff">Staff</option>
          </select>
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
          {loading ? "Saving..." : "Save User"}
        </button>
        <button onClick={closeModal} className="btn btn-error ml-2">
          Close
        </button>
      </div>
    </div>
  );
}

export default AddUserModalBody;
