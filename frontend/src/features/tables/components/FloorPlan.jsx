import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getTables,
  updateTablePosition,
  selectTablesByFloor,
  selectLoading,
  selectError,
} from "../tableSlice";
import Table from "./Table";
import AddTableModal from "./AddTableModal";
import Draggable from "react-draggable";

const FloorPlan = ({ floorId }) => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => selectTablesByFloor(state, floorId));
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getTables({ floor: floorId }));
  }, [dispatch, floorId]);

  const onStop = (e, data, tableId) => {
    dispatch(
      updateTablePosition({ id: tableId, position: { x: data.x, y: data.y } })
    );
  };

  if (loading) return <div>Loading tables...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="relative border mt-4 p-4 min-h-[500px] bg-gray-100 rounded">
      <div className="flex justify-end mb-4">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setAddModalOpen(true)}
        >
          Add Table
        </button>
      </div>
      {tables.map((table) => (
        <Draggable
          key={table._id}
          handle=".handle"
          defaultPosition={{ x: table.position.x, y: table.position.y }}
          grid={[10, 10]}
          onStop={(e, data) => onStop(e, data, table._id)}
          bounds="parent"
        >
          <div className="absolute">
            <Table table={table} />
          </div>
        </Draggable>
      ))}
      <AddTableModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        floorId={floorId}
      />
    </div>
  );
};

export default FloorPlan;
