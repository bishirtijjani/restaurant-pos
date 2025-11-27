import React from 'react';
import { Layer, Line } from 'react-konva';

const GridLayer = ({ width, height, gridSize = 20, scale = 1, visible = true }) => {
  if (!visible) return null;

  const lines = [];
  
  // Calculate start and end points based on the view area if we wanted to optimize
  // For now, we'll draw a large enough grid or dynamic based on width/height
  // Ideally, this should receive the stage position to only draw visible lines
  // But for simplicity in this iteration, let's draw a fixed large grid or use a pattern
  
  // Better approach for infinite grid: Use a large area or dynamic calculation
  // Let's stick to a reasonable fixed size for the floor dimensions for now, 
  // or use the pattern approach which is more performant for backgrounds.
  
  // Actually, the best way for a grid in Konva is often a Shape with a fillPattern or just drawing lines.
  // Let's draw lines for the "floor size" area.
  
  const numCols = Math.ceil(width / gridSize);
  const numRows = Math.ceil(height / gridSize);

  for (let i = 0; i <= numCols; i++) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i * gridSize, 0, i * gridSize, height]}
        stroke="#ddd"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  for (let i = 0; i <= numRows; i++) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i * gridSize, width, i * gridSize]}
        stroke="#ddd"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return (
    <Layer listening={false}>
      {lines}
    </Layer>
  );
};

export default GridLayer;
