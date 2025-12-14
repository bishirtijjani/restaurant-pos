import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchFloorById } from "../floors/floorSlice";
import {
  fetchTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} from "./tablesSlice";
import { fetchOrders } from "../orders/ordersSlice";
import { fetchAllUsers } from "../users/usersSlice";
import TitleCard from "../../components/Cards/TitleCard";
import TableFormModal from "./components/TableFormModalBody";
import TableDetailsModal from "./components/TableDetailsModalBody";
import TableCard from "./components/TableCard";
import { Plus, ArrowLeft, Grid, List, Users } from "lucide-react";
import { showNotification } from "../common/headerSlice";

const TableManagement = () => {
  const { floorId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentFloor, loading: floorLoading } = useSelector(
    (state) => state.floors
  );
  const { tables, loading: tablesLoading } = useSelector(
    (state) => state.tables
  );
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );

  const [viewMode, setViewMode] = useState("grid");
  const [showTableForm, setShowTableForm] = useState(false);
  const [showTableDetails, setShowTableDetails] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const floorTables = tables.filter((t) => {
    const tableFloorId =
      typeof t.floorId === "string" ? t.floorId : t.floorId?._id;
    return String(tableFloorId) === String(floorId) && t.isActive;
  });

  const loading = floorLoading || tablesLoading;

  useEffect(() => {
    if (floorId) {
      dispatch(fetchFloorById(floorId));
      dispatch(fetchTables({ floorId }));
      dispatch(fetchOrders());
      dispatch(fetchAllUsers());
    }
  }, [dispatch, floorId]);

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
      if (showTableDetails) {
        setShowTableDetails(false);
      }
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
    // Logic to delete table
    if (window.confirm("Are you sure you want to delete this table?")) {
      try {
        await dispatch(deleteTable(tableId)).unwrap();
        dispatch(showNotification({ message: "Table deleted", status: 1 }));
        dispatch(fetchTables({ floorId }));
      } catch (error) {
        dispatch(
          showNotification({ message: "Failed to delete table", status: 0 })
        );
      }
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
          <button
            onClick={handleCreateTable}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Table
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : floorTables.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <Users className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Tables Yet</h3>
          <p className="text-base-content/70 mb-4">
            Add tables to this floor to start taking orders
          </p>
          <button onClick={handleCreateTable} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Add First Table
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {console.log(floorTables)}
          {floorTables.map((table) => (
            <TableCard
              key={table._id}
              table={table}
              currency={settings?.currency?.symbol || "$"}
              onEdit={handleEditTable}
              onDelete={handleDeleteTable}
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
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

                      <button
                        onClick={() => handleEditTable(table)}
                        className="btn btn-sm btn-ghost"
                      >
                        Edit
                      </button>
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
