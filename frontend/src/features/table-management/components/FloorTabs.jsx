import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getFloors,
  reorderFloors,
  selectFloors,
  selectLoading,
  selectError,
} from "../floorSlice";
import FloorPlan from "./FloorPlan";
import AddFloorModal from "./AddFloorModal";
import EditFloorModal from "./EditFloorModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const FloorTabs = () => {
  const dispatch = useDispatch();
  const floors = useSelector(selectFloors);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [activeTab, setActiveTab] = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [floorToEdit, setFloorToEdit] = useState(null);

  useEffect(() => {
    dispatch(getFloors());
  }, [dispatch]);

  useEffect(() => {
    if (floors.length > 0 && !activeTab) {
      setActiveTab(floors[0]._id);
    }
  }, [floors, activeTab]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(floors);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const floorIds = items.map((floor) => floor._id);
    dispatch(reorderFloors(floorIds));
  };

  const handleEdit = (floor) => {
    setFloorToEdit(floor);
    setEditModalOpen(true);
  };

  if (loading) return <div>Loading floors...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Floors</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setAddModalOpen(true)}
        >
          Add Floor
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="floorTabs" direction="horizontal">
          {(provided) => (
            <div
              className="tabs tabs-boxed"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {floors.map((floor, index) => (
                <Draggable
                  key={floor._id}
                  draggableId={floor._id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`tab tab-lg ${
                        activeTab === floor._id ? "tab-active" : ""
                      }`}
                      onClick={() => setActiveTab(floor._id)}
                    >
                      {floor.name} ({floor.tableCount || 0})
                      <button
                        className="btn btn-xs btn-ghost ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(floor);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div>
        {activeTab && (
          <FloorPlan
            floorId={activeTab}
            key={activeTab} // Re-mount when floor changes
          />
        )}
      </div>

      <AddFloorModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      {floorToEdit && (
        <EditFloorModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          floor={floorToEdit}
        />
      )}
    </div>
  );
};

export default FloorTabs;
