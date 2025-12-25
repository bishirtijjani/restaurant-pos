import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createMasterItem, updateMasterItem } from "../brandMenuSlice";
import { closeModal } from "../../common/modalSlice";

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
    <form onSubmit={handleSubmit}>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Name *</span>
        </label>
        <input
          type="text"
          name="name"
          className="input input-bordered"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Category *</span>
        </label>
        <input
          type="text"
          name="category"
          className="input input-bordered"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Price *</span>
        </label>
        <input
          type="number"
          name="price"
          step="0.01"
          min="0"
          className="input input-bordered"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          name="description"
          className="textarea textarea-bordered"
          rows="3"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Image URL</span>
        </label>
        <input
          type="text"
          name="image"
          className="input input-bordered"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Preparation Time (minutes)</span>
        </label>
        <input
          type="number"
          name="preparationTime"
          min="1"
          className="input input-bordered"
          value={formData.preparationTime}
          onChange={handleChange}
        />
      </div>

      <div className="modal-action">
        <button
          type="button"
          className="btn"
          onClick={() => dispatch(closeModal())}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : extraObject ? (
            "Update Draft"
          ) : (
            "Create Draft"
          )}
        </button>
      </div>
    </form>
  );
}

export default BrandMenuForm;
