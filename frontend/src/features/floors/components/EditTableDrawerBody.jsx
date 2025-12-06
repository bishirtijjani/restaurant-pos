import React, { useState, useEffect } from "react";
import { Save, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateTable } from "../../tables/tableSlice";
import { showNotification } from "../../common/headerSlice";
import { openModal } from "../../common/modalSlice";
import { MODAL_BODY_TYPES, CONFIRMATION_MODAL_CLOSE_TYPES } from "../../../utils/globalConstantUtil";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import SearchableSelect from "../../../components/Input/SearchableSelect";

const EditTableDrawerBody = ({ closeRightDrawer, table }) => {
  const dispatch = useDispatch();
  
  // Initialize state with correct structure
  const [tableData, setTableData] = useState({
      ...table,
      tableNumber: table.tableNumber || table.name || "",
      capacity: table.capacity || table.seats || 4,
      width: table.position?.width || table.width || 60,
      height: table.position?.height || table.height || 60,
      shape: table.shape || "rectangle"
  });

  // Update state if table prop changes
  useEffect(() => {
      setTableData({
          ...table,
          tableNumber: table.tableNumber || table.name || "",
          capacity: table.capacity || table.seats || 4,
          width: table.position?.width || table.width || 60,
          height: table.position?.height || table.height || 60,
          shape: table.shape || "rectangle"
      });
  }, [table]);

  const shapeOptions = [
      { value: "rectangle", name: "Rectangle" },
      { value: "circle", name: "Circle" }
  ];

  const handleSaveTable = async () => {
    try {
        // Construct payload matching backend schema
        // Ensure numeric values are numbers
        const payload = {
            tableNumber: tableData.tableNumber,
            capacity: parseInt(tableData.capacity),
            shape: tableData.shape,
            position: {
                ...table.position,
                x: table.position?.x || 0,
                y: table.position?.y || 0,
                rotation: table.position?.rotation || 0,
                width: parseInt(tableData.width),
                height: parseInt(tableData.height),
            }
        };
        
        await dispatch(updateTable({ id: tableData._id, ...payload })).unwrap();
        dispatch(showNotification({ message: "Table updated", status: 1 }));
        closeRightDrawer();
    } catch (error) {
        console.error("Update failed:", error);
        dispatch(showNotification({ message: "Failed to update table", status: 0 }));
    }
  };

  const handleDelete = () => {
      dispatch(openModal({
          title: "Confirmation",
          bodyType: MODAL_BODY_TYPES.CONFIRMATION,
          extraObject: {
              message: "Are you sure you want to delete this table?",
              type: CONFIRMATION_MODAL_CLOSE_TYPES.DELETE_TABLE,
              id: tableData._id,
          },
      }));
      // Note: We don't closeRightDrawer() here immediately, 
      // the confirmation modal success handler (in ConfirmationModalBody) or listener should ideally handle it,
      // or the user can manually close it. 
      // But typically deleting the object means we should close the drawer.
      // Since ConfirmationModalBody deletes it, we can listen for table changes or just close it here if we passed a callback?
      // Actually ConfirmationModalBody executes the delete.
      closeRightDrawer();
  };

  const handleNumberChange = (e) => {
      const { name, value } = e.target;
      setTableData(prev => ({
          ...prev,
          [name]: value
      }));
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Table Number</span>
        </label>
        <input
          type="text"
          value={tableData.tableNumber || ""}
          onChange={(e) =>
            setTableData({ ...tableData, tableNumber: e.target.value })
          }
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Shape</span>
        </label>
        <SearchableSelect
          options={shapeOptions}
          value={tableData.shape || "rectangle"}
          onChange={(e) =>
            setTableData({ ...tableData, shape: e.target.value })
          }
          name="shape"
          placeholder="Select shape"
          className="w-full"
          valueKey="value"
          labelKey="name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Width</span>
          </label>
          <FormattedNumberInput
            name="width"
            value={tableData.width}
            onChange={handleNumberChange}
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Height</span>
          </label>
          <FormattedNumberInput
            name="height"
            value={tableData.height}
            onChange={handleNumberChange}
            className="input input-bordered w-full"
          />
        </div>
      </div>
      
       <div className="form-control">
        <label className="label">
          <span className="label-text">Capacity</span>
        </label>
        <FormattedNumberInput
            name="capacity"
            value={tableData.capacity}
            onChange={handleNumberChange}
            className="input input-bordered w-full"
        />
      </div>

      <div className="pt-4 flex gap-2">
        <button
          onClick={handleSaveTable}
          className="btn btn-primary flex-1 gap-2"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-error btn-outline"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EditTableDrawerBody;
