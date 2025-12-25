# Implementation Plan: Organization-Centric (Brand) Architecture

This plan refactors the existing "Implicit Multi-Store" setup into a formal **Organization-Centric (Brand)** model. This provides the foundation for Master Menu Management, Brand-wide Loyalty, and Seamless Scaling while maintaining simplicity for single-store owners.

## Phase 1: The Foundation (Model Layer)

### 1.1 Create the `Organization` Model

Create `backend/models/Organization.js`.

- **Fields**:
  - `name`: Brand name.
  - `logo`: Brand-wide logo.
  - `ownerId`: The primary account owner.
  - `brandSettings`:
    - `currency`: Default (Code, Symbol, Name).
    - `taxSettings`: Brand-wide default tax rules.
    - `theme`: Primary colors/branding for the app.
  - `subscription`: (Future) Brand-level billing.

### 1.2 Update the `Store` Model

Update `backend/models/Store.js`.

- Add `organizationId` (ObjectId, ref: 'Organization').
- **Local Overrides**: Ensure the `settings` sub-schema in the Store model remains.
  - Values here will be treated as `null` by default (meaning "Inherit from Org").
  - If a value is present in the Store model, it **overwrites** the Organization value.

### 1.3 Update the `User` Model

Update `backend/models/User.js`.

- Add `stores.organizationId` for each store link.
- This allows a user to be a "Brand Manager" (access to everything in the Org) or a "Branch Manager" (access to one `Store` within the Org).

---

## Phase 2: The Migration & "Shadow" Onboarding

### 2.1 "Shadow Organization" Migration

Create a migration script to:

1.  Identify existing store owners.
2.  Auto-generate an `Organization` for them using their first store's details.
3.  Link all their stores to this new Organization.

### 2.2 Intelligent Signup Flow

Update the store creation controller:

- **Rule**: If a user creates their first store, an Organization is created silently in the background.
- **Rule**: Subsequent stores created by that user are automatically tied to that same Organization.

---

## Phase 3: Inheritance & Override Logic (The "Smart Brain")

### 3.1 Settings Convergence

Update `generalSettingsController.js` to implement the **Fallback Logic**:

- `getSettings`: Fetches Store settings $\rightarrow$ if Field is empty $\rightarrow$ Fetch from Organization.
- `updateSettings`: Allows the user to choose "Inherit" or "Override" for specific fields (Logo, Taxes, Prices).

### 3.2 Context Injection

Update `backend/middleware/storeMiddleware.js` to attach `req.organizationId` to every request. This enables:

- Brand-wide Customer searches.
- Brand-wide Inventory visibility (for transfers).

---

## Phase 4: UI/UX Refinement

### 4.1 The "Power Dashboard"

Refine the `StoreManagement.jsx` page:

- Show **Brand Summary** (Phase 2 work) only to users with `admin`/`manager` roles at the Org level.
- Waiters see the store list but **not** the brand revenue.

### 4.2 Single-Store Simplicity

- If `user.stores.length === 1`, hide the "Organization" terminology from the UI entirely to keep it clean for small shops.

---

## Phase 5: Future Steps (Franchise Ready)

1.  **Master Menu**: Create items once at the Org level; push/sync to all `storeId`s.
2.  **Cross-Store Inventory**: Official transfers between stores under the same `organizationId`.
3.  **Global Loyalty**: Points earned at Branch A, spent at Branch B.
