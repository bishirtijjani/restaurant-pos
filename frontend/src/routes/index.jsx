// All components mapping with path for internal routes

import { lazy } from "react";
// const Welcome = lazy(() => import("../pages/protected/Welcome"));
const Page404 = lazy(() => import("../pages/protected/404"));
const POS = lazy(() => import("../pages/protected/POS"));
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
const Receipt = lazy(() => import("../features/common/components/Receipt"));
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

const routes = [
  {
    path: "/dashboard", // the url
    component: Analytics, // view rendered
  },
  {
    path: "/settings/profile",
    component: ProfileSettings,
  },
  {
    path: "/settings/general",
    component: GeneralSettings,
  },
  {
    path: "/categories",
    component: Categories,
  },
  {
    path: "/menu-items",
    component: MenuItems,
  },
  {
    path: "/expenses",
    component: Expenses,
  },
  {
    path: "/receipt",
    component: Receipt,
  },
  {
    path: "/orders",
    component: Orders,
  },
  {
    path: "/orders/new",
    component: AddOrder,
  },
  {
    path: "/inventory",
    component: Inventory,
  },
  {
    path: "/purchase-orders",
    component: PurchaseOrders,
  },
  {
    path: "/purchase-orders/new",
    component: CreatePurchaseOrder,
  },
  {
    path: "/purchase-orders/:id",
    component: PurchaseOrderDetails,
  },
  {
    path: "/stock-adjustments",
    component: StockAdjustments,
  },
  {
    path: "/suppliers",
    component: Suppliers,
  },
  {
    path: "/analytics",
    component: Analytics,
  },
  {
    path: "/users",
    component: Users,
  },
  {
    path: "/customers",
    component: Customers,
  },
  {
    path: "/kds",
    component: KDS,
  },
  {
    path: "/stations",
    component: KDSStations,
  },
  {
    path: "/pos",
    component: POS,
  },

  {
    path: "/404",
    component: Page404,
  },
];

export default routes;
