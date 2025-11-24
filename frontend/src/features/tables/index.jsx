// frontend/src/features/tables/index.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  fetchTables,
  createTable,
  updateTable,
  updateTablePosition,
  updateTableStatus,
  deleteTable,
  linkTableToOrder,
  unlinkTableFromOrder,
} from "./tableSlice";
import { fetchFloorById } from "./floorSlice";
import { fetchOrders } from "../orders/ordersSlice";
import TitleCard from "../../components/Cards/TitleCard";
import DraggableTable from "./components/DraggableTable";
import TableFormModal from "./components/TableFormModal";
import TableDetailsModal from "./components/TableDetailsModal";
import { Plus, ArrowLeft, Grid, List, Users, Settings } from "lucide-react";
import { showNotification } from "../common/headerSlice";
import Can from "../../components/Auth/Can";

const TableManagement = () => {
  const { floorId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentFloor } = useSelector((state) => state.floors);
  const { tables, loading } = useSelector((state) => state.tables);
  const { orders } = useSelector((state) => state.orders);

  const [viewMode, setViewMode] = useState("grid");
  const [showTableForm, setShowTableForm] = useState(false);
  const [showTableDetails, setShowTableDetails] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const floorTables = tables.filter((t) => t.floorId === floorId && t.isActive);

  useEffect(() => {
    dispatch(fetchFloorById(floorId));
    dispatch(fetchTables({ floorId }));
    dispatch(fetchOrders());
  }, [dispatch, floorId]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = floorTables.findIndex((t) => t._id === active.id);
      const newIndex = floorTables.findIndex((t) => t._id === over.id);

      const reordered = arrayMove(floorTables, oldIndex, newIndex);

      reordered.forEach((table, index) => {
        dispatch(
          updateTablePosition({
            id: table._id,
            position: { x: index * 150, y: 0 },
          })
        );
      });
    }

    setActiveId(null);
  };

  const handleCreateTable = () => {
    setSelectedTable(null);
    setShowTableForm(true);
  };

  const handleEditTable = (table) => {
    setSelectedTable(table);
    setShowTableForm(true);
  };

  const handleViewDetails = (table) => {
    setSelectedTable(table);
    setShowTableDetails(true);
  };

  const handleSaveTable = async (data) => {
    try {
      if (selectedTable) {
        await dispatch(
          updateTable({ id: selectedTable._id, ...data })
        ).unwrap();
        dispatch(showNotification({ message: "Table updated", status: 1 }));
      } else {
        await dispatch(createTable({ ...data, floorId })).unwrap();
        dispatch(showNotification({ message: "Table created", status: 1 }));
      }
      setShowTableForm(false);
      dispatch(fetchTables({ floorId }));
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Operation failed",
          status: 0,
        })
      );
    }
  };

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await dispatch(
        updateTableStatus({ id: tableId, status: newStatus })
      ).unwrap();
      dispatch(showNotification({ message: "Status updated", status: 1 }));
      dispatch(fetchTables({ floorId }));
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to update status",
          status: 0,
        })
      );
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm("Delete this table?")) return;

    try {
      await dispatch(deleteTable(tableId)).unwrap();
      dispatch(showNotification({ message: "Table deleted", status: 1 }));
      dispatch(fetchTables({ floorId }));
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message || "Failed to delete",
          status: 0,
        })
      );
    }
  };

  return (
    <TitleCard
      title={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/app/floors")}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span>
            {currentFloor?.name || "Floor"} - Tables ({floorTables.length})
          </span>
        </div>
      }
      topMargin="mt-2"
      TopSideButtons={
        <div className="flex gap-2">
          <div className="join">
            <button
              className={`join-item btn btn-sm ${
                viewMode === "grid" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              className={`join-item btn btn-sm ${
                viewMode === "list" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Can do="createMenu">
            <button
              onClick={handleCreateTable}
              className="btn btn-primary btn-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Table
            </button>
          </Can>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : floorTables.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Tables Yet</h3>
          <p className="text-base-content/70 mb-4">
            Add tables to this floor to start taking orders
          </p>
          <Can do="createMenu">
            <button
              onClick={handleCreateTable}
              className="btn btn-primary gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Table
            </button>
          </Can>
        </div>
      ) : viewMode === "grid" ? (
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={floorTables.map((t) => t._id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {floorTables.map((table) => (
                <DraggableTable
                  key={table._id}
                  table={table}
                  onEdit={handleEditTable}
                  onDelete={handleDeleteTable}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <DraggableTable
                table={floorTables.find((t) => t._id === activeId)}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Table #</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Assigned Staff</th>
                <th>Current Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {floorTables.map((table) => (
                <tr key={table._id}>
                  <td className="font-medium">{table.tableNumber}</td>
                  <td>
                    <span
                      className={`badge badge-${getStatusColor(table.status)}`}
                    >
                      {table.status}
                    </span>
                  </td>
                  <td>{table.capacity} seats</td>
                  <td>{table.assignedStaff?.fullname || "-"}</td>
                  <td>{table.currentOrder?.orderNumber || "-"}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewDetails(table)}
                        className="btn btn-sm btn-ghost"
                      >
                        View
                      </button>
                      <Can do="editMenu">
                        <button
                          onClick={() => handleEditTable(table)}
                          className="btn btn-sm btn-ghost"
                        >
                          Edit
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTableForm && (
        <TableFormModal
          table={selectedTable}
          floorId={floorId}
          onClose={() => setShowTableForm(false)}
          onSave={handleSaveTable}
        />
      )}

      {showTableDetails && selectedTable && (
        <TableDetailsModal
          table={selectedTable}
          onClose={() => setShowTableDetails(false)}
          onStatusChange={handleStatusChange}
          onEdit={handleEditTable}
        />
      )}
    </TitleCard>
  );
};

const getStatusColor = (status) => {
  const colors = {
    available: "success",
    occupied: "warning",
    ordered: "info",
    reserved: "secondary",
    cleaning: "neutral",
    unavailable: "error",
  };
  return colors[status] || "ghost";
};

export default TableManagement;
