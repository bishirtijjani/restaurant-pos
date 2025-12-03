# Findings: Merged Tables Operational Behavior

## 1. Table Merge/Unmerge Code
- **UI**: `MergeTableModalBody.jsx` handles the merge selection and calls the `mergeTables` thunk.
- **State**: `tableSlice.js` contains `mergeTables` and `splitTables` thunks.
- **Visualization**: `FloorCanvas.jsx` renders dashed lines between tables using the `table.mergedWith` property.
- **Unmerge**: `TableDetailsDrawerBody.jsx` provides the "Split" button which calls `splitTables`.

## 2. Table State Model
- **`mergedWith`**: An array of table IDs (or objects) indicating which tables are merged with the current one.
- **`status`**: Standard statuses (available, occupied, reserved, etc.).
- **`currentOrder`**: Links to an active order. Currently appears to be a direct link on the table object.

## 3. Order Creation / Lookup
- **POS**: `POSModalBody.jsx` handles order creation. It currently selects a single `tableNumber` (`selectedTable`).
- **Gap**: There is no explicit logic in the POS to handle merged groups. If Table A and Table B are merged, selecting Table A creates an order for Table A. It is not automatically treated as a "Group Order" in the frontend, though the backend might handle some linking (unknown).
- **Existing Logic**: `linkTableToOrder` exists in `tableSlice.js`, but it's per-table.

## 4. Merged Table Groups Logic
- **Implicit Grouping**: The group is defined by the `mergedWith` adjacency list. There is no explicit "Group ID" exposed in the frontend state, but the `mergedWith` array effectively creates the graph.
- **Primary Table**: There is no explicit "Primary" table flag visible in the frontend, but typically the one with the order or the first one selected could be considered primary.

## 5. Sidebar Drawer Component
- **`TableDetailsDrawerBody.jsx`**: This is the main view for table details.
- **Current Behavior**: Shows details for the *single* clicked table. If merged, it shows a "Split" button but doesn't explicitly aggregate info from the merged group (e.g., total capacity of the group, or shared order if linked to the other table).

## 6. Reservation Assignment & Conflict Detection
- **`AddReservationModalBody.jsx`**: Contains local `checkConflicts` logic (Status, Capacity, Time Overlap).
- **Gap**: The current conflict detection checks the *single* selected table. It does not appear to check if the table is part of a merged group or if the merge itself would cause a conflict (e.g., merging a reserved table).

## 7. UX Behaviors to Preserve
- **Visual Merge**: The dashed line visualization in `FloorCanvas` is established and should be kept.
- **Drawer Layout**: The `TableDetailsDrawerBody` layout (Summary, QR, Reservations, Order, Actions) is consistent and should be enriched, not replaced.
- **Modal Flows**: The existing modal system (`openModal`) is used consistently and should be reused.
