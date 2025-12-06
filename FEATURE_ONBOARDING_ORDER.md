# 🚀 New Restaurant Feature Onboarding Order

This guide outlines the recommended order for a new restaurant to interact with the system features to ensure a smooth setup and operation.

| # | Feature | Path | Purpose |
|---|---------|------|---------|
| **1** | **Register/Login** | `user` / `pages/Login.jsx` | Create account or authenticate |
| **2** | **General Settings** | `settings` | Configure restaurant name, currency, timezone, tax rates |
| **3** | **Users** | `users` | Add staff accounts (managers, cashiers, waiters, kitchen) |
| **4** | **Product Categories** | `categories` | Create menu categories (Appetizers, Main, Drinks, etc.) |
| **5** | **Menu Items** | `menuItems` | Add dishes/products to the menu |
| **6** | **Add-On Groups** | `addOnGroups` | Create modifiers & extras (toppings, sizes, etc.) |
| **7** | **Floors & Tables** | `floors` + `tables` | Set up floor plans with tables |
| **8** | **KDS Stations** | `kdsStations` | Configure kitchen display stations |
| **9** | **Discounts & Promos** | `discounts` | Set up promotional discounts |
| **10** | **Suppliers** | `suppliers` | Add ingredient/supply vendors |
| **11** | **Inventory Items** | `inventory` | Track stock items linked to suppliers |
| **12** | **Customers** | `customers` | Start building customer database |
| **--- Day-to-Day Operations ---** | | | |
| **13** | **POS / Ultra-Fast POS** | `orders` / `ultraFastPOS` | Take orders |
| **14** | **Kitchen Display (KDS)** | `kds` | Kitchen workflow management |
| **15** | **Reservations** | `reservations` | Manage table bookings |
| **16** | **Purchase Orders** | `purchaseOrders` | Order stock from suppliers |
| **17** | **Stock Adjustments** | `stockAdjustments` | Manage inventory changes |
| **18** | **Expenses** | `expenses` | Track operational costs |
| **19** | **Dashboard** | `dashboard` | Overview & quick stats |
| **20** | **Analytics** | `analytics` | Business intelligence & reports |

### Summary
*   **Setup Phase (1-11)**: Critical configuration steps required before opening for business.
*   **Daily Operations (12-18)**: Features used during regular business hours for service and management.
*   **Analysis (19-20)**: Tools for monitoring performance and business insights.
