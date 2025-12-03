
/**
 * Utility functions for handling merged tables and group orders.
 */

/**
 * Get the full group of tables merged with the given table.
 * Returns an array of table objects including the target table itself.
 * @param {string} tableId - The ID of the table to check.
 * @param {Array} allTables - List of all available tables.
 * @returns {Array} Array of table objects in the group.
 */
export const getMergedGroup = (tableId, allTables) => {
    if (!tableId || !allTables) return [];

    const targetTable = allTables.find(t => t._id === tableId);
    if (!targetTable) return [];

    // If not merged, return just itself
    if (!targetTable.mergedWith || targetTable.mergedWith.length === 0) {
        return [targetTable];
    }

    // BFS/DFS to find all connected tables to handle transitive merges if any
    // (Though current implementation might be fully connected adjacency list)
    const group = new Set();
    const queue = [targetTable];
    group.add(targetTable._id);

    while (queue.length > 0) {
        const current = queue.shift();
        
        // Check mergedWith
        if (current.mergedWith && Array.isArray(current.mergedWith)) {
            current.mergedWith.forEach(linked => {
                const linkedId = typeof linked === 'object' ? linked._id : linked;
                if (!group.has(linkedId)) {
                    const linkedTable = allTables.find(t => t._id === linkedId);
                    if (linkedTable) {
                        group.add(linkedId);
                        queue.push(linkedTable);
                    }
                }
            });
        }
    }

    return Array.from(group).map(id => allTables.find(t => t._id === id)).filter(Boolean);
};

/**
 * Resolve the active order for a merged group.
 * Checks all tables in the group for an active order.
 * @param {string} tableId - The ID of the table to check.
 * @param {Array} allTables - List of all available tables.
 * @returns {Object|null} The active order object or null if none found.
 */
export const resolveMergedGroupOrder = (tableId, allTables) => {
    const group = getMergedGroup(tableId, allTables);
    
    // Find first table with a currentOrder
    const tableWithOrder = group.find(t => t.currentOrder);
    
    return tableWithOrder ? tableWithOrder.currentOrder : null;
};

/**
 * Get the primary table of a group (e.g. for labeling or assigning orders).
 * Heuristic: Table with order > Lowest Table Number > ID
 * @param {Array} group - Array of table objects.
 * @returns {Object} The primary table.
 */
export const getPrimaryTable = (group) => {
    if (!group || group.length === 0) return null;
    
    // 1. Table with order
    const withOrder = group.find(t => t.currentOrder);
    if (withOrder) return withOrder;

    // 2. Lowest Table Number
    return [...group].sort((a, b) => {
        const numA = parseInt(a.tableNumber) || Infinity;
        const numB = parseInt(b.tableNumber) || Infinity;
        return numA - numB;
    })[0];
};

/**
 * Check if tables can be merged based on status and reservations.
 * @param {Array} tableIds - IDs of tables to merge.
 * @param {Array} allTables - List of all tables.
 * @param {Array} todaysReservations - List of today's reservations.
 * @returns {Object} { canMerge: boolean, reason: string }
 */
export const canMergeTables = (tableIds, allTables, todaysReservations) => {
    const tables = tableIds.map(id => allTables.find(t => t._id === id)).filter(Boolean);
    
    if (tables.length !== tableIds.length) {
        return { canMerge: false, reason: "Some tables not found" };
    }

    // 1. Check Status (allow available or occupied, but warn if different?)
    // For now, strict: must be available or occupied (not reserved/blocked)
    const invalidStatus = tables.find(t => ['reserved', 'blocked', 'unavailable'].includes(t.status));
    if (invalidStatus) {
        return { canMerge: false, reason: `Table ${invalidStatus.tableNumber} is ${invalidStatus.status}` };
    }

    // 2. Check Reservations
    // If any table has a reservation NOW or overlapping soon, warn/block.
    // Simple check: Is there an active reservation for any of these tables?
    const now = new Date();
    const conflict = todaysReservations.find(res => {
        if (res.status === 'cancelled' || res.status === 'completed') return false;
        
        // Check if reservation is for one of our tables
        const resTableId = typeof res.tableId === 'object' ? res.tableId._id : res.tableId;
        if (!tableIds.includes(resTableId)) return false;

        // Check time overlap (simplified: active now or starting within 90 mins)
        // Real logic should be more robust, but this matches existing "currentReservation" logic
        const resTime = new Date(res.reservationDate); // Assuming ISO string or date object
        // If reservationDate is just YYYY-MM-DD, we need reservationTime
        const start = new Date(`${res.reservationDate.split('T')[0]}T${res.reservationTime}`);
        const end = new Date(start.getTime() + (res.duration || 90) * 60000);
        
        // Check if "now" is inside reservation window
        // OR if reservation starts very soon (e.g. next 30 mins)
        const leadTime = 30 * 60000;
        return (now >= start && now <= end) || (start > now && start - now < leadTime);
    });

    if (conflict) {
        return { canMerge: false, reason: `Conflict with reservation for ${conflict.customerName} at ${conflict.reservationTime}` };
    }

    return { canMerge: true };
};
