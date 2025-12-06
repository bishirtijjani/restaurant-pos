import { useState } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";

function InputModalBody({ closeModal, extraObject }) {
  const dispatch = useDispatch();
  const { title, message, inputType = "text", confirmAction, placeholder = "" } = extraObject;
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setError("This field is required");
      return;
    }
    confirmAction(inputValue);
    dispatch(closeModal());
  };

  return (
    <>
      <p className="text-xl font-bold text-center mb-4">{title}</p>
      <p className="text-center mb-6">{message}</p>

      <div className="form-control w-full mb-6">
        {inputType === "textarea" ? (
          <textarea
            className={`textarea textarea-bordered h-24 ${error ? "textarea-error" : ""}`}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
          ></textarea>
        ) : (
          <input
            type={inputType}
            placeholder={placeholder}
            className={`input input-bordered w-full ${error ? "input-error" : ""}`}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
          />
        )}
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>

      <div className="modal-action mt-12">
        <button className="btn btn-outline" onClick={() => dispatch(closeModal())}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Confirm
        </button>
      </div>
    </>
  );
}

export default InputModalBody;
