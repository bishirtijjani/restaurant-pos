import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../app/authSlice"; // Import the loginUser thunk
import { Link, useNavigate } from "react-router-dom";
import LoginHeroSection from "./LoginHeroSection";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import { showNotification } from "../common/headerSlice";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth); // Get loading and error from Redux

  const [loginObj, setLoginObj] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    const { email, password } = loginObj;
    if (!email || !password) {
      dispatch(
        showNotification({ message: "Please fill in all fields", status: 0 })
      );
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        navigate("/app/dashboard");
      }
    } catch (error) {
      showNotification({ message: "An unexpected error occurred!", status: 0 });
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
          <div className="hidden md:block">
            <LoginHeroSection />
          </div>
          <div className="py-24 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">Login</h2>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                <InputText
                  defaultValue={loginObj.email}
                  updateType="email"
                  containerStyle="mt-4"
                  labelTitle="Email"
                  updateFormValue={updateFormValue}
                />
                <div className="relative mt-4">
                  <InputText
                    defaultValue={loginObj.password}
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
                {error && (
                  <div className=" mt-4">
                    <span className="my-5 inline-block ">
                      Forgot Password ?{" "}
                      <Link
                        to="/forgot-password "
                        className="text-primary hover:underline "
                      >
                        Click here
                      </Link>
                    </span>
                  </div>
                )}
              </div>

              {error && <ErrorText>{error}</ErrorText>}
              <button type="submit" className={`btn mt-2 w-full btn-primary`}>
                <span className={`${loading ? "loading" : ""}`}>Login</span>
              </button>

              <div className="text-center mt-4">
                Don't have an account ?{" "}
                <span className="inline-block hover:text-primary hover:underline">
                  <Link
                    className="text-primary hover:underline "
                    to="/register"
                  >
                    Register
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

export default Login;
