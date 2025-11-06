// frontend/src/features/inventory/components/LinkMenuItemsModalBody.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  linkToMenuItem,
  unlinkMenuItem,
  fetchInventoryItemById,
} from "../inventorySlice";
import { fetchAllMenuItems } from "../../menuItems/menuItemsSlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import { Search, Link as LinkIcon, Unlink, Trash2 } from "lucide-react";
import ErrorText from "../../../components/Typography/ErrorText";

const LinkMenuItemsModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const inventoryItem = extraObject;
  const menuItems = useSelector((state) => state.menuItems.menuItems || []);
  const { loading } = useSelector((state) => state.inventory);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [error, setError] = useState("");
  const [linkedItems, setLinkedItems] = useState([]);

  useEffect(() => {
    dispatch(fetchAllMenuItems());
    if (inventoryItem?.linkedMenuItems) {
      setLinkedItems(inventoryItem.linkedMenuItems);
    }
  }, [dispatch, inventoryItem]);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const notLinked = !linkedItems.find(
      (linked) => linked.menuItemId._id === item._id
    );
    return matchesSearch && notLinked;
  });

  const handleLink = async () => {
    if (!selectedMenuItem) {
      setError("Please select a menu item");
      return;
    }
    if (!quantityUsed || parseFloat(quantityUsed) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    try {
      await dispatch(
        linkToMenuItem({
          id: inventoryItem._id,
          menuItemId: selectedMenuItem,
          quantityUsed: parseFloat(quantityUsed),
        })
      ).unwrap();

      dispatch(
        showNotification({
          message: "Menu item linked successfully",
          status: 1,
        })
      );

      // Refresh the inventory item to get updated links
      const updated = await dispatch(
        fetchInventoryItemById(inventoryItem._id)
      ).unwrap();
      setLinkedItems(updated.data.linkedMenuItems || []);

      setSelectedMenuItem("");
      setQuantityUsed("");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to link menu item");
      dispatch(
        showNotification({
          message: err.message || "Failed to link menu item",
          status: 0,
        })
      );
    }
  };

  const handleUnlink = async (menuItemId) => {
    try {
      await dispatch(
        unlinkMenuItem({
          id: inventoryItem._id,
          menuItemId,
        })
      ).unwrap();

      dispatch(
        showNotification({
          message: "Menu item unlinked successfully",
          status: 1,
        })
      );

      // Refresh the inventory item
      const updated = await dispatch(
        fetchInventoryItemById(inventoryItem._id)
      ).unwrap();
      setLinkedItems(updated.data.linkedMenuItems || []);
    } catch (err) {
      dispatch(
        showNotification({
          message: err.message || "Failed to unlink menu item",
          status: 0,
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Inventory Item Info */}
      <div className="alert alert-info">
        <div>
          <div className="font-bold">{inventoryItem.name}</div>
          <div className="text-sm">
            Current Stock: {inventoryItem.currentStock} {inventoryItem.unit}
          </div>
        </div>
      </div>

      {/* Link New Menu Item Section */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-lg flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Link Menu Item
          </h3>

          <div className="space-y-4">
            {/* Search */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search Menu Items</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search by menu item name..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Select Menu Item */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select Menu Item</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedMenuItem}
                onChange={(e) => {
                  setSelectedMenuItem(e.target.value);
                  setError("");
                }}
              >
                <option value="">-- Select a menu item --</option>
                {filteredMenuItems.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} - {item.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Used */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Quantity Used (per serving) in {inventoryItem.unit}
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="e.g., 0.5"
                value={quantityUsed}
                onChange={(e) => {
                  setQuantityUsed(e.target.value);
                  setError("");
                }}
                min="0"
                step="0.01"
              />
              <label className="label">
                <span className="label-text-alt">
                  How much of this ingredient is used to make one serving
                </span>
              </label>
            </div>

            {error && <ErrorText>{error}</ErrorText>}

            <button
              onClick={handleLink}
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Linking...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link Menu Item
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Linked Menu Items Section */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-lg flex items-center gap-2">
            <Unlink className="w-5 h-5" />
            Linked Menu Items ({linkedItems.length})
          </h3>

          {linkedItems.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <LinkIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No menu items linked yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {linkedItems.map((link) => (
                <div
                  key={link.menuItemId._id}
                  className="flex items-center justify-between p-3 bg-base-100 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{link.menuItemId.name}</div>
                    <div className="text-sm text-base-content/70">
                      Uses {link.quantityUsed} {inventoryItem.unit} per serving
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnlink(link.menuItemId._id)}
                    className="btn btn-ghost btn-sm text-error"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="modal-action">
        <button
          onClick={() => dispatch(closeModal())}
          className="btn btn-outline"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LinkMenuItemsModalBody;
