import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import axios from "axios";
import {
  EnvelopeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import SupportLink from "../../components/Support/SupportLink";

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
        error.response?.data?.message || "Error retrieving security questions.",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitAnswersAndPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (answers[0].trim() === "" || answers[1].trim() === "") {
      return setErrorMessage("Please answer both security questions.");
    }

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
        error.response?.data?.message || "Error resetting password.",
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
    <div className="relative min-h-screen bg-stone-50 text-gray-900 font-sans selection:bg-brand/30">
      {/* Immersive Background Engine */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden lg:flex w-1/2 flex-col justify-center px-24 border-r border-gray-300">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-brand/30">
                P
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-gray-900">
                CODEKET
              </span>
            </div>

            <h1 className="text-6xl font-black tracking-tight leading-[0.9] mb-8 text-gray-900">
              Vault
              <br />
              <span className="text-brand italic">Recovery.</span>
            </h1>

            <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-md">
              Securely reset your credentials through our multi-factor recovery
              system.
            </p>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24 relative overflow-y-auto">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-gray-200 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-gray-300/60 relative"
            >
              <div className="mb-10 text-center lg:text-left transition-all">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                  {step === 1 && "Identity"}
                  {step === 2 && "Verification"}
                  {step === 3 && "Success"}
                </h2>
                <p className="text-gray-600 font-semibold">
                  {step === 1 && "Enter your registered email address"}
                  {step === 2 && "Confirm security challenge details"}
                  {step === 3 && "Credentials successfully updated"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={submitEmail}
                    className="space-y-6"
                  >
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <InputText
                        type="email"
                        defaultValue={email}
                        updateType="email"
                        containerStyle="mt-0"
                        labelTitle=""
                        updateFormValue={({ value }) => setEmail(value)}
                        placeholder="Email Address"
                        className="pl-14 bg-gray-50 border-2 text-gray-900 border-gray-300 focus:border-brand rounded-full shadow-inner"
                      />
                    </div>

                    {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-20 font-black py-4 rounded-full transition-all flex items-center justify-center gap-2 group shadow-xl"
                    >
                      {loading ? (
                        <span className="loading loading-spinner text-white"></span>
                      ) : (
                        <>
                          Continue{" "}
                          <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <div className="text-center pt-4">
                      <Link
                        to="/login"
                        className="text-gray-500 hover:text-gray-900 transition-colors text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <ArrowLeftIcon className="w-3 h-3" /> Back to Sign In
                      </Link>
                    </div>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={submitAnswersAndPassword}
                    className="space-y-6"
                  >
                    <div className="space-y-6">
                      {securityQuestions.map((sq, index) => (
                        <div key={index} className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">
                            Challenge {index + 1}
                          </label>
                          <div className="p-4 bg-gray-100 border-2 border-gray-300 rounded-3xl">
                            <p className="text-sm font-bold text-gray-800">
                              {sq.question}
                            </p>
                          </div>
                          <input
                            type="text"
                            value={answers[index]}
                            onChange={(e) =>
                              handleAnswerChange(index, e.target.value)
                            }
                            className="w-full bg-gray-50 border-2 border-gray-300 rounded-full py-4 px-6 focus:outline-none focus:border-brand text-gray-900 font-bold transition-all shadow-inner"
                            placeholder="Your Answer"
                            required
                          />
                        </div>
                      ))}

                      <div className="pt-4 space-y-4 border-t-2 border-gray-300">
                        <div className="relative">
                          <KeyIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-300 rounded-full py-4 pl-14 pr-6 focus:outline-none focus:border-brand text-gray-900 font-bold transition-all shadow-inner"
                            placeholder="New Secure Password"
                            required
                            minLength={6}
                          />
                        </div>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-gray-50 border-2 border-gray-300 rounded-full py-4 px-6 focus:outline-none focus:border-brand text-gray-900 font-bold transition-all shadow-inner"
                          placeholder="Confirm New Password"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand text-white hover:bg-brand-hover font-black py-4 rounded-full transition-all flex items-center justify-center gap-2 group shadow-xl shadow-brand/20"
                    >
                      {loading ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        "Reset Credentials"
                      )}
                    </button>
                  </motion.form>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8"
                  >
                    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto border border-success/20">
                      <CheckCircleIcon className="w-10 h-10 text-success" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        System Updated
                      </h3>
                      <p className="text-gray-600 text-sm font-semibold">
                        Your password has been successfully reset. You can now
                        securely access your account.
                      </p>
                    </div>
                    <Link to="/login" className="block">
                      <button className="w-full bg-gray-900 text-white font-black py-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all">
                        Sign In Now
                      </button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
      <SupportLink />
    </div>
  );
}

export default ForgotPassword;
