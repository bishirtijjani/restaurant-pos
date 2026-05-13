# Codeket Restaurant

> **The operations-first, offline-capable restaurant management system. One backbone for table, kitchen, inventory, and analytics — running on any device, with or without internet.**

Live marketing site: [restaurant.codeket.com](https://restaurant.codeket.com)
App: [app.restaurant.codeket.com](https://app.restaurant.codeket.com)

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [Who It's For](#2-who-its-for)
3. [The Product Philosophy](#3-the-product-philosophy)
4. [Repository Layout](#4-repository-layout)
5. [Tech Stack](#5-tech-stack)
6. [System Architecture](#6-system-architecture)
7. [Multi-Tenancy Model](#7-multi-tenancy-model)
8. [Offline-First Architecture](#8-offline-first-architecture)
9. [Backend Reference](#9-backend-reference)
10. [Frontend Reference](#10-frontend-reference)
11. [Product Site](#11-product-site)
12. [Feature Catalog](#12-feature-catalog)
13. [Roles & Permissions](#13-roles--permissions)
14. [Data Models](#14-data-models)
15. [API Surface](#15-api-surface)
16. [Real-Time, Sync & Idempotency](#16-real-time-sync--idempotency)
17. [Security](#17-security)
18. [Observability & Health](#18-observability--health)
19. [Payments & Billing](#19-payments--billing)
20. [UI/UX Design Language](#20-uiux-design-language)
21. [Development Setup](#21-development-setup)
22. [Scripts & Utilities](#22-scripts--utilities)
23. [Testing Strategy](#23-testing-strategy)
24. [Deployment](#24-deployment)
25. [Marketing Positioning](#25-marketing-positioning)
26. [Pricing](#26-pricing)
27. [Roadmap & Known Gaps](#27-roadmap--known-gaps)
28. [Support](#28-support)

---

## 1. What This Is

**Codeket Restaurant** is a full-stack, multi-tenant SaaS restaurant management system. It replaces the fragile mosaic that most restaurants run on — a separate POS, a spreadsheet for stock, a printer that crashes when Wi-Fi drops, a notebook for reservations — with one integrated operational backbone.

It is **not** a "POS with extras." It is an end-to-end operating system for the restaurant floor: from the guest sitting down at a table, through the order moving to the kitchen, to inventory being deducted, to the manager seeing the variance the next morning — all in one continuous flow that does not break when the internet does.

The application ships as:

- A **PWA web app** ([frontend/](frontend/)) installable on iPad, Android, Windows, or any Chromium browser — no native build required, no app-store gating.
- A **Node/Express API + MongoDB** backend ([backend/](backend/)) that handles multi-tenant data, sync orchestration, payments, real-time WebSocket fan-out, and platform health monitoring.
- A **marketing & lead-capture site** ([product-site/](product-site/)) built as a static-rendered React 19 SSG bundle.
- An **end-to-end Playwright test harness** ([tests/](tests/)) for golden-path regression.

---

## 2. Who It's For

| Audience | Pain it solves |
|---|---|
| **Independent full-service restaurants** | Eliminates the gap between POS, kitchen, and stock. One source of truth. |
| **Small chains (2–10 locations)** | Brand-level menu inheritance with per-store overrides; centralized analytics; locked-down RBAC. |
| **Restaurants in regions with unstable internet** | Local-first storage means service does not stop when Wi-Fi does. Everything reconciles on reconnect. |
| **Operators replacing legacy/proprietary POS** | No hardware lock-in. Works on the iPad they already own. No setup fees, no contracts. |
| **Founders / multi-unit owners** | Real-time visibility across stores, audit trail of every void/discount/edit, granular tax control. |
| **Kitchens running multi-station prep** | Dedicated KDS with per-station routing, audio alerts, course timing, and recall. |

**Explicitly not for:** Pure delivery-only ghost kitchens (no driver dispatch yet), large enterprise chains needing custom ERP integration, or food trucks that don't need inventory tracking.

---

## 3. The Product Philosophy

Four design principles, applied consistently across every screen and endpoint:

1. **Reliability over Features** — A POS that crashes during dinner rush is worthless, no matter how many integrations it has. Every feature is built to keep working when something — internet, server, hardware — fails.
2. **Operational Continuity** — Table → Kitchen → Inventory → Analytics is one pipeline. No re-entry, no parallel spreadsheets, no manual reconciliation.
3. **Bring Your Own Hardware** — No proprietary terminals. The app runs on whatever screen you can plug in: an iPad, an Android tablet, a Windows till, a laptop, a phone.
4. **Opinionated by Design** — We make the right defaults so you don't have to configure 200 toggles. Customization is allowed where it matters (tax, branding, recipes) and refused where it would compromise reliability.

---

## 4. Repository Layout

```
restaurant-management-system/
├── backend/               Node + Express + MongoDB API
│   ├── config/            Security, CORS, DB, Cloudinary, permissions defaults
│   ├── controllers/       40 domain controllers (one per resource)
│   ├── middleware/        Auth, store context, permissions, rate limit, idempotency
│   ├── models/            34 Mongoose schemas
│   ├── routes/            40 route files + centralized index.js
│   ├── services/          ImportExportService, healthMonitor
│   ├── scripts/           Seeders, migrations, super-admin promotion
│   ├── test/              Vitest + supertest + mongodb-memory-server
│   ├── utils/             webSocket, syncEngine, OrderCalculator, taxCalculator,
│   │                      discountCalculator, inventoryManager, paymentProvider,
│   │                      communicationManager, metricsCollector, alertManager,
│   │                      logAction, settingsManager, tenancyPlugin, logger
│   └── index.js           Server entrypoint (HTTP + WebSocket + health monitor)
│
├── frontend/              React 18 + Vite + Redux Toolkit PWA
│   ├── public/            Static assets, icons, manifest
│   ├── src/
│   │   ├── app/           Store, authSlice, init, initOffline, axios interceptors
│   │   ├── components/    Auth, Cards, Common, Input, Mobile, Support,
│   │   │                  Typography, SyncManager, OfflineIndicator
│   │   ├── containers/    Layout, Header, Sidebars, ModalLayout, Guards
│   │   ├── features/      30 feature folders (Redux slice + UI per domain)
│   │   ├── hooks/         Cross-cutting React hooks
│   │   ├── pages/         Login, Register, Forgot/Reset, Onboarding, protected/
│   │   ├── routes/        Route table (lazy-loaded)
│   │   ├── services/      API client wrappers
│   │   ├── utils/         Offline storage (localforage), helpers, formatters
│   │   ├── sw.js          Service worker (Workbox, injectManifest)
│   │   ├── App.jsx        Root component + router
│   │   └── main.jsx       Vite entry
│   └── vite.config.js     Vite + VitePWA config
│
├── product-site/          Marketing site (React 19 + Vite SSG + Tailwind 4)
│   ├── src/               Landing, pricing, philosophy, FAQ, lead-capture modal
│   ├── vercel.json        Vercel routing
│   └── vite.config.js     vite-react-ssg build
│
├── tests/
│   └── e2e/               Playwright E2E specs (POS flow, etc.)
│
├── playwright.config.js   E2E config
├── checklist.md           Feature coverage matrix (what's built vs. not)
├── manual_test_guide.md   Step-by-step manual QA script
├── PRODUCT_SITE_CONTENT.md  Source-of-truth marketing copy
├── test_coverage_gaps.md  Known untested paths
└── README.md              This document
```

---

## 5. Tech Stack

### Backend
- **Runtime:** Node.js + Express 4
- **Database:** MongoDB via Mongoose 8
- **Auth:** JWT (jsonwebtoken) + bcryptjs, cookie-parser, refresh-token rotation
- **Real-time:** native `ws` WebSocket server (not Socket.io on backend)
- **Background work:** Bull (Redis-backed queues) for deferred jobs
- **Payments:** Stripe SDK
- **Storage / CDN:** Cloudinary (image uploads via multer-storage-cloudinary)
- **Email:** Nodemailer (SMTP) with provider abstraction
- **Security:** Helmet, express-mongo-sanitize, xss-clean, custom rate limiter
- **Validation:** Joi
- **Data exchange:** csv-parse, csv-stringify, exceljs for import/export
- **Date/time:** date-fns + date-fns-tz
- **QR generation:** qrcode
- **Tests:** Vitest, supertest, mongodb-memory-server

### Frontend (App)
- **Framework:** React 18 + React Router 6
- **State:** Redux Toolkit + react-redux
- **Styling:** Tailwind CSS 3 + DaisyUI + styled-components (legacy pockets)
- **Charts:** Recharts + Tremor
- **Canvas (floor plans):** Konva + react-konva
- **Drag/drop:** @dnd-kit/core + @dnd-kit/sortable + react-beautiful-dnd (legacy)
- **PDF:** @react-pdf/renderer + print-js + react-to-print
- **Forms / pickers:** react-datepicker, react-tailwindcss-datepicker, react-date-range, react-select
- **Animation:** framer-motion
- **Icons:** lucide-react + @heroicons/react
- **Realtime client:** socket.io-client (legacy), native WebSocket for live ops
- **Offline storage:** localforage (IndexedDB)
- **PWA:** vite-plugin-pwa (injectManifest)
- **Notifications:** react-toastify, react-notifications, react-contexify
- **Onboarding tour:** react-joyride
- **Excel/CSV:** xlsx
- **Payments client:** @stripe/stripe-js + @stripe/react-stripe-js
- **JWT decoding:** jwt-decode

### Product Site
- **Framework:** React 19 + react-router-dom 7
- **Build:** vite-react-ssg (static rendering for SEO)
- **Styling:** Tailwind CSS 4
- **Lead capture:** @emailjs/browser
- **Hosting:** Vercel

### Infrastructure
- **Dev DB:** Local MongoDB or Atlas
- **Test DB:** mongodb-memory-server (ephemeral)
- **CDN/Images:** Cloudinary
- **Queues:** Redis + Bull
- **CI/Hosting (recommended):** Vercel (product site), any Node-capable host for backend (Render, Railway, Fly, Docker on VPS)

---

## 6. System Architecture

```
                    ┌──────────────────────────────────────────────────┐
                    │              CODEKET RESTAURANT PLATFORM          │
                    └──────────────────────────────────────────────────┘

  Customer / Floor Staff Devices                  Manager / Admin Devices
  ┌──────────────────────────────┐                ┌──────────────────────────────┐
  │  PWA (React 18 + Vite)       │                │  PWA (Admin dashboards)      │
  │  ├─ POS / Ultra-Fast POS     │                │  ├─ Analytics                │
  │  ├─ KDS                      │                │  ├─ Audit Logs               │
  │  ├─ Floor Plan (Konva)       │                │  ├─ Brand & Store mgmt       │
  │  ├─ Reservations             │                │  ├─ Platform Health          │
  │  └─ Service Worker + IDB     │                │  └─ Super-Admin              │
  └────────────┬─────────────────┘                └────────────┬─────────────────┘
               │                                                │
               │  HTTPS REST (axios)        WebSocket (/ws, JWT)│
               │  + Background Sync         + storeId/stationId │
               └────────────────────┬───────────────────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │   Express API (Node)    │
                       │   ├─ authMiddleware     │
                       │   ├─ storeMiddleware    │  ← multi-tenant gate
                       │   ├─ permission checks  │
                       │   ├─ idempotency        │
                       │   ├─ rate limit         │
                       │   └─ 40 controllers     │
                       └─────┬────────────┬──────┘
                             │            │
              ┌──────────────▼──┐      ┌──▼──────────────┐
              │  MongoDB        │      │  Redis + Bull   │
              │  (Mongoose)     │      │  (queues, jobs) │
              │  34 collections │      └─────────────────┘
              └────────┬────────┘
                       │
              ┌────────▼──────────────────────────────────┐
              │  External services                         │
              │  ├─ Stripe (payments + webhooks)           │
              │  ├─ Cloudinary (image CDN)                 │
              │  ├─ Nodemailer / SMTP (email)              │
              │  └─ Communication providers (SMS/WhatsApp) │
              └────────────────────────────────────────────┘
```

**Request lifecycle (protected route):**

1. Client sends request with `Authorization: Bearer <jwt>` + `x-store-id: <storeId>`.
2. [backend/index.js](backend/index.js) applies Helmet, CORS, cookieParser, request logger, metrics collection, rate limiter.
3. [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js) verifies JWT, attaches `req.user`.
4. [backend/middleware/storeMiddleware.js](backend/middleware/storeMiddleware.js) validates the user has access to that store, attaches `req.store` + `req.storeId`.
5. Permission middleware checks the action against the user's per-store role.
6. Idempotency middleware deduplicates by `clientId` (UUIDv7) where applicable.
7. Controller executes; Mongoose queries are auto-filtered by `storeId` via [backend/utils/tenancyPlugin.js](backend/utils/tenancyPlugin.js).
8. Response logged + metrics emitted; WebSocket fan-out triggered for live-ops collections (orders, KDS state, inventory).

---

## 7. Multi-Tenancy Model

Three layers of tenancy, enforced at the database, middleware, and UI layers simultaneously:

```
Organization (brand owner)
   │
   ├── Plan: free | basic | pro
   ├── Brand-level settings: currency default, timezone, branding,
   │   master menu, inventory defaults, communication providers
   │
   └── Store(s)  ←── one or many, all share the brand
         │
         ├── Local overrides: branding tweak, store-specific tax,
         │   printer config, hardware, currency override (rare)
         │
         ├── Owns: inventory, orders, customers, expenses,
         │   tables/floors, suppliers, audit logs
         │
         └── User access via User.stores[]:
               { storeId, role, permissions[], status }
```

**Key rules:**
- A `User` can belong to multiple `Store`s, with **different roles per store**.
- The active store is selected via the `x-store-id` header, validated on every request.
- `MenuItem` is **organization-level** by default (brand-wide menu) but supports `isMaster` + `masterId` for store-level overrides — the "Brand Catalog" inheritance pattern.
- `Settings` cascade: Organization default → Store override → effective value. See [backend/utils/settingsManager.js](backend/utils/settingsManager.js).
- Brand-wide routes (`/api/brand/*`, `/api/analytics/multi-store-overview`, `/api/platform-admin/*`) skip the `storeMiddleware` check because they intentionally span stores.
- Super-admins (platform staff) operate at a layer above organizations and have a separate guarded UI at `/super-admin/*`.

---

## 8. Offline-First Architecture

The single most important non-obvious property of this system: **the restaurant does not stop when the internet does.**

### Client side
- **Service Worker** ([frontend/src/sw.js](frontend/src/sw.js)) — Workbox `injectManifest` strategy. Precaches the entire app shell and static assets at build time. Handles navigation fallback so refreshing offline still loads the SPA. Listens for `background-sync` (`offline-sync` tag) and `periodicsync` (`periodic-refresh`) events.
- **IndexedDB via localforage** ([frontend/src/utils/offline/storage.js](frontend/src/utils/offline/storage.js)) — Separate localforage instances per collection (menuItems, categories, orders, customers, suppliers, expenses, inventory, purchaseOrders, users, syncQueue, failedQueue, metadata, settings, dashboard). All scoped by active store.
- **Sync queue** — Any write performed while offline is enqueued. When the connection returns (or background-sync fires), the queue is flushed in order. Failures move to `failedQueue` for inspection.
- **Initial sync overlay** ([frontend/src/components/InitialSyncOverlay.jsx](frontend/src/components/InitialSyncOverlay.jsx)) — On first login or store switch, the app aggressively pre-fetches everything needed for offline operation before letting the user in.
- **Offline indicator** ([frontend/src/components/OfflineIndicator.jsx](frontend/src/components/OfflineIndicator.jsx)) — Always-visible badge so staff know exactly which mode they're in.
- **Offline prefetch hook** ([frontend/src/features/common/hooks/useOfflinePrefetch.js](frontend/src/features/common/hooks/useOfflinePrefetch.js)) — Proactively warms the cache while online and authenticated.

### Server side
- **Delta sync controller** ([backend/controllers/syncController.js](backend/controllers/syncController.js)) — `POST /api/sync/pull` returns only records changed since the client's `lastSyncDate`. Lazy-loads Mongoose models per collection to avoid circular deps. Settings collection is handled as a special document-style merge.
- **Idempotency keys** ([backend/models/IdempotencyKey.js](backend/models/IdempotencyKey.js)) + `clientId` on Orders, Customers, Payments — Network retries cannot create duplicate records. The client generates a UUIDv7 at the moment of action; the server treats the second request as a no-op replay.
- **Conflict resolution** — Last-write-wins for most collections; orders use a state-machine to reject invalid transitions (you cannot reopen a fully refunded order, etc.).

### What "offline" actually means in practice
| Action | Works offline? |
|---|---|
| Take a dine-in order, send to KDS on same network | ✅ |
| Take a takeaway order, cash payment | ✅ |
| Add a customer | ✅ |
| View today's menu, prices, modifiers | ✅ |
| Stock deduction (queued, applied on reconnect) | ✅ |
| Card payment via Stripe | ❌ (requires network) |
| Cross-device sync without local network | ❌ (one device per offline pocket) |
| Live analytics | ❌ (data appears when connection returns) |

---

## 9. Backend Reference

### Entrypoint
[backend/index.js](backend/index.js) wires:
1. Process-level uncaught exception + unhandled rejection handlers (log + exit).
2. `setupSecurity(app)` — Helmet + JSON body parser (50MB) + mongo-sanitize + xss-clean.
3. Cookie parser, CORS, request logger, metrics collector, `generalLimiter` on `/api`.
4. `connectToDB()` to Mongo.
5. Centralized routes at `/api` ([backend/routes/index.js](backend/routes/index.js)).
6. Optional static serving of `frontend/dist` if present (single-box deploy).
7. Global error handler returning `{ success: false, message: "Internal server error" }`.
8. HTTP server + WebSocket initialization on the same port.
9. `healthMonitor.startMonitoring()` after 2s delay (lets DB stabilize).
10. SIGTERM/SIGINT graceful shutdown with 10s force-kill fallback.

### Controllers (40)
Each domain has exactly one controller. The full list:

`addOnGroupController`, `analyticsController`, `authController`, `brandMenuController`, `categoryController`, `customerController`, `dashboardController`, `discountController`, `expenseController`, `floorController`, `generalSettingsController`, `healthController`, `importExportController`, `inventoryController`, `kdsController`, `kdsStationsController`, `logController`, `menuItemController`, `onboardingController`, `orderController`, `orderModificationController`, `orderPreviewController`, `organizationController`, `paymentController`, `platformAdminController`, `promoCodeController`, `purchaseOrderController`, `reportController`, `reservationController`, `stockAdjustmentController`, `storeController`, `supplierController`, `syncController`, `tableController`, `ultraFastPOSController`, `uploadController`, `userController`, `voidController`, `webhookController`.

### Middleware
| File | Role |
|---|---|
| `authMiddleware.js` | JWT verify, attaches `req.user`, refresh-token flow |
| `storeMiddleware.js` | Resolves `x-store-id`, asserts user has access, attaches `req.store` |
| `roleMiddleware.js` | Coarse role gate (admin/manager/staff/...) |
| `permissionMiddleware.js` | Fine-grained permission gate (e.g. `ORDERS_VOID`) |
| `superAdminMiddleware.js` | Platform-staff-only routes |
| `organizationMiddleware.js` | Brand-level context for cross-store endpoints |
| `validationMiddleware.js` | Joi request validation |
| `uploadMiddleware.js` | Multer + Cloudinary image uploads |
| `rateLimitMiddleware.js` | Per-route + general rate limits |
| `idempotencyMiddleware.js` | `clientId` + `IdempotencyKey` replay protection |

### Utilities
| File | Role |
|---|---|
| `webSocket.js` | WS server, JWT-on-subscribe, storeId/stationId channels |
| `syncEngine.js` | Server-side delta computation |
| `OrderCalculator.js` | Single source of truth for order totals |
| `taxCalculator.js` | Per-item, inclusive/exclusive, store-overridable tax |
| `discountCalculator.js` | Percentage / fixed / BOGO with stacking rules |
| `inventoryManager.js` | Recipe-based deduction, low-stock alerts |
| `paymentProvider.js` | Stripe abstraction + future provider hook |
| `communicationManager.js` + `ProviderRegistry.js` | Email/SMS/WhatsApp routing |
| `metricsCollector.js` | API latency, error rate, active requests |
| `alertManager.js` | Threshold breach → SystemAlert |
| `logAction.js` | Centralized audit-trail writer |
| `settingsManager.js` | Brand → Store settings cascade |
| `tenancyPlugin.js` | Mongoose plugin auto-filtering by `storeId` |
| `logger.js` | Structured logging |

---

## 10. Frontend Reference

### Bootstrap
[frontend/src/App.jsx](frontend/src/App.jsx) calls three init routines before mounting routes:
- `initializeApp()` — Redux store, theme, axios base URL
- `initializeOfflineSupport()` — Registers SW, attaches background-sync listeners, starts 30s auto-sync once authenticated
- `setupAxiosInterceptors()` — Attaches JWT, handles 401 refresh, injects `x-store-id`

Public pages (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/onboarding`) bypass auth fetches to save quota.

Authenticated users are routed by user-type:
- `/super-admin/*` → `SuperAdminGuard` + `SuperAdminLayout`
- `/app/*` → `SuperAdminBlockGuard` + `StoreGuard` + `Layout`
- `/home` → external redirect to marketing site

### Containers
- `Layout` — Main app shell: Header + LeftSidebar + PageContent + RightSidebar + ModalLayout
- `Header` — Store switcher, search, notifications, user menu, offline indicator
- `LeftSidebar` + `SidebarSubmenu` — Role-aware navigation tree
- `RightSidebar` — Contextual quick actions
- `ModalLayout` — Global modal portal (Redux-driven)
- `StoreGuard` — Forces store selection if none active
- `SuperAdminGuard` / `SuperAdminBlockGuard` — Routes super-admins away from tenant UI
- `SuspenseContent` — Lazy-load fallback

### Features (30 slices)
Each folder contains its Redux slice + UI + sub-components:

`addOnGroups`, `analytics` (10+ dashboards), `auditLogs`, `brand`, `categories`, `common`, `customers`, `dashboard`, `discounts`, `expenses`, `floors`, `inventory`, `kds`, `kdsStations`, `menuItems`, `onboarding`, `orders`, `platformAdmin`, `platformHealth`, `purchaseOrders`, `reservations`, `settings`, `stockAdjustments`, `stores`, `suppliers`, `tables`, `ultraFastPOS`, `user`, `users`.

### State Management
- Redux Toolkit slices per feature; `createAsyncThunk` for API calls.
- Optimistic updates on writes; rollback on rejection.
- `authSlice` holds JWT, current user, active organization, active store.
- `generalSettingsSlice` holds the cascaded effective settings, refetched on store switch.
- Real-time updates from WebSocket dispatch directly into slices via `SyncManager`.

### Service Worker
[frontend/src/sw.js](frontend/src/sw.js) — Workbox precache + navigation fallback + background sync + periodic sync. Auto-update on new build.

---

## 11. Product Site

[product-site/](product-site/) is the public marketing site. It is intentionally a **separate codebase** from the app — different framework version, different audience, different deploy cadence.

- **React 19 + Vite 7 + Tailwind 4**
- **vite-react-ssg** for static rendering → fast first paint + SEO
- **EmailJS** for lead-capture form submission (no backend round-trip)
- **WhatsApp deep-link** (`2349063503232`) for founder-direct contact
- **Hosted on Vercel** (see `vercel.json`)

Source-of-truth copy is documented in [PRODUCT_SITE_CONTENT.md](PRODUCT_SITE_CONTENT.md). The site's narrative is reproduced in [§25 Marketing Positioning](#25-marketing-positioning).

---

## 12. Feature Catalog

This list is the source of truth for what ships today. Cross-check against [checklist.md](checklist.md) for the build-status matrix.

### POS & Ordering
- Dine-in, takeaway, delivery order types
- Table-based and counter-based ordering
- Order modification, split, merge, hold, reopen, void, refund (full or partial)
- Order reprinting; order status tracking with state machine
- Item quantity changes, notes, modifiers
- **Ultra-Fast POS mode** — Keyboard-driven numeric entry for high-volume cashiers; configurable bindings; minimal-click checkout

### Payments
- Cash, card (Stripe), mixed payments, multi-tender per order
- Change calculation, tips (fixed / % / custom, per-staff attribution)
- Deferred payments / pay-on-account / customer credit tracking
- Stripe webhook handling for async confirmations

### Menu Management
- Categories + subcategories
- Items with variants (size, portion, flavor)
- Modifier groups (required vs optional)
- Time-based pricing (happy hour) via Discount engine
- Menu cloning across locations, menu versioning, visibility toggles, sold-out flags
- Image uploads (Cloudinary), preparation time estimates
- **Brand Catalog** — Master menu at organization level, store-level overrides

### Kitchen & Operations
- **Kitchen Display System (KDS)** with real-time WebSocket updates
- Multi-station kitchens (grill / fryer / salad / pizza / dessert / beverage / expo / all)
- Per-station category routing, audio alerts, configurable timing warnings
- Order recall, kitchen notes, prep-time tracking
- Display customization (columns, font size, color scheme, volume)
- Bar routing, delivery prep status, printer integration

### Inventory & Supply Chain
- Ingredient + item-level tracking
- **Recipe-based automatic deduction** on order completion
- Manual stock adjustments with reason codes
- Stock counts, variance reports, spoilage / waste tracking
- Low-stock alerts + reorder levels
- Supplier-linked stock, purchase orders, inventory valuation

### Staff & Access
- Staff accounts with PIN login + email/password login
- Multi-device sessions (refresh tokens tracked per device with IP + UA)
- Role-based + granular permission overrides per store
- Staff performance metrics, sales/tip attribution
- Audit trail of every state-changing action

### Taxes, Fees & Pricing
- Sales tax / VAT, multiple rates, per-item rules
- Inclusive / exclusive tax
- Service charges, location-based rules
- Currency configuration per store

### Discounts & Promotions
- Percentage, fixed, BOGO (buy X get Y at Z%)
- Item-level, category-level, order-level scope
- Scheduled discounts (start/end dates)
- Coupon codes (promo codes) with usage limits + per-customer caps
- Happy hour pricing, stackable + non-stackable rules

### Reporting & Analytics
Eleven distinct dashboards in [frontend/src/features/analytics/](frontend/src/features/analytics/):
- **Overview** — High-level KPIs
- **Sales Analytics** — Trends, segmentation, comparisons
- **Menu Intelligence** — Item performance, category mix
- **Inventory Analytics** — Movement, valuation
- **Variance Analytics** — Expected vs actual usage
- **Staff Analytics** — Productivity, sales by staff
- **Customer Insights** — Repeat behavior, segmentation
- **Advanced Insights** — Composite metrics
- **Payment Analytics** — Method breakdown
- **Tax Analytics** — Compliance-ready reports
- **Custom Reports** — Saved configurations

Plus daily sales summary, item sales, category performance, refund reports, profit estimation, cost vs revenue, peak hours analysis.

### Tables, Floors & Reservations
- **Konva canvas floor plan editor** — Drag/rotate tables, shape variants, capacity per table
- Multiple floors per store with layout (width, height, gridSize, backgroundColor)
- Table status (available / occupied / ordered / reserved / cleaning / unavailable)
- Table merge + split
- **Reservations** — Table assignment, party size, date/time, duration, status workflow
- Capacity heatmaps and turnover metrics per floor

### Customer & CRM
- Customer profiles with order history, contact info, notes
- Debt limit + customer payment tracking ([backend/models/CustomerPayment.js](backend/models/CustomerPayment.js))
- Loyalty points field on Customer model
- Repeat customer analytics

### Multi-Location
- Organization → multiple stores
- Branch-specific settings + inventory
- Shared brand menu with per-store overrides
- Cross-store analytics overview (`/analytics/multi-store-overview`)
- Central admin roles + per-location permissions

### Delivery / Online
- Delivery order handling + delivery fees
- **Table QR menus** — QR generation per table for dine-in self-order
- Webhook support (Stripe)

### System & Platform
- **Offline mode** (see §8)
- Multi-device support, role-based UI
- Email + SMS + WhatsApp notifications via provider abstraction
- Data import (CSV / Excel) + export (CSV / Excel / PDF)
- **Audit logs** — Every create / edit / delete / void / state-change / role-change / merge / split
- **System health monitoring** (super-admin dashboard)
- Error logging, environment-based config

### Admin / Super-Admin
- Platform-level admin dashboard for managing tenants
- Tenant onboarding progress tracking ([backend/models/OnboardingProgress.js](backend/models/OnboardingProgress.js))
- Platform health dashboard (metrics, alerts, device status)

---

## 13. Roles & Permissions

Roles live on `User.stores[].role` — a user has a **different role per store**.

### Built-in roles
| Role | Permissions |
|---|---|
| **admin** | All permissions (wildcard) |
| **manager** | 9 permissions: menu view/edit, orders view/create/void/discount/reopen, inventory, reports, expenses, staff, customers |
| **cashier** | menu view, orders view/create, customers view |
| **waiter** | menu view, orders view/create |
| **kitchen** | menu view, orders view |
| **accountant** | reports, expenses (implied) |
| **staff** | minimal default |

### Granular permissions
Defined in [backend/config/permissions.js](backend/config/permissions.js):

`MENU_VIEW`, `MENU_EDIT`, `ORDERS_VIEW`, `ORDERS_CREATE`, `ORDERS_VOID`, `ORDERS_DISCOUNT`, `ORDERS_REOPEN`, `INVENTORY_VIEW`, `INVENTORY_EDIT`, `INVENTORY_TRANSFER`, `REPORTS_VIEW`, `EXPENSES_MANAGE`, `SETTINGS_EDIT`, `STAFF_MANAGE`, `CUSTOMERS_VIEW`, `CUSTOMERS_EDIT`, `BRAND_MENU_VIEW`, `BRAND_MENU_EDIT`, `BRAND_MENU_PUBLISH`, `BRAND_PRICING_OVERRIDE`.

Permissions can be granted **additively per user** beyond their role, allowing fine overrides without role explosion.

### PIN login
Staff can authenticate with a 4–6 digit PIN at the device level. The PIN unlocks the same session as email/password but is optimized for fast cashier rotation.

---

## 14. Data Models

Thirty-four Mongoose schemas in [backend/models/](backend/models/). Highlights:

### Identity & Tenancy
- **Organization** — Brand owner. Plan (free/basic/pro). Holds brand-level defaults: currency, timezone, branding, master menu, inventory defaults, communication providers, tax, discounts, printer, hardware.
- **Store** — Belongs to an Organization. Local overrides for branding, settings, communication, currency.
- **User** — `stores[]` array (multi-store membership). Per-entry: storeId, role, permissions, status. Refresh tokens with IP/UA tracking. Audit trail (`lastAction`).
- **Counter** — Atomic counter (e.g., order numbers).

### Menu & Catalog
- **MenuItem** — name, price, costPrice, customTax, time-bound discount, preparationTime, allergens, dietaryTags, addOnGroups[], isMaster/masterId for brand inheritance.
- **Category** — Menu grouping.
- **AddOnGroup** — Modifier groups (required vs optional, min/max selections).

### Orders & Service
- **Order** — clientId (idempotency), orderNumber, items[] (with addOns, notes, per-item status), table/customer refs, payments[] (split), paymentHistory, taxes, discounts (BOGO/%/fixed), fulfillment, totalAmount, currency snapshot.
- **OrderModificationLog** — Every modification recorded.
- **VoidLog** — Voids with reason + approver.
- **IdempotencyKey** — Replay-protection store.

### Inventory & Supply
- **InventoryItem** — storeId, SKU, category, unit (kg/g/L/ml/pcs/pack/box/bag), currentStock, minStockLevel, costPrice, linkedMenuItems[] (recipe).
- **Supplier**, **PurchaseOrder**, **StockAdjustment**, **Expense**.

### Customers & Pricing
- **Customer** — phone/email/address, debtLimit, notes[], clientId, store-scoped unique indexes.
- **CustomerPayment** — cash/card/transfer/other.
- **Discount** — type (percentage/fixed/BOGO), scope (all/category/items), scheduling, bogoConfig, applicableItems[].
- **PromoCode** — code, discountValue, minimumOrderAmount, usageLimit, usageLimitPerCustomer, usedBy[].

### Floor & Reservations
- **Floor** — layout (width/height/gridSize/backgroundColor), capacity (total/occupied/reserved), metrics.
- **Table** — floorId, position (x/y/rotation/width/height), capacity, shape, status, merge/split refs.
- **Reservation** — tableId, customerName/phone/email, partySize, date/time, duration, status (pending → confirmed → seated → completed / cancelled).

### Kitchen
- **KDSStation** — type (grill/fryer/salad/pizza/dessert/beverage/expo/all), categories[], displaySettings (columns, autoAdvance, soundEnabled, volume, colorScheme, fontSize), timingSettings (warningTime).

### Settings & Onboarding
- **UltraFastPOSSettings** — Keyboard bindings + behavior.
- **OnboardingProgress** — Wizard step tracking per organization.

### Sync & Audit
- **SyncJob** — Background sync tracking.
- **AuditLog** — userId, entityType, action (create/edit/update/delete/adjustStock/roleChange/bump/recall/state_change/merge/split), oldValue/newValue, reason. Indexed on store + timestamp.

### Platform Health
- **DeviceStatus** — Per-device heartbeat, last seen, offline state.
- **HealthMetrics** — Snapshots of CPU/memory/latency/error rate.
- **SystemAlert** — Threshold-breach alerts.
- **NotificationLog** — Outbound email/SMS/WhatsApp record.

### Reports
- **Report** — Saved/scheduled reports (sales/inventory/staff/custom).

---

## 15. API Surface

All routes mounted under `/api`. Routes mounted in [backend/routes/index.js](backend/routes/index.js):

### Public
- `POST /api/auth/*` — login, register, refresh, forgot/reset password, PIN login
- `POST /api/webhooks/*` — Stripe webhooks (raw body, not JSON-parsed)
- `GET /api/platform/health` — Public health probe

### Brand-Level (auth required, no store context)
- `GET /api/analytics/multi-store-overview`
- `/api/brand/*` — Brand catalog, brand settings, master menu
- `/api/platform-admin/*` — Super-admin only

### Tenant-Level (auth + store context required)
| Prefix | Resource |
|---|---|
| `/api/users` | Users / staff |
| `/api/general-settings` | Settings |
| `/api/customers` | Customers + payments + notes |
| `/api/categories` | Menu categories |
| `/api/dashboard` | Dashboard KPIs |
| `/api/menu-items` | Menu items |
| `/api/suppliers` | Suppliers |
| `/api/orders` | Order CRUD, split/merge, hold/reopen, refund |
| `/api/order-modifications` | Mod history |
| `/api/void` | Void operations |
| `/api/add-on-groups` | Modifier groups |
| `/api/expenses` | Expenses |
| `/api/kds` | Live KDS feed + state transitions |
| `/api/stations` | KDS station config |
| `/api/onboarding` | Onboarding wizard state |
| `/api/inventory` | Inventory items |
| `/api/purchase-orders` | POs |
| `/api/stock-adjustments` | Manual adjustments |
| `/api/ultra-fast-pos` | UFP settings |
| `/api/discounts` | Discount engine |
| `/api/promo-codes` | Coupons |
| `/api/floors` | Floors |
| `/api/tables` | Tables (incl. QR generation) |
| `/api/reservations` | Reservations |
| `/api/analytics` | All analytics endpoints |
| `/api/reports` | Reports |
| `/api/import` | Import/export (CSV/Excel) |
| `/api/stores` | Store CRUD |
| `/api/organizations` | Organization-level admin |
| `/api/payments` | Payment intents, refunds |
| `/api/sync` | Delta pull/push |
| `/api/logs` | Audit log query |
| `/api/upload` | Image upload (Cloudinary) |
| `/api/health/*` | Tenant-scoped health checks |

### WebSocket
- `ws(s)://<host>/ws?token=<jwt>&storeId=<id>[&stationId=<id>]`
- Channels: `orders`, `kds:<stationId>`, `inventory`, `tables`, `notifications`

---

## 16. Real-Time, Sync & Idempotency

### Real-time fan-out
[backend/utils/webSocket.js](backend/utils/webSocket.js) maintains a registry of connected clients keyed by `(storeId, channel)`. Controllers that mutate live-ops state (orders, KDS, inventory, tables) emit through the registry. Clients subscribe on connect by passing JWT + storeId + optional stationId.

### Delta sync
- Client tracks `lastSyncDate` per collection.
- `POST /api/sync/pull` returns `{ collection: [records changed after lastSyncDate], serverTime }`.
- Server time is used as the next `lastSyncDate` to avoid clock-skew gaps.
- Writes go through normal REST endpoints; the client queues them in IndexedDB when offline.

### Idempotency
- Client generates a UUIDv7 `clientId` per business action (order creation, customer creation, payment).
- The server's `idempotencyMiddleware` checks `IdempotencyKey` collection; if the key already exists, it returns the cached response.
- Order, Customer, and Payment models have unique indexes on `(storeId, clientId)` as a second line of defense.

### Background sync
- Service worker registers `offline-sync` background-sync tag.
- When the browser regains network, the SW notifies any open client to flush the queue.
- Periodic sync (`periodic-refresh`) proactively re-pulls fresh data when the SW is woken by the platform.

---

## 17. Security

| Concern | Mitigation |
|---|---|
| **Authentication** | JWT (short-lived access token) + refresh token rotation; refresh tokens tied to device/IP/UA |
| **Authorization** | Multi-layer: auth → store context → role → permission |
| **Multi-tenant isolation** | `tenancyPlugin` auto-filters every query by `storeId`; nothing leaks across tenants |
| **HTTP headers** | Helmet defaults applied via [backend/config/security.js](backend/config/security.js) |
| **Injection** | `express-mongo-sanitize` strips `$` operators; `xss-clean` strips XSS payloads |
| **Input validation** | Joi schemas per controller |
| **Rate limiting** | General limiter on `/api`; per-route stricter limits for auth + writes |
| **CORS** | Whitelist via [backend/config/corsOptions.js](backend/config/corsOptions.js) + [allowedOrigins.js](backend/config/allowedOrigins.js) |
| **Password storage** | bcryptjs with salt rounds |
| **PIN** | Hashed at rest, same algorithm as password |
| **Idempotency** | UUIDv7 `clientId` + IdempotencyKey table prevent replay |
| **Audit trail** | Every state-changing action logged with userId, oldValue, newValue, reason |
| **File uploads** | Multer + Cloudinary; type + size validation |
| **Stripe webhooks** | Raw body kept (not JSON-parsed) so signature verification works |
| **HTTPS** | Enforced in production via security setup |
| **Body size** | 50MB JSON limit (tunable) |

---

## 18. Observability & Health

[backend/services/healthMonitor.js](backend/services/healthMonitor.js) runs in the same process as the API:

- **Metrics every 30s** (configurable via `METRICS_COLLECTION_INTERVAL`) — CPU, memory, active requests, endpoint response times, error rates → persisted to `HealthMetrics`.
- **Device staleness check every 60s** (`DEVICE_CHECK_INTERVAL`) — Flags devices that haven't heartbeated; surfaces via `DeviceStatus`.
- **Threshold-based alerts** — Via [backend/utils/alertManager.js](backend/utils/alertManager.js) → writes `SystemAlert` records; surfaced on the super-admin **Platform Health Dashboard**.
- **Per-tenant health** — `/api/health/*` routes give tenant-scoped operational status for the in-app health widget.
- **Structured logging** — [backend/utils/logger.js](backend/utils/logger.js); every request logs `{ method, url, status, duration }`.
- **Graceful shutdown** — Server stops accepting connections, drains in-flight requests, force-kills after 10s.

---

## 19. Payments & Billing

### In-app payments (restaurant → customer)
- Stripe SDK on backend; `@stripe/react-stripe-js` on frontend.
- Payment Intent flow with idempotency.
- Webhooks consumed at `/api/webhooks/stripe` for async confirmations and refund events.
- Split payments stored on `Order.payments[]` — supports mixed cash + card + customer-credit on a single ticket.
- Refunds (full or partial) tracked in `Order.refunds` + audit logged.
- Currency snapshotted on the order at creation time (so historic reports stay accurate after currency config changes).

### Platform billing (Codeket → restaurant)
- Plan stored on `Organization.plan` (free / basic / pro).
- Current commercial model: flat **AED 599/mo** during Early Access for UAE Founding Partners, with annual option (AED 5,990/year per location = 2 months free), lifetime price-lock for the first 6 founding restaurants.
- Billing logic enforcement is partial (see [§27 Known Gaps](#27-roadmap--known-gaps)).

---

## 20. UI/UX Design Language

### Visual identity
- **Brand color:** Orange (warm, hospitality-aligned, high-visibility for action buttons).
- **Logo mark:** Letter **"C"** in an orange circle.
- **Typography:** Tailwind defaults — clean, dense, info-first; no decorative fonts.
- **Tone:** Direct, operational, no marketing-fluff. "Run Your Restaurant on One Operational System."

### Layout
- **Three-column app shell:** LeftSidebar (nav) + PageContent + RightSidebar (contextual actions).
- **Always-visible offline indicator** so staff never have to guess connection state.
- **Modal-driven editing** — Most CRUD happens in modals to keep context (the table you were looking at, the order you're editing) on screen.
- **Mobile-aware** — Dedicated mobile components in [frontend/src/components/Mobile/](frontend/src/components/Mobile/); platform-admin dashboards explicitly made mobile-responsive (see recent commits).

### Component philosophy
- **DaisyUI + Tailwind** for the base component vocabulary — pre-styled but unopinionated.
- **Tremor + Recharts** for analytics — graphs are functional, not decorative.
- **Konva** for the floor plan — the table layout is treated as a real spatial canvas, not a grid of cards.
- **react-joyride** for onboarding tours.
- **react-toastify + react-notifications** for non-blocking feedback.
- **framer-motion** for purposeful animation (modals, drawers) — never gratuitous.

### POS-specific UI
- **Touch-first targets** — Large buttons, generous padding, no hover-dependent interactions.
- **Ultra-Fast POS mode** — A separate keyboard-driven interface for cashiers who never touch the screen; numeric pad + configurable shortcuts.
- **KDS** — Black-on-color tiles, large legible fonts, configurable per-station color schemes, audio alerts at configurable volume.

### Accessibility
- Color-coded statuses always paired with a label.
- Keyboard navigation through Ultra-Fast POS.
- High-contrast modes available via DaisyUI themes.

---

## 21. Development Setup

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **MongoDB** 6+ (local or Atlas)
- **Redis** 6+ (for Bull queues) — optional in dev if queue features aren't exercised
- **Cloudinary account** (for image uploads) — optional with mocks
- **Stripe test keys** (for payment flows)

### First-time setup

```bash
# Clone
git clone <repo>
cd restaurant-management-system

# Install root devDeps (Playwright)
npm install

# Backend
cd backend
npm install
cp .env.example .env       # fill in MONGO_URI, JWT_SECRET, STRIPE_*, CLOUDINARY_*, etc.

# Frontend
cd ../frontend
npm install
cp .env.example .env       # fill in VITE_API_URL, VITE_WS_URL, VITE_STRIPE_PUBLIC_KEY

# Product site (optional)
cd ../product-site
npm install
```

### Run

```bash
# Terminal 1 — backend
cd backend
npm run server              # nodemon on PORT (default 5000)

# Terminal 2 — frontend
cd frontend
npm run dev                 # vite on 5173

# Terminal 3 — product site (optional)
cd product-site
npm run dev                 # vite on 5175
```

### Required environment variables (backend)

| Var | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token signing key |
| `JWT_REFRESH_SECRET` | Refresh token signing key |
| `PORT` | API port (default 5000) |
| `NODE_ENV` | `development` / `production` |
| `STRIPE_SECRET_KEY` | Stripe server key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image uploads |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email |
| `REDIS_URL` | Bull queue backend |
| `METRICS_COLLECTION_INTERVAL` | Health monitor cadence (ms, default 30000) |
| `DEVICE_CHECK_INTERVAL` | Device staleness cadence (ms, default 60000) |
| `ALLOWED_ORIGINS` | Comma-separated CORS whitelist |

### Required environment variables (frontend)

| Var | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:5000/api`) |
| `VITE_WS_URL` | WebSocket URL (`ws://localhost:5000/ws`) |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key |

---

## 22. Scripts & Utilities

[backend/scripts/](backend/scripts/):

| Script | Purpose |
|---|---|
| `seedDemoRestaurant.js` | Seeds a complete demo restaurant (menu, inventory, customers, orders) for demos |
| `seedRealisticData.js` | Generates larger volumes of realistic test data with @faker-js/faker |
| `makeSuperAdmin.js` | Promotes a user to platform super-admin |
| `changePassword.js` | CLI password reset |
| `migrateToOrganization.js` | Legacy single-store → Organization restructure |
| `migrateToMultiStore.js` | Enable multi-store on existing org |
| `migrateDataToOrganization.js` | Move owned data to the new Organization layer |
| `migrateMasterMenuFields.js` | Backfill brand menu inheritance fields |
| `migrateVersionFields.js` | Add version tracking to existing rows |
| `migrateSettingsToBrand.js` | Promote settings from store to brand level |
| `migrateStoreFields.js` | Store-level field restructuring |
| `updateLogActionCalls.js` | Bulk audit-log writer migration |

Run with `node backend/scripts/<file>.js` (some accept CLI args — read the file).

---

## 23. Testing Strategy

### Backend (Vitest + supertest + mongodb-memory-server)
[backend/test/](backend/test/):
- `auth.test.js` — Login, register, refresh, password reset
- `sync.test.js` — Delta sync correctness, timestamp boundaries
- `multistore.test.js` — Tenant isolation, store-switching, permission gates
- `idempotency.test.js` — Replay protection via IdempotencyKey + clientId
- `clientId.test.js` — UUIDv7 deduplication on Order/Customer creation
- `importExportService.test.js` — CSV/Excel round-trip
- `bcrypt.test.js` — Password hashing
- `health.test.js` — Health probe endpoints
- `setup.js` — Shared in-memory Mongo fixture + cleanup

Run: `cd backend && npm test`

### Frontend (Vitest + Testing Library + jsdom)
Unit tests colocated in feature folders. Run: `cd frontend && npm test`

### E2E (Playwright)
[tests/e2e/](tests/e2e/):
- `pos_flow.test.js` — Full POS golden path (login → order → pay → KDS → completion)
- `example.test.js` — Template

Config: [playwright.config.js](playwright.config.js). Run: `npm test` from root (Playwright is in root `devDependencies`).

### Manual QA
[manual_test_guide.md](manual_test_guide.md) — Step-by-step script covering every feature, organized by area: auth, dashboard, analytics, menu setup, inventory, operations, multi-store, admin, platform health, role-based access. Used pre-release.

### Coverage gaps
[test_coverage_gaps.md](test_coverage_gaps.md) — Tracks known untested paths.

---

## 24. Deployment

### Frontend & Product Site
- **Vercel** is the supported target (product site has `vercel.json`).
- `vite build` produces a static bundle; product site uses `vite-react-ssg build` for static rendering.
- The frontend PWA's service worker auto-updates on new deploys.

### Backend
- Any Node-capable host (Render, Railway, Fly.io, AWS EC2, Docker on VPS).
- Single-box deploy supported: if `frontend/dist` exists relative to `backend/`, Express serves it (see [backend/index.js:79-91](backend/index.js#L79-L91)).
- Set all env vars from §21.
- Provision Mongo + Redis.
- Expose port (default 5000) over HTTPS — terminate TLS at the reverse proxy.
- WebSocket upgrades must be proxied (`Upgrade: websocket` headers passed through).
- Health probe: `GET /api/platform/health`.
- Graceful shutdown supported on SIGTERM/SIGINT — orchestrators with rolling deploys work cleanly.

### Database operations
- Mongo connection in [backend/config/dbConnection.js](backend/config/dbConnection.js); reconnection handled by Mongoose.
- Migrations are **manual scripts** (see §22) — run them once per environment.
- Indexes are defined on schemas; Mongoose creates them on connect.

---

## 25. Marketing Positioning

The full source-of-truth marketing copy is in [PRODUCT_SITE_CONTENT.md](PRODUCT_SITE_CONTENT.md). Summary:

### Tagline
> **Run Your Restaurant on One Operational System**

### Subheadline
> Offline-capable restaurant management built for real-world conditions. From POS to KDS, inventory to analytics.

### Hero early-access badge
> **Early Access — Limited UAE Restaurants**

### Hero trust signals
- No Credit Card • 14-Day Trial • Works Offline

### The 4-step operational story
1. **From Table** — Orders & service execution. No duplication.
2. **To Kitchen** — Kitchen & preparation flow. Real-time sync.
3. **To Inventory** — Inventory & cost control. Zero manual edits.
4. **To Analytics** — Reporting & oversight. Live data.

### Four core pillars (philosophy)
1. **Bring Your Own Hardware** — Hardware freedom. Use iPads, Android tablets, laptops, or desktops you already own.
2. **Talk to Humans, Not Bots** — Direct support. Text the founder directly. No tickets.
3. **Process Over Customization** — Engineered flow. Proven workflows enforced by design.
4. **Strong Where It Matters** — Mission-critical focus. POS, Inventory, Taxes, Reports.

### Credibility (UAE positioning)
> Designed for mission-critical service — now entering real-world UAE operations.
> Codeket isn't just a POS; it's industrial-grade infrastructure that protects your revenue when it matters most. Especially in regions with unstable connectivity or complex tax requirements.

Four reliability cards: **Built for pressure** (industrial grade) • **Offline-capable** (local-first) • **UAE Tax & VAT Ready** (handles UAE 5% VAT, FTA-compliant invoices, service charges, per-item rules) • **Instant Setup** (live in hours).

Proof HUD: **100% Operational Readiness** • **Instant Local Sync** • **VAT Native — UAE Compliant**.

### Founding partners offer (UAE Launch Program)
- Wanted: 6 founding UAE restaurants ("06 / 06" spots remaining)
- Direct Access to the Founder (Personal Cell)
- Lifetime Price Lock at AED 599/mo
- Feature Priority — "You ask, we build"
- Zero Setup Fees (AED 2,000 value)
- CTA: WhatsApp `2349063503232`

### FAQ
1. **Setup fee?** None. Live in 15 minutes.
2. **Existing hardware?** Yes — any iPad, Android tablet, or browser. No proprietary lock-in.
3. **Offline mode?** Local-first architecture stores transactions on the device; syncs automatically on reconnect.
4. **Support?** Direct WhatsApp / call line to the founding team. No ticket waitlists.
5. **Tax flexibility?** Configurable globally, per location, and per menu item. Inclusive or exclusive pricing supported.

---

## 26. Pricing

The site presents pricing as a head-to-head comparison against legacy competitor POS systems:

| Feature | Competitors | Codeket |
|---|---|---|
| Hardware | AED 3,500–14,000 upfront | Use existing iPads, tablets, laptops, desktops |
| Monthly Fee | AED 700+ / location | AED 599 flat |
| Payments | Proprietary lock-in | Integrated Stripe Payments |
| Support | Ticket waitlist | Founder direct line |
| Contract | 1–3 year lock-in | Month-to-month |
| Hidden Fees | Setup & training | Zero hidden costs |

### Plans

| Plan | Price | Notes |
|---|---|---|
| **Early Access (Founding Partner)** | **AED 599/mo** | Lifetime-locked for the first 6 UAE restaurants |
| **Annual** | **AED 5,990/year** per location | 2 months free vs. monthly |

### What's included
- Zero hardware spend — save AED 5,000+ on day one
- Unlimited Front-of-House POS devices
- Unlimited Kitchen Displays (KDS)
- Drag & drop floor & table management with reservations
- Live inventory & waste tracking
- Advanced multi-store reporting
- Direct human support (call / text)
- Freedom to use integrated Stripe Payments
- Full offline mode
- Granular tax control (global, per location, per item)

### What's *not* there
- No setup fees
- No contracts (month-to-month)
- No hardware markup (bring your own)

---

## 27. Roadmap & Known Gaps

Documented honestly in [checklist.md](checklist.md). Not yet shipped:

### POS
- Order duplication, tip pooling, gift cards, vouchers, store credit

### Menu
- Combo meals, bundles, demand-based dynamic pricing, seasonal menus, multi-menu support, allergen tags, dietary tags

### Kitchen
- Course-based preparation, fire/hold courses, order prioritization, kitchen performance metrics

### Inventory
- Unit conversions, batch/lot tracking, multi-warehouse, location transfers, GRN, FIFO/LIFO, expiry tracking, cost-fluctuation handling

### Staff
- Clock-in/clock-out, shift management, shift history, manager overrides

### Taxes
- Automatic gratuity, tax exemptions, rounding rules, multi-currency, exchange rates, country-specific compliance modules

### Discounts
- Loyalty discounts, staff discounts, conditional discounts

### Reporting
- Discount reports, order fulfillment times, kitchen performance, table turnover rates, usage reports

### Multi-location
- Centralized reporting (only overview today), cross-branch stock transfers

### CRM
- Customer preferences, membership tiers, stored payment methods, marketing tags

### Delivery
- Dispatch status, driver assignment, integrations with Uber Eats / DoorDash, native online ordering, customer-facing QR ordering UI

### System
- Backup & restore tooling

### Settings
- Workflow toggles, accounting behavior toggles, inventory behavior toggles, POS behavior toggles, UI behavior toggles

### Admin
- Plan enforcement, usage limits, billing logic, feature gating, license management, support tools, debug views

---

## 28. Support

- **Email:** restaurant@codeket.com
- **WhatsApp (founder direct, no bots):** `2349063503232`
- **Marketing site:** [restaurant.codeket.com](https://restaurant.codeket.com)
- **App:** [app.restaurant.codeket.com](https://app.restaurant.codeket.com)

### Legal
- [Privacy Policy](https://codeket.com/privacy-policy)
- [Terms of Service](https://codeket.com/terms-of-service)
- [Cookie Policy](https://codeket.com/cookie-policy)

---

© 2026 Codeket Ltd. All rights reserved.
