import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../app/authSlice"; // Import the registerUser thunk
import { Link, useNavigate } from "react-router-dom";
import LoginHeroSection from "./LoginHeroSection";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth); // Get loading and error from Redux

  const [registerObj, setRegisterObj] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(""); // For password match feedback

  const submitForm = async (e) => {
    e.preventDefault();

    const { fullname, email, password, confirmPassword } = registerObj;

    if (!fullname || !email || !password || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError(""); // Clear any previous errors

    try {
      // Dispatch the register action and wait for the response
      await dispatch(registerUser({ fullname, email, password })).unwrap();

      // If successful, redirect to the login page
      navigate("/login");
    } catch (err) {
      // Handle errors gracefully (error is already managed by Redux state)
      console.error("Registration failed: ", err);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setRegisterObj({ ...registerObj, [updateType]: value });
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
              Register
            </h2>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                <InputText
                  defaultValue={registerObj.fullname}
                  updateType="fullname"
                  containerStyle="mt-4"
                  labelTitle="Full Name"
                  updateFormValue={updateFormValue}
                />
                <InputText
                  defaultValue={registerObj.email}
                  updateType="email"
                  containerStyle="mt-4"
                  labelTitle="Email"
                  updateFormValue={updateFormValue}
                />
                <div className="relative mt-4">
                  <InputText
                    defaultValue={registerObj.password}
                    type={showPassword ? "text" : "password"}
                    updateType="password"
                    labelTitle="Password"
                    updateFormValue={updateFormValue}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-10"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="relative mt-4">
                  <InputText
                    defaultValue={registerObj.confirmPassword}
                    type={showConfirmPassword ? "text" : "password"}
                    updateType="confirmPassword"
                    labelTitle="Confirm Password"
                    updateFormValue={updateFormValue}
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
                {passwordError && (
                  <ErrorText styleClass="mt-2">{passwordError}</ErrorText>
                )}
              </div>

              {error && <ErrorText>{error}</ErrorText>}
              <button type="submit" className={`btn mt-2 w-full btn-primary`}>
                <span className={`${loading ? "loading" : ""}`}>Register</span>
              </button>

              <div className="text-center mt-4">
                Already have an account?{" "}
                <span className="inline-block">
                  <Link to="/login" className="text-primary hover:underline">
                    Login
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
