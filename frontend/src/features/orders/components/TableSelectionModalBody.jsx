import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables } from "../../tables/tableSlice";
import { fetchFloors } from "../../floors/floorSlice";
import { Check } from "lucide-react";

const TableSelectionModalBody = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const { onSelect, selectedTableId } = extraObject;

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
      closeModal();
    }
  };

  const availableTables = tables.filter(isTableSelectable);

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Floor Tabs */}
      {floors.length > 1 && (
        <div className="tabs tabs-boxed mb-4 shrink-0 overflow-x-auto no-scrollbar">
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
      <div className="flex-1 overflow-y-auto mb-4 pr-1">
        {availableTables.length === 0 ? (
          <div className="text-center py-12 text-base-content/50">
            <p>No available tables on this floor</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tables.map((table) => {
              const selectable = isTableSelectable(table);
              const isSelected =
                selectedTable?._id === table._id ||
                (!selectedTable && selectedTableId === table._id);

              return (
                <button
                  key={table._id}
                  onClick={() => handleTableClick(table)}
                  disabled={!selectable}
                  className={`
                    relative aspect-square rounded-xl border-2 transition-all p-2 flex flex-col items-center justify-center
                    ${isSelected ? "border-primary scale-105 shadow-md z-10" : "border-base-300"}
                    ${selectable ? "hover:scale-105 cursor-pointer" : "opacity-50 cursor-not-allowed"}
                    ${getTableStatusColor(table.status)} bg-opacity-10
                  `}
                >
                  <div className="font-bold text-lg">{table.tableNumber}</div>
                  <div className="text-xs opacity-70">
                    {table.capacity} seats
                  </div>
                  <div
                    className={`text-[10px] mt-1 badge badge-xs ${getTableStatusColor(table.status)} text-white border-none py-2 px-2 uppercase font-bold`}
                  >
                    {table.status}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5 shadow-sm">
                      <Check size={12} className="text-primary-content" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-base-300 gap-4 mt-auto">
        <div className="text-sm text-base-content/70 text-center sm:text-left">
          {selectedTable ? (
            <span>
              Selected: <strong>Table {selectedTable.tableNumber}</strong> (
              {selectedTable.capacity} seats)
            </span>
          ) : (
            <span>Select an available table to continue</span>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={closeModal}
            className="btn btn-ghost flex-1 sm:flex-none"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTable}
            className="btn btn-primary flex-1 sm:flex-none px-8"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableSelectionModalBody;
