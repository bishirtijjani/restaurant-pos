import { useState } from "react";
import { useDispatch } from "react-redux";
import { showNotification } from "../../common/headerSlice";
import { createStore } from "../storeSlice";

function AddStoreModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState({
    name: "",
    location: "",
    phone: "",
    email: "",
    currency: "USD",
    taxRate: 0,
    isActive: true,
  });

  const updateFormValue = ({ updateType, value }) => {
    setStoreData({ ...storeData, [updateType]: value });
  };

  const saveNewStore = () => {
    if (storeData.name.trim() === "")
      return dispatch(
        showNotification({ message: "Store Name is required!", status: 0 })
      );

    setLoading(true);
    dispatch(createStore(storeData))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: "New Store Added!", status: 1 }));
        closeModal();
      })
      .catch((err) => {
        dispatch(
          showNotification({
            message: "Error creating store: " + err,
            status: 0,
          })
        );
        setLoading(false);
      });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Store Name*</span>
          </label>
          <input
            type="text"
            value={storeData.name}
            onChange={(e) =>
              updateFormValue({ updateType: "name", value: e.target.value })
            }
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Location/Address</span>
          </label>
          <input
            type="text"
            value={storeData.location}
            onChange={(e) =>
              updateFormValue({ updateType: "location", value: e.target.value })
            }
            className="input input-bordered w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Phone</span>
            </label>
            <input
              type="text"
              value={storeData.phone}
              onChange={(e) =>
                updateFormValue({ updateType: "phone", value: e.target.value })
              }
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="text"
              value={storeData.email}
              onChange={(e) =>
                updateFormValue({ updateType: "email", value: e.target.value })
              }
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Currency</span>
            </label>
            <select
              className="select select-bordered"
              value={storeData.currency}
              onChange={(e) =>
                updateFormValue({
                  updateType: "currency",
                  value: e.target.value,
                })
              }
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Tax Rate (%)</span>
            </label>
            <input
              type="number"
              value={storeData.taxRate}
              onChange={(e) =>
                updateFormValue({
                  updateType: "taxRate",
                  value: parseFloat(e.target.value),
                })
              }
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>

      <div className="modal-action">
        <button className="btn btn-ghost" onClick={() => closeModal()}>
          Cancel
        </button>
        <button className="btn btn-primary px-6" onClick={() => saveNewStore()}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </>
  );
}

export default AddStoreModalBody;
