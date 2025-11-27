import React, { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateTable, deleteTable } from "../../tables/tableSlice";
import { showNotification } from "../../common/headerSlice";

const EditTableDrawerBody = ({ closeRightDrawer, table }) => {
  const dispatch = useDispatch();
  console.log("EditTableDrawerBody rendered with table:", table);
  const [tableData, setTableData] = useState(table || {});

  const handleSaveTable = async () => {
    try {
        await dispatch(updateTable({ id: tableData._id, ...tableData })).unwrap();
        dispatch(showNotification({ message: "Table updated", status: 1 }));
        closeRightDrawer();
    } catch (error) {
        dispatch(showNotification({ message: "Failed to update table", status: 0 }));
    }
  };

  const handleDelete = async () => {
      if(window.confirm("Delete this table?")) {
          try {
              await dispatch(deleteTable(tableData._id)).unwrap();
              dispatch(showNotification({ message: "Table deleted", status: 1 }));
              closeRightDrawer();
          } catch (error) {
              dispatch(showNotification({ message: "Failed to delete table", status: 0 }));
          }
      }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Table Name</span>
        </label>
        <input
          type="text"
          value={tableData.name || ""}
          onChange={(e) =>
            setTableData({ ...tableData, name: e.target.value })
          }
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Shape</span>
        </label>
        <select
          value={tableData.shape || "rect"}
          onChange={(e) =>
            setTableData({ ...tableData, shape: e.target.value })
          }
          className="select select-bordered w-full"
        >
          <option value="rect">Rectangle</option>
          <option value="circle">Circle</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Width</span>
          </label>
          <input
            type="number"
            value={tableData.width || 60}
            onChange={(e) =>
              setTableData({
                ...tableData,
                width: parseInt(e.target.value),
              })
            }
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Height</span>
          </label>
          <input
            type="number"
            value={tableData.height || 60}
            onChange={(e) =>
              setTableData({
                ...tableData,
                height: parseInt(e.target.value),
              })
            }
            className="input input-bordered w-full"
          />
        </div>
      </div>
      
       <div className="form-control">
        <label className="label">
          <span className="label-text">Seats</span>
        </label>
        <input
          type="number"
          value={tableData.seats || 4}
          onChange={(e) =>
            setTableData({
              ...tableData,
              seats: parseInt(e.target.value),
            })
          }
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
