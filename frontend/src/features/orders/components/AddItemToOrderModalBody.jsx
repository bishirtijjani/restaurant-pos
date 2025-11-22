// frontend/src/features/orders/components/AddItemToOrderModalBody.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../common/modalSlice";
import { fetchAllMenuItems } from "../../menuItems/menuItemsSlice";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import { Search } from "lucide-react";

const AddItemToOrderModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const { onConfirm } = extraObject;
  const menuItems = useSelector((state) => state.menuItems.menuItems || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    dispatch(fetchAllMenuItems());
  }, [dispatch]);

  const categories = [
    ...new Set(menuItems.map((item) => item.category)),
  ].sort();

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const handleSelectItem = (item) => {
    // Check if item has add-on groups
    if (item.addOnGroups && item.addOnGroups.length > 0) {
      dispatch(
        openModal({
          title: `Customize ${item.name}`,
          bodyType: MODAL_BODY_TYPES.ADDON_SELECTOR,
          extraObject: {
            menuItem: item,
            onConfirm: (addOnData) => {
              onConfirm({
                menuItemId: item._id,
                name: item.name,
                price: item.price,
                quantity: 1,
                itemNote: addOnData.itemNote,
                addOns: addOnData.addOns,
                addOnsTotal: addOnData.total - item.price,
                subtotal: addOnData.total,
              });
              dispatch(closeModal());
            },
          },
          size: "lg",
        })
      );
    } else {
      onConfirm({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        itemNote: "",
        addOns: [],
        addOnsTotal: 0,
        subtotal: item.price,
      });
      dispatch(closeModal());
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="form-control">
        <label className="input input-bordered flex items-center gap-2">
          <Search className="w-5 h-5 opacity-70" />
          <input
            type="text"
            className="grow"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`btn btn-sm ${
            !selectedCategory ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setSelectedCategory("")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`btn btn-sm ${
              selectedCategory === category ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredItems.map((item) => (
          <button
            key={item._id}
            onClick={() => handleSelectItem(item)}
            className="card bg-base-200 hover:bg-base-300 transition text-left"
          >
            <div className="card-body p-4">
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-base-content/70">{item.category}</p>
              <p className="text-primary font-semibold">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-base-content/70">
          No items found
        </div>
      )}

      <div className="modal-action">
        <button
          onClick={() => dispatch(closeModal())}
          className="btn btn-outline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddItemToOrderModalBody;
