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
  deleteFloor,
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
// Removed ReservationSidebar import as it is now inside FloorSidebarContent
import ContextMenu, { MENU_ID } from "./components/ContextMenu";
import { Plus, Save, Settings, Monitor, Combine, Menu, X } from "lucide-react";
import { useReservationLifecycle } from "../reservations/reservationLifecycleHooks";

import { Lock, Unlock } from "lucide-react"; // Import Lock icons
import FloorSidebarContent from "./components/FloorSidebarContent";

const FloorManager = () => {
  const dispatch = useDispatch();

  // Data Selectors
  const { floors, loading: floorsLoading } = useSelector(
    (state) => state.floors,
  );
  const { tables } = useSelector((state) => state.tables);
  const { items: reservations } = useSelector((state) => state.reservations);

  // Get Timezone from Auth User Store Settings
  const { user } = useSelector((state) => state.auth);
  const timezone = user?.store?.settings?.timezone || "UTC";

  // Derived State
  const reservedSoonReservations = useSelector((state) =>
    selectReservedSoon(state, timezone),
  );
  const reservedSoonTableIds = useMemo(
    () =>
      reservedSoonReservations
        .filter((r) => r.tableId)
        .map((r) => r.tableId._id || r.tableId),
    [reservedSoonReservations],
  );

  // Local State
  const [activeFloorId, setActiveFloorId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [locked, setLocked] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

  const stageRef = useRef(null);
  const { show: showContextMenu } = useContextMenu({ id: MENU_ID });

  // Load Initial Data
  useEffect(() => {
    dispatch(fetchFloors());
    dispatch(fetchTables());
    dispatch(getReservations());
  }, [dispatch]);

  // Set initial active floor
  useEffect(() => {
    if (floors.length > 0 && !activeFloorId) {
      // Prefer the first floor or restore from somewhere if needed
      setActiveFloorId(floors[0]._id);
    }
  }, [floors, activeFloorId]);

  // Set Active Floor Tables Filter?
  // Note: fetchTables might fetch ALL tables. We usually filter them in the UI or fetch by floor.
  // The fetchTables slice seems to support params. If we want to optimize we should fetch when floor changes.
  useEffect(() => {
    if (activeFloorId) {
      dispatch(fetchTables({ floorId: activeFloorId }));
    }
  }, [dispatch, activeFloorId]);

  // Reservation Lifecycle Hook
  const { activeReservation, handleDragStart, handleDragEnd } =
    useReservationLifecycle(
      tables,
      (reservationId, tableId) => {
        dispatch(
          updateReservation({
            id: reservationId,
            tableId: tableId,
            status: "confirmed", // Auto confirm when dropped
          }),
        )
          .unwrap()
          .then(() => {
            dispatch(
              showNotification({
                message: "Reservation assigned and confirmed!",
                status: 1,
              }),
            );
          })
          .catch((err) => {
            dispatch(
              showNotification({
                message: err.message || "Failed to assign reservation",
                status: 0,
              }),
            );
          });
      },
      stageRef, // Pass stageRef for coordinate translation
    );

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // --- Handlers ---

  const handleFloorSelect = (floorId) => {
    setActiveFloorId(floorId);
    setLocked(false); // Reset lock on floor switch potentially
    setIsSidebarOpen(false); // Close sidebar on mobile on selection
  };

  const handleAddFloor = () => {
    dispatch(
      openModal({
        title: "Add New Floor",
        bodyType: MODAL_BODY_TYPES.ADD_NEW_FLOOR,
      }),
    );
  };

  const handleAddTable = () => {
    // Actually, let's use the Drawer for adding/editing tables if possible,
    // OR just open the drawer directly.
    dispatch(
      openRightDrawer({
        header: "Add New Table",
        type: RIGHT_DRAWER_TYPES.FLOOR_TABLE_EDIT,
        extraObject: { floorId: activeFloorId },
      }),
    );
  };

  const handleSaveLayout = () => {
    if (!activeFloorId) return;
    const floor = floors.find((f) => f._id === activeFloorId);
    if (!floor) return;

    // We need to send table positions.
    // tables state already updated optimistically?
    // tables are in 'tables' selector.
    const floorTables = tables.filter(
      (t) => t.floorId === activeFloorId || t.floorId?._id === activeFloorId,
    );

    dispatch(
      updateTablePositions({ floorId: activeFloorId, tables: floorTables }),
    )
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: "Layout saved!", status: 1 }));
        setEditMode(false);
      })
      .catch((err) => {
        dispatch(
          showNotification({ message: "Failed to save layout", status: 0 }),
        );
      });
  };

  const handleTableClick = (table) => {
    if (editMode) {
      // In edit mode, click might just select for drag, handled by Canvas
      return;
    }
    // Open Table Details
    dispatch(
      openRightDrawer({
        header: `Table ${table.tableNumber}`,
        type: RIGHT_DRAWER_TYPES.FLOOR_TABLE_DETAILS,
        extraObject: { table },
      }),
    );
  };

  const handleTableContextMenu = (e, table) => {
    if (editMode) return;
    e.evt.preventDefault();
    // Set selected for context menu action
    // We might need a local state for "contextMenuTable"
    // Or just use the passed table in the action closure?
    // react-context-menu passes props.
    showContextMenu(e.evt, { props: { table } });
  };

  const handleContextMenuAction = ({ id, props }) => {
    const { table } = props;
    if (!table) return;

    switch (id) {
      case "view_details":
        handleTableClick(table);
        break;
      case "edit_table":
        dispatch(
          openRightDrawer({
            header: `Edit Table ${table.tableNumber}`,
            type: RIGHT_DRAWER_TYPES.FLOOR_TABLE_EDIT,
            extraObject: { table },
          }),
        );
        break;
      // Add other actions like Merge, clean etc
      default:
        break;
    }
  };

  const handleMergeTables = () => {
    if (selectedTableIds.length < 2) return;
    dispatch(
      openModal({
        title: "Merge Tables",
        bodyType: MODAL_BODY_TYPES.MERGE_TABLES, // Constant 61 is MERGE_TABLE
        extraObject: { tableIds: selectedTableIds, floorId: activeFloorId },
      }),
    );
  };

  const handleTableSelect = (tableId, isMulti) => {
    if (tableId === null) {
      setSelectedTableIds([]);
      return;
    }
    if (isMulti) {
      setSelectedTableIds((prev) =>
        prev.includes(tableId)
          ? prev.filter((id) => id !== tableId)
          : [...prev, tableId],
      );
    } else {
      setSelectedTableIds([tableId]);
    }
  };

  // Add Reservation Handler
  const handleAddReservation = () => {
    dispatch(
      openModal({
        title: "New Reservation",
        bodyType: MODAL_BODY_TYPES.ADD_RESERVATION,
      }),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-base-100">
        {/* Adjusted height for header */}

        <div className="flex flex-1 relative overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex w-80 flex-col border-r border-base-300 bg-base-200 z-20">
            <FloorSidebarContent
              floors={floors}
              activeFloorId={activeFloorId}
              onSelectFloor={handleFloorSelect}
              onAddFloor={handleAddFloor}
              onEditFloor={(floor) => {
                // Implement Edit Floor Modal
                dispatch(
                  openModal({
                    title: "Edit Floor",
                    bodyType: MODAL_BODY_TYPES.ADD_NEW_FLOOR,
                    extraObject: floor,
                  }),
                );
              }}
              onDeleteFloor={(id) => {
                // Implement Delete Confirmation
                // For now just dispatch or open modal
                if (window.confirm("Are you sure?")) dispatch(deleteFloor(id));
              }}
              reservations={reservations}
              onAddReservation={handleAddReservation}
              timezone={timezone}
            />
          </div>

          {/* Mobile Sidebar (Drawer) */}
          <div
            className={`absolute inset-0 z-50 transform transition-transform duration-300 md:hidden ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-full">
              <div className="w-80 h-full bg-base-200 shadow-xl overflow-hidden">
                <div className="flex justify-end p-2 border-b border-base-300">
                  <button
                    className="btn btn-ghost btn-circle btn-sm"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                <FloorSidebarContent
                  floors={floors}
                  activeFloorId={activeFloorId}
                  onSelectFloor={handleFloorSelect}
                  onAddFloor={handleAddFloor}
                  onEditFloor={(f) => {}}
                  onDeleteFloor={(id) => {}}
                  reservations={reservations}
                  onAddReservation={handleAddReservation}
                  timezone={timezone}
                />
              </div>
              <div
                className="flex-1 bg-black/50"
                onClick={() => setIsSidebarOpen(false)}
              ></div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col relative w-full overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-base-300 bg-base-100 z-30 shrink-0">
              {/* Top Row: Navigation and Mode Toggle */}
              <div className="h-14 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <button
                    className="md:hidden btn btn-ghost btn-circle btn-sm"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <Menu size={20} />
                  </button>
                  <h2 className="font-bold text-lg hidden sm:block">
                    {floors.find((f) => f._id === activeFloorId)?.name ||
                      "Select Floor"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`btn btn-sm btn-rounded me-2 ${
                      locked ? "btn-error text-white" : ""
                    }`}
                    onClick={() => setLocked(!locked)}
                    title={locked ? "Unlock View" : "Lock View"}
                  >
                    {locked ? (
                      <span className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        <span className="inline">Floor</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Unlock className="w-4 h-4" />
                        <span className="inline">Floor</span>
                      </span>
                    )}
                  </button>

                  <div className="join">
                    <button
                      className={`join-item btn btn-sm ${
                        !editMode ? "btn-primary" : ""
                      }`}
                      onClick={() => setEditMode(false)}
                    >
                      <Monitor className="w-4 h-4 mr-1" />
                      <span className="inline">Live</span>
                    </button>
                    <button
                      className={`join-item btn btn-sm ${
                        editMode ? "btn-primary" : ""
                      }`}
                      onClick={() => setEditMode(true)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      <span className="inline">Edit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Second Row: Admin Actions (Edit Mode Only) */}
              {editMode && (
                <div className="h-12 border-t border-base-200 bg-base-200/30 flex items-center justify-center sm:justify-end px-4 gap-2">
                  <div className="flex items-center gap-2">
                    {selectedTableIds.length > 1 && (
                      <button
                        onClick={handleMergeTables}
                        className="btn btn-sm btn-warning gap-2 shadow-sm"
                      >
                        <Combine className="w-4 h-4" />
                        <span>Merge</span>
                      </button>
                    )}
                    <button
                      onClick={handleAddTable}
                      className="btn btn-sm btn-outline gap-2 shadow-sm bg-base-100"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Table</span>
                    </button>
                    <button
                      onClick={handleSaveLayout}
                      className="btn btn-sm btn-success text-white gap-2 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-base-200 overflow-hidden touch-none">
              {floorsLoading ? (
                <div className="flex justify-center items-center h-full">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <FloorCanvas
                  ref={stageRef}
                  floor={floors.find((f) => f._id === activeFloorId) || {}}
                  tables={tables.filter(
                    (t) =>
                      t.floorId === activeFloorId ||
                      t.floorId?._id === activeFloorId,
                  )}
                  editMode={editMode}
                  locked={locked}
                  snapTarget={null}
                  onTableChange={(id, newAttrs) => {
                    dispatch(
                      optimisticUpdateTablePositionTableSlice({
                        tableId: id,
                        position: newAttrs.position,
                      }),
                    );
                    // We don't save to DB on every drag for performance, only on Save.
                    // But if width changes (resize), we might want to update local state more robustly.
                    if (newAttrs.width !== undefined) {
                      // Dispatch updateTable immediately for resize? Or just optimistic?
                      // Let's stick to optimistic for now unless user saves.
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
        </div>

        <ContextMenu onAction={handleContextMenuAction} />

        <DragOverlay>
          {activeReservation && (
            <div className="card bg-base-100 shadow-xl border-2 border-primary p-3 cursor-grabbing opacity-90 w-64">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm truncate">
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
