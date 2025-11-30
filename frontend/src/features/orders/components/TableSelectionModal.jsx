// frontend/src/features/orders/components/TableSelectionModal.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables } from "../../tables/tableSlice";
import { fetchFloors } from "../../floors/floorSlice";
import { X, Check } from "lucide-react";

const TableSelectionModal = ({ onSelect, onClose, selectedTableId }) => {
  const dispatch = useDispatch();
  const { tables } = useSelector((state) => state.tables);
  const { floors } = useSelector((state) => state.floors);
  
  const [activeFloorId, setActiveFloorId] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    dispatch(fetchFloors());
  }, [dispatch]);

  useEffect(() => {
    if (floors.length > 0 && !activeFloorId) {
      setActiveFloorId(floors[0]._id);
    }
  }, [floors, activeFloorId]);

  useEffect(() => {
    if (activeFloorId) {
      dispatch(fetchTables({ floorId: activeFloorId }));
    }
  }, [activeFloorId, dispatch]);

  const getTableStatusColor = (status) => {
    const statusMap = {
      available: "bg-success",
      occupied: "bg-error",
      reserved: "bg-warning",
      cleaning: "bg-info",
      unavailable: "bg-base-300",
    };
    return statusMap[status?.toLowerCase()] || "bg-base-300";
  };

  const isTableSelectable = (table) => {
    const status = table.status?.toLowerCase();
    return status === "available";
  };

  const handleTableClick = (table) => {
    if (isTableSelectable(table)) {
      setSelectedTable(table);
    }
  };

  const handleConfirm = () => {
    if (selectedTable) {
      onSelect(selectedTable);
      onClose();
    }
  };

  const availableTables = tables.filter(isTableSelectable);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Select Table</h3>
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
          <X size={18} />
        </button>
      </div>

      {/* Floor Tabs */}
      {floors.length > 1 && (
        <div className="tabs tabs-boxed mb-4">
          {floors.map((floor) => (
            <a
              key={floor._id}
              className={`tab ${activeFloorId === floor._id ? "tab-active" : ""}`}
              onClick={() => setActiveFloorId(floor._id)}
            >
              {floor.name}
            </a>
          ))}
        </div>
      )}

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto mb-4">
        {availableTables.length === 0 ? (
          <div className="text-center py-12 text-base-content/50">
            <p>No available tables on this floor</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {tables.map((table) => {
              const selectable = isTableSelectable(table);
              const isSelected = selectedTable?._id === table._id;
              
              return (
                <button
                  key={table._id}
                  onClick={() => handleTableClick(table)}
                  disabled={!selectable}
                  className={`
                    relative aspect-square rounded-lg border-2 transition-all
                    ${isSelected ? "border-primary scale-105" : "border-base-300"}
                    ${selectable ? "hover:scale-105 cursor-pointer" : "opacity-50 cursor-not-allowed"}
                    ${getTableStatusColor(table.status)} bg-opacity-10
                  `}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <div className="font-bold text-lg">{table.tableNumber}</div>
                    <div className="text-xs opacity-70">{table.capacity} seats</div>
                    <div className={`text-xs mt-1 badge badge-xs ${getTableStatusColor(table.status)} text-white`}>
                      {table.status}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <Check size={16} className="text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-base-300">
        <div className="text-sm text-base-content/70">
          {selectedTable ? (
            <span>
              Selected: <strong>Table {selectedTable.tableNumber}</strong> ({selectedTable.capacity} seats)
            </span>
          ) : (
            <span>Select a table to continue</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTable}
            className="btn btn-sm btn-primary"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableSelectionModal;
