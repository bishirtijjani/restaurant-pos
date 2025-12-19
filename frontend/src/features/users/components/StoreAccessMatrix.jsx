import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStores } from "../../stores/storeSlice";
import { updateUser } from "../../users/usersSlice";
import { showNotification } from "../../common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";

function StoreAccessMatrix({ user, onClose }) {
  const dispatch = useDispatch();
  const { items: allStores } = useSelector((state) => state.stores);
  const [userStores, setUserStores] = useState([]);

  // Initialize user's current stores
  useEffect(() => {
    if (user && user.stores) {
      setUserStores(
        user.stores.map((s) => ({
          storeId: s.storeId?._id || s.storeId,
          role: s.role || "staff",
        }))
      );
    }
    dispatch(getStores());
  }, [user, dispatch]);

  const handleToggleStore = (storeId) => {
    const exists = userStores.find((s) => s.storeId === storeId);
    if (exists) {
      // Remove
      setUserStores(userStores.filter((s) => s.storeId !== storeId));
    } else {
      // Add with default role 'staff'
      setUserStores([...userStores, { storeId, role: "staff" }]);
    }
  };

  const handleRoleChange = (storeId, newRole) => {
    setUserStores(
      userStores.map((s) =>
        s.storeId === storeId ? { ...s, role: newRole } : s
      )
    );
  };

  const handleSave = () => {
    // Backend expects { stores: [{ storeId, role }] }
    dispatch(updateUser({ id: user._id, user: { stores: userStores } }))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "Access updated successfully",
            status: 1,
          })
        );
        if (onClose) onClose();
      })
      .catch((err) => {
        dispatch(
          showNotification({ message: "Failed to update access", status: 0 })
        );
      });
  };

  return (
    <TitleCard title={`Manage Access: ${user.name}`} topMargin="mt-2">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Has Access</th>
              <th>Store Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {allStores.map((store, k) => {
              const access = userStores.find((s) => s.storeId === store._id);
              const isChecked = !!access;

              return (
                <tr key={k}>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={isChecked}
                      onChange={() => handleToggleStore(store._id)}
                    />
                  </td>
                  <td>{store.name}</td>
                  <td>
                    <select
                      className="select select-bordered select-sm w-full max-w-xs"
                      disabled={!isChecked}
                      value={access?.role || "staff"}
                      onChange={(e) =>
                        handleRoleChange(store._id, e.target.value)
                      }
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="cashier">Cashier</option>
                      <option value="staff">Staff</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="waiter">Waiter</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </TitleCard>
  );
}

export default StoreAccessMatrix;
