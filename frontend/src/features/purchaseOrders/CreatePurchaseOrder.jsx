import FormattedNumberInput from "../../components/Input/FormattedNumberInput";
import SearchableSelect from "../../components/Input/SearchableSelect";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInventoryItems } from "../inventory/inventorySlice";
import { createPurchaseOrder } from "./purchaseOrdersSlice";
import { fetchAllSuppliers } from "../suppliers/suppliersSlice";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../common/headerSlice";
import { clearError, clearSuccess } from "./purchaseOrdersSlice";
import TitleCard from "../../components/Cards/TitleCard";

import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Calendar,
} from "lucide-react";
import ErrorText from "../../components/Typography/ErrorText";
import { fetchSettings } from "../settings/generalSettings/generalSettingsSlice";

const CreatePurchaseOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success, message } = useSelector(
    (state) => state.purchaseOrders
  );
  const inventoryItems = useSelector((state) => state.inventory.items || []);
  const suppliers = useSelector((state) => state.suppliers.suppliers || []);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );

  const [formData, setFormData] = useState({
    supplier: "",
    expectedDeliveryDate: "",
    items: [
      {
        inventoryItem: "",
        quantity: "",
        unitPrice: "",
      },
    ],
    notes: "",
    invoiceNumber: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!settings) {
      dispatch(fetchSettings());
    }

    dispatch(fetchInventoryItems());
    dispatch(fetchAllSuppliers());
  }, [dispatch]);

  useEffect(() => {
    if (success && message) {
      dispatch(showNotification({ message, status: 1 }));
      dispatch(clearSuccess());
      navigate("/app/purchase-orders");
    }
    if (error) {
      dispatch(
        showNotification({ message: error.message || error, status: 0 })
      );
      dispatch(clearError());
    }
  }, [success, message, error, dispatch, navigate]);

  const currency = settings?.currency.symbol || "$";

  const supplierOptions = [
    { value: "", name: "Select supplier" },
    ...suppliers.map(s => ({ value: s._id, name: s.name }))
  ];

  const itemOptions = [
    { value: "", name: "Select item" },
    ...inventoryItems.map(item => ({
      value: item._id,
      name: `${item.name} - ${item.sku || "No SKU"} (${item.unit})`
    }))
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          inventoryItem: "",
          quantity: "",
          unitPrice: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateItemSubtotal = (quantity, unitPrice) => {
    return (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
  };

  // Note: Total is calculated on the server side for security
  // This is just for display preview
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + calculateItemSubtotal(item.quantity, item.unitPrice);
    }, 0);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.supplier) newErrors.supplier = "Supplier is required";
    if (formData.items.length === 0)
      newErrors.items = "At least one item is required";

    formData.items.forEach((item, index) => {
      if (!item.inventoryItem) newErrors[`item_${index}`] = "Item is required";
      if (!item.quantity || parseFloat(item.quantity) <= 0)
        newErrors[`quantity_${index}`] = "Valid quantity is required";
      if (!item.unitPrice || parseFloat(item.unitPrice) <= 0)
        newErrors[`unitPrice_${index}`] = "Valid unit price is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(createPurchaseOrder(formData)).unwrap();
    } catch (err) {
      // Error handled in useEffect
    }
  };

  return (
    <TitleCard
      title={
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          <span>Create Purchase Order</span>
        </div>
      }
      TopSideButtons={
        <button
          onClick={() => navigate("/app/purchase-orders")}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      }
      topMargin="mt-2"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier and Date Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="text-danger label-text font-medium">
                Supplier *
              </span>
            </label>
            <SearchableSelect
              options={supplierOptions}
              value={formData.supplier}
              onChange={handleChange}
              name="supplier"
              placeholder="Select supplier"
              className={errors.supplier ? "border-error" : ""}
              valueKey="value"
              labelKey="name"
            />
            {errors.supplier && <ErrorText>{errors.supplier}</ErrorText>}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Expected Delivery Date
              </span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-base-content/50" />
              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleChange}
                className="input input-bordered w-full pl-10"
              />
            </div>
          </div>
        </div>

        {/* Invoice Number and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Invoice Number</span>
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="Optional invoice reference"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Notes</span>
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="Additional notes"
            />
          </div>
        </div>

        <div className="divider">Order Items</div>

        {/* Items Section */}
        <div className="space-y-4">
          {formData.items.map((item, index) => {
            const selectedItem = inventoryItems.find(
              (i) => i._id === item.inventoryItem
            );
            const subtotal = calculateItemSubtotal(
              item.quantity,
              item.unitPrice
            );

            return (
              <div
                key={index}
                className="card bg-base-200 border border-base-300"
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">Item {index + 1}</h3>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="text-danger label-text">
                          Inventory Item *
                        </span>
                      </label>
                      <SearchableSelect
                        options={itemOptions}
                        value={item.inventoryItem}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "inventoryItem",
                            e.target.value
                          )
                        }
                        name={`item_${index}`}
                        placeholder="Select item"
                        className={errors[`item_${index}`] ? "border-error" : ""}
                        valueKey="value"
                        labelKey="name"
                      />
                      {errors[`item_${index}`] && (
                        <ErrorText>{errors[`item_${index}`]}</ErrorText>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Quantity * ({selectedItem?.unit || "unit"})
                        </span>
                      </label>
                      <FormattedNumberInput
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        className={`input input-bordered ${
                          errors[`quantity_${index}`] ? "input-error" : ""
                        }`}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      {errors[`quantity_${index}`] && (
                        <ErrorText>{errors[`quantity_${index}`]}</ErrorText>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Unit Price * ({currency})
                        </span>
                      </label>
                      <FormattedNumberInput
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, "unitPrice", e.target.value)
                        }
                        className={`input input-bordered ${
                          errors[`unitPrice_${index}`] ? "input-error" : ""
                        }`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      {errors[`unitPrice_${index}`] && (
                        <ErrorText>{errors[`unitPrice_${index}`]}</ErrorText>
                      )}
                    </div>
                  </div>

                  {subtotal > 0 && (
                    <div className="flex justify-end items-center mt-3 pt-3 border-t border-base-300">
                      <span className="text-sm text-base-content/70 mr-2">
                        Subtotal:
                      </span>
                      <span className="text-lg font-semibold text-primary">
                        {currency}
                        {subtotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addItem}
            className="btn btn-outline btn-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Item
          </button>
        </div>

        {/* Total Section */}
        <div className="card bg-primary/10 border border-primary/20">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">Total Amount</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {currency}
                {calculateTotal().toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate("/app/purchase-orders")}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Purchase Order
              </>
            )}
          </button>
        </div>
      </form>
    </TitleCard>
  );
};

export default CreatePurchaseOrder;
