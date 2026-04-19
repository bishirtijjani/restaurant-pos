import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createMasterItem, updateMasterItem } from "../brandMenuSlice";
import { closeModal } from "../../common/modalSlice";
import MultiSelect from "../../../components/Input/MultiSelect";
import ImageUploader from "../../../components/Input/ImageUploader";
import { DIETARY_TAGS, ALLERGENS } from "../../../utils/dietaryConstants";

function BrandMenuForm({ extraObject }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    description: "",
    image: "",
    preparationTime: 15,
    allergens: [],
    dietaryTags: [],
  });

  useEffect(() => {
    if (extraObject) {
      setFormData({
        name: extraObject.name || "",
        category: extraObject.category || "",
        price: extraObject.price || 0,
        description: extraObject.description || "",
        image: extraObject.image || "",
        preparationTime: extraObject.preparationTime || 15,
        allergens: extraObject.allergens || [],
        dietaryTags: extraObject.dietaryTags || [],
      });
    }
  }, [extraObject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "preparationTime"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (extraObject?._id) {
        await dispatch(
          updateMasterItem({
            id: extraObject._id,
            updates: formData,
          })
        ).unwrap();
      } else {
        await dispatch(createMasterItem(formData)).unwrap();
      }

      dispatch(closeModal());
      dispatch({
        type: "header/showNotification",
        payload: {
          message: extraObject
            ? "Master item updated (draft)"
            : "Master item created (draft)",
          status: 1,
        },
      });
    } catch (error) {
      dispatch({
        type: "header/showNotification",
        payload: { message: error, status: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Item Name *</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Signature Burger"
            className="input input-bordered focus:input-primary transition-all"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Category *</span>
          </label>
          <input
            type="text"
            name="category"
            placeholder="e.g. Main Course"
            className="input input-bordered focus:input-primary transition-all"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Master Price *</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 opacity-40">$</span>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              className="input input-bordered w-full pl-8 focus:input-primary transition-all"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Prep Time (mins)</span>
          </label>
          <input
            type="number"
            name="preparationTime"
            min="1"
            className="input input-bordered focus:input-primary transition-all"
            value={formData.preparationTime}
            onChange={handleChange}
          />
        </div>

        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text font-semibold">Description</span>
          </label>
          <textarea
            name="description"
            placeholder="Describe this item for your customers..."
            className="textarea textarea-bordered h-24 focus:textarea-primary transition-all"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Allergens */}
        <div className="form-control md:col-span-1">
          <label className="label">
            <span className="label-text font-semibold">Allergens</span>
          </label>
          <MultiSelect
            options={ALLERGENS.map((a) => ({ value: a, name: a }))}
            value={formData.allergens}
            onChange={handleChange}
            name="allergens"
            placeholder="Select allergens"
          />
        </div>

        {/* Dietary Tags */}
        <div className="form-control md:col-span-1">
          <label className="label">
            <span className="label-text font-semibold">Dietary Tags</span>
          </label>
          <MultiSelect
            options={DIETARY_TAGS.map((t) => ({ value: t, name: t }))}
            value={formData.dietaryTags}
            onChange={handleChange}
            name="dietaryTags"
            placeholder="Select tags (e.g. Halal)"
          />
        </div>

        <div className="form-control md:col-span-2">
          <label className="label border-t border-base-200 mt-2 pt-4">
            <span className="label-text font-semibold">Item Image</span>
          </label>
          <ImageUploader
            value={formData.image}
            onChange={(url) =>
              setFormData((prev) => ({ ...prev, image: url }))
            }
          />
        </div>
      </div>

      <div className="modal-action bg-base-200/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => dispatch(closeModal())}
          disabled={loading}
        >
          Discard
        </button>
        <button
          type="submit"
          className="btn btn-primary px-8 shadow-lg shadow-primary/20"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : extraObject ? (
            "Save Changes"
          ) : (
            "Create Master Item"
          )}
        </button>
      </div>
    </form>
  );
}

export default BrandMenuForm;
