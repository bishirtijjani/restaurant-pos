import React, { useRef, useState, useEffect, useImperativeHandle } from "react";
import { Stage, Layer, Transformer, Line, Text } from "react-konva";
import { useDroppable } from "@dnd-kit/core";
import TableNode from "./TableNode";
import GridLayer from "./GridLayer";
import { Fullscreen, Minus, Plus } from "lucide-react";

// Helper to get center of table
const getTableCenter = (table) => {
  const x = table.position?.x || 0;
  const y = table.position?.y || 0;
  const w = table.position?.width || table.width || 60;
  const h = table.position?.height || table.height || 60;
  return { x: x + w / 2, y: y + h / 2 };
};

// Touch Helpers
const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getCenter = (p1, p2) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};

const FloorCanvas = React.forwardRef(
  (
    {
      floor,
      tables,
      onTableChange,
      onTableClick,
      onTableContextMenu,
      editMode,
      onViewChange,
      snapTarget, // NEW: table to highlight for snapping
      reservedSoonTableIds = [], // NEW: tables with upcoming reservations
      selectedTableIds = [], // Lifted state
      onTableSelect, // Lifted handler
      locked = false, // NEW: Lock view
    },
    ref,
  ) => {
    const stageRef = useRef(null);
    const containerRef = useRef(null);
    const transformerRef = useRef(null);

    // Touch Zoom Refs
    const lastCenter = useRef(null);
    const lastDist = useRef(0);

    // Local state
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    // const [selectedIds, setSelectedIds] = useState([]); // Removed local state
    const [stageSize, setStageSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const { setNodeRef, isOver } = useDroppable({
      id: "floor-canvas",
      data: { type: "FLOOR_CANVAS" },
    });

    const fitToScreen = () => {
      if (!stageRef.current || tables.length === 0) return;

      const stage = stageRef.current;
      const padding = 50;

      // Calculate bounding box of all tables
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      tables.forEach((table) => {
        const x = table.position?.x || 0;
        const y = table.position?.y || 0;
        const w = table.position?.width || table.width || 60;
        const h = table.position?.height || table.height || 60;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      });

      if (minX === Infinity) return; // No tables

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;

      const containerWidth = stageSize.width;
      const containerHeight = stageSize.height;

      const scaleX = (containerWidth - padding * 2) / contentWidth;
      const scaleY = (containerHeight - padding * 2) / contentHeight;

      const newScale = Math.min(scaleX, scaleY, 1.5); // Cap max scale

      const newX =
        (containerWidth - contentWidth * newScale) / 2 - minX * newScale;
      const newY =
        (containerHeight - contentHeight * newScale) / 2 - minY * newScale;

      setScale(newScale);
      setPosition({ x: newX, y: newY });

      if (onViewChange)
        onViewChange({ scale: newScale, position: { x: newX, y: newY } });
    };

    useImperativeHandle(ref, () => {
      const stage = stageRef.current;
      if (stage) {
        stage.fitToScreen = fitToScreen;
      }
      return stage;
    });

    // Resize observer
    useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          setStageSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
          });
        }
      };
      window.addEventListener("resize", updateSize);
      updateSize();
      return () => window.removeEventListener("resize", updateSize);
    }, []);

    // Update Transformer nodes
    useEffect(() => {
      if (editMode && transformerRef.current && stageRef.current) {
        const nodes = selectedTableIds.map((id) =>
          stageRef.current.findOne(`#table-${id}`),
        );
        const validNodes = nodes.filter(Boolean);
        transformerRef.current.nodes(validNodes);
        transformerRef.current.getLayer().batchDraw();
      }
    }, [selectedTableIds, editMode, tables]);

    // Zoom handler
    const handleWheel = (e) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      const scaleBy = 1.1;
      const newScale =
        e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      if (newScale < 0.1 || newScale > 5) return;
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      setScale(newScale);
      setPosition(newPos);
      if (onViewChange) onViewChange({ scale: newScale, position: newPos });
    };

    // Touch Handlers
    const handleTouchMove = (e) => {
      const stage = stageRef.current;
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      if (touch1 && touch2) {
        e.evt.preventDefault();
        // Stop dragging if pinch starts
        if (stage.isDragging()) {
          stage.stopDrag();
        }

        const p1 = { x: touch1.clientX, y: touch1.clientY };
        const p2 = { x: touch2.clientX, y: touch2.clientY };

        if (!lastCenter.current) {
          lastCenter.current = getCenter(p1, p2);
          lastDist.current = getDistance(p1, p2);
          return;
        }

        const newCenter = getCenter(p1, p2);
        const dist = getDistance(p1, p2);

        if (!dist) return;

        // Calculate scale
        const pointTo = {
          x: (newCenter.x - stage.x()) / stage.scaleX(),
          y: (newCenter.y - stage.y()) / stage.scaleX(),
        };

        const scale = stage.scaleX() * (dist / lastDist.current);
        const newScale = Math.min(Math.max(scale, 0.1), 5);

        // Calculate new position
        const dx = newCenter.x - lastCenter.current.x;
        const dy = newCenter.y - lastCenter.current.y;

        const newPos = {
          x: newCenter.x - pointTo.x * newScale + dx,
          y: newCenter.y - pointTo.y * newScale + dy,
        };

        // Update state
        setScale(newScale);
        setPosition(newPos);

        // Konva manual update for smoothness
        // stage.scaleX(newScale);
        // stage.scaleY(newScale);
        // stage.position(newPos);
        // stage.batchDraw();

        lastDist.current = dist;
        lastCenter.current = newCenter;
        if (onViewChange) onViewChange({ scale: newScale, position: newPos });
      }
    };

    const handleTouchEnd = () => {
      lastCenter.current = null;
      lastDist.current = 0;
    };

    const handleDragEnd = (e) => {
      if (e.target === stageRef.current) {
        setPosition({ x: e.target.x(), y: e.target.y() });
        if (onViewChange)
          onViewChange({
            scale,
            position: { x: e.target.x(), y: e.target.y() },
          });
      }
    };

    const handleTableSelect = (tableId, isMulti) => {
      if (onTableSelect) {
        onTableSelect(tableId, isMulti);
      }
    };

    useEffect(() => {
      if (stageRef.current) {
        stageRef.current.container().style.cursor = editMode
          ? "default"
          : selectedTableIds.length > 0
            ? "default"
            : "grab";
      }
    }, [editMode, selectedTableIds]);

    const handleZoomIn = () => {
      setScale((s) => Math.min(s * 1.2, 5));
    };

    const handleZoomOut = () => {
      setScale((s) => Math.max(s / 1.2, 0.1));
    };

    const handleFitToScreen = () => {
      fitToScreen();
    };

    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          containerRef.current = node;
        }}
        className={`w-full h-full bg-base-200 overflow-hidden relative ${
          isOver ? "ring-4 ring-primary ring-inset" : ""
        }`}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={!locked} // Disable panning if locked (for mobile scroll)
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => {
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
              if (onTableSelect) onTableSelect(null, false); // Clear selection
            }
          }}
          onDragEnd={handleDragEnd}
          onContextMenu={(e) => {
            e.evt.preventDefault();
          }}
          ref={stageRef}
        >
          <GridLayer
            width={floor?.layout?.width || 2000}
            height={floor?.layout?.height || 2000}
            gridSize={floor?.layout?.gridSize || 20}
            visible={true}
            opacity={editMode ? 1 : 0.3}
          />

          <Layer>
            {/* Watermark Floor Name */}
            <Text
              text={floor?.name?.toUpperCase() || ""}
              fontSize={180} // Huge text
              fontStyle="bold"
              fill="#cbd5e1" // Slate-300 / neutral
              opacity={0.15} // Faded watermark feel
              x={stageSize.width / 2}
              y={stageSize.height / 2}
              offsetX={
                (floor?.name?.length || 0) * 55 // Center offset (rough estimation)
              }
              offsetY={90} // Half of fontSize
              listening={false} // Don't block clicks
            />
          </Layer>

          <Layer>
            {/* Render Merge Connections */}
            {tables.map((table) => {
              if (!table.mergedWith || table.mergedWith.length === 0)
                return null;

              const start = getTableCenter(table);

              return table.mergedWith.map((mergedId) => {
                // mergedWith can be objects or IDs depending on population
                const targetId =
                  typeof mergedId === "object" ? mergedId._id : mergedId;
                const targetTable = tables.find((t) => t._id === targetId);
                if (!targetTable) return null;

                const end = getTableCenter(targetTable);

                return (
                  <Line
                    key={`merge-${table._id}-${targetId}`}
                    points={[start.x, start.y, end.x, end.y]}
                    stroke="#3b82f6" // Blue-500
                    strokeWidth={4}
                    dash={[10, 5]}
                    opacity={0.6}
                    listening={false} // Pass events through
                  />
                );
              });
            })}

            {tables.map((table) => (
              <TableNode
                key={table._id}
                id={`table-${table._id}`} // ID for finding node
                table={table}
                isSelected={selectedTableIds.includes(table._id)}
                isSnapTarget={snapTarget?._id === table._id} // NEW: highlight if snap target
                isReservedSoon={reservedSoonTableIds.includes(table._id)}
                editMode={editMode}
                onSelect={(e) => {
                  const isMulti = e.evt.shiftKey || e.evt.ctrlKey;
                  handleTableSelect(table._id, isMulti);
                  if (!isMulti) {
                    onTableClick(table);
                  }
                }}
                onChange={(newAttrs) => {
                  onTableChange(table._id, newAttrs);
                }}
                onContextMenu={(e) => onTableContextMenu(e, table)}
              />
            ))}
            {editMode && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 30 || newBox.height < 30) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <button
            className="btn btn-circle btn-sm bg-base-100 shadow-lg"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <Plus />
          </button>
          <button
            className="btn btn-circle btn-sm bg-base-100 shadow-lg"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <Minus />
          </button>
          <button
            className="btn btn-circle btn-sm bg-base-100 shadow-lg"
            onClick={handleFitToScreen}
            title="Fit to Screen"
          >
            <Fullscreen />
          </button>
        </div>

        {editMode && (
          <div className="absolute top-4 left-4 pointer-events-none bg-black/50 text-white px-2 py-1 rounded text-xs">
            Edit Mode Active
          </div>
        )}
      </div>
    );
  },
);

export default FloorCanvas;
