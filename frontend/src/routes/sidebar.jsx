import {
  LayoutDashboard,
  Shapes,
  Users,
  Settings,
  KeyRound,
  BarChart,
  ShoppingCart,
  Truck,
  ClipboardList,
  FileText,
  User,
  Tag,
  PlusCircle,
  Monitor,
  Package,
} from "lucide-react";

const iconClasses = `h-5 w-5`;
const submenuIconClasses = `h-5 w-5`;

export const adminRoutes = [
  {
    path: "/app/dashboard",
    icon: <LayoutDashboard className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "/app/kds",
    icon: <Monitor className={iconClasses} />,
    name: "Kitchen Display",
  },
  {
    path: "/app/stations",
    icon: <Monitor className={submenuIconClasses} />,
    name: "Station Management",
  },
  {
    path: "/app/categories",
    icon: <Shapes className={iconClasses} />,
    name: "Product Categories",
  },
  {
    path: "/app/menu-items",
    icon: <Tag className={iconClasses} />,
    name: "Menu Items",
  },

  {
    path: "/app/suppliers",
    icon: <Truck className={iconClasses} />,
    name: "Suppliers",
  },
  {
    path: "",
    icon: <Package className={`${iconClasses} inline`} />,
    name: "Inventory",
    submenu: [
      {
        path: "/app/inventory",
        icon: <Package className={submenuIconClasses} />,
        name: "Inventory Items",
      },
      {
        path: "/app/purchase-orders",
        icon: <FileText className={submenuIconClasses} />,
        name: "Purchase Orders",
      },
      {
        path: "/app/stock-adjustments",
        icon: <ClipboardList className={submenuIconClasses} />,
        name: "Stock Adjustments",
      },
    ],
  },
  {
    path: "/app/expenses",
    icon: <FileText className={iconClasses} />,
    name: "Expenses",
  },
  {
    path: "",
    icon: <ShoppingCart className={`${iconClasses} inline`} />,
    name: "Orders",
    submenu: [
      {
        path: "/app/orders",
        icon: <ShoppingCart className={submenuIconClasses} />,
        name: "View All Orders",
      },
      {
        path: "/app/orders/new",
        icon: <PlusCircle className={submenuIconClasses} />,
        name: "Add New Order",
      },
    ],
  },
  {
    path: "/app/users",
    icon: <Users className={iconClasses} />,
    name: "Users",
  },
  {
    path: "/app/customers",
    icon: <Users className={iconClasses} />,
    name: "Customers",
  },
  {
    path: "",
    icon: <Settings className={`${iconClasses} inline`} />,
    name: "Settings",
    submenu: [
      {
        path: "/app/settings/profile",
        icon: <User className={submenuIconClasses} />,
        name: "Profile",
      },
      {
        path: "/app/settings/general",
        icon: <KeyRound className={submenuIconClasses} />,
        name: "General Settings",
      },
    ],
  },
];

export const managerRoutes = [
  {
    path: "/app/dashboard",
    icon: <LayoutDashboard className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "/app/categories",
    icon: <Shapes className={iconClasses} />,
    name: "Product Categories",
  },
  {
    path: "/app/products",
    icon: <Tag className={iconClasses} />,
    name: "Products",
  },
  {
    path: "/app/suppliers",
    icon: <Truck className={iconClasses} />,
    name: "Suppliers",
  },
  {
    path: "/app/expenses",
    icon: <FileText className={iconClasses} />,
    name: "Expenses",
  },
  {
    path: "/app/orders",
    icon: <ShoppingCart className={iconClasses} />,
    name: "Orders",
  },
  {
    path: "/app/analytics",
    icon: <BarChart className={iconClasses} />,
    name: "Analytics",
  },
  {
    path: "",
    icon: <Settings className={`${iconClasses} inline`} />,
    name: "Settings",
    submenu: [
      {
        path: "/app/settings-profile",
        icon: <User className={submenuIconClasses} />,
        name: "Profile",
      },
      {
        path: "/app/settings-pin",
        icon: <KeyRound className={iconClasses} />,
        name: "Change PIN",
      },
    ],
  },
];

export const staffRoutes = [
  {
    path: "/app/dashboard",
    icon: <LayoutDashboard className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "/app/products",
    icon: <Tag className={iconClasses} />,
    name: "Products",
  },
  {
    path: "/app/orders",
    icon: <ShoppingCart className={iconClasses} />,
    name: "Orders",
  },
  {
    path: "",
    icon: <Settings className={`${iconClasses} inline`} />,
    name: "Settings",
    submenu: [
      {
        path: "/app/settings-profile",
        icon: <User className={submenuIconClasses} />,
        name: "Profile",
      },
      {
        path: "/app/settings-pin",
        icon: <KeyRound className={iconClasses} />,
        name: "Change PIN",
      },
    ],
  },
];
