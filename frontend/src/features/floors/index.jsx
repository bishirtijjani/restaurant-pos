import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
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
  optimisticUpdateTablePosition as optimisticUpdateTablePositionTableSlice,
} from "../tables/tableSlice";
import { getReservations, updateReservation } from "../reservations/reservationSlice";
import { showNotification } from "../common/headerSlice";
import { openRightDrawer } from "../common/rightDrawerSlice";
import { openModal } from "../common/modalSlice";
import { RIGHT_DRAWER_TYPES, MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";

import FloorCanvas from "./components/FloorCanvas";
import ReservationSidebar from "./components/ReservationSidebar";
import ContextMenu, { MENU_ID } from "./components/ContextMenu";
import { Plus, Save, Settings, Monitor, Building2 } from "lucide-react";

const FloorManager = () => {
  const dispatch = useDispatch();
  const { floors, loading: floorsLoading } = useSelector((state) => state.floors);
  const { tables } = useSelector((state) => state.tables);
  const { items: reservations } = useSelector((state) => state.reservations);

  const [activeFloorId, setActiveFloorId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [socket, setSocket] = useState(null);
  const [activeReservation, setActiveReservation] = useState(null);
  const [snapTarget, setSnapTarget] = useState(null); // Table to snap to

  const { show } = useContextMenu({ id: MENU_ID });
  const sensors = useSensors(useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
  }));

  // Initial Load
  useEffect(() => {
    dispatch(fetchFloors());
    dispatch(getReservations({ status: "confirmed" }));
  }, [dispatch]);

  // Set active floor
  useEffect(() => {
    if (floors.length > 0 && !activeFloorId) {
      setActiveFloorId(floors[0]._id);
    }
  }, [floors, activeFloorId]);

  // Fetch tables when floor changes
  useEffect(() => {
    if (activeFloorId) {
      dispatch(fetchTables({ floorId: activeFloorId }));
    }
  }, [activeFloorId, dispatch]);

  // Native WebSocket Connection
  useEffect(() => {
    // Connect to /ws path
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.hostname}:5000/ws`; // Adjust port if needed, assuming 5000 based on backend
    // Actually, usually it's same host/port if proxied, or specific port.
    // Let's assume proxy handles /ws or port 5000.
    // If dev, frontend is 5173, backend 5000.
    
    const newSocket = new WebSocket("ws://localhost:5000/ws");

    newSocket.onopen = () => {
      console.log("WebSocket connected");
      // Subscribe if needed? Backend checks stationId.
      newSocket.send(JSON.stringify({ type: "subscribe", stationId: "all" }));
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "TABLE_UPDATED" || message.type === "order:updated") {
             // Refresh tables
             if (activeFloorId) dispatch(fetchTables({ floorId: activeFloorId }));
        }
        if (message.type === "RESERVATION_UPDATED") {
            dispatch(getReservations({ status: "confirmed" }));
        }
      } catch (e) {
        console.error("WebSocket message parse error", e);
      }
    };

    newSocket.onclose = () => {
        console.log("WebSocket disconnected");
    };

    setSocket(newSocket);

    return () => {
        newSocket.close();
    };
  }, [dispatch, activeFloorId]);

  // Handlers
  const handleTableClick = (table) => {
    setSelectedTable(table);
    // Open Global Right Drawer
    dispatch(openRightDrawer({
        header: editMode ? "Edit Table" : `Table ${table.name}`,
        bodyType: editMode ? RIGHT_DRAWER_TYPES.FLOOR_TABLE_EDIT : RIGHT_DRAWER_TYPES.FLOOR_TABLE_DETAILS,
        extraObject: { table }
    }));
  };

  const handleTableContextMenu = (e, table) => {
    if (editMode) return;
    setSelectedTable(table);
    show({ event: e.evt, props: { table } });
  };

  const handleContextMenuAction = (actionId, table) => {
    switch (actionId) {
      case "open":
        handleTableClick(table);
        break;
      case "status_available":
        dispatch(updateTableStatus({ id: table._id, status: "Available" }));
        break;
      case "status_occupied":
        dispatch(updateTableStatus({ id: table._id, status: "Occupied" }));
        break;
      case "status_dirty":
        dispatch(updateTableStatus({ id: table._id, status: "Dirty" }));
        break;
      case "delete":
        if (window.confirm("Delete this table?")) {
            dispatch(deleteTable(table._id));
        }
        break;
      default:
        console.log("Action:", actionId);
    }
  };
  
  const stageRef = useRef(null);

  const onDragStart = (event) => {
    if (event.active.data.current?.type === "RESERVATION") {
      setActiveReservation(event.active.data.current.reservation);
    }
  };

  const onDragCancel = () => {
    setActiveReservation(null);
    setSnapTarget(null);
  };

  const onDragMove = (event) => {
    if (event.active.data.current?.type === "RESERVATION" && stageRef.current) {
      const stage = stageRef.current;
      
      // 1. Get the dragged element's rect in screen coordinates
      const dragRect = event.active.rect.current.translated;
      
      if (dragRect) {
        // 2. Get stage container info to calculate relative position
        const containerRect = stage.container().getBoundingClientRect();
        
        // 3. Calculate drag rect relative to the stage container
        // This is still in "screen pixels" but relative to the stage top-left
        const relativeDragRect = {
            x: dragRect.left - containerRect.left,
            y: dragRect.top - containerRect.top,
            width: dragRect.width,
            height: dragRect.height
        };

        // 4. Get stage transform (scale & pan)
        const stageX = stage.x();
        const stageY = stage.y();
        const stageScale = stage.scaleX(); // Assuming uniform scale

        // 5. Convert drag rect to "World Space" coordinates
        // We need to inverse the stage transform
        const worldDragRect = {
            x: (relativeDragRect.x - stageX) / stageScale,
            y: (relativeDragRect.y - stageY) / stageScale,
            width: relativeDragRect.width / stageScale,
            height: relativeDragRect.height / stageScale
        };

        // 6. Check intersection with all tables (AABB Collision)
        let bestTarget = null;
        let maxOverlapArea = 0;

        tables.forEach(table => {
            const tx = table.position?.x || 0;
            const ty = table.position?.y || 0;
            const tw = table.position?.width || table.width || 60;
            const th = table.position?.height || table.height || 60;

            // Calculate intersection rectangle
            const x_overlap = Math.max(0, Math.min(worldDragRect.x + worldDragRect.width, tx + tw) - Math.max(worldDragRect.x, tx));
            const y_overlap = Math.max(0, Math.min(worldDragRect.y + worldDragRect.height, ty + th) - Math.max(worldDragRect.y, ty));
            
            const overlapArea = x_overlap * y_overlap;

            if (overlapArea > 0) {
                // If we have an overlap, check if it's the best one (largest area)
                if (overlapArea > maxOverlapArea) {
                    maxOverlapArea = overlapArea;
                    bestTarget = table;
                }
            }
        });

        // 7. Update state
        if (bestTarget?._id !== snapTarget?._id) {
            setSnapTarget(bestTarget);
        }
      }
    }
  };

  const validateAssignment = (table, reservation) => {
      // 1. Status Check
      if (table.status && table.status.toLowerCase() !== 'available') {
          return { valid: false, reason: `Table is ${table.status}` };
      }

      // 2. Capacity Check
      const guests = reservation.guests || reservation.partySize || 0;
      if (guests > table.capacity) {
          return { valid: false, reason: `Table capacity (${table.capacity}) is too small for ${guests} guests` };
      }

      // 3. Time Overlap Check
      // Assuming reservation has reservationTime and duration (default 90 mins)
      const newStart = new Date(reservation.reservationTime).getTime();
      const duration = reservation.duration || 90;
      const newEnd = newStart + duration * 60000;

      const hasOverlap = reservations.some(res => {
          if (res.tableId !== table._id || res._id === reservation._id || res.status === 'cancelled') return false;
          
          const existingStart = new Date(res.reservationTime).getTime();
          const existingDuration = res.duration || 90;
          const existingEnd = existingStart + existingDuration * 60000;

          return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasOverlap) {
          return { valid: false, reason: "Reservation overlaps with an existing booking" };
      }

      return { valid: true };
  };

  const onDragEnd = (event) => {
      const { active, over } = event;
      
      // Clear snap target immediately
      const currentSnapTarget = snapTarget;
      setSnapTarget(null);
      setActiveReservation(null);
      
      if (active.data.current?.type === "RESERVATION" && over?.id === "floor-canvas") {
          // Use the last calculated snap target if available, otherwise recalculate (fallback)
          // Since onDragMove runs every frame, snapTarget should be accurate.
          
          let targetTable = currentSnapTarget;

          if (!targetTable) {
              // Fallback: Recalculate if for some reason snapTarget wasn't set (e.g. very fast drag)
              if (stageRef.current) {
                  const stage = stageRef.current;
                  const dragRect = active.rect.current.translated;
                  
                  if (dragRect) {
                      const containerRect = stage.container().getBoundingClientRect();
                      const relativeDragRect = {
                          x: dragRect.left - containerRect.left,
                          y: dragRect.top - containerRect.top,
                          width: dragRect.width,
                          height: dragRect.height
                      };
                      const stageX = stage.x();
                      const stageY = stage.y();
                      const stageScale = stage.scaleX();
                      
                      const worldDragRect = {
                          x: (relativeDragRect.x - stageX) / stageScale,
                          y: (relativeDragRect.y - stageY) / stageScale,
                          width: relativeDragRect.width / stageScale,
                          height: relativeDragRect.height / stageScale
                      };

                      let maxOverlapArea = 0;

                      tables.forEach(table => {
                          const tx = table.position?.x || 0;
                          const ty = table.position?.y || 0;
                          const tw = table.position?.width || table.width || 60;
                          const th = table.position?.height || table.height || 60;

                          const x_overlap = Math.max(0, Math.min(worldDragRect.x + worldDragRect.width, tx + tw) - Math.max(worldDragRect.x, tx));
                          const y_overlap = Math.max(0, Math.min(worldDragRect.y + worldDragRect.height, ty + th) - Math.max(worldDragRect.y, ty));
                          const overlapArea = x_overlap * y_overlap;

                          if (overlapArea > 0 && overlapArea > maxOverlapArea) {
                              maxOverlapArea = overlapArea;
                              targetTable = table;
                          }
                      });
                  }
              }
          }

          if (targetTable) {
               const reservation = active.data.current.reservation;
               const validation = validateAssignment(targetTable, reservation);

               if (!validation.valid) {
                   dispatch(showNotification({ message: validation.reason, status: 0 }));
                   return;
               }

               if (window.confirm(`Assign reservation for ${reservation.customerName} to table ${targetTable.tableNumber}?`)) {
                   dispatch(updateTableStatus({ id: targetTable._id, status: "reserved" }));
                   // Also update the reservation to link it to the table
                   dispatch(updateReservation({ id: reservation._id, data: { tableId: targetTable._id, status: "confirmed" } }));
                   dispatch(showNotification({ message: "Reservation assigned successfully", status: 1 }));
               }
          }
      }
  };

  const handleAddTable = () => {
      const newTable = {
          tableNumber: `T${tables.length + 1}`,
          floorId: activeFloorId,
          shape: "rectangle",
          position: { 
              x: 100, 
              y: 100,
              width: 60,
              height: 60,
              rotation: 0
          },
          capacity: 4,
          status: "available"
      };
      dispatch(createTable(newTable));
  };

  const handleSaveLayout = () => {
      const tablePositions = tables.map(t => ({
          id: t._id,
          position: t.position
      }));
      dispatch(updateTablePositions({ floorId: activeFloorId, tables: tablePositions }));
      setEditMode(false);
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
      <div className="flex h-[calc(100vh-6rem)] gap-4">
        {/* Sidebar */}
        <div className="flex-none">
             <ReservationSidebar reservations={reservations} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-base-100 rounded-lg shadow-xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-100 z-10">
            <div className="flex items-center gap-4">
                <div className="tabs tabs-boxed">
                    {floors.map(floor => (
                        <a 
                            key={floor._id} 
                            className={`tab ${activeFloorId === floor._id ? 'tab-active' : ''}`}
                            onClick={() => setActiveFloorId(floor._id)}
                        >
                            {floor.name}
                        </a>
                    ))}
                </div>
                <button 
                    className="btn btn-sm btn-outline gap-2"
                    onClick={() => dispatch(openModal({
                        title: "Add New Floor",
                        bodyType: MODAL_BODY_TYPES.ADD_NEW_FLOOR
                    }))}
                >
                    <Building2 className="w-4 h-4" />
                    Floor
                </button>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="join">
                    <button 
                        className={`join-item btn btn-sm ${!editMode ? 'btn-primary' : ''}`}
                        onClick={() => setEditMode(false)}
                    >
                        <Monitor className="w-4 h-4 mr-1" /> Live
                    </button>
                    <button 
                        className={`join-item btn btn-sm ${editMode ? 'btn-primary' : ''}`}
                        onClick={() => setEditMode(true)}
                    >
                        <Settings className="w-4 h-4 mr-1" /> Edit
                    </button>
                </div>
                
                {editMode && (
                    <>
                        <button onClick={handleAddTable} className="btn btn-sm btn-outline gap-2">
                            <Plus className="w-4 h-4" /> Table
                        </button>
                        <button onClick={handleSaveLayout} className="btn btn-sm btn-success gap-2 text-white">
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
                    floor={floors.find(f => f._id === activeFloorId) || {}}
                    tables={tables}
                    editMode={editMode}
                    snapTarget={snapTarget}
                    onTableChange={(id, newAttrs) => {
                        dispatch(optimisticUpdateTablePositionTableSlice({ tableId: id, position: newAttrs.position }));
                        if (newAttrs.width !== undefined) {
                             dispatch(updateTable({ id, ...newAttrs }));
                        }
                    }}
                    onTableClick={handleTableClick}
                    onTableContextMenu={handleTableContextMenu}
                 />
             )}
          </div>
        </div>
        
        <ContextMenu onAction={handleContextMenuAction} />
        <DragOverlay>
          {activeReservation && (
            <div className="card bg-base-100 shadow-xl border-2 border-primary p-3 cursor-grabbing opacity-90">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm">{activeReservation.customerName}</h4>
                <span className="badge badge-sm badge-ghost">{activeReservation.status}</span>
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
