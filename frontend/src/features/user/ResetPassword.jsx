import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        setLoading(false);
        return;
      }

      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        setErrorMessage("Invalid or missing token.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert("Password reset successful. You can now log in.");
        navigate("/login");
      } else {
        setErrorMessage(data.message || "Error resetting password.");
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-md shadow-xl bg-base-100 rounded-xl">
        <div className="py-12 px-10">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Reset Password
          </h2>
          <p className="mb-8 text-center font-semibold">
            Enter your new password below.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResetPassword();
            }}
          >
            <div className="mb-4 relative">
              <InputText
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                updateType="password"
                containerStyle="mt-4"
                labelTitle="New Password"
                placeholder="Enter your new password"
                updateFormValue={({ value }) => setNewPassword(value)}
              />
              <button
                type="button"
                className="absolute right-3 top-10"
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            <div className="mb-4 relative">
              <InputText
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                updateType="confirmPassword"
                containerStyle="mt-4"
                labelTitle="Confirm Password"
                placeholder="Confirm your new password"
                updateFormValue={({ value }) => setConfirmPassword(value)}
              />
              <button
                type="button"
                className="absolute right-3 top-10"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            <ErrorText styleClass="mt-4">{errorMessage}</ErrorText>
            <button
              type="submit"
              className={
                "btn mt-4 w-full btn-primary" + (loading ? " loading" : "")
              }
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
