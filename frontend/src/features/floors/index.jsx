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
import { RIGHT_DRAWER_TYPES } from "../../utils/globalConstantUtil";

import FloorCanvas from "./components/FloorCanvas";
import ReservationSidebar from "./components/ReservationSidebar";
import ContextMenu, { MENU_ID } from "./components/ContextMenu";
import { Plus, Save, Settings, Monitor } from "lucide-react";

const FloorManager = () => {
  const dispatch = useDispatch();
  const { floors, loading: floorsLoading } = useSelector((state) => state.floors);
  const { tables } = useSelector((state) => state.tables);
  const { items: reservations } = useSelector((state) => state.reservations);

  const [activeFloorId, setActiveFloorId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [socket, setSocket] = useState(null);

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

  const onDragEnd = (event) => {
      const { active, over } = event;
      
      if (active.data.current?.type === "RESERVATION") {
          if (over?.id === "floor-canvas" && stageRef.current) {
               const stage = stageRef.current;
               
               // Get client coordinates from dnd-kit event
               const clientX = event.active.rect.current.translated.left + 20; 
               const clientY = event.active.rect.current.translated.top + 20;
               
               const containerRect = stage.container().getBoundingClientRect();
               const stageX = clientX - containerRect.left;
               const stageY = clientY - containerRect.top;
               
               const transform = stage.getAbsoluteTransform().copy();
               transform.invert();
               const pos = transform.point({ x: stageX, y: stageY });
               
               const targetTable = tables.find(t => {
                   const tx = t.position?.x || 0;
                   const ty = t.position?.y || 0;
                   const tw = t.width || 60;
                   const th = t.height || 60;
                   return pos.x >= tx && pos.x <= tx + tw && pos.y >= ty && pos.y <= ty + th;
               });
               
               if (targetTable) {
                   if (window.confirm(`Assign reservation for ${active.data.current.reservation.customerName} to table ${targetTable.name}?`)) {
                       dispatch(updateTableStatus({ id: targetTable._id, status: "Reserved" }));
                       dispatch(showNotification({ message: "Reservation assigned", status: 1 }));
                   }
               }
          }
      }
  };

  const handleAddTable = () => {
      const newTable = {
          name: `T${tables.length + 1}`,
          floorId: activeFloorId,
          shape: "rect",
          position: { x: 100, y: 100 },
          width: 60,
          height: 60,
          seats: 4,
          status: "Available"
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
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
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
        <DragOverlay /> 
      </div>
    </DndContext>
  );
};

export default FloorManager;
