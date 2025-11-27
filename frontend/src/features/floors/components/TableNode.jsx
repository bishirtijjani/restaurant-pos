import React, { useRef, useEffect } from "react";
import { Group, Rect, Circle, Text } from "react-konva";

const TableNode = ({
  id,
  table,
  isSelected,
  onSelect,
  onChange,
  editMode,
  onContextMenu,
}) => {
  const shapeRef = useRef();
  const groupRef = useRef();

  const shapeProps = {
    width: table.width || 60,
    height: table.height || 60,
    fill: getTableColor(table.status),
    stroke: isSelected ? "#00a96e" : "#e5e7eb",
    strokeWidth: isSelected ? 2 : 1,
    shadowBlur: isSelected ? 10 : 5,
    shadowColor: "black",
    shadowOpacity: 0.15,
    shadowOffset: { x: 2, y: 2 },
    cornerRadius: table.shape === "circle" ? (table.width || 60) / 2 : 8,
  };

  const textProps = {
    text: table.name,
    fontSize: 14,
    fontStyle: "bold",
    fill: "#fff",
    align: "center",
    verticalAlign: "middle",
    width: table.width || 60,
    height: table.height || 60,
  };

  return (
    <Group
      id={id}
      ref={groupRef}
      x={table.position?.x || 0}
      y={table.position?.y || 0}
      rotation={table.rotation || 0}
      draggable={editMode}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          ...table,
          position: {
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
            x: node.x(),
            y: node.y(),
          },
          width: Math.max(30, (table.width || 60) * scaleX),
          height: Math.max(30, (table.height || 60) * scaleY),
          rotation: node.rotation(),
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
          width={table.width || 60}
          height={table.height || 60}
          offsetX={0}
          offsetY={0}
          radius={(table.width || 60) / 2}
          x={(table.width || 60) / 2}
          y={(table.height || 60) / 2}
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
      <Group x={(table.width || 60) - 10} y={10}>
           <Circle
              radius={10}
              fill="#ffffff"
              shadowBlur={2}
              shadowColor="black"
              shadowOpacity={0.2}
           />
           <Text
              text={table.seats || "4"}
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
  switch (status) {
    case "Available":
      return "#10b981"; // Emerald 500
    case "Occupied":
      return "#3b82f6"; // Blue 500
    case "Reserved":
      return "#f59e0b"; // Amber 500
    case "Dirty":
      return "#ef4444"; // Red 500
    default:
      return "#9ca3af"; // Gray 400
  }
};

export default TableNode;

