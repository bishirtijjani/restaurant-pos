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
const Purchase = lazy(() => import("../pages/protected/Purchase"));
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
    path: "/purchase",
    component: Purchase,
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
    path: "/orders/add-new",
    component: AddOrder,
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
    path: "/pos",
    component: POS,
  },
  {
    path: "/404",
    component: Page404,
  },
];

export default routes;
