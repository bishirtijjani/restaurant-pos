import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateMenuItem } from "../menuItemsSlice";
import { closeModal } from "../../common/modalSlice";
import { showNotification } from "../../common/headerSlice";
import InputText from "../../../components/Input/InputText";
import TextAreaInput from "../../../components/Input/TextAreaInput";

import ToggleInput from "../../../components/Input/ToggleInput";
import { fetchAllCategories } from "../../categories/categoriesSlice";
import { fetchAddOnGroups } from "../../addOnGroups/addOnGroupsSlice";
import { Check, PlusCircle, Lock } from "lucide-react";
import SearchableSelect from "../../../components/Input/SearchableSelect";
import MultiSelect from "../../../components/Input/MultiSelect";
import { ALLERGENS, DIETARY_TAGS } from "../../../utils/dietaryConstants";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import { openModal } from "../../common/modalSlice";
import axios from "../../../utils/offline/offlineAxios";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";

const EditMenuItemModalBody = ({ extraObject }) => {
  const dispatch = useDispatch();
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories,
  );
  const { settings } = useSelector((state) => state.generalSettings);
  const currency = settings?.currency?.symbol || "$";
  const menuItem = extraObject;

  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(fetchAddOnGroups({ isActive: true }));
  }, [dispatch]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    costPrice: "",
    itemCode: "",
    preparationTime: "",
    description: "",
    isAvailable: true,
    image: null,
    customTax: {
      enabled: false,
      rate: 0,
    },
    addOnGroups: [],
    allergens: [],
    dietaryTags: [],
  });

  // Add state for image preview
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOnGroups = useSelector((state) => state.addOnGroups.groups || []);
  const [selectedAddOnGroups, setSelectedAddOnGroups] = useState([]);

  // Check if this item is synced from the master menu
  const isBrandControlled = !!menuItem?.masterId;
  const BRAND_TIP = "Brand-controlled. Edit this in the Master Menu.";

  /**
   * Wraps any form-control in a full-width tooltip when isBrandControlled.
   * Hovering anywhere on the input triggers the tooltip.
   */
  const BrandLockedField = ({ children }) => {
    if (!isBrandControlled) return children;
    return (
      <div
        className="tooltip tooltip-top w-full"
        data-tip={BRAND_TIP}
      >
        {children}
      </div>
    );
  };

  const BrandLockIcon = () => {
    if (!isBrandControlled) return null;
    return <Lock className="w-3.5 h-3.5 text-base-content/40 ml-1.5 inline-block" />;
  };

  // Initialize form data with the menu item data
  useEffect(() => {
    if (menuItem) {
      // Find category ID from category name
      const categoryId =
        categories.find((cat) => cat.name === menuItem.category)?._id || "";

      setFormData({
        name: menuItem.name || "",
        category: categoryId,
        price: menuItem.price?.toString() || "",
        costPrice: menuItem.costPrice?.toString() || "",
        itemCode: menuItem.itemCode || "",
        preparationTime: menuItem.preparationTime?.toString() || "15",
        description: menuItem.description || "",
        isAvailable:
          menuItem.isAvailable !== undefined ? menuItem.isAvailable : true,
        image: menuItem.image || null,
        customTax: menuItem.customTax || {
          enabled: false,
          rate: 0,
        },
        allergens: menuItem.allergens || [],
        dietaryTags: menuItem.dietaryTags || [],
      });

      // Set image preview if the menu item has an image
      if (menuItem.image) {
        setImagePreview(menuItem.image);
      }

      // Set add-on groups if they exist
      if (menuItem.addOnGroups) {
        setSelectedAddOnGroups(
          menuItem.addOnGroups.map((g) => (typeof g === "object" ? g._id : g)),
        );
      }
    }
  }, [menuItem, categories]);

  const toggleAddOnGroup = (groupId) => {
    setSelectedAddOnGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const openAddNewCategory = () => {
    dispatch(
      openModal({
        title: "Add New Category",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_CATEGORY,
        size: "xl",
      }),
    );
  };

  const updateFormValue = ({ updateType, value }) => {
    setFormData({
      ...formData,
      [updateType]: value,
    });

    // Clear error when field is updated
    if (errors[updateType]) {
      setErrors({
        ...errors,
        [updateType]: null,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        image: "Please select a valid image (JPEG, PNG or WEBP)",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({
        ...errors,
        image: "Image size should be less than 2MB",
      });
      return;
    }

    // Clear any previous errors
    if (errors.image) {
      setErrors({
        ...errors,
        image: null,
      });
    }

    // Create file reader to convert image to base64
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setImageFile(file);
      // Not setting it in formData to save memory, it will be uploaded first
      // updateFormValue({ updateType: "image", value: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    updateFormValue({ updateType: "image", value: null });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.category) newErrors.category = "Category is required";

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = "Price must be a valid number";
    }

    if (
      formData.costPrice &&
      (isNaN(formData.costPrice) || parseFloat(formData.costPrice) < 0)
    ) {
      newErrors.costPrice = "Cost price must be a valid number";
    }

    if (
      formData.preparationTime &&
      (isNaN(formData.preparationTime) ||
        parseInt(formData.preparationTime) < 0)
    ) {
      newErrors.preparationTime = "Preparation time must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.image;

      // Upload image to Cloudinary if a file was selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        try {
          const uploadRes = await axios.post("/api/upload", imageFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          if (uploadRes.data?.success) {
            finalImageUrl = uploadRes.data.data.url;
          }
        } catch (uploadErr) {
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // Prepare data for submission
      const updatedData = {
        ...formData,
        image: finalImageUrl,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
        preparationTime: formData.preparationTime
          ? parseInt(formData.preparationTime)
          : 15,
        addOnGroups: selectedAddOnGroups,
        allergens: formData.allergens,
        dietaryTags: formData.dietaryTags,
      };

      // Dispatch the updateMenuItem thunk
      const resultAction = await dispatch(
        updateMenuItem({ id: menuItem._id, updatedData }),
      );

      if (updateMenuItem.fulfilled.match(resultAction)) {
        dispatch(
          showNotification({
            message: "Menu item updated successfully",
            status: 1,
          }),
        );
        dispatch(closeModal());
      } else {
        throw new Error(
          resultAction.payload?.message || "Failed to update menu item",
        );
      }
    } catch (error) {
      dispatch(showNotification({ message: error.message, status: 0 }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name field */}
          <BrandLockedField>
            <div className="form-control">
              <label className="label justify-start">
                <span className="label-text">Item Name</span>
                <BrandLockIcon />
                <span className="label-text-alt text-error ml-auto">
                  {errors.name}
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter item name"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) =>
                  updateFormValue({ updateType: "name", value: e.target.value })
                }
                required
                disabled={isBrandControlled}
              />
            </div>
          </BrandLockedField>

          {/* Category dropdown */}
          <BrandLockedField>
            <div className="form-control">
              <label className="label justify-start">
                <span className="label-text">Category</span>
                <BrandLockIcon />
                <div className="flex items-center gap-2 ml-auto">
                  <span className="label-text-alt text-error">
                    {errors.category}
                  </span>
                  {!isBrandControlled && (
                    <button
                      type="button"
                      onClick={openAddNewCategory}
                      className="btn btn-ghost btn-xs text-primary"
                      title="Add New Category"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </label>
              <SearchableSelect
                options={categories || []}
                value={formData.category}
                onChange={(e) =>
                  updateFormValue({
                    updateType: "category",
                    value: e.target.value,
                  })
                }
                name="category"
                placeholder={
                  categoriesLoading ? "Loading categories..." : "Select category"
                }
                disabled={categoriesLoading || isBrandControlled}
                className="w-full"
                valueKey="_id"
                labelKey="name"
              />
            </div>
          </BrandLockedField>

          {/* Selling Price field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Selling Price ({currency})</span>
              <span className="label-text-alt text-error">{errors.price}</span>
            </label>
            <FormattedNumberInput
              name="price"
              value={formData.price}
              onChange={(e) =>
                updateFormValue({ updateType: "price", value: e.target.value })
              }
              className="input input-bordered w-full"
              placeholder="Enter Selling price"
              min={0}
              required
            />
          </div>

          {/* Cost Price field (optional) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Cost Price ({currency}) (optional)
              </span>
              <span className="label-text-alt text-error">
                {errors.costPrice}
              </span>
            </label>
            <FormattedNumberInput
              name="costPrice"
              value={formData.costPrice}
              onChange={(e) =>
                updateFormValue({
                  updateType: "costPrice",
                  value: e.target.value,
                })
              }
              className="input input-bordered w-full"
              placeholder="Enter cost price"
              min={0}
            />
          </div>

          {/* Item Code field (optional) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Item Code (optional)</span>
              <span className="label-text-alt text-error">
                {errors.itemCode}
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter item code"
              className="input input-bordered w-full"
              value={formData.itemCode}
              onChange={(e) =>
                updateFormValue({
                  updateType: "itemCode",
                  value: e.target.value,
                })
              }
            />
          </div>

          {/* Preparation Time field */}
          <BrandLockedField>
            <div className="form-control">
              <label className="label justify-start">
                <span className="label-text">Preparation Time (minutes)</span>
                <BrandLockIcon />
                <span className="label-text-alt text-error ml-auto">
                  {errors.preparationTime}
                </span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="Enter preparation time"
                className="input input-bordered w-full"
                value={formData.preparationTime}
                onChange={(e) =>
                  updateFormValue({
                    updateType: "preparationTime",
                    value: e.target.value,
                  })
                }
                disabled={isBrandControlled}
              />
            </div>
          </BrandLockedField>
        </div>

        {/* Description field (full width) */}
        <BrandLockedField>
          <div className="mt-4 form-control">
            <label className="label justify-start">
              <span className="label-text">Description (optional)</span>
              <BrandLockIcon />
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Enter item description"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                updateFormValue({
                  updateType: "description",
                  value: e.target.value,
                })
              }
              disabled={isBrandControlled}
            ></textarea>
          </div>
        </BrandLockedField>

        {/* Dietary Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <BrandLockedField>
            <div className="form-control">
              <label className="label justify-start">
                <span className="label-text">Allergens</span>
                <BrandLockIcon />
              </label>
              <MultiSelect
                options={ALLERGENS.map((a) => ({ value: a, name: a }))}
                value={formData.allergens}
                onChange={(e) =>
                  updateFormValue({
                    updateType: "allergens",
                    value: e.target.value,
                  })
                }
                name="allergens"
                placeholder="Select allergens"
                disabled={isSubmitting || isBrandControlled}
              />
            </div>
          </BrandLockedField>
          <BrandLockedField>
            <div className="form-control">
              <label className="label justify-start">
                <span className="label-text">Dietary Tags</span>
                <BrandLockIcon />
              </label>
              <MultiSelect
                options={DIETARY_TAGS.map((t) => ({ value: t, name: t }))}
                value={formData.dietaryTags}
                onChange={(e) =>
                  updateFormValue({
                    updateType: "dietaryTags",
                    value: e.target.value,
                  })
                }
                name="dietaryTags"
                placeholder="Select tags (e.g. Halal)"
                disabled={isSubmitting || isBrandControlled}
              />
            </div>
          </BrandLockedField>
        </div>

        {/* Image upload field (full width) */}
        <BrandLockedField>
          <div className="mt-4 form-control">
            <label className="label justify-start">
              <span className="label-text">Item Image (optional)</span>
              <BrandLockIcon />
              <span className="label-text-alt text-error ml-auto">
                {errors.image}
              </span>
            </label>

            {imagePreview ? (
              <div className="flex flex-col items-center border rounded-lg p-4 border-base-300">
                <div className="w-full flex justify-center mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 object-contain rounded-md"
                  />
                </div>
                {/* Hide "Remove Image" button if locked */}
                {!isBrandControlled && (
                  <button
                    type="button"
                    className="btn btn-outline btn-error btn-sm"
                    onClick={removeImage}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            ) : isBrandControlled ? (
              <div className="border-2 border-dashed border-base-300 rounded-lg p-6 flex flex-col items-center bg-base-200 opacity-70">
                <p className="text-sm text-center mb-2">
                  Image is managed by Brand
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-base-300 rounded-lg p-6 flex flex-col items-center">
                <div className="mb-2 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-base-content opacity-40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-center mb-2">
                  Click or drag & drop to upload an image
                </p>
                <p className="text-xs text-center text-base-content opacity-60 mb-4">
                  JPEG, PNG or WEBP (max 2MB)
                </p>
                <label className="btn btn-outline btn-sm" htmlFor="image-upload">
                  Browse Files
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg, image/png, image/jpg, image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            )}
          </div>
        </BrandLockedField>

        {/* Availability toggle */}
        <div className="mt-4 form-control">
          <label className="label cursor-pointer justify-start gap-2">
            <span className="label-text">Available for Order</span>
            <input
              type="checkbox"
              className="toggle toggle-primary ml-2"
              checked={formData.isAvailable}
              onChange={(e) =>
                updateFormValue({
                  updateType: "isAvailable",
                  value: e.target.checked,
                })
              }
            />
          </label>
        </div>

        <div className="divider">Tax Settings (Optional)</div>

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={formData.customTax.enabled}
              onChange={(e) =>
                updateFormValue({
                  updateType: "customTax",
                  value: { ...formData.customTax, enabled: e.target.checked },
                })
              }
            />
            <div>
              <span className="label-text font-medium">Custom Tax Rate</span>
              <p className="text-xs opacity-70">
                Override global tax for this item
              </p>
            </div>
          </label>
        </div>

        {formData.customTax.enabled && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Tax Rate (%)</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              value={formData.customTax.rate}
              onChange={(e) =>
                updateFormValue({
                  updateType: "customTax",
                  value: {
                    ...formData.customTax,
                    rate: parseFloat(e.target.value),
                  },
                })
              }
              min="0"
              max="100"
              step="0.1"
              placeholder="Enter custom tax rate"
            />
          </div>
        )}

        <div className="divider">Add-On Groups (Optional)</div>

        <BrandLockedField>
        <div className="form-control">
          <label className="label justify-start">
            <span className="label-text">
              Select add-on groups for this item
            </span>
            <BrandLockIcon />
          </label>
          {addOnGroups.length === 0 ? (
            <div className="alert alert-info">
              <span>
                No add-on groups available. Create them in the Add-On Groups
                section.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {addOnGroups.map((group) => (
                <label
                  key={group._id}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${isBrandControlled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-base-200 transition"} ${
                    selectedAddOnGroups.includes(group._id)
                      ? "border-primary bg-primary/10"
                      : "border-base-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAddOnGroups.includes(group._id)}
                    onChange={() =>
                      !isBrandControlled && toggleAddOnGroup(group._id)
                    }
                    className="checkbox checkbox-primary checkbox-sm"
                    disabled={isBrandControlled}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{group.name}</div>
                    <div className="text-xs text-base-content/70">
                      {group.items?.length || 0} items •{" "}
                      {group.isRequired ? "Required" : "Optional"}
                    </div>
                  </div>
                  {selectedAddOnGroups.includes(group._id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
        </BrandLockedField>

        {/* Submit button */}
        <div className="modal-action">
          <button
            className="btn btn-outline"
            onClick={() => dispatch(closeModal())}
            type="button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              "Update Item"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMenuItemModalBody;
