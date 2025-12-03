import React, { useState, useEffect } from "react";
import { X, Save, Trash2, User, Users } from "lucide-react";
import FormattedNumberInput from "../../../components/Input/FormattedNumberInput";
import TableDetailsDrawerBody from "./TableDetailsDrawerBody";

const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-96 bg-base-100 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

const FloorDrawers = ({
  activeDrawer,
  onClose,
  selectedTable,
  onUpdateTable,
  onDeleteTable,
}) => {
  const [tableData, setTableData] = useState(selectedTable || {});

  useEffect(() => {
    if (selectedTable) {
      setTableData(selectedTable);
    }
  }, [selectedTable]);

  const handleSaveTable = () => {
    onUpdateTable(tableData._id, tableData);
    onClose();
  };

  return (
    <>
      {/* Edit Table Drawer */}
      <Drawer
        isOpen={activeDrawer === "EDIT_TABLE"}
        onClose={onClose}
        title="Edit Table"
      >
        <div className="space-y-4">
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
              <FormattedNumberInput
                name="width"
                value={tableData.width}
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
              <FormattedNumberInput
                name="height"
                value={tableData.height}
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
            <FormattedNumberInput
              name="seats"
              value={tableData.seats}
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
              onClick={() => {
                  if(window.confirm("Delete this table?")) {
                      onDeleteTable(tableData._id);
                      onClose();
                  }
              }}
              className="btn btn-error btn-outline"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Drawer>

      {/* Table Details Drawer */}
      <Drawer
        isOpen={activeDrawer === "TABLE_DETAILS"}
        onClose={onClose}
        title={`Table ${selectedTable?.name || ""}`}
      >
        <TableDetailsDrawerBody 
            table={selectedTable} 
            closeRightDrawer={onClose} 
        />
      </Drawer>
    </>
  );
};

export default FloorDrawers;
