import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginHeroSection from "./LoginHeroSection";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import axios from "axios";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Security Questions, 3: New Password
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState(["", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Submit email and get security questions
  const submitEmail = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (email.trim() === "") {
      return setErrorMessage("Email is required!");
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/auth/get-security-questions", {
        email: email.trim(),
      });

      if (response.data.success) {
        setSecurityQuestions(response.data.questions);
        setStep(2);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error retrieving security questions."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify security answers and reset password
  const submitAnswersAndPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate answers
    if (answers[0].trim() === "" || answers[1].trim() === "") {
      return setErrorMessage("Please answer both security questions.");
    }

    // Validate new password
    if (newPassword.trim() === "") {
      return setErrorMessage("New password is required.");
    }

    if (newPassword !== confirmPassword) {
      return setErrorMessage("Passwords do not match.");
    }

    if (newPassword.length < 6) {
      return setErrorMessage("Password must be at least 6 characters long.");
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/auth/verify-security-answers", {
        email: email.trim(),
        answers: answers.map((a) => a.trim()),
        newPassword,
      });

      if (response.data.success) {
        setStep(3);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error resetting password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
          <div className="hidden md:block">
            <LoginHeroSection />
          </div>
          <div className="py-24 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Answer Security Questions"}
              {step === 3 && "Password Reset Successful"}
            </h2>

            {/* Step 3: Success */}
            {step === 3 && (
              <>
                <div className="text-center mt-8">
                  <svg
                    className="inline-w-32 h-32 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="my-4 text-xl font-bold text-center">
                  Password Reset Successful
                </p>
                <p className="mt-4 mb-8 font-semibold text-center">
                  Your password has been successfully reset. You can now log in
                  with your new password.
                </p>
                <div className="text-center mt-4">
                  <Link to="/login">
                    <button className="btn btn-block btn-primary">
                      Go to Login
                    </button>
                  </Link>
                </div>
              </>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <>
                <p className="my-8 font-semibold text-center">
                  Enter your email to retrieve your security questions
                </p>
                <form onSubmit={submitEmail}>
                  <div className="mb-4">
                    <InputText
                      type="email"
                      defaultValue={email}
                      updateType="email"
                      containerStyle="mt-4"
                      labelTitle="Email"
                      placeholder="you@mail.com"
                      updateFormValue={({ value }) => setEmail(value)}
                    />
                  </div>

                  <ErrorText styleClass="mt-12">{errorMessage}</ErrorText>
                  <button
                    type="submit"
                    className={
                      "btn mt-2 w-full btn-primary" +
                      (loading ? " loading" : "")
                    }
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Continue"}
                  </button>

                  <div className="text-center mt-4">
                    Remember your password?{" "}
                    <Link to="/login">
                      <button className="inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                        Login
                      </button>
                    </Link>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: Security Questions and New Password */}
            {step === 2 && (
              <>
                <p className="my-6 font-semibold text-center">
                  Answer your security questions and set a new password
                </p>
                <form onSubmit={submitAnswersAndPassword}>
                  <div className="mb-6 space-y-4">
                    {securityQuestions.map((sq, index) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium">
                          Security Question {index + 1}
                        </label>
                        <div className="p-3 bg-base-200 rounded-lg mb-2">
                          <p className="text-sm font-semibold">{sq.question}</p>
                        </div>
                        <input
                          type="text"
                          value={answers[index]}
                          onChange={(e) =>
                            handleAnswerChange(index, e.target.value)
                          }
                          className="input input-bordered w-full"
                          placeholder="Enter your answer"
                          required
                        />
                      </div>
                    ))}

                    <div className="divider mt-6 mb-4">New Password</div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <ErrorText styleClass="mt-4">{errorMessage}</ErrorText>
                  <button
                    type="submit"
                    className={
                      "btn mt-4 w-full btn-primary" +
                      (loading ? " loading" : "")
                    }
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setErrorMessage("");
                        setAnswers(["", ""]);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200"
                    >
                      Back to Email
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
