// frontend/src/routes/sidebar.jsx
import {
  LayoutDashboard,
  Shapes,
  Users,
  Settings,
  KeyRound,
  ShoppingCart,
  Truck,
  ClipboardList,
  FileText,
  User,
  Tag,
  Building,
  PlusCircle,
  Monitor,
  Package,
  Zap,
  Plus,
  Activity,
} from "lucide-react";
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  LightBulbIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

const iconClasses = `h-5 w-5`;
const submenuIconClasses = `h-5 w-5`;

export const adminRoutes = [
  {
    path: "/app/dashboard",
    icon: <LayoutDashboard className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "/app/platform/health",
    icon: <Activity className={iconClasses} />,
    name: "Platform Health",
  },
  {
    path: "/app/analytics",
    icon: <ChartBarIcon className={`${iconClasses} inline`} />,
    name: "Analytics",
    submenu: [
      {
        path: "/app/analytics/overview",
        icon: <DocumentChartBarIcon className={submenuIconClasses} />,
        name: "Overview",
      },
      {
        path: "/app/analytics/sales",
        icon: <CurrencyDollarIcon className={submenuIconClasses} />,
        name: "Sales",
      },
      {
        path: "/app/analytics/menu",
        icon: <Tag className={submenuIconClasses} />,
        name: "Menu",
      },
      {
        path: "/app/analytics/inventory",
        icon: <ArchiveBoxIcon className={submenuIconClasses} />,
        name: "Inventory Overview",
      },
      {
        path: "/app/analytics/variance",
        icon: <ClipboardList className={submenuIconClasses} />,
        name: "Variance Report",
      },
      {
        path: "/app/analytics/staff",
        icon: <UserGroupIcon className={submenuIconClasses} />,
        name: "Staff",
      },
      {
        path: "/app/analytics/customers",
        icon: <Users className={submenuIconClasses} />,
        name: "Customers",
      },
      {
        path: "/app/analytics/advanced",
        icon: <LightBulbIcon className={submenuIconClasses} />,
        name: "Advanced",
      },
      {
        path: "/app/analytics/payments",
        icon: <CreditCardIcon className={submenuIconClasses} />,
        name: "Payments",
      },
      {
        path: "/app/analytics/reports",
        icon: <FileText className={submenuIconClasses} />,
        name: "Reports",
      },
      {
        path: "/app/analytics/tax",
        icon: <CalculatorIcon className={submenuIconClasses} />,
        name: "Tax Report",
      },
    ],
  },
  {
    path: "/app/floors",
    icon: <Shapes className={iconClasses} />,
    name: "Floors & Tables",
  },
  {
    path: "/app/reservations",
    icon: <ClipboardList className={iconClasses} />,
    name: "Reservations",
  },
  {
    path: "/app/kds",
    icon: <Monitor className={iconClasses} />,
    name: "Kitchen Display",
  },
  {
    path: "/app/discounts",
    icon: <Tag className={iconClasses} />,
    name: "Discounts & Promos",
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
    path: "",
    icon: <Tag className={`${iconClasses} inline`} />,
    name: "Menu",
    submenu: [
      {
        path: "/app/menu-items",
        icon: <Tag className={submenuIconClasses} />,
        name: "Menu Items",
      },
      {
        path: "/app/add-on-groups",
        icon: <Plus className={submenuIconClasses} />,
        name: "Add-On Groups",
      },
    ],
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
        path: "/app/ultra-fast-pos",
        icon: <Zap className={submenuIconClasses} />,
        name: "Ultra-Fast POS",
      },
      {
        path: "/app/pos",
        icon: <PlusCircle className={submenuIconClasses} />,
        name: "POS",
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
    path: "/app/settings",
    icon: <Settings className={iconClasses} />,
    name: "Settings",
  },
];

