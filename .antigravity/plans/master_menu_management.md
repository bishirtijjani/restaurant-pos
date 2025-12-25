# Implementation Plan: Master Menu Management (SaaS)

This plan outlines the steps to implement a centralized Master Menu system where an organization (Tenant) can manage a global catalog and synchronize it across multiple store locations with optional local overrides.

## 1. Core Architecture Pattern

- **Master Entities**: Items, Segments (Categories), and Add-on Groups defined at the Organization level (`storeId: null`).
- **Store Entities**: Local instances linked via `masterId`.
- **Inheritance vs. Overrides**:
  - **Master Owned**: Name, Description, Images, Sync Category, Selection Rules (for Add-ons). These are LOCKED at the store level.
  - **Operational Sandbox**: Price, Availability (isAvailable), Tax Rates, Local Item Code. These are OVERRIDABLE at the store level.
- **Hybrid Support**: Stores can still create `Store-Only` items (masterId: null) that never appear in the brand catalog.

---

## Phase 1: Model & Schema Updates (Backend)

### 1.1 `MenuItem`, `Category` & `AddOnGroup` Schema

- [ ] **Modify `storeId`**: Make `storeId` optional (required: false) to allow Brand-level records.
- [ ] **Add SaaS Flags**:
  - `isMaster`: Boolean (default: false).
  - `masterId`: ObjectId (ref: 'SameModel', default: null).
- [ ] **Data Structure Updates**:
  - Add `syncOverrides`: Map or Object to track which fields the branch has modified (e.g., `{ price: true }`).
  - For `AddOnGroup`: Ensure nested `items` also support `masterId` tracking.

### 1.2 `Store` Schema

- [ ] **Add Brand Policies**:
  - `menuSettings.enforceBrandPricing`: Boolean.
  - `menuSettings.allowLocalModifiers`: Boolean.

---

## Phase 2: API & Controller Logic (Backend)

### 2.1 Brand-Level Catalog Controllers

- [ ] **Create `brandMenuController.js`** & **`brandAddOnController.js`**:
  - `getBrandCatalog`: Lists `isMaster: true` records.
  - `upsertMasterItem`: Creates/Updates brand items.
- [ ] **Advanced Sync Engine**:
  - Implement `propagateMasterChange(entityId)`:
    - Automatically updates all linked store records.
    - **Logic**: Only updates fields NOT marked in `syncOverrides`.

### 2.2 Store-Level Logic Updates

- [ ] **Middleware Enforcement**:
  - Prevent store-level `PUT/PATCH` on "Master-Owned" fields if `masterId` is present.
  - Allow branch managers to update only "Operational Sandbox" fields.

---

## Phase 3: Frontend - Brand Central UI

### 3.1 Organization Workspace

- [ ] **Master Catalog Manager**:
  - High-level view of all Brand products.
  - "Publish to All" or "Selective Sync" buttons.
- [ ] **Add-on Group Builder**:
  - Centralized modifiers that automatically attach to items across the brand.

---

## Phase 4: Frontend - Store Management UI

### 4.1 "Smart" Form Behavior

- [ ] **Visual Distinction**: "Brand" badge on synced items.
- [ ] **Dynamic Locking**:
  - Disable input fields for Name/Description.
  - Add "Override Price" toggle next to the price field.
- [ ] **Local Specials**: Keep the "Add New Item" button for store-specific menu additions.

---

## Phase 5: Inventory & Mapping (Advanced)

### 5.1 The Ingredient Bridge

- [ ] **Problem**: "Master Burger" needs "Buns", but Store A's "Buns" ID is different from Store B's.
- [ ] **Solution**: Implement "Fuzzy Mapping" where a sync event prompts the store manager to link master ingredients to local stock if not already linked.

---

## Success Criteria

1.  **Central Control**: Brand changes a recipe description; it updates in all 100 branches instantly.
2.  **Local Flexibility**: Branch A sells for $15, Branch B for $18. Branch A is out of Stock (isAvailable: false) without affecting Branch B.
3.  **Local Items**: Branch C creates a "Local Anniversary Shake" that doesn't appear in Branch A or B.
4.  **Integrity**: Branch Managers cannot rename Brand-owned items.
