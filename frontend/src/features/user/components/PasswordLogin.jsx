import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthError } from "../../../app/authSlice";
import { Link, useNavigate } from "react-router-dom";
import ErrorText from "../../../components/Typography/ErrorText";
import InputText from "../../../components/Input/InputText";
import { showNotification } from "../../common/headerSlice";
import { EyeIcon, EyeSlashIcon, KeyIcon } from "@heroicons/react/24/outline";

function PasswordLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [loginObj, setLoginObj] = useState({
    email: localStorage.getItem("lastEmail") || "",
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
        localStorage.setItem("lastEmail", email);
        navigate("/app/dashboard");
      } else if (loginUser.rejected.match(result)) {
        dispatch(
          showNotification({
            message: result.payload || "Invalid email or password",
            status: 0,
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "An unexpected error occurred!",
          status: 0,
        })
      );
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  const switchToPinMode = () => {
    dispatch(clearAuthError());
    navigate("/login/pin");
  };

  return (
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

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm">
            Forgot Password?{" "}
            <Link
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Click here
            </Link>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-primary gap-2"
            onClick={switchToPinMode}
          >
            <KeyIcon className="w-4 h-4" />
            Use PIN
          </button>
        </div>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      <button type="submit" className={`btn mt-2 w-full btn-primary`}>
        <span className={`${loading ? "loading" : ""}`}>Login</span>
      </button>
    </form>
  );
}

export default PasswordLogin;