export const managerRoutes = [
  {
    path: "/app/dashboard",
    icon: <LayoutDashboard className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "/app/analytics",
    icon: <ChartBarIcon className={`${iconClasses} inline`} />,
    name: "Analytics",
    submenu: [
      {
        path: "/app/analytics/overview",
        icon: <DocumentChartBarIcon className={submenuIconClasses} />,
        name: "Overview",
      },
      {
        path: "/app/analytics/sales",
        icon: <CurrencyDollarIcon className={submenuIconClasses} />,
        name: "Sales",
      },
      {
        path: "/app/analytics/menu",
        icon: <Tag className={submenuIconClasses} />,
        name: "Menu",
      },
      {
        path: "/app/analytics/inventory",
        icon: <ArchiveBoxIcon className={submenuIconClasses} />,
        name: "Inventory Overview",
      },
      {
        path: "/app/analytics/variance",
        icon: <ClipboardList className={submenuIconClasses} />,
        name: "Variance Report",
      },
      {
        path: "/app/analytics/staff",
        icon: <UserGroupIcon className={submenuIconClasses} />,
        name: "Staff",
      },
      {
        path: "/app/analytics/customers",
        icon: <Users className={submenuIconClasses} />,
        name: "Customers",
      },
      {
        path: "/app/analytics/advanced",
        icon: <LightBulbIcon className={submenuIconClasses} />,
        name: "Advanced",
      },
      {
        path: "/app/analytics/payments",
        icon: <CreditCardIcon className={submenuIconClasses} />,
        name: "Payments",
      },
      {
        path: "/app/analytics/reports",
        icon: <FileText className={submenuIconClasses} />,
        name: "Reports",
      },
      {
        path: "/app/analytics/tax",
        icon: <CalculatorIcon className={submenuIconClasses} />,
        name: "Tax Report",
      },
    ],
  },
  {
    path: "/app/floors",
    icon: <Building className={iconClasses} />,
    name: "Floors & Tables",
  },
  {
    path: "/app/reservations",
    icon: <ClipboardList className={iconClasses} />,
    name: "Reservations",
  },
  {
    path: "/app/kds",
    icon: <Monitor className={iconClasses} />,
    name: "Kitchen Display",
  },
  {
    path: "/app/discounts",
    icon: <Tag className={iconClasses} />,
    name: "Discounts & Promos",
  },
  {
    path: "",
    icon: <Tag className={`${iconClasses} inline`} />,
    name: "Menu",
    submenu: [
      {
        path: "/app/menu-items",
        icon: <Tag className={submenuIconClasses} />,
        name: "Menu Items",
      },
      {
        path: "/app/add-on-groups",
        icon: <Plus className={submenuIconClasses} />,
        name: "Add-On Groups",
      },
    ],
  },
  {
    path: "/app/categories",
    icon: <Shapes className={iconClasses} />,
    name: "Product Categories",
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
        path: "/app/ultra-fast-pos",
        icon: <Zap className={submenuIconClasses} />,
        name: "Ultra-Fast POS",
      },
      {
        path: "/app/pos",
        icon: <PlusCircle className={submenuIconClasses} />,
        name: "POS",
      },
    ],
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
    ],
  },
];

export const cashierRoutes = [
  {
    path: "/app/dashboard",
    icon: <LayoutDashboard className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "/app/floors",
    icon: <Shapes className={iconClasses} />,
    name: "Floors & Tables",
  },
  {
    path: "/app/reservations",
    icon: <ClipboardList className={iconClasses} />,
    name: "Reservations",
  },
  {
    path: "",
    icon: <ShoppingCart className={`${iconClasses} inline`} />,
    name: "Orders",
    submenu: [
      {
        path: "/app/orders",
        icon: <ShoppingCart className={submenuIconClasses} />,
        name: "View Orders",
      },
      {
        path: "/app/pos",
        icon: <PlusCircle className={submenuIconClasses} />,
        name: "POS",
      },
      {
        path: "/app/ultra-fast-pos",
        icon: <Zap className={submenuIconClasses} />,
        name: "Ultra-Fast POS",
      },
    ],
  },
  {
    path: "/app/customers",
    icon: <Users className={iconClasses} />,
    name: "Customers",
  },
  {
    path: "/app/expenses",
    icon: <FileText className={iconClasses} />,
    name: "Expenses",
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
    ],
  },
];

export const waiterRoutes = [
  {
    path: "/app/dashboard",
    icon: <LayoutDashboard className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "",
    icon: <ShoppingCart className={`${iconClasses} inline`} />,
    name: "Orders",
    submenu: [
      {
        path: "/app/pos",
        icon: <PlusCircle className={submenuIconClasses} />,
        name: "POS",
      },
      {
        path: "/app/ultra-fast-pos",
        icon: <Zap className={submenuIconClasses} />,
        name: "Ultra-Fast POS",
      },
    ],
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
    ],
  },
];

export const kitchenRoutes = [
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
    path: "",
    icon: <Settings className={`${iconClasses} inline`} />,
    name: "Settings",
    submenu: [
      {
        path: "/app/settings/profile",
        icon: <User className={submenuIconClasses} />,
        name: "Profile",
      },
    ],
  },
];

export const accountantRoutes = [
  {
    path: "/app/dashboard",
    icon: <LayoutDashboard className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "",
    icon: <Package className={`${iconClasses} inline`} />,
    name: "Inventory",
    submenu: [
      {
        path: "/app/purchase-orders",
        icon: <FileText className={submenuIconClasses} />,
        name: "Purchase Orders",
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
    icon: <Settings className={`${iconClasses} inline`} />,
    name: "Settings",
    submenu: [
      {
        path: "/app/settings/profile",
        icon: <User className={submenuIconClasses} />,
        name: "Profile",
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
    path: "",
    icon: <ShoppingCart className={`${iconClasses} inline`} />,
    name: "Orders",
    submenu: [
      {
        path: "/app/orders",
        icon: <ShoppingCart className={submenuIconClasses} />,
        name: "View Orders",
      },
    ],
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
    ],
  },
];
