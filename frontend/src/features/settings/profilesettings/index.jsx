import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser, updateUserProfile } from "../../../app/authSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import SecurityQuestionsInput from "../../../components/SecurityQuestions/SecurityQuestionsInput";

function ProfileSettings() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    pinCode: "",
  });

  const [securityQuestions, setSecurityQuestions] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [updateSecurityQuestions, setUpdateSecurityQuestions] = useState(false);

  useEffect(() => {
    if (!user) dispatch(getCurrentUser());
    else {
      setFormData((f) => ({
        ...f,
        fullname: user.fullname || "",
        email: user.email || "",
        pinCode: user.pinCode ? "****" : "",
      }));

      // Load existing security questions (without answers)
      if (user.securityQuestions && user.securityQuestions.length === 2) {
        setSecurityQuestions([
          { question: user.securityQuestions[0].question, answer: "" },
          { question: user.securityQuestions[1].question, answer: "" },
        ]);
      }
    }
  }, [dispatch, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e?.preventDefault?.();
    setMessage(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Validate security questions if updating them
    if (updateSecurityQuestions) {
      if (
        !securityQuestions[0].question ||
        !securityQuestions[0].answer ||
        !securityQuestions[1].question ||
        !securityQuestions[1].answer
      ) {
        setMessage("Please complete both security questions and answers");
        return;
      }

      if (
        securityQuestions[0].answer.trim().length < 2 ||
        securityQuestions[1].answer.trim().length < 2
      ) {
        setMessage("Security answers must be at least 2 characters long");
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        fullname: formData.fullname,
        email: formData.email,
      };
      if (formData.password) payload.password = formData.password;
      if (formData.pinCode && formData.pinCode !== "****")
        payload.pinCode = formData.pinCode;
      if (updateSecurityQuestions)
        payload.securityQuestions = securityQuestions;

      const result = await dispatch(updateUserProfile(payload)).unwrap();
      setMessage("Profile updated successfully");

      // Clear password fields
      setFormData((f) => ({ ...f, password: "", confirmPassword: "" }));

      // Clear security question answers if they were updated
      if (updateSecurityQuestions) {
        setSecurityQuestions([
          { question: securityQuestions[0].question, answer: "" },
          { question: securityQuestions[1].question, answer: "" },
        ]);
        setUpdateSecurityQuestions(false);
      }
    } catch (err) {
      setMessage(
        err?.message ||
          (err?.message === undefined ? String(err) : "Update failed")
      );
    } finally {
      setSaving(false);
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <div>
          <label className="label">New password (optional)</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="label">Confirm password</label>
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="label">PIN Code (4-6 digits)</label>
          <input
            name="pinCode"
            type="text"
            maxLength={6}
            value={formData.pinCode}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder={
              user?.pinCode
                ? "Leave as **** to keep current PIN"
                : "Enter new PIN"
            }
          />
        </div>

        <div className="md:col-span-2">
          <div className="divider"></div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">Security Questions</label>
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Update Security Questions</span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={updateSecurityQuestions}
                onChange={(e) => setUpdateSecurityQuestions(e.target.checked)}
              />
            </label>
          </div>

          {updateSecurityQuestions ? (
            <SecurityQuestionsInput
              securityQuestions={securityQuestions}
              onSecurityQuestionsChange={setSecurityQuestions}
              showAnswers={true}
            />
          ) : (
            <div className="space-y-2">
              <div className="p-4 bg-base-200 rounded-lg">
                <p className="text-sm font-medium">Question 1:</p>
                <p className="text-sm">
                  {securityQuestions[0].question || "Not set"}
                </p>
              </div>
              <div className="p-4 bg-base-200 rounded-lg">
                <p className="text-sm font-medium">Question 2:</p>
                <p className="text-sm">
                  {securityQuestions[1].question || "Not set"}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Check the box above to update your security questions
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <button
          className="btn btn-primary float-right"
          onClick={handleProfileUpdate}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 text-sm alert ${
            message.includes("success") ? "alert-success" : "alert-error"
          }`}
        >
          <p>{message}</p>
        </div>
      )}
    </TitleCard>
  );
}

export default ProfileSettings;
