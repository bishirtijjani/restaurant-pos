import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode"; // Corrected import
import ErrorText from "../../../components/Typography/ErrorText";
import { fetchAllSuppliers } from "../../suppliers/suppliersSlice";
import { fetchAllMenuItems } from "../../menuItems/menuItemsSlice";
import { createPurchase, fetchAllPurchases } from "../purchaseSlice";
import { showNotification } from "../../common/headerSlice";

function AddPurchaseModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const { suppliers, loading: suppliersLoading } = useSelector(
    (state) => state.suppliers
  );
  const { menuItems, loading: menuItemsLoading } = useSelector(
    (state) => state.menuItems
  );

  const [purchase, setPurchase] = useState({
    purchaseDate: new Date().toISOString().split("T")[0],
    supplier: "",
    menuItems: [],
    totalCost: 0,
    createdBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    dispatch(fetchAllSuppliers());
    dispatch(fetchAllMenuItems());

    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setPurchase((prev) => ({ ...prev, createdBy: decodedToken.userId }));
    }
  }, [dispatch]);

  const handleInputChange = (e) => {
    setPurchase({ ...purchase, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleMenuItemChange = (index, e) => {
    const newMenuItems = [...purchase.menuItems];
    const { name, value } = e.target;

    if (
      name === "totalCost" ||
      name === "quantity" ||
      name === "packSellingPrice" ||
      name === "unitSellingPrice"
    ) {
      newMenuItems[index] = {
        ...newMenuItems[index],
        [name]: value === "" ? "" : parseFloat(value),
      };

      if (name === "totalCost" && value !== "") {
        const prices = calculatePrices(index, parseFloat(value));
        newMenuItems[index] = { ...newMenuItems[index], ...prices };
      }
    } else if (name === "menuItemId") {
      newMenuItems[index] = { ...newMenuItems[index], menuItemId: value };
      const prices = calculatePrices(index, newMenuItems[index].totalCost || 0);
      newMenuItems[index] = { ...newMenuItems[index], ...prices };
    } else {
      newMenuItems[index] = { ...newMenuItems[index], [name]: value };
    }

    setPurchase({ ...purchase, menuItems: newMenuItems });
    setErrorMessage("");
  };

  const addMenuItemField = () => {
    setPurchase({
      ...purchase,
      menuItems: [
        ...purchase.menuItems,
        {
          menuItemId: "",
          batchNumber: "",
          quantity: 1,
          totalCost: 0,
          packPurchasePrice: 0,
          unitPurchasePrice: 0,
          packSellingPrice: 0,
          unitSellingPrice: 0,
          expiryDate: "", // Add expiry date with an empty string as the default value
        },
      ],
    });
  };

  const calculatePrices = (index, totalCost) => {
    const menuItem = menuItems.find(
      (p) => p._id === purchase.menuItems[index].menuItemId
    );
    const unitsInPack = menuItem ? menuItem.unitsInPack : 1;
    const quantity = purchase.menuItems[index].quantity || 1;

    const packPurchasePrice = totalCost / quantity || 0;
    const unitPurchasePrice = packPurchasePrice / unitsInPack || 0;

    return { packPurchasePrice, unitPurchasePrice, totalCost };
  };

  const removeMenuItemField = (index) => {
    const newMenuItems = purchase.menuItems.filter((_, i) => i !== index);
    setPurchase({ ...purchase, menuItems: newMenuItems });
  };

  const savePurchase = () => {
    if (!purchase.supplier) return setErrorMessage("Supplier is required!");
    if (purchase.menuItems.length === 0)
      return setErrorMessage("At least one menuItem is required!");

    setLoading(true);
    dispatch(createPurchase(purchase))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "Purchase added successfully!",
            status: 1,
          })
        );
        dispatch(fetchAllPurchases());
        closeModal();
      })
      .catch((error) => {
        dispatch(showNotification({ message: error.message, status: 0 }));
        setErrorMessage(error.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="text-lg font-semibold">Add New Purchase</h2>
      </div>
      <div className="modal-body">
        <div className="mt-4">
          <label htmlFor="purchaseDate" className="block text-sm font-medium">
            Purchase Date
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            value={purchase.purchaseDate}
            onChange={handleInputChange}
            className="input input-bordered w-full mt-2"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="supplier" className="block text-sm font-medium">
            Supplier
          </label>
          <select
            id="supplier"
            name="supplier"
            value={purchase.supplier}
            onChange={handleInputChange}
            className="select select-bordered w-full mt-2"
            disabled={suppliersLoading}
          >
            <option value="">---- Select a Supplier ----</option>
            {suppliers.map((sup) => (
              <option key={sup._id} value={sup._id}>
                {sup.name}
              </option>
            ))}
          </select>
          {suppliersLoading && <p>Loading suppliers...</p>}
        </div>
        {purchase.menuItems.map((prod, index) => (
          <div key={index} className="mt-8 border p-3 border-black">
            <label className="bg-slate-200 max-w-fit p-2 rounded-3xl block text-sm font-medium">
              MenuItem {index + 1}
            </label>
            <select
              name="menuItemId"
              value={prod.menuItemId}
              onChange={(e) => handleMenuItemChange(index, e)}
              className="select select-bordered w-full mt-2"
              disabled={menuItemsLoading}
            >
              <option value="">Select a MenuItem</option>
              {menuItems.map((menuItem) => (
                <option key={menuItem._id} value={menuItem._id}>
                  {menuItem.name}
                </option>
              ))}
            </select>

            <label
              htmlFor={`batchNumber-${index}`}
              className="block text-sm mt-4 label"
            >
              Batch Number
            </label>
            <input
              type="text"
              id={`batchNumber-${index}`}
              name="batchNumber"
              value={prod.batchNumber}
              onChange={(e) => handleMenuItemChange(index, e)}
              className="input input-bordered w-full mt-2"
              placeholder="Enter Batch Number"
            />

            <label
              htmlFor={`quantity-${index}`}
              className="block text-sm mt-4 label"
            >
              Quantity
            </label>
            <input
              type="number"
              id={`quantity-${index}`}
              name="quantity"
              value={prod.quantity}
              onChange={(e) => handleMenuItemChange(index, e)}
              className="input input-bordered w-full mt-2"
              min={1}
              placeholder="Enter Quantity"
            />

            <label
              htmlFor={`totalCost-${index}`}
              className="block text-sm mt-4 label"
            >
              Total Cost (₦)
            </label>
            <input
              type="number"
              id={`totalCost-${index}`}
              name="totalCost"
              value={prod.totalCost}
              onChange={(e) => handleMenuItemChange(index, e)}
              className="input input-bordered w-full mt-2"
              min={0}
              placeholder="Enter Total Cost"
            />

            <label
              htmlFor={`packPurchasePrice-${index}`}
              className="block text-sm mt-4 label"
            >
              Purchase Price per Pack (₦)
            </label>
            <input
              type="number"
              id={`packPurchasePrice-${index}`}
              value={
                prod.packPurchasePrice
                  ? prod.packPurchasePrice.toFixed(2)
                  : "0.00"
              }
              className="input input-bordered w-full mt-2"
              disabled
            />

            <label
              htmlFor={`unitPurchasePrice-${index}`}
              className="block text-sm mt-4 label"
            >
              Purchase Price per Unit (₦)
            </label>
            <input
              type="number"
              id={`unitPurchasePrice-${index}`}
              value={
                prod.unitPurchasePrice
                  ? prod.unitPurchasePrice.toFixed(2)
                  : "0.00"
              }
              className="input input-bordered w-full mt-2"
              disabled
            />

            <label
              htmlFor={`packSellingPrice-${index}`}
              className="block text-sm mt-4 label"
            >
              Selling Price per Pack (₦)
            </label>
            <input
              type="number"
              id={`packSellingPrice-${index}`}
              name="packSellingPrice"
              value={prod.packSellingPrice}
              onChange={(e) => handleMenuItemChange(index, e)}
              className="input input-bordered w-full mt-2"
              min={0}
              placeholder="Enter Selling Price per Pack"
            />

            <label
              htmlFor={`unitSellingPrice-${index}`}
              className="block text-sm mt-4 label"
            >
              Selling Price per Unit (₦)
            </label>
            <input
              type="number"
              id={`unitSellingPrice-${index}`}
              name="unitSellingPrice"
              value={prod.unitSellingPrice}
              onChange={(e) => handleMenuItemChange(index, e)}
              className="input input-bordered w-full mt-2"
              min={0}
              placeholder="Enter Selling Price per Unit"
            />

            <label
              htmlFor={`expiryDate-${index}`}
              className="block text-sm mt-4 label"
            >
              Expiry Date
            </label>
            <input
              type="date"
              id={`expiryDate-${index}`}
              value={prod.expiryDate || ""}
              onChange={(e) => handleMenuItemChange(index, e)}
              name="expiryDate"
              className="input input-bordered w-full mt-2"
            />

            {/* Remove Button */}
            <button
              onClick={() => removeMenuItemField(index)}
              className="btn btn-error mt-4"
            >
              Remove
            </button>
          </div>
        ))}
        <button onClick={addMenuItemField} className="btn btn-secondary mt-4">
          Add MenuItem
        </button>
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
      </div>
      <div className="modal-action">
        <button
          onClick={savePurchase}
          className={`btn btn-primary ${loading ? "loading" : ""}`}
        >
          Save Purchase
        </button>
        <button onClick={closeModal} className="btn btn-error">
          Close
        </button>
      </div>
    </div>
  );
}

export default AddPurchaseModalBody;
