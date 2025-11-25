// frontend/src/routes/index.jsx
import { lazy } from "react";

const Page404 = lazy(() => import("../pages/protected/404"));
const Dashboard = lazy(() => import("../pages/protected/Dashboard"));
const ProfileSettings = lazy(() =>
  import("../pages/protected/ProfileSettings")
);
const MenuItems = lazy(() => import("../pages/protected/MenuItems"));
const Categories = lazy(() => import("../pages/protected/Categories"));
const Suppliers = lazy(() => import("../pages/protected/Suppliers"));
const Orders = lazy(() => import("../pages/protected/Orders"));
const AddOrder = lazy(() => import("../pages/protected/AddOrder"));
const Expenses = lazy(() => import("../pages/protected/Expenses"));
const Analytics = lazy(() => import("../pages/protected/Analytics"));
const Users = lazy(() => import("../pages/protected/Users"));
const Customers = lazy(() => import("../pages/protected/Customers"));
const GeneralSettings = lazy(() =>
  import("../pages/protected/GeneralSettings")
);
const KDS = lazy(() => import("../pages/protected/KDS"));
const KDSStations = lazy(() => import("../pages/protected/KDSStations"));
const Inventory = lazy(() => import("../pages/protected/Inventory"));
const StockAdjustments = lazy(() =>
  import("../pages/protected/StockAdjustments")
);
const PurchaseOrders = lazy(() => import("../pages/protected/PurchaseOrders"));
const CreatePurchaseOrder = lazy(() =>
  import("../pages/protected/CreatePurchaseOrder")
);
const PurchaseOrderDetails = lazy(() =>
  import("../pages/protected/PurchaseOrderDetails")
);
const UltraFastPOS = lazy(() => import("../pages/protected/UltraFastPOS"));
const KeyboardSettings = lazy(() =>
  import("../features/ultraFastPOS/components/KeyboardSettings")
);
const AddOnGroups = lazy(() => import("../pages/protected/AddOnGroups"));
const Discounts = lazy(() => import("../pages/protected/Discounts"));
const Tables = lazy(() => import("../pages/protected/Tables"));
const Floors = lazy(() => import("../pages/protected/Floors"));
const Reservations = lazy(() => import("../pages/protected/Reservations"));

const routes = [
  { path: "/dashboard", component: Analytics },
  { path: "/settings/profile", component: ProfileSettings },
  { path: "/settings/general", component: GeneralSettings },
  { path: "/categories", component: Categories },
  { path: "/menu-items", component: MenuItems },
  { path: "/add-on-groups", component: AddOnGroups },
  { path: "/expenses", component: Expenses },
  { path: "/orders", component: Orders },
  { path: "/orders/new", component: AddOrder },
  { path: "/inventory", component: Inventory },
  { path: "/purchase-orders", component: PurchaseOrders },
  { path: "/purchase-orders/new", component: CreatePurchaseOrder },
  { path: "/purchase-orders/:id", component: PurchaseOrderDetails },
  { path: "/ultra-fast-pos", component: UltraFastPOS },
  { path: "/settings/keyboard", component: KeyboardSettings },
  { path: "/stock-adjustments", component: StockAdjustments },
  { path: "/suppliers", component: Suppliers },
  { path: "/analytics", component: Analytics },
  { path: "/users", component: Users },
  { path: "/customers", component: Customers },
  { path: "/kds", component: KDS },
  { path: "/stations", component: KDSStations },
  { path: "/404", component: Page404 },
  { path: "/discounts", component: Discounts },
  { path: "/table-management", component: Tables },
  { path: "/floors/:floorId/tables", component: Tables },
  { path: "/floors", component: Floors },
  { path: "/reservations", component: Reservations },
];

export default routes;
