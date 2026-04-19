import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Lock } from "lucide-react";
import ErrorText from "../../../components/Typography/ErrorText";
import { showNotification } from "../../common/headerSlice";
import { updateCategory, fetchAllCategories } from "../categoriesSlice";

function EditCategoryModalBody({ extraObject, closeModal }) {
  const categoryItem = extraObject;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Brand-lock helpers
  const isBrandControlled = !!categoryItem?.masterId;
  const BRAND_TIP = "Brand-controlled. Edit this in the Brand Dashboard.";
  const BrandLockedField = ({ children }) => {
    if (!isBrandControlled) return children;
    return (
      <div className="tooltip tooltip-top w-full" data-tip={BRAND_TIP}>
        {children}
      </div>
    );
  };
  const BrandLockIcon = () =>
    isBrandControlled ? (
      <Lock className="w-3.5 h-3.5 text-base-content/40 ml-1.5 inline-block" />
    ) : null;

  const [category, setCategory] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (categoryItem) {
      setCategory({
        name: categoryItem.name || "",
        description: categoryItem.description || "",
      });
    }
  }, [categoryItem]);

  const saveCategory = () => {
    if (category.name.trim() === "")
      return setErrorMessage("Category name is required!");

    setLoading(true);
    dispatch(updateCategory({ id: categoryItem._id, category }))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "Category Updated Successfully!",
            status: 1,
          }),
        );
        closeModal();
      })
      .catch((error) => {
        setErrorMessage(error.message || "Failed to update category");
        dispatch(
          showNotification({
            message: error.message || "Failed to update category",
            status: 0,
          }),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    setErrorMessage("");
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  return (
    <>
      {isBrandControlled && (
        <div className="alert alert-warning mb-4 py-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            This category is managed by the Brand. Only brand admins can edit it.
          </span>
        </div>
      )}

      {/* Category Name */}
      <div className="mt-4">
        <BrandLockedField>
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Category Name <BrandLockIcon />
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={category.name}
              onChange={handleInputChange}
              className="input input-bordered w-full mt-2"
              placeholder="Enter Category Name"
              disabled={isBrandControlled}
            />
          </div>
        </BrandLockedField>
      </div>

      {/* Category Description */}
      <div className="mt-4">
        <BrandLockedField>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Category Description <BrandLockIcon />
            </label>
            <textarea
              id="description"
              name="description"
              value={category.description}
              onChange={handleInputChange}
              className="input input-bordered w-full mt-2"
              placeholder="Enter Category Description"
              rows="4"
              disabled={isBrandControlled}
            />
          </div>
        </BrandLockedField>
      </div>

      {/* Error Message */}
      <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>

      {/* Modal Actions */}
      <div className="modal-action">
        <button className="btn btn-error" onClick={closeModal}>
          Cancel
        </button>
        <button
          className={`btn btn-primary px-6 ${loading ? "loading" : ""}`}
          onClick={saveCategory}
        >
          Save
        </button>
      </div>
    </>
  );
}

export default EditCategoryModalBody;
