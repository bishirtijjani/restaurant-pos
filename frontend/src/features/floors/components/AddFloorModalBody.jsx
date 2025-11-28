import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ErrorText from "../../../components/Typography/ErrorText";
import { showNotification } from "../../common/headerSlice";
import { createFloor, fetchFloors } from "../floorSlice";
import { Building2, Grid3x3, Maximize2 } from "lucide-react";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";

function AddFloorModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const { floors } = useSelector((state) => state.floors);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Smart default for floor number
  const suggestedFloorNumber = floors.length > 0 
    ? Math.max(...floors.map(f => f.floorNumber || 0)) + 1 
    : 1;

  const [floor, setFloor] = useState({
    name: "",
    floorNumber: suggestedFloorNumber,
    description: "",
    isActive: true,
    layout: {
      width: 2000,
      height: 2000,
      gridSize: 20,
    },
  });

  const saveFloor = () => {
    // Validation
    if (floor.name.trim() === "") {
      return setErrorMessage("Floor name is required!");
    }

    if (floor.layout.width <= 0 || floor.layout.height <= 0) {
      return setErrorMessage("Canvas dimensions must be positive numbers!");
    }

    if (floor.layout.gridSize <= 0) {
      return setErrorMessage("Grid size must be a positive number!");
    }

    setLoading(true);
    dispatch(createFloor(floor))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: "Floor Created Successfully!",
            status: 1,
          })
        );
        dispatch(fetchFloors());
        closeModal();
      })
      .catch((error) => {
        setErrorMessage(`${error.message || "Failed to create floor"}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    setErrorMessage("");
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("layout.")) {
      const layoutField = name.split(".")[1];
      setFloor({
        ...floor,
        layout: {
          ...floor.layout,
          [layoutField]: type === "number" ? Number(value) : value,
        },
      });
    } else {
      setFloor({
        ...floor,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Floor Name */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="label">
            <span className="label-text font-medium">
              Floor Name <span className="text-error">*</span>
            </span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
            <input
              type="text"
              id="name"
              name="name"
              value={floor.name}
              onChange={handleInputChange}
              className="input input-bordered w-full pl-10"
              placeholder="e.g., Main Floor, Second Floor, Patio"
              autoFocus
            />
          </div>
        </div>

        {/* Floor Number */}
        <div>
          <label htmlFor="floorNumber" className="label">
            <span className="label-text font-medium">Floor Number</span>
          </label>
          <FormattedNumberInput
            name="floorNumber"
            value={floor.floorNumber}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="1"
            min={1}
            step="1"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-end pb-3">
          <label className="label cursor-pointer gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={floor.isActive}
              onChange={handleInputChange}
              className="checkbox checkbox-primary"
            />
            <span className="label-text font-medium">Active Floor</span>
          </label>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="label">
            <span className="label-text font-medium">Description</span>
            <span className="label-text-alt text-base-content/50">Optional</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={floor.description}
            onChange={handleInputChange}
            className="textarea textarea-bordered w-full"
            placeholder="Add any notes about this floor..."
            rows="3"
          />
        </div>
      </div>

      {/* Layout Settings */}
      <div className="divider mt-6 mb-4">Canvas Settings</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Canvas Width */}
        <div>
          <label htmlFor="layout.width" className="label">
            <span className="label-text font-medium flex items-center gap-2">
              <Maximize2 className="w-4 h-4" />
              Width (px)
            </span>
          </label>
          <FormattedNumberInput
            name="layout.width"
            value={floor.layout.width}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="2000"
            min={500}
            step="100"
          />
        </div>

        {/* Canvas Height */}
        <div>
          <label htmlFor="layout.height" className="label">
            <span className="label-text font-medium flex items-center gap-2">
              <Maximize2 className="w-4 h-4" />
              Height (px)
            </span>
          </label>
          <FormattedNumberInput
            name="layout.height"
            value={floor.layout.height}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="2000"
            min={500}
            step="100"
          />
        </div>

        {/* Grid Size */}
        <div>
          <label htmlFor="layout.gridSize" className="label">
            <span className="label-text font-medium flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Grid Size (px)
            </span>
          </label>
          <FormattedNumberInput
            name="layout.gridSize"
            value={floor.layout.gridSize}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="20"
            min={5}
            step="5"
          />
        </div>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span className="text-sm">Default canvas size is 2000×2000px with a 20px grid. You can adjust these later in edit mode.</span>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <ErrorText styleClass="mt-4">{errorMessage}</ErrorText>
      )}

      {/* Modal Actions */}
      <div className="modal-action">
        <button className="btn btn-ghost" onClick={closeModal}>
          Cancel
        </button>
        <button
          className={`btn btn-primary px-6 ${loading ? "loading" : ""}`}
          onClick={saveFloor}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Floor"}
        </button>
      </div>
    </>
  );
}

export default AddFloorModalBody;
