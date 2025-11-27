import React from "react";
import { useDispatch } from "react-redux";
import { updateTableStatus } from "../../tables/tableSlice";
import { showNotification } from "../../common/headerSlice";

const TableDetailsDrawerBody = ({ closeRightDrawer, table }) => {
  const dispatch = useDispatch();
  console.log("TableDetailsDrawerBody rendered with table:", table);

  const handleStatusChange = async (status) => {
      try {
          console.log(`Attempting to update status to ${status} for table ${table._id}`);
          await dispatch(updateTableStatus({ id: table._id, status })).unwrap();
          dispatch(showNotification({ message: `Table marked as ${status}`, status: 1 }));
          closeRightDrawer();
      } catch (error) {
          console.error("Failed to update status:", error);
          dispatch(showNotification({ message: `Failed to update status: ${error.message || error}`, status: 0 }));
      }
  };

  return (
    <div className="space-y-6 pt-4">
        <div className="stats shadow w-full">
            <div className="stat">
                <div className="stat-title">Status</div>
                <div className={`stat-value text-lg ${
                    table?.status === 'available' ? 'text-success' :
                    table?.status === 'occupied' ? 'text-primary' :
                    table?.status === 'reserved' ? 'text-warning' : 'text-error'
                }`}>{table?.status || 'Unknown'}</div>
            </div>
             <div className="stat">
                <div className="stat-title">Seats</div>
                <div className="stat-value text-lg">{table?.capacity || 0}</div>
            </div>
        </div>

        {table?.currentOrder && (
            <div className="card bg-base-200 p-4">
                <h4 className="font-bold mb-2">Current Order</h4>
                <p>Order #{table.currentOrder.orderNumber}</p>
                <p className="text-sm opacity-70">Total: ${table.currentOrder.totalAmount}</p>
                <button className="btn btn-sm btn-outline mt-2 w-full">View Order</button>
            </div>
        )}

        <div className="divider">Actions</div>
        
        <div className="grid grid-cols-2 gap-2">
            <button 
                className="btn btn-outline btn-sm"
                onClick={() => {
                    // TODO: Implement assign waiter modal or logic
                    dispatch(showNotification({ message: "Assign Waiter feature coming soon", status: 1 }));
                }}
            >
                Assign Waiter
            </button>
            <button 
                onClick={() => handleStatusChange('cleaning')}
                className="btn btn-outline btn-sm"
            >
                Mark Dirtya
            </button>
             <button 
                onClick={() => handleStatusChange('available')}
                className="btn btn-outline btn-sm text-success"
            >
                Mark Available
            </button>
            <button 
                className="btn btn-outline btn-sm text-error"
                onClick={() => handleStatusChange('unavailable')}
            >
                Block Table
            </button>
        </div>
    </div>
  );
};

export default TableDetailsDrawerBody;
