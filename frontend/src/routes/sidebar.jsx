import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import TableCellsIcon from "@heroicons/react/24/outline/TableCellsIcon";
import UserIcon from "@heroicons/react/24/outline/UserIcon";
import Cog6ToothIcon from "@heroicons/react/24/outline/Cog6ToothIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import KeyIcon from "@heroicons/react/24/outline/KeyIcon";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import ShoppingBagIcon from "@heroicons/react/24/outline/ShoppingBagIcon";
import TruckIcon from "@heroicons/react/24/outline/TruckIcon";
import ClipboardIcon from "@heroicons/react/24/outline/ClipboardIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import IdentificationIcon from "@heroicons/react/24/outline/IdentificationIcon";
import TagIcon from "@heroicons/react/24/outline/TagIcon";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import { Monitor } from "lucide-react";

const iconClasses = `h-6 w-6`;
const submenuIconClasses = `h-6 w-6`;

export const adminRoutes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "/app/kds",
    icon: <Monitor className={iconClasses} />,
    name: "Kitchen Display",
  },
  {
    path: "/app/stations",
    icon: <Monitor className="h-6 w-6" />,
    name: "Station Management",
  },
  {
    path: "/app/categories",
    icon: <TableCellsIcon className={iconClasses} />,
    name: "Product Categories",
  },
  {
    path: "/app/menu-items",
    icon: <TagIcon className={iconClasses} />,
    name: "Menu Items",
  },
  {
    path: "/app/suppliers",
    icon: <TruckIcon className={iconClasses} />,
    name: "Suppliers",
  },
  {
    path: "/app/expenses",
    icon: <DocumentTextIcon className={iconClasses} />,
    name: "Expenses",
  },
  {
    path: "",
    icon: <ShoppingBagIcon className={`${iconClasses} inline`} />,
    name: "Orders",
    submenu: [
      {
        path: "/app/orders",
        icon: <ShoppingBagIcon className={submenuIconClasses} />,
        name: "View All Orders",
      },
      {
        path: "/app/orders/add-new",
        icon: <PlusCircleIcon className={submenuIconClasses} />,
        name: "Add New Order",
      },
    ],
  },
  {
    path: "/app/users",
    icon: <UserGroupIcon className={iconClasses} />,
    name: "Users",
  },
  {
    path: "/app/customers",
    icon: <UserGroupIcon className={iconClasses} />,
    name: "Customers",
  },
  {
    path: "",
    icon: <Cog6ToothIcon className={`${iconClasses} inline`} />,
    name: "Settings",
    submenu: [
      {
        path: "/app/settings/profile",
        icon: <IdentificationIcon className={submenuIconClasses} />,
        name: "Profile",
      },
      {
        path: "/app/settings/general",
        icon: <KeyIcon className={submenuIconClasses} />,
        name: "General Settings",
      },
    ],
  },
];

export const managerRoutes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "/app/categories",
    icon: <TableCellsIcon className={iconClasses} />,
    name: "Product Categories",
  },
  {
    path: "/app/products",
    icon: <TagIcon className={iconClasses} />,
    name: "Products",
  },
  {
    path: "/app/suppliers",
    icon: <TruckIcon className={iconClasses} />,
    name: "Suppliers",
  },
  {
    path: "/app/expenses",
    icon: <DocumentTextIcon className={iconClasses} />,
    name: "Expenses",
  },
  {
    path: "/app/orders",
    icon: <ShoppingBagIcon className={iconClasses} />,
    name: "Orders",
  },
  {
    path: "/app/analytics",
    icon: <ChartBarIcon className={iconClasses} />,
    name: "Analytics",
  },
  {
    path: "",
    icon: <Cog6ToothIcon className={`${iconClasses} inline`} />,
    name: "Settings",
    submenu: [
      {
        path: "/app/settings-profile",
        icon: <IdentificationIcon className={submenuIconClasses} />,
        name: "Profile",
      },
      {
        path: "/app/settings-pin",
        icon: <KeyIcon className={iconClasses} />,
        name: "Change PIN",
      },
    ],
  },
];

export const staffRoutes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "/app/products",
    icon: <TagIcon className={iconClasses} />,
    name: "Products",
  },
  {
    path: "/app/orders",
    icon: <ShoppingBagIcon className={iconClasses} />,
    name: "Orders",
  },
  {
    path: "",
    icon: <Cog6ToothIcon className={`${iconClasses} inline`} />,
    name: "Settings",
    submenu: [
      {
        path: "/app/settings-profile",
        icon: <IdentificationIcon className={submenuIconClasses} />,
        name: "Profile",
      },
      {
        path: "/app/settings-pin",
        icon: <KeyIcon className={iconClasses} />,
        name: "Change PIN",
      },
    ],
  },
];
