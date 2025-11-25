// frontend/src/features/floors/components/FloorPlanCanvas.jsx - NEW PREMIUM COMPONENT
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableTableItem from "./DraggableTableItem";
import {
  optimisticUpdateTablePosition,
  updateTablePositions,
} from "../floorSlice";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Save,
  Undo,
  Redo,
  Settings,
} from "lucide-react";
import { showNotification } from "../../common/headerSlice";

const FloorPlanCanvas = ({ floor, tables, onTableClick, editMode = false }) => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(
      tables.map((t) => ({
        id: t._id,
        position: { ...t.position },
      }))
    );
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, tables]);

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      previousState.forEach(({ id, position }) => {
        dispatch(optimisticUpdateTablePosition({ tableId: id, position }));
      });
      setHistoryIndex(historyIndex - 1);
      setHasUnsavedChanges(true);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      nextState.forEach(({ id, position }) => {
        dispatch(optimisticUpdateTablePosition({ tableId: id, position }));
      });
      setHistoryIndex(historyIndex + 1);
      setHasUnsavedChanges(true);
    }
  };

  // Drag handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    saveToHistory();
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;

    if (delta.x === 0 && delta.y === 0) {
      setActiveId(null);
      return;
    }

    const table = tables.find((t) => t._id === active.id);
    if (!table) {
      setActiveId(null);
      return;
    }

    const newPosition = {
      ...table.position,
      x: table.position.x + delta.x / zoom,
      y: table.position.y + delta.y / zoom,
    };

    // Snap to grid if enabled
    if (showGrid) {
      const gridSize = floor.layout?.gridSize || 20;
      newPosition.x = Math.round(newPosition.x / gridSize) * gridSize;
      newPosition.y = Math.round(newPosition.y / gridSize) * gridSize;
    }

    dispatch(
      optimisticUpdateTablePosition({
        tableId: active.id,
        position: newPosition,
      })
    );
    setHasUnsavedChanges(true);
    setActiveId(null);
  };

  // Save changes
  const handleSave = async () => {
    try {
      const tablePositions = tables.map((t) => ({
        id: t._id,
        position: t.position,
      }));

      await dispatch(
        updateTablePositions({ floorId: floor._id, tables: tablePositions })
      ).unwrap();

      dispatch(
        showNotification({
          message: "Floor layout saved successfully",
          status: 1,
        })
      );
      setHasUnsavedChanges(false);
    } catch (error) {
      dispatch(
        showNotification({
          message: "Failed to save layout",
          status: 0,
        })
      );
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleFitView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan controls
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  const activeTable = activeId ? tables.find((t) => t._id === activeId) : null;

  return (
    <div className="relative h-full bg-base-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="join">
          <button
            onClick={handleZoomOut}
            className="join-item btn btn-sm"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button className="join-item btn btn-sm no-animation">
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="join-item btn btn-sm"
            disabled={zoom >= 2}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <button onClick={handleFitView} className="btn btn-sm" title="Fit View">
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`btn btn-sm ${showGrid ? "btn-primary" : ""}`}
          title="Toggle Grid"
        >
          <Grid3x3 className="w-4 h-4" />
        </button>

        {editMode && (
          <>
            <div className="divider divider-horizontal mx-0"></div>
            <button
              onClick={handleUndo}
              className="btn btn-sm"
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              className="btn btn-sm"
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Save Button */}
      {editMode && hasUnsavedChanges && (
        <div className="absolute top-4 right-4 z-10">
          <button onClick={handleSave} className="btn btn-primary btn-sm gap-2">
            <Save className="w-4 h-4" />
            Save Layout
          </button>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: showGrid
            ? `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
           linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`
            : "none",
          backgroundSize: showGrid
            ? `${(floor.layout?.gridSize || 20) * zoom}px ${
                (floor.layout?.gridSize || 20) * zoom
              }px`
            : "auto",
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: floor.layout?.width || 1200,
            height: floor.layout?.height || 800,
            position: "relative",
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tables.map((t) => t._id)}
              strategy={rectSortingStrategy}
            >
              {tables.map((table) => (
                <DraggableTableItem
                  key={table._id}
                  table={table}
                  onClick={() => onTableClick(table)}
                  editMode={editMode}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeTable && (
                <DraggableTableItem
                  table={activeTable}
                  isDragging
                  editMode={editMode}
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Instructions */}
      {editMode && (
        <div className="absolute bottom-4 left-4 bg-base-100 p-3 rounded-lg shadow-lg text-xs">
          <p className="font-semibold mb-1">Controls:</p>
          <ul className="space-y-1 opacity-70">
            <li>• Drag tables to reposition</li>
            <li>• Hold Shift + Drag to pan canvas</li>
            <li>• Ctrl/Cmd + Z/Shift+Z to undo/redo</li>
            <li>• Ctrl/Cmd + S to save</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FloorPlanCanvas;
