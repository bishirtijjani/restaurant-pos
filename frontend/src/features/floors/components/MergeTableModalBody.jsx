import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mergeTables, fetchTables } from "../../tables/tableSlice";
import { showNotification } from "../../common/headerSlice";
import { closeModal } from "../../common/modalSlice";
import { Combine } from "lucide-react";
import { canMergeTables } from "../../tables/tableUtils";

const MergeTableModalBody = ({ closeModal, extraObject }) => {
    const dispatch = useDispatch();
    const { tables } = useSelector((state) => state.tables);
    const { items: reservations } = useSelector((state) => state.reservations);
    const [selectedTargetId, setSelectedTargetId] = useState("");
    const [loading, setLoading] = useState(false);

    // Get today's reservations for conflict check
    const todaysReservations = reservations.filter(r => {
        const today = new Date().toISOString().split('T')[0];
        return r.reservationDate.startsWith(today) && r.status !== 'cancelled';
    });

    const { tableId, floorId } = extraObject;



    // Filter out the current table and only show tables on the same floor
    const availableTables = tables.filter(t => {
        const tFloorId = typeof t.floorId === 'object' ? t.floorId?._id : t.floorId;
        const targetFloorId = typeof floorId === 'object' ? floorId?._id : floorId;
        return t._id !== tableId && String(tFloorId) === String(targetFloorId);
    });

    const handleMerge = async () => {
        if (!selectedTargetId) {
            dispatch(showNotification({ message: "Please select a table to merge with", status: 0 }));
            return;
        }

        // Conflict Check
        const validation = canMergeTables([tableId, selectedTargetId], tables, todaysReservations);
        if (!validation.canMerge) {
            dispatch(showNotification({ message: `Cannot merge: ${validation.reason}`, status: 0 }));
            return;
        }

        setLoading(true);
        try {
            await dispatch(mergeTables({ 
                tableIds: [tableId, selectedTargetId], 
                reason: "Drawer Merge" 
            })).unwrap();
            
            dispatch(showNotification({ message: "Tables merged successfully", status: 1 }));
            dispatch(fetchTables({ floorId })); // Refresh
            closeModal();
        } catch (error) {
            dispatch(showNotification({ message: `Merge failed: ${error.message || error}`, status: 0 }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="text-center p-4 bg-base-200 rounded-lg">
                <Combine className="w-12 h-12 mx-auto text-primary mb-2" />
                <h3 className="font-bold text-lg">Merge Table</h3>
                <p className="text-sm opacity-70">Select another table to combine with this one.</p>
            </div>

            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Merge with:</span>
                </label>
                <select 
                    className="select select-bordered w-full"
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                >
                    <option value="">Select a table...</option>
                    {availableTables.map(t => (
                        <option key={t._id} value={t._id}>
                            Table {t.tableNumber} ({t.seats} seats) - {t.status}
                        </option>
                    ))}
                </select>
            </div>

            <div className="modal-action">
                <button className="btn btn-ghost" onClick={() => closeModal()}>Cancel</button>
                <button 
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    onClick={handleMerge}
                    disabled={!selectedTargetId || loading}
                >
                    Merge Tables
                </button>
            </div>
        </div>
    );
};

export default MergeTableModalBody;
