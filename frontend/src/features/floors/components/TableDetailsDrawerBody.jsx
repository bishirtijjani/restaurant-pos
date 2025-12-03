import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTableStatus, fetchTables } from "../../tables/tableSlice";
import { checkInReservation } from "../../reservations/reservationSlice";
import { showNotification } from "../../common/headerSlice";
import { openModal } from "../../common/modalSlice";
import { MODAL_BODY_TYPES, CONFIRMATION_MODAL_CLOSE_TYPES } from "../../../utils/globalConstantUtil";
import { format, isWithinInterval, addMinutes, parseISO, isFuture, isToday } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { 
    Clock, 
    Users, 
    Calendar, 
    Utensils, 
    Ban, 
    CheckCircle, 
    AlertTriangle, 
    Trash2,
    Edit,
    PlusCircle,
    Combine,
    Download,
    Printer,
    Split,
    Link
} from "lucide-react";
import { getMergedGroup, resolveMergedGroupOrder, getPrimaryTable } from "../../tables/tableUtils";

const TableDetailsDrawerBody = ({ closeRightDrawer, table }) => {
    const dispatch = useDispatch();
    
    // QR Code download handler
    const handleDownloadQR = () => {
        const svg = document.getElementById(`qr-code-${table._id}`);
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = 300;
        canvas.height = 300;
        
        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 300, 300);
            ctx.drawImage(img, 0, 0, 300, 300);
            
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `table-${table.tableNumber}-qr-code.png`;
                link.click();
                URL.revokeObjectURL(url);
            });
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };
    
    // QR Code print handler
    const handlePrintQR = () => {
        const svg = document.getElementById(`qr-code-${table._id}`);
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
        const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;
        
        const printWindow = window.open('', '', 'width=400,height=500');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Table ${table.tableNumber} QR Code</title>
                <style>
                    body {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        font-family: Arial, sans-serif;
                    }
                    .qr-container {
                        text-align: center;
                        padding: 20px;
                    }
                    h1 { 
                        margin: 20px 0 10px; 
                        font-size: 24px;
                        font-weight: bold;
                    }
                    p { 
                        margin: 5px 0; 
                        color: #666; 
                    }
                    .qr-image {
                        margin: 20px 0;
                        padding: 15px;
                        background: white;
                        border-radius: 12px;
                        display: inline-block;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    img {
                        display: block;
                        width: 200px;
                        height: 200px;
                    }
                    @media print {
                        body {
                            min-height: auto;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <h1>Table ${table.tableNumber}</h1>
                    <div class="qr-image">
                        <img src="${svgDataUrl}" alt="QR Code" />
                    </div>
                    <p>Scan to view menu or place order</p>
                    <p style="font-size: 12px; margin-top: 20px;">${table.floorName || 'Main Floor'}</p>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(() => window.print(), 300);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };
    const { items: reservations } = useSelector((state) => state.reservations);
    const { tables } = useSelector((state) => state.tables); // Need all tables for merge logic

    // Get Merged Group Info
    const mergedGroup = useMemo(() => getMergedGroup(table?._id, tables), [table, tables]);
    const isMerged = mergedGroup.length > 1;
    const primaryTable = getPrimaryTable(mergedGroup);
    const groupOrder = resolveMergedGroupOrder(table?._id, tables);
    
    // Construct Group Name
    const groupName = useMemo(() => {
        if (!isMerged) return `Table ${table.tableNumber}`;
        return `Table ${mergedGroup.map(t => t.tableNumber).sort((a,b) => a-b).join(" + ")}`;
    }, [isMerged, table, mergedGroup]);
    
    // Filter reservations for this table (or group) and today
    const todayReservations = useMemo(() => {
        if (!table || !reservations) return [];
        
        // Get IDs of all tables in the group
        const groupIds = isMerged ? mergedGroup.map(t => t._id) : [table._id];

        return reservations.filter(res => {
            const resTableId = typeof res.tableId === 'object' ? res.tableId._id : res.tableId;
            return groupIds.includes(resTableId) && 
                   isToday(new Date(res.reservationDate)) &&
                   res.status !== 'cancelled';
        }).sort((a, b) => new Date(a.reservationTime) - new Date(b.reservationTime));
    }, [table, reservations, isMerged, mergedGroup]);

    // Find current active reservation (overlapping now or starting within 15 mins)
    const currentReservation = useMemo(() => {
        const now = new Date();
        return todayReservations.find(res => {
            // Parse reservation time correctly (reservationTime is HH:MM:SS format)
            const start = new Date(`${res.reservationDate.split('T')[0]}T${res.reservationTime}`);
            const end = addMinutes(start, res.duration || 90);
            const startWindow = addMinutes(start, -15); // Show 15 mins before
            return isWithinInterval(now, { start: startWindow, end });
        });
    }, [todayReservations]);

    const handleCheckIn = async (reservation) => {
        try {
            await dispatch(checkInReservation(reservation._id)).unwrap();
            dispatch(showNotification({ message: "Guest checked in successfully", status: 1 }));
            // Refresh tables to show occupied status immediately
            if (table.floorId) dispatch(fetchTables({ floorId: table.floorId }));
        } catch (error) {
            dispatch(showNotification({ message: `Check-in failed: ${error.message || error}`, status: 0 }));
        }
    };

    const handleStatusChange = async (status) => {
        try {
            await dispatch(updateTableStatus({ id: table._id, status })).unwrap();
            dispatch(showNotification({ message: `Table marked as ${status}`, status: 1 }));
            if (status === 'cleaning' || status === 'available') {
                // closeRightDrawer(); // Optional: keep open to see change
            }
        } catch (error) {
            dispatch(showNotification({ message: `Failed to update status: ${error.message || error}`, status: 0 }));
        }
    };

    const handleOpenOrder = () => {
        if (table.currentOrder) {
             dispatch(openModal({
                title: "Order Details",
                bodyType: MODAL_BODY_TYPES.ORDER_DETAILS,
                extraObject: { orderId: table.currentOrder._id || table.currentOrder }
            }));
        } else {
            const extraObject = { tableId: table._id, floorId: table.floorId };
            if (currentReservation) {
                extraObject.reservationId = currentReservation._id;
                extraObject.customerName = currentReservation.customerName;
                extraObject.guests = currentReservation.partySize;
            }
            dispatch(openModal({
                title: "New Order",
                bodyType: MODAL_BODY_TYPES.ADD_ORDER,
                extraObject
            }));
        }
    };

    const handleAddReservation = () => {
        dispatch(openModal({
            title: "Add Reservation",
            bodyType: MODAL_BODY_TYPES.ADD_RESERVATION,
            extraObject: { tableId: table._id, preSelectedDate: new Date() }
        }));
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'available': return 'badge-success';
            case 'occupied': return 'badge-primary';
            case 'reserved': return 'badge-warning';
            case 'cleaning': return 'badge-info';
            case 'unavailable': return 'badge-error';
            default: return 'badge-ghost';
        }
    };

    if (!table) return <div className="p-4">Select a table to view details</div>;

    return (
        <div className="flex flex-col h-full bg-base-100">
            {/* 1. Table Summary Section */}
            <div className="p-6 bg-base-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            {groupName}
                            <span className={`badge ${getStatusColor(table.status)} badge-lg capitalize`}>
                                {table.status}
                            </span>
                        </h2>
                        <p className="text-base-content/70 text-sm mt-1">
                            {isMerged ? `${mergedGroup.reduce((sum, t) => sum + t.seats, 0)} Seats (Total)` : `${table.seats} Seats`} • Floor: {table.floorName || 'Main Floor'}
                        </p>
                    </div>
                    {/* Quick Edit */}
                    <button className="btn btn-ghost btn-xs btn-circle" onClick={() => dispatch(openModal({
                        title: "Edit Table Details",
                        bodyType: MODAL_BODY_TYPES.EDIT_TABLE,
                        extraObject: { tableId: table._id }
                    }))}     title="Edit Table Details">
                        <Edit size={16} />
                    </button>
                </div>
                
                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center bg-base-100 py-5 px-4 rounded-lg border border-base-300">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <QRCodeSVG 
                            id={`qr-code-${table._id}`}
                            value={`table:${table._id}`}
                            size={100}
                            level="M"
                            marginSize={0}
                        />
                    </div>
                    <div className="text-center mt-3">
                        <h4 className="font-bold text-sm leading-tight">Table QR Code</h4>
                        <p className="text-xs text-base-content/60 mt-1 leading-tight">
                            Scan to view menu or place order
                        </p>
                        <div className="flex gap-2 justify-center mt-2">
                            <button 
                                className="btn btn-xs btn-ghost gap-1"
                                onClick={handleDownloadQR}
                                title="Download QR Code"
                            >
                                <Download size={12} />
                                Download
                            </button>
                            <button 
                                className="btn btn-xs btn-ghost gap-1"
                                onClick={handlePrintQR}
                                title="Print QR Code"
                            >
                                <Printer size={12} />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 2. Current Reservation (if any) */}
                {currentReservation && (
                    <div className="card bg-warning/10 border border-warning/20 shadow-sm">
                        <div className="card-body p-4">
                            <h3 className="card-title text-sm text-warning flex items-center gap-2">
                                <Clock size={16} />
                                Current Reservation
                            </h3>
                            <div className="flex justify-between items-center mt-1">
                                <div>
                                    <p className="font-bold text-lg">{currentReservation.customerName || 'Guest'}</p>
                                    <p className="text-sm opacity-70">
                                        {format(new Date(currentReservation.reservationTime), 'h:mm a')} • {currentReservation.partySize} Guests
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {currentReservation.status === 'confirmed' && (
                                        <button 
                                            className="btn btn-sm btn-success text-white"
                                            onClick={() => handleCheckIn(currentReservation)}
                                        >
                                            Check In
                                        </button>
                                    )}
                                    <button 
                                        className="btn btn-sm btn-warning btn-outline"
                                        onClick={() => dispatch(openModal({
                                            title: "Edit Reservation",
                                            bodyType: MODAL_BODY_TYPES.EDIT_RESERVATION,
                                            extraObject: currentReservation
                                        }))}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                            {currentReservation.notes && (
                                <div className="text-xs bg-base-100 p-2 rounded mt-2 opacity-80">
                                    "{currentReservation.notes}"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. Upcoming Reservations */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-sm opacity-70 uppercase tracking-wider">Today's Reservations</h3>
                        <button 
                            className="btn btn-ghost btn-xs text-primary"
                            onClick={handleAddReservation}
                        >
                            <PlusCircle size={14} className="mr-1"/> Add
                        </button>
                    </div>
                    
                    {todayReservations.length > 0 ? (
                        <div className="space-y-2">
                            {todayReservations.map(res => (
                                <div key={res._id} className={`flex items-center justify-between p-3 rounded-lg border ${
                                    res._id === currentReservation?._id ? 'bg-warning/5 border-warning/30' : 'bg-base-100 border-base-200'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-base-200 p-2 rounded-md font-mono text-sm font-bold">
                                            {format(new Date(res.reservationTime), 'HH:mm')}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{res.customerName}</p>
                                            <p className="text-xs opacity-60">{res.partySize} ppl • {res.status}</p>
                                        </div>
                                    </div>
                                    {/* Conflict Warning Logic could go here */}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-base-200/50 rounded-lg border border-dashed border-base-300">
                            <p className="text-sm opacity-50">No reservations for today</p>
                        </div>
                    )}
                </div>

                {/* 4. Current Order Section (Group Aware) */}
                {(table.status === 'occupied' || groupOrder) && (
                    <div>
                        <h3 className="font-bold text-sm opacity-70 uppercase tracking-wider mb-2">
                            {isMerged ? 'Group Order' : 'Active Order'}
                        </h3>
                        {groupOrder ? (
                            <div className="card bg-primary/5 border border-primary/20">
                                <div className="card-body p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg">Order #{groupOrder.orderNumber}</p>
                                            <p className="text-sm opacity-70">
                                                {groupOrder.items?.length || 0} Items • <span className="font-mono font-bold">${groupOrder.totalAmount}</span>
                                            </p>
                                            <div className="badge badge-sm mt-2">{groupOrder.status || 'Active'}</div>
                                            {isMerged && groupOrder.table !== table.tableNumber && (
                                                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                                    <Link size={10} /> Linked via Table {groupOrder.table}
                                                </p>
                                            )}
                                        </div>
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => dispatch(openModal({
                                                title: "Order Details",
                                                bodyType: MODAL_BODY_TYPES.ORDER_DETAILS,
                                                extraObject: { orderId: groupOrder._id || groupOrder }
                                            }))}
                                        >
                                            Open Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-warning shadow-sm text-sm py-2">
                                <AlertTriangle size={16} />
                                <span>Table is occupied but has no active order linked.</span>
                                <button className="btn btn-xs btn-ghost" onClick={handleOpenOrder}>Link/Create</button>
                            </div>
                        )}
                    </div>
                )}

                {/* 6. Table Timeline Preview (Simplified) */}
                <div>
                    <h3 className="font-bold text-sm opacity-70 uppercase tracking-wider mb-2">Timeline (12 PM - 10 PM)</h3>
                    <div className="h-4 bg-base-200 rounded-full w-full relative overflow-hidden flex">
                        {/* Timeline Visualization */}
                        {todayReservations.map((res, idx) => {
                            // Simple logic to place dots/bars on timeline
                            const startHour = new Date(res.reservationTime).getHours();
                            if (startHour < 12 || startHour > 22) return null;
                            const left = ((startHour - 12) / 10) * 100; 
                            return (
                                <div 
                                    key={idx}
                                    className="absolute h-full bg-warning opacity-70"
                                    style={{ left: `${left}%`, width: '15%' }} // Assuming 1.5hr slots
                                    title={`Reservation at ${format(new Date(res.reservationTime), 'h:mm a')}`}
                                />
                            );
                        })}
                        {/* Current Time Marker */}
                        <div 
                            className="absolute h-full w-0.5 bg-red-500 z-10"
                            style={{ left: `${((new Date().getHours() - 12) / 10) * 100}%` }}
                            title="Now"
                        />
                    </div>
                    <div className="flex justify-between text-[10px] opacity-50 mt-1 font-mono">
                        <span>12p</span>
                        <span>5p</span>
                        <span>10p</span>
                    </div>
                </div>

                {/* 5. Quick Actions Section */}
                <div>
                    <h3 className="font-bold text-sm opacity-70 uppercase tracking-wider mb-2">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            className="btn btn-outline btn-sm gap-2 justify-start h-auto py-2"
                            onClick={handleOpenOrder}
                        >
                            <Utensils size={16} />
                            <div className="text-left">
                                <div className="font-bold">Order</div>
                                <div className="text-[10px] font-normal opacity-70">Open POS</div>
                            </div>
                        </button>

                        <button 
                            className="btn btn-outline btn-sm gap-2 justify-start h-auto py-2"
                            onClick={handleAddReservation}
                        >
                            <Calendar size={16} />
                            <div className="text-left">
                                <div className="font-bold">Reserve</div>
                                <div className="text-[10px] font-normal opacity-70">Book Table</div>
                            </div>
                        </button>

                        <button 
                            className={`btn btn-outline btn-sm gap-2 justify-start h-auto py-2 ${table.status === 'cleaning' ? 'btn-active' : ''}`}
                            onClick={() => handleStatusChange(table.status === 'cleaning' ? 'available' : 'cleaning')}
                        >
                            <CheckCircle size={16} />
                            <div className="text-left">
                                <div className="font-bold">{table.status === 'cleaning' ? 'Mark Clean' : 'Mark Dirty'}</div>
                                <div className="text-[10px] font-normal opacity-70">Toggle Status</div>
                            </div>
                        </button>

                        <button 
                            className={`btn btn-outline btn-sm gap-2 justify-start h-auto py-2 ${table.status === 'unavailable' ? 'btn-error text-white' : 'text-error'}`}
                            onClick={() => handleStatusChange(table.status === 'unavailable' ? 'available' : 'unavailable')}
                        >
                            <Ban size={16} />
                            <div className="text-left">
                                <div className="font-bold">{table.status === 'unavailable' ? 'Unblock' : 'Block'}</div>
                                <div className="text-[10px] font-normal opacity-70">Stop Service</div>
                            </div>
                        </button>

                        {table.mergedWith && table.mergedWith.length > 0 ? (
                            <button 
                                className="btn btn-outline btn-sm gap-2 justify-start h-auto py-2"
                                onClick={() => dispatch(openModal({
                                    title: "Split Tables?",
                                    bodyType: MODAL_BODY_TYPES.CONFIRMATION,
                                    extraObject: {
                                        message: `Are you sure you want to split table ${table.tableNumber}?`,
                                        type: CONFIRMATION_MODAL_CLOSE_TYPES.SPLIT_TABLES,
                                        id: table._id,
                                    },
                                }))}
                            >
                                <Split size={16} />
                                <div className="text-left">
                                    <div className="font-bold">Split</div>
                                    <div className="text-[10px] font-normal opacity-70">Unmerge Tables</div>
                                </div>
                            </button>
                        ) : (
                            <button 
                                className="btn btn-outline btn-sm gap-2 justify-start h-auto py-2"
                                onClick={() => dispatch(openModal({
                                    title: "Merge Table",
                                    bodyType: MODAL_BODY_TYPES.MERGE_TABLE,
                                    extraObject: { 
                                        tableId: table._id,
                                        floorId: table.floorId
                                    }
                                }))}
                            >
                                <Combine size={16} />
                                <div className="text-left">
                                    <div className="font-bold">Merge</div>
                                    <div className="text-[10px] font-normal opacity-70">Combine Tables</div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* 7. Metadata Section */}
            <div className="p-4 bg-base-200 text-xs text-base-content/50 border-t border-base-300">
                <div className="flex justify-between">
                    <span>ID: {table._id?.slice(-6)}</span>
                    <span>Pos: {Math.round(table.position?.x)}, {Math.round(table.position?.y)}</span>
                </div>
                <div className="mt-1">
                    Updated: {table.updatedAt ? format(new Date(table.updatedAt), 'MMM d, h:mm a') : 'N/A'}
                </div>
            </div>
        </div>
    );
};

export default TableDetailsDrawerBody;
