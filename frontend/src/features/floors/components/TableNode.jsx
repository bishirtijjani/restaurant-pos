import React, { useRef, useEffect } from "react";
import { Group, Rect, Circle, Text } from "react-konva";

const TableNode = ({
  id,
  table,
  isSelected,
  isSnapTarget, // NEW: whether this table is the snap target
  onSelect,
  onChange,
  editMode,
  onContextMenu,
}) => {
  const shapeRef = useRef();
  const groupRef = useRef();

  // Access properties with fallback
  const width = table.position?.width || table.width || 60;
  const height = table.position?.height || table.height || 60;
  const rotation = table.position?.rotation || table.rotation || 0;
  const x = table.position?.x || 0;
  const y = table.position?.y || 0;
  const capacity = table.capacity || table.seats || 4;
  const tableNumber = table.tableNumber || table.name || "??";

  const shapeProps = {
    width,
    height,
    fill: getTableColor(table.status),
    stroke: isSnapTarget ? "#570df8" : (isSelected ? "#00a96e" : "#e5e7eb"), // Purple for snap target
    strokeWidth: isSnapTarget ? 4 : (isSelected ? 2 : 1),
    shadowBlur: isSnapTarget ? 20 : (isSelected ? 10 : 5),
    shadowColor: isSnapTarget ? "#570df8" : "black",
    shadowOpacity: isSnapTarget ? 0.6 : 0.15,
    shadowOffset: { x: 2, y: 2 },
    cornerRadius: table.shape === "circle" ? width / 2 : 8,
  };

  const textProps = {
    text: tableNumber,
    fontSize: 14,
    fontStyle: "bold",
    fill: "#fff",
    align: "center",
    verticalAlign: "middle",
    width,
    height,
  };

  return (
    <Group
      id={id}
      ref={groupRef}
      x={x}
      y={y}
      rotation={rotation}
      draggable={editMode}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          ...table,
          position: {
            ...table.position,
            x: e.target.x(),
            y: e.target.y(),
          },
        });
      }}
      onTransformEnd={(e) => {
        const node = groupRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale and update width/height/rotation
        node.scaleX(1);
        node.scaleY(1);

        onChange({
          ...table,
          position: {
            ...table.position,
            x: node.x(),
            y: node.y(),
            width: Math.max(30, width * scaleX),
            height: Math.max(30, height * scaleY),
            rotation: node.rotation(),
          },
        });
      }}
      onContextMenu={(e) => {
        e.evt.preventDefault(); // Prevent native context menu
        onContextMenu && onContextMenu(e, table);
      }}
      onMouseEnter={(e) => {
        if (editMode || !isSelected) {
          const container = e.target.getStage().container();
          container.style.cursor = editMode ? "move" : "pointer";
        }
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = "default";
      }}
    >
      {/* Main Shape */}
      {table.shape === "circle" ? (
        <Circle
          ref={shapeRef}
          {...shapeProps}
          width={width}
          height={height}
          offsetX={0}
          offsetY={0}
          radius={width / 2}
          x={width / 2}
          y={height / 2}
        />
      ) : (
        <Rect ref={shapeRef} {...shapeProps} />
      )}

      {/* Table Name */}
      <Text
        {...textProps}
        offsetX={0}
        offsetY={0}
        x={0}
        y={0}
      />

      {/* Capacity Indicator */}
      <Group x={width - 10} y={10}>
           <Circle
              radius={10}
              fill="#ffffff"
              shadowBlur={2}
              shadowColor="black"
              shadowOpacity={0.2}
           />
           <Text
              text={capacity.toString()}
              fontSize={10}
              fontStyle="bold"
              fill="#333"
              align="center"
              verticalAlign="middle"
              width={20}
              height={20}
              offsetX={10}
              offsetY={10}
           />
      </Group>
    </Group>
  );
};

const getTableColor = (status) => {
  switch (status?.toLowerCase()) {
    case "available":
      return "#10b981"; // Emerald 500
    case "occupied":
      return "#3b82f6"; // Blue 500
    case "reserved":
      return "#f59e0b"; // Amber 500
    case "cleaning":
    case "dirty":
      return "#ef4444"; // Red 500
    default:
      return "#9ca3af"; // Gray 400
  }
};

export default TableNode;

