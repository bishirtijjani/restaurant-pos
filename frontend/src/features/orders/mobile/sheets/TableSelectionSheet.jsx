// frontend/src/features/orders/mobile/sheets/TableSelectionSheet.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Check } from "lucide-react";
import { useHaptic } from "../../../../hooks/useHaptic";
import { BottomSheet } from "../../../../components/Mobile";
import { setSelectedTable } from "../../posSlice";
import { fetchTables } from "../../../../features/tables/tableSlice";
import { fetchFloors } from "../../../../features/floors/floorSlice";

/**
 * Table Selection Sheet
 * Mobile-optimized replacement for TableSelectionModal
 */
const TableSelectionSheet = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const haptic = useHaptic();

  // Redux state
  const tables = useSelector((state) => state.tables.tables) || [];
  const floors = useSelector((state) => state.floors.floors) || [];
  const { selectedTable } = useSelector((state) => state.pos);

  // Load data if empty
  React.useEffect(() => {
    if (isOpen) {
      if (tables.length === 0) dispatch(fetchTables());
      if (floors.length === 0) dispatch(fetchFloors());
    }
  }, [isOpen, dispatch, tables.length, floors.length]);

  // Local state for active floor tab
  const [activeFloorId, setActiveFloorId] = React.useState(
    floors.length > 0 ? floors[0]._id : "all"
  );

  // Filter tables by floor and availability
  const filteredTables = React.useMemo(() => {
    let filtered = tables;

    // Filter by floor
    if (activeFloorId !== "all") {
      filtered = filtered.filter((t) => t.floorId === activeFloorId);
    }

    return filtered;
  }, [tables, activeFloorId]);

  const handleTableSelect = (table) => {
    if (table.status !== "available") {
      haptic.error();
      return;
    }

    haptic.success();
    dispatch(setSelectedTable(table));
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-success text-success-content border-success";
      case "occupied":
        return "bg-error text-error-content border-error opacity-60";
      case "reserved":
        return "bg-warning text-warning-content border-warning opacity-80";
      case "cleaning":
        return "bg-info text-info-content border-info opacity-80";
      case "unavailable":
        return "bg-neutral text-neutral-content border-neutral opacity-50";
      default:
        return "bg-base-200 border-base-300";
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Select Table"
      snapPoints={[0.85]}
      initialSnap={0}
    >
      <div className="flex flex-col h-full bg-base-100">
        {/* Floor Tabs */}
        {floors.length > 0 && (
          <div className="px-4 py-2 border-b border-base-200 overflow-x-auto snap-scroll scrollbar-hide">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFloorId("all")}
                className={`btn btn-sm ${
                  activeFloorId === "all" ? "btn-primary" : "btn-ghost"
                }`}
              >
                All Floors
              </button>
              {floors.map((floor) => (
                <button
                  key={floor._id}
                  onClick={() => setActiveFloorId(floor._id)}
                  className={`btn btn-sm ${
                    activeFloorId === floor._id ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {floor.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {filteredTables.map((table) => {
              const isSelected = selectedTable?._id === table._id;
              const isAvailable = table.status === "available";

              return (
                <button
                  key={table._id}
                  onClick={() => handleTableSelect(table)}
                  disabled={!isAvailable}
                  className={`
                            aspect-square rounded-xl p-2 flex flex-col items-center justify-center relative border-2 transition-all
                            ${
                              isSelected
                                ? "ring-2 ring-primary ring-offset-2"
                                : ""
                            }
                            ${getStatusColor(table.status)}
                            ${
                              !isAvailable
                                ? "cursor-not-allowed"
                                : "active:scale-95 shadow-sm"
                            }
                        `}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-content rounded-full w-5 h-5 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  <span className="text-xl font-bold">{table.tableNumber}</span>

                  <div className="flex items-center gap-1 text-xs mt-1 opacity-80">
                    <Users size={10} />
                    <span>{table.capacity}</span>
                  </div>

                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-300/50 backdrop-blur-[1px] rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider -rotate-12 bg-base-100 px-1 py-0.5 rounded shadow-sm opacity-100">
                        {table.status}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {filteredTables.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <p>No tables found for this floor.</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-base-200 text-xs grid grid-cols-3 gap-2 sticky bottom-0 bg-base-100 safe-area-bottom">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div> Available
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error"></div> Occupied
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div> Reserved
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default TableSelectionSheet;
