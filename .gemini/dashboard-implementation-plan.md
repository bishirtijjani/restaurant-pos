# Implementation Plan: Restaurant Command Center Dashboard

## 1. Objective

Transform the dashboard from a placeholder into a "Command Center" that provides a "Live Pulse" of the restaurant. It will combine high-level strategic data (Revenue/Sales) with urgent operational data (Stock/KDS/Tables).

## 2. Visual Design & Layout

- **Theme**: Premium, clean, and high-contrast. Uses the existing design system but with enhanced "at-a-glance" visibility.
- **Header**: "Live Feed" indicator (blinking green dot) with "Last Updated" timestamp.
- **Top Section (KPI Pulse)**: Four high-impact Stat Cards:
  - **Total Revenue (Today)**
  - **Active Orders** (In-progress orders)
  - **Current Occupancy** (Seats/Tables filled)
  - **Active Staff** (Users with orders today)
- **Main Grid (Operational Blocks)**:
  - **Left Column (Trends)**:
    - **Today's Sales Curve**: A mini-line chart showing hourly revenue.
    - **Recent Orders Feed**: Last 5 orders with status indicators.
  - **Right Column (Operations)**:
    - **Urgent Alerts Pane**:
      - Low Stock Items (Below min level).
      - Long-waiting Orders (Orders pending > 15 mins).
    - **Quick Actions**: "Open POS", "New Reservation", "Add Expense".

## 3. Technical Implementation

### Phase 1: Data Architecture (Backend)

- **Controller Update**: Enhance `dashboardController.js` to return:
  - `kpis`: Today's totals (revenue, counts).
  - `ops`: Low stock count, pending KDS tasks, table occupancy %.
  - `feed`: Recent activity log.
- **Route**: Ensure `/api/dashboard` is scoped correctly with `x-store-id`.

### Phase 2: State Management (Frontend)

- **dashboardSlice.js**:
  - Update `initialState` to include `kpis`, `opsStats`, `recentActivity`, and `alerts`.
  - Add `fetchDashboardData` thunk to hit the unified endpoint.
  - Implement auto-refresh logic (optional, e.g., every 60 seconds).

### Phase 3: Component Development

- **New Components**:
  - `LiveStatusHeader`: Displays "Live" status and branch/store name.
  - `OperationsAlerts`: A list component for critical stock/KDS warnings.
  - `QuickActionToolbar`: A grid of icons for fast navigation.
- **Reused Components**:
  - `StatCard`: Enhanced to support colors and icons.
  - `MiniChart`: Simplified version of the analytics charts.

### Phase 4: Assembly & Polish

- Update `features/dashboard/index.jsx` to assemble the grid layout.
- Add micro-animations (e.g., subtle entry animations for cards).
- Ensure full responsiveness for tablet and desktop views.

## 4. Success Metrics

- Average time to find operational issues (Stock/KDS) reduced.
- Reduced need to navigate to deep analytics for daily performance checks.
- Zero "nonsense" — only actionable or critical data on the home screen.
