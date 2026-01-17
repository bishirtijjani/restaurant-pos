1. POS & ORDERING FEATURES
   Core POS

Order creation (dine-in / takeaway / delivery) ✅
Table-based ordering ✅
Counter-based ordering ✅
Order modification after creation ✅
Item quantity changes ✅
Item notes / modifiers ✅
Split orders ✅
Merge orders ✅
Hold orders ✅
Reopen closed orders ✅
Void orders (with permission) ✅
Refund orders (full / partial) ✅
Order reprinting ✅
Order duplication ❌
Order status tracking ✅

Payments

Cash payments ✅
Card payments ✅
Mixed payments ✅
Multiple tenders per order ✅
Change calculation ✅
Tips (fixed / percentage / custom) ✅
Tips per staff ✅
Tip pooling ❌
Deferred payments ✅
Pay later / on account ✅
Gift cards ❌
Vouchers ❌
Store credit ❌

2. MENU MANAGEMENT

Categories & subcategories ✅
Menu items ✅
Item variants (size, portion, flavor) ✅
Modifiers / add-ons ✅
Modifier groups ✅
Required vs optional modifiers ✅
Combo meals ❌
Bundles ❌
Dynamic pricing ❌ (No demand-based pricing found)
Time-based pricing (happy hour) ✅ (Fully implemented via discountController)
Scheduled menu availability ❌
Seasonal menus ❌
Multi-menu support ❌
Menu cloning across locations ✅
Menu versioning ✅
Item visibility toggles ✅
Sold-out flags ✅
Image uploads ✅
Allergen tags ❌
Dietary tags ❌
Preparation time estimates ✅

3. KITCHEN & OPERATIONS

Kitchen display system (KDS) ✅
Order routing to stations ✅
Multi-station kitchens ✅
Course-based preparation ❌
Order prioritization ❌
Fire / hold courses ❌
Prep time tracking ✅
Order recall ✅
Kitchen notes ✅
Printer integration ❌
Bar routing ✅
Delivery prep status ✅
Real-time order sync ✅
Kitchen performance metrics ❌

4. INVENTORY & STOCK MANAGEMENT
   Inventory Core

Ingredient-level tracking ✅
Item-level tracking ✅
Automatic stock deduction ✅
Manual stock adjustments ✅
Stock counts ✅
Stock variance reports ❌
Spoilage / waste tracking ✅
Unit conversions ❌
Batch tracking ❌ (No batch/lot support in InventoryItem model)
Low-stock alerts ✅
Reorder levels ✅

Advanced Inventory (Special Cases)

Recipe-based deduction ✅
Multiple inventory methods ❌
Multi-warehouse support ❌
Transfer between locations ❌
Supplier-based stock ✅
Purchase orders ✅
Receiving & GRN ❌
Inventory valuation ✅
FIFO / LIFO ❌
Expiry tracking ❌ (No expiryDate field in InventoryItem)
Lot numbers ❌
Cost fluctuation handling ❌

5. STAFF & ACCESS CONTROL

Staff accounts ✅
Roles & permissions ✅
Custom permission sets ✅
Clock-in / clock-out ❌ (No Shift model or clock logic found)
Shift management ❌
Shift history ❌
Staff performance metrics ✅
Sales attribution ✅
Tip attribution ✅
Staff activity logs ✅
Audit trails ✅
PIN-based login ✅
Multi-device sessions ✅
Manager overrides ❌

6. TAXES, FEES & PRICING LOGIC (BIG ONE)

Sales tax / VAT ✅
Multiple tax rates ✅
Per-item tax rules ✅
Inclusive / exclusive tax ✅
Service charges ✅
Automatic gratuity ❌
Location-based tax rules ✅
Tax exemptions ❌
Rounding rules ❌
Currency configuration ✅ (Single currency only)
Multi-currency support ❌
Exchange rate handling ❌
Country-specific tax compliance logic ❌

7. DISCOUNTS, PROMOTIONS & OFFERS

Percentage discounts ✅
Fixed amount discounts ✅
Item-level discounts ❌
Order-level discounts ✅
Scheduled promotions ❌
Coupon codes ✅
Loyalty discounts ❌
Staff discounts ❌
Happy hour pricing ✅
Buy-one-get-one ❌
Conditional discounts ❌
Stackable discounts ✅
Non-stackable rules ✅

8. REPORTING & ANALYTICS
   Sales & Financial

Daily sales summary ✅
Item sales reports ✅
Category performance ✅
Payment method breakdown ✅
Tax reports ❌
Discount reports ❌
Refund reports ✅
Profit estimation ✅
Cost vs revenue ✅
Net vs gross revenue ✅

Operational

Peak hours analysis ✅
Staff productivity ✅
Order fulfillment times ❌
Kitchen performance ❌
Table turnover rates ❌

Inventory

Stock movement reports ✅
Waste reports ✅
Usage reports ❌
Inventory valuation ✅

9. MULTI-LOCATION & ORGANIZATION LOGIC

Organization accounts ✅
Multiple restaurants under one org ✅
Branch-specific settings ✅
Shared menus ✅
Centralized reporting ❌
Branch-level inventory ✅
Cross-branch stock transfers ❌
Central admin roles ✅
Location-level permissions ✅

10. CUSTOMER & CRM FEATURES

Customer profiles ✅
Order history ✅
Contact info ✅
Preferences ❌
Loyalty points ✅
Membership tiers ❌
Stored payment methods ❌
Marketing tags ❌
Notes on customers ❌
Repeat customer analytics ✅

11. DELIVERY & THIRD-PARTY INTEGRATION

Delivery order handling ✅
Dispatch status ❌
Driver assignment ❌
Delivery fees ✅
Integration with delivery platforms ❌ (No webhooks/APIs for Uber/DoorDash)
Online ordering ❌
QR code ordering ❌
Table QR menus ✅ (QR generation exists in TableController)
API endpoints ✅
Webhooks ❌

12. SYSTEM & PLATFORM FEATURES

Offline mode ✅
Sync conflict resolution ✅
Multi-device support ✅
Role-based UI ✅
Notifications ✅
Email alerts ✅
SMS alerts ✅
Backup & restore ❌
Data export ✅
Import tools ✅
Audit logs ✅
System health monitoring ❌
Error logging ✅
Environment configuration ✅

13. SETTINGS & CONFIGURATION (THE DANGER ZONE)

Feature toggles ✅
Workflow toggles ❌
Accounting behavior toggles ❌
Inventory behavior toggles ❌
POS behavior toggles ❌
Tax logic toggles ✅
UI behavior toggles ❌

14. ADMIN / SUPER-ADMIN (Often Forgotten)

Platform-level admin ❌
Tenant management ✅
Plan enforcement ❌
Usage limits ❌
Billing logic ❌
Feature gating ❌
License management ❌
Support tools ❌
Debug views ❌
