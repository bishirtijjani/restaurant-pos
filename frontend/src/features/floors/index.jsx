import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useContextMenu } from "react-contexify";
import {
  fetchFloors,
  updateTablePositions,
  optimisticUpdateTablePosition,
} from "./floorSlice";
import {
  fetchTables,
  updateTable,
  updateTableStatus,
  deleteTable,
  createTable,
  mergeTables,
  optimisticUpdateTablePosition as optimisticUpdateTablePositionTableSlice,
} from "../tables/tableSlice";
import {
  getReservations,
  updateReservation,
  selectReservedSoon,
} from "../reservations/reservationSlice";
import { showNotification } from "../common/headerSlice";
import { openRightDrawer } from "../common/rightDrawerSlice";
import { openModal } from "../common/modalSlice";
import {
  RIGHT_DRAWER_TYPES,
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../utils/globalConstantUtil";
import useWebSocket from "../common/hooks/useWebSocket";

import FloorCanvas from "./components/FloorCanvas";
import ReservationSidebar from "./components/ReservationSidebar";
import ContextMenu, { MENU_ID } from "./components/ContextMenu";
import { Plus, Save, Settings, Monitor, Combine } from "lucide-react";
import { useReservationLifecycle } from "../reservations/reservationLifecycleHooks";

import { Lock, Unlock } from "lucide-react"; // Import Lock icons

const FloorManager = () => {
  const dispatch = useDispatch();
  const { floors, loading: floorsLoading } = useSelector(
    (state) => state.floors
  );
  const { tables } = useSelector((state) => state.tables);
  const { items: reservations } = useSelector((state) => state.reservations);
  
  // Get Timezone from Auth User Store Settings
  const { user } = useSelector((state) => state.auth);
  // Optional chaining is safe here. If store or settings missing, default to UTC.
  const timezone = user?.store?.settings?.timezone || "UTC";

  // Pass timezone to selector
  const reservedSoonReservations = useSelector((state) => selectReservedSoon(state, timezone));
  const reservedSoonTableIds = useMemo(
    () =>
      reservedSoonReservations
        .filter((r) => r.tableId)
        .map((r) => r.tableId._id || r.tableId),
    [reservedSoonReservations]
  );

  const [activeFloorId, setActiveFloorId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [locked, setLocked] = useState(false); // New Locked State
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableIds, setSelectedTableIds] = useState([]); // Lifted state

// ... (keep middle code same) ...

              <button
                className="btn btn-sm btn-primary"
                title="Add New Floor"
                onClick={() =>
                  dispatch(
                    openModal({
                      title: "Add New Floor",
                      bodyType: MODAL_BODY_TYPES.ADD_NEW_FLOOR,
                    })
                  )
                }
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
                {/* Lock Toggle for Mobile/Tablet */}
                <button
                  className={`btn btn-sm btn-circle ${locked ? "btn-error" : "btn-ghost"}`}
                  onClick={() => setLocked(!locked)}
                  title={locked ? "Unlock View" : "Lock View (Enable Scrolling)"}
                >
                    {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>

              <div className="join">
                <button
                  className={`join-item btn btn-sm ${
                    !editMode ? "btn-primary" : ""
                  }`}
                  onClick={() => setEditMode(false)}
                >
                  <Monitor className="w-4 h-4 mr-1" /> Live
                </button>
                <button
                  className={`join-item btn btn-sm ${
                    editMode ? "btn-primary" : ""
                  }`}
                  onClick={() => setEditMode(true)}
                >
                  <Settings className="w-4 h-4 mr-1" /> Edit
                </button>
              </div>

              {editMode && (
                <>
                  {selectedTableIds.length > 1 && (
                    <button
                      onClick={handleMergeTables}
                      className="btn btn-sm btn-warning gap-2 text-white"
                    >
                      <Combine className="w-4 h-4" /> Merge (
                      {selectedTableIds.length})
                    </button>
                  )}
                  <button
                    onClick={handleAddTable}
                    className="btn btn-sm btn-outline gap-2"
                  >
                    <Plus className="w-4 h-4" /> Table
                  </button>
                  <button
                    onClick={handleSaveLayout}
                    className="btn btn-sm btn-success gap-2 text-white"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            {floorsLoading ? (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <FloorCanvas
                ref={stageRef}
                floor={floors.find((f) => f._id === activeFloorId) || {}}
                tables={tables}
                editMode={editMode}
                locked={locked} // Pass locked state
                snapTarget={snapTarget}
                onTableChange={(id, newAttrs) => {
                  dispatch(
                    optimisticUpdateTablePositionTableSlice({
                      tableId: id,
                      position: newAttrs.position,
                    })
                  );
                  if (newAttrs.width !== undefined) {
                    dispatch(updateTable({ id, ...newAttrs }));
                  }
                }}
                onTableClick={handleTableClick}
                onTableContextMenu={handleTableContextMenu}
                reservedSoonTableIds={reservedSoonTableIds}
                selectedTableIds={selectedTableIds}
                onTableSelect={handleTableSelect}
              />
            )}
          </div>
        </div>

        <ContextMenu onAction={handleContextMenuAction} />
        <DragOverlay>
          {activeReservation && (
            <div className="card bg-base-100 shadow-xl border-2 border-primary p-3 cursor-grabbing opacity-90">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm">
                  {activeReservation.customerName}
                </h4>
                <span className="badge badge-sm badge-ghost">
                  {activeReservation.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <span>{activeReservation.partySize} guests</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default FloorManager;
