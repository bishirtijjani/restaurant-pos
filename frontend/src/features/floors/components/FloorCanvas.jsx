import React, { useRef, useState, useEffect, useImperativeHandle } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import { useDroppable } from "@dnd-kit/core";
import TableNode from "./TableNode";
import GridLayer from "./GridLayer";

const FloorCanvas = React.forwardRef(({
  floor,
  tables,
  onTableChange,
  onTableClick,
  onTableContextMenu,
  editMode,
  onViewChange, 
}, ref) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const transformerRef = useRef(null);
  
  // Local state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const { setNodeRef, isOver } = useDroppable({
    id: "floor-canvas",
    data: { type: "FLOOR_CANVAS" },
  });

  useImperativeHandle(ref, () => stageRef.current);

  // Resize observer
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update Transformer nodes
  useEffect(() => {
    if (editMode && transformerRef.current && stageRef.current) {
      const nodes = selectedIds.map(id => stageRef.current.findOne(`#table-${id}`));
      const validNodes = nodes.filter(Boolean);
      transformerRef.current.nodes(validNodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, editMode, tables]);

  // Zoom handler
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
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

  const handleDragEnd = (e) => {
      if (e.target === stageRef.current) {
          setPosition({ x: e.target.x(), y: e.target.y() });
          if (onViewChange) onViewChange({ scale, position: { x: e.target.x(), y: e.target.y() } });
      }
  };

  const handleTableSelect = (tableId, isMulti) => {
      if (isMulti) {
          setSelectedIds(prev => prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]);
      } else {
          setSelectedIds([tableId]);
      }
  };

  useEffect(() => {
    if (stageRef.current) {
        stageRef.current.container().style.cursor = editMode ? "default" : (selectedIds.length > 0 ? "default" : "grab");
    }
  }, [editMode, selectedIds]);

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
        draggable={!editMode || (editMode && selectedIds.length === 0)}
        onWheel={handleWheel}
        onMouseDown={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            setSelectedIds([]);
          }
        }}
        onDragEnd={handleDragEnd}
        ref={stageRef}
      >
        <GridLayer 
            width={floor?.layout?.width || 2000} 
            height={floor?.layout?.height || 2000} 
            gridSize={floor?.layout?.gridSize || 20}
            visible={editMode}
        />
        
        <Layer>
          {tables.map((table) => (
            <TableNode
              key={table._id}
              id={`table-${table._id}`} // ID for finding node
              table={table}
              isSelected={selectedIds.includes(table._id)}
              editMode={editMode}
              onSelect={(e) => {
                handleTableSelect(table._id, e.evt.shiftKey || e.evt.ctrlKey);
                onTableClick(table);
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
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="btn btn-circle btn-sm" onClick={() => setScale(s => Math.min(s * 1.2, 5))}>+</button>
          <button className="btn btn-circle btn-sm" onClick={() => setScale(s => Math.max(s / 1.2, 0.1))}>-</button>
          <button className="btn btn-circle btn-sm" onClick={() => { setScale(1); setPosition({x: 0, y: 0}); }}>R</button>
      </div>

      {editMode && (
         <div className="absolute top-4 left-4 pointer-events-none bg-black/50 text-white px-2 py-1 rounded text-xs">
            Edit Mode Active
         </div>
      )}
    </div>
  );
});

export default FloorCanvas;
