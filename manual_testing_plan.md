# Manual Testing Strategy: Restaurant Management System

Given the constraints (no automated tests, large system), the most efficient approach is **Scenario-Based Testing**. This replicates real-world usage patterns ("Day in the Life") to verify that the frontend, backend, database, and business logic work harmoniously together.

## 🧪 Testing Philosophy

- **Focus on Flows, not Features:** Don't just test "does the button work?". Test "can I complete an order from start to finish?".
- **Role-Playing:** Test as a specific user (Manager, Waiter, Kitchen Staff) to find permission and usability issues.
- **Edge Case "Hats":** Intentionally try to break it (bad internet, entering 0 quantity, cancelling mid-payment).

---

## 📋 Master Test Scenarios

### 1. The "Grand Opening" (System Setup & CRUD Cycles)

**Goal:** Verify initialization, data seeding, and configuration. **Crucial:** Test the full Create-Update-Delete cycle.

- [ ] **Onboarding:** Sign up a new user -> Create Organization -> Create first Store.
- [ ] **Infrastructure:** Create a Floor Plan -> Add Tables -> **Rename Table** -> **Delete Table** (Verify it disappears).
- [ ] **Menu Engineering (The CRUD Test):**
  - **Create:** Create "Burger" ($10).
  - **Update:** Edit "Burger" price to $12. Verify POS reflects change immediately.
  - **Delete:** Try to delete "Burger".
    - _Edge Case:_ If it's in an active order, does the system block deletion or handle it gracefully?
- [ ] **Staffing:** Invite User -> **Update Role** (Waiter to Manager) -> **Delete/Deactivate User**.

### 2. The "Busy Dinner Service" (Core POS Loop)

**Goal:** Stress test the primary revenue-generating flow.

- [ ] **Seating:** Login (PIN) -> Select Table -> Assign Customer (Walk-in or Search).
- [ ] **Ordering (Calculations Check):**
  - Add items to cart ($10 Item).
  - Add Modifier (+$2 Cheese). **Verify Total is $12**.
  - **Quantity Logic:** Increase quantity to 2. **Verify Total is $24**.
  - **Discounts:** Apply 10% discount. **Verify Total is $21.60**.
- [ ] **Kitchen Communication (KDS):**
  - Verify order appears on KDS.
  - Bump item -> Bump order.
- [ ] **Modifications (The "Chaos" Test):**
  - Re-open table -> Void an item. **Verify Total decreases correctly**.
  - **Edge Case:** Try to edit an order _after_ it's been printed/sent to kitchen. Does it warn the kitchen?

### 3. The "Checkout" (Payment & Math)

**Goal:** Ensure money calculations, taxes, and transaction recording are perfect.

- [ ] **Tax & Rounding:**
  - Check Subtotal + Tax = Grand Total.
  - _Edge Case:_ Test with unique prices (e.g., $9.99) to verify rounding logic.
- [ ] **Bill Splitting:** Split $100 bill into 3. Does it equal $33.33 + $33.33 + $33.34? (No missing pennies).
- [ ] **Payment Methods:**
  - Cash: Bill $20, Pay $50. **Verify Change is $30**.
  - Partial: Pay $10 Cash, remaining on Card.
- [ ] **Closing:** Print Receipt -> Close Table.

### 4. The "Back of House" (Stock Logic)

**Goal:** Verify stock count creates, updates, and decrements correctly.

- [ ] **Receiving:** Create PO for 10 Cokes -> Receive. **Stock = 10**.
- [ ] **Selling:** Sell 2 Cokes via POS. **Stock should be 8**.
- [ ] **Return:** Refund 1 Coke. **Stock should be 9**.
- [ ] **Adjustments:** Manually set stock to 5. Verify log says "Manual Adjustment".

### 5. The "Owner's Morning" (Data Integrity)

**Goal:** Verify data aggregation and settings.

- [ ] **Reports:** "Daily Sales" should equal exactly the sum of Test Scenarios 2 & 3.
- [ ] **User Management:** Change Manager PIN -> Try old PIN (Must fail).
- [ ] **Settings:** Change Currency Symbol -> Verify it updates on Buttons and Receipts.

---

## 🐞 Bug Reporting Template

Keep it simple to move fast. Use a spreadsheet or a simple markdown file.

| ID  | Scenario | What Happened                          | Expected Behavior        | Severity |
| --- | -------- | -------------------------------------- | ------------------------ | -------- |
| 01  | Payment  | App crashed when splitting bill 3 ways | Bill should split evenly | Critical |
| 02  | Menu     | "Spicy" icon missing on Tacos          | Icon should be visible   | Cosmetic |

## 🚀 Recommended Execution Order

1.  **Settings & Menu** (If this fails, nothing else matters).
2.  **POS & Order Flow** (The money maker).
3.  **KDS** (The fulfillment).
4.  **Checkout** (The validation).
5.  **Inventory & Reports** (The aftermath).
