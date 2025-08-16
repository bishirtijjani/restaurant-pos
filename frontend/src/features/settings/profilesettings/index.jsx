import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../../components/Cards/TitleCard";
import { showNotification } from "../../common/headerSlice";
import { updateUserProfile, getCurrentUser } from "../../../app/authSlice";

function ProfileSettings() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth); // Get user from Redux store

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
  });

  // Fetch user on component mount if not already present in Redux state
  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    } else {
      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
      });
    }
  }, [dispatch, user]);

  // Handle form field updates
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      const action = await dispatch(updateUserProfile(formData));

      if (action.meta.requestStatus === "fulfilled") {
        dispatch(showNotification({ message: "Profile Updated", status: 1 }));
        setFormData({
          fullname: action.payload.fullname,
          email: action.payload.email,
        });
      } else {
        dispatch(
          showNotification({
            message: action.payload || "Profile Update Failed", // Include error message if available
            status: 0,
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "An unexpected error occurred",
          status: 0,
        })
      );
    }
  };

  return (
    <TitleCard title="Profile Settings" topMargin="mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            disabled={loading} // Disable input while updating
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            disabled={loading} // Disable input while updating
          />
        </div>

        <div className="divider"></div>
      </div>

      <div className="mt-16">
        <button
          className="btn btn-primary float-right"
          onClick={handleProfileUpdate}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-red-500 text-sm">
          <p>{error}</p>
        </div>
      )}
    </TitleCard>
  );
}

export default ProfileSettings;
