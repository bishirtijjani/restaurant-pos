# Implementation Plan: Group Command Center (Multi-Store Analytics)

This plan outlines the steps to transform the `Store Management` page from a simple list into a **Premium Multi-Store Command Center** for owners and managers. It provides a "Bird's Eye View" of performance across all locations without sacrificing security or performance.

## Phase 1: Backend (The Data Engine)

### 1.1 New "Global" Analytics Controller

Create a new method in `backend/controllers/analyticsController.js` called `getMultiStoreOverview`.

- **Logic**:
  - Fetch the full user object to get the `stores` access list.
  - Filter for stores where the user has `admin` or `manager` roles.
  - Run parallel aggregations across these store IDs for:
    - **Total Today's Revenue** (Orders collection).
    - **Active Order Count** (Orders with status 'pending'/'preparing').
    - **Critical Alerts** (Low stock items and overly delayed orders).
    - **Individual Store Snapshots** (Brief data per store for the cards/sparklines).

### 1.2 Route Configuration

Update `backend/routes/index.js` and `backend/routes/analyticsRoutes.js`.

- **Challenge**: The global overview must bypass the `storeMiddleware` because it queries multiple IDs, not just one.
- **Solution**:
  - Register the route `/api/analytics/multi-store-overview` **before** the `router.use(storeMiddleware)` in `backend/routes/index.js`.
  - Add `roleMiddleware(['admin', 'manager'])` to this specific route for global security.

---

## Phase 2: Frontend (The "Wow" factor)

### 2.1 Analytics Data Fetching

- Create a new slice or update `storeSlice.js` to handle the global analytics state.
- Implement an `asyncThunk` to fetch the multi-store data on page load of the Store Management page.

### 2.2 Component: Global Stats Header

Create a high-end summary component for the top of the Store Management page.

- **Visuals**: Large, crisp numbers with icon accents.
- **Metrics**:
  - "Brand Revenue" (with a "Compared to Yesterday" trend).
  - "System Load" (Total active tables/orders).
  - "Priority Alerts" (A subtle, pulsing list of things needing attention).

### 2.3 Component: Enhanced Store Cards

Upgrade the cards in `StoreManagement.jsx`:

- **Sparklines**: Integrate `recharts` to show a tiny, elegant 24h sales trendline on each card.
- **Live Stats**: Add "Live Revenue" and "Active Orders" badges to each card.
- **Visual Polish**: Apply glassmorphism effects and modern borders (border-primary for the active store).

---

## Phase 3: UX & Performance

### 3.1 Progressive Loading

- Ensure the store cards load immediately (cached or from the basic store list).
- Analytics should "hydrate" in with a smooth skeleton animation to maintain a responsive feel.

### 3.2 Role-Based UI

- If a user is only a `waiter` in all their stores, the analytics header remains hidden. They only see the store list for switching.
- Managers only see aggregated data for stores they have authority over.

---

## 4. Technical Requirements

- **Charts**: `recharts` (already in project) for the sparklines.
- **Animations**: `framer-motion` (or standard CSS transitions) for smooth card expansions.
- **State**: Redux Toolkit for caching the global overview to prevent redundant API calls.

## 5. Success Criteria

- Owners can identify their busiest/slowest store in **under 3 seconds** of opening the app.
- Critical stock or kitchen delays across the entire franchise are visible in a single list.
- The UI maintains a "Premium SaaS" aesthetic that wows the user.
