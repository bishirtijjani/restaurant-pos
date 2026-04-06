// frontend/src/routes/index.jsx
import { lazy } from "react";

const Page404 = lazy(() => import("../pages/protected/404"));
const Dashboard = lazy(() => import("../pages/protected/Dashboard"));
const ProfileSettings = lazy(
  () => import("../pages/protected/ProfileSettings"),
);
const MenuItems = lazy(() => import("../pages/protected/MenuItems"));
const Categories = lazy(() => import("../pages/protected/Categories"));
const Suppliers = lazy(() => import("../pages/protected/Suppliers"));
const Orders = lazy(() => import("../pages/protected/Orders"));
const POS = lazy(() => import("../pages/protected/POS"));
const Expenses = lazy(() => import("../pages/protected/Expenses"));
const Users = lazy(() => import("../pages/protected/Users"));
const Customers = lazy(() => import("../pages/protected/Customers"));
const CustomerProfile = lazy(
  () => import("../features/customers/CustomerProfile"),
);
const GeneralSettings = lazy(
  () => import("../pages/protected/GeneralSettings"),
);
const KDS = lazy(() => import("../pages/protected/KDS"));
const KDSStations = lazy(() => import("../pages/protected/KDSStations"));
const Inventory = lazy(() => import("../pages/protected/Inventory"));
const StockAdjustments = lazy(
  () => import("../pages/protected/StockAdjustments"),
);
const PurchaseOrders = lazy(() => import("../pages/protected/PurchaseOrders"));
const CreatePurchaseOrder = lazy(
  () => import("../pages/protected/CreatePurchaseOrder"),
);
const PurchaseOrderDetails = lazy(
  () => import("../pages/protected/PurchaseOrderDetails"),
);
const UltraFastPOS = lazy(() => import("../pages/protected/UltraFastPOS"));
const KeyboardSettings = lazy(
  () => import("../features/ultraFastPOS/components/KeyboardSettings"),
);
const AddOnGroups = lazy(() => import("../pages/protected/AddOnGroups"));
const Discounts = lazy(() => import("../pages/protected/Discounts"));
const Tables = lazy(() => import("../pages/protected/Tables"));
const Floors = lazy(() => import("../pages/protected/Floors"));
const Reservations = lazy(() => import("../pages/protected/Reservations"));
const AnalyticsOverview = lazy(
  () => import("../features/analytics/dashboards/Overview"),
);
const SalesOverview = lazy(
  () => import("../features/analytics/dashboards/Sales"),
);
const MenuIntelligence = lazy(
  () => import("../features/analytics/dashboards/Menu"),
);
const StaffAnalytics = lazy(
  () => import("../features/analytics/dashboards/Staff"),
);
const CustomerInsights = lazy(
  () => import("../features/analytics/dashboards/Customer"),
);
const AdvancedInsights = lazy(
  () => import("../features/analytics/dashboards/Advanced"),
);
const PaymentAnalytics = lazy(
  () => import("../features/analytics/dashboards/Payment"),
);
const CustomReports = lazy(
  () => import("../features/analytics/dashboards/Reports"),
);
const InventoryAnalytics = lazy(
  () => import("../features/analytics/dashboards/Inventory"),
);
const TaxAnalytics = lazy(() => import("../features/analytics/dashboards/Tax"));
const VarianceAnalytics = lazy(
  () => import("../features/analytics/dashboards/Inventory/Variance"),
);
const StoreManagement = lazy(() => import("../pages/StoreManagement"));
const BrandCatalog = lazy(() => import("../features/brand/BrandCatalog"));
const BrandSettings = lazy(() => import("../features/brand/BrandSettings"));
const SettingsHub = lazy(() => import("../features/settings/SettingsHub"));
const AuditLogs = lazy(() => import("../features/auditLogs"));
const PlatformHealthDashboard = lazy(
  () => import("../features/platformHealth/PlatformHealthDashboard"),
);
const MockDashboard = lazy(() => import("../pages/protected/MockDashboard"));
const MockSidebar = lazy(() => import("../pages/protected/MockDashboard")); // Reuse for now, Layout will hide content
const MockPOSPage = lazy(() => import("../pages/protected/MockPOSPage"));
const MockKDSPage = lazy(() => import("../pages/protected/MockKDSPage"));
const MockInventoryPage = lazy(
  () => import("../pages/protected/MockInventoryPage"),
);
const MockAnalyticsPage = lazy(
  () => import("../pages/protected/MockAnalyticsPage"),
);
const PlatformAdminDashboard = lazy(
  () => import("../features/platformAdmin"),
);

const routes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/mock-dashboard", component: MockDashboard },
  { path: "/mock-dashboard", component: MockDashboard },
  { path: "/mock-sidebar", component: MockSidebar },
  { path: "/mock-pos", component: MockPOSPage },
  { path: "/mock-kds", component: MockKDSPage },
  { path: "/mock-inventory", component: MockInventoryPage },
  { path: "/mock-analytics", component: MockAnalyticsPage },

  { path: "/platform-admin", component: PlatformAdminDashboard },
  { path: "/platform/health", component: PlatformHealthDashboard },
  { path: "/settings", component: SettingsHub },
  { path: "/settings/profile", component: ProfileSettings },
  { path: "/settings/general", component: GeneralSettings },
  { path: "/settings/audit-logs", component: AuditLogs },
  { path: "/categories", component: Categories },
  { path: "/menu-items", component: MenuItems },
  { path: "/add-on-groups", component: AddOnGroups },
  { path: "/expenses", component: Expenses },
  { path: "/orders", component: Orders },
  { path: "/pos", component: POS },
  { path: "/inventory", component: Inventory },
  { path: "/purchase-orders", component: PurchaseOrders },
  { path: "/purchase-orders/new", component: CreatePurchaseOrder },
  { path: "/purchase-orders/:id", component: PurchaseOrderDetails },
  { path: "/ultra-fast-pos", component: UltraFastPOS },
  { path: "/settings/keyboard", component: KeyboardSettings },
  { path: "/stock-adjustments", component: StockAdjustments },
  { path: "/suppliers", component: Suppliers },
  { path: "/users", component: Users },
  { path: "/customers", component: Customers },
  { path: "/customers/:id", component: CustomerProfile },
  { path: "/kds", component: KDS },
  { path: "/stations", component: KDSStations },
  { path: "/404", component: Page404 },
  { path: "/discounts", component: Discounts },
  { path: "/table-management", component: Tables },
  { path: "/floors/:floorId/tables", component: Tables },
  { path: "/floors", component: Floors },
  { path: "/reservations", component: Reservations },
  { path: "/analytics", component: AnalyticsOverview },
  { path: "/analytics/overview", component: AnalyticsOverview },
  { path: "/analytics/sales", component: SalesOverview },
  { path: "/analytics/menu", component: MenuIntelligence },
  { path: "/analytics/inventory", component: InventoryAnalytics },
  { path: "/analytics/staff", component: StaffAnalytics },
  { path: "/analytics/customers", component: CustomerInsights },
  { path: "/analytics/advanced", component: AdvancedInsights },
  { path: "/analytics/payments", component: PaymentAnalytics },
  { path: "/analytics/reports", component: CustomReports },
  { path: "/analytics/tax", component: TaxAnalytics },
  { path: "/analytics/variance", component: VarianceAnalytics },
  { path: "/stores", component: StoreManagement },
  { path: "/brand-catalog", component: BrandCatalog },
  { path: "/brand-settings", component: BrandSettings },
];

export default routes;
