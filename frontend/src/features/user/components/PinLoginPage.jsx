import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUserWithPin, clearAuthError } from "../../../app/authSlice";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../common/headerSlice";
import PinLogin from "./PinLogin";
import InputText from "../../../components/Input/InputText";

function PinLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState(localStorage.getItem("lastEmail") || "");
  const [showPinPad, setShowPinPad] = useState(!!email);

  const submitPinLogin = async (pinCode) => {
    if (!email) {
      dispatch(
        showNotification({
          message: "Email is required for PIN login",
          status: 0,
        })
      );
      setShowPinPad(false);
      return;
    }

    try {
      const result = await dispatch(loginUserWithPin({ email, pinCode }));
      if (loginUserWithPin.fulfilled.match(result)) {
        localStorage.setItem("lastEmail", email);
        navigate("/app/dashboard");
      } else if (loginUserWithPin.rejected.match(result)) {
        dispatch(
          showNotification({
            message: result.payload || "Invalid PIN",
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

  const switchToPasswordMode = () => {
    dispatch(clearAuthError());
    navigate("/login");
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      dispatch(
        showNotification({ message: "Please enter your email", status: 0 })
      );
      return;
    }
    setShowPinPad(true);
  };

  const updateEmail = ({ value }) => {
    setEmail(value);
  };

  return (
    <div>
      {!showPinPad ? (
        <form onSubmit={handleEmailSubmit}>
          <h3 className="text-xl font-semibold mb-4 text-center">
            Enter your email for PIN login
          </h3>
          <InputText
            defaultValue={email}
            updateType="email"
            autoComplete="email"
            containerStyle="mt-4"
            labelTitle="Email"
            updateFormValue={updateEmail}
          />
          <button
            type="submit"
            className={`btn mt-4 w-full btn-primary ${
              loading ? "loading" : ""
            }`}
            disabled={loading}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={switchToPasswordMode}
            className="btn btn-ghost w-full mt-2"
            disabled={loading}
          >
            Use Password Instead
          </button>
        </form>
      ) : (
        <PinLogin
          email={email}
          onLogin={submitPinLogin}
          onCancel={switchToPasswordMode}
          loading={loading}
        />
      )}
    </div>
  );
}

export default PinLoginPage;
