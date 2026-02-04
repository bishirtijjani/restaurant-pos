import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ErrorText from "../../../components/Typography/ErrorText";
import { showNotification } from "../../common/headerSlice";
import { updateCategory, fetchAllCategories } from "../categoriesSlice";

function EditCategoryModalBody({ extraObject, closeModal }) {
  const categoryItem = extraObject;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
      {/* Category Name */}
      <div className="mt-4">
        <label htmlFor="name" className="block text-sm font-medium">
          Category Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={category.name}
          onChange={handleInputChange}
          className="input input-bordered w-full mt-2"
          placeholder="Enter Category Name"
        />
      </div>

      {/* Category Description */}
      <div className="mt-4">
        <label htmlFor="description" className="block text-sm font-medium">
          Category Description
        </label>
        <textarea
          id="description"
          name="description"
          value={category.description}
          onChange={handleInputChange}
          className="input input-bordered w-full mt-2"
          placeholder="Enter Category Description"
          rows="4"
        />
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
