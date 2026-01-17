import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "../usersSlice";
import { showNotification } from "../../common/headerSlice";
import {
  ShieldCheck,
  Menu,
  ShoppingCart,
  Box,
  FileText,
  Settings,
  Users as UsersIcon,
  ChevronRight,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PERMISSION_GROUPS = [
  {
    id: "orders",
    name: "Order Management",
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    permissions: [
      {
        id: "orders:view",
        name: "View Orders",
        desc: "Can see order history and active orders",
      },
      {
        id: "orders:create",
        name: "Create Orders",
        desc: "Can take new orders and process payments",
      },
      {
        id: "orders:void",
        name: "Void Orders",
        desc: "Critical: Can delete or void items from orders",
        critical: true,
      },
      {
        id: "orders:discount",
        name: "Apply Discounts",
        desc: "Can add discounts to orders",
      },
      {
        id: "orders:reopen",
        name: "Reopen Orders",
        desc: "Critical: Can reopen completed or cancelled orders",
        critical: true,
      },
    ],
  },
  {
    id: "menu",
    name: "Menu & Catalog",
    icon: <Menu className="w-5 h-5" />,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    permissions: [
      { id: "menu:view", name: "View Menu", desc: "Can browse the menu items" },
      {
        id: "menu:edit",
        name: "Modify Menu",
        desc: "Can add, edit or delete menu items and categories",
      },
    ],
  },
  {
    id: "inventory",
    name: "Inventory & Stock",
    icon: <Box className="w-5 h-5" />,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    permissions: [
      {
        id: "inventory:view",
        name: "View Inventory",
        desc: "Can see stock levels",
      },
      {
        id: "inventory:edit",
        name: "Manage Stock",
        desc: "Can adjust stock and receive POs",
      },
      {
        id: "inventory:transfer",
        name: "Stock Transfers",
        desc: "Can move stock between branches",
      },
    ],
  },
  {
    id: "financials",
    name: "Reports & Expenses",
    icon: <FileText className="w-5 h-5" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    permissions: [
      {
        id: "reports:view",
        name: "View Reports",
        desc: "Can see sales and performance analytics",
        critical: true,
      },
      {
        id: "expenses:manage",
        name: "Manage Expenses",
        desc: "Can record and edit store expenses",
      },
    ],
  },
  {
    id: "management",
    name: "Staff & Settings",
    icon: <UsersIcon className="w-5 h-5" />,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    permissions: [
      {
        id: "staff:manage",
        name: "Manage Staff",
        desc: "Can add/edit or remove staff members",
        critical: true,
      },
      {
        id: "settings:edit",
        name: "Store Settings",
        desc: "Can modify store profile and operational settings",
        critical: true,
      },
    ],
  },
];

function PermissionMatrix({ extraObject, closeModal }) {
  const dispatch = useDispatch();
  const user = extraObject;
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGroup, setActiveGroup] = useState(PERMISSION_GROUPS[0].id);

  useEffect(() => {
    if (user && user.permissions) {
      setSelectedPermissions(user.permissions);
    }
  }, [user]);

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId],
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await dispatch(
        updateUser({
          id: user._id,
          user: { permissions: selectedPermissions },
        }),
      ).unwrap();

      dispatch(
        showNotification({
          message: `Permissions updated for ${user.fullname}`,
          status: 1,
        }),
      );
      closeModal();
    } catch (error) {
      dispatch(
        showNotification({
          message: "Failed to update permissions",
          status: 0,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const group = PERMISSION_GROUPS.find((g) => g.id === activeGroup);

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-1/3 border-r border-base-300 overflow-y-auto">
          {PERMISSION_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`w-full flex items-center gap-3 p-4 transition-all hover:bg-base-200 text-left ${
                activeGroup === g.id
                  ? "bg-primary/5 border-r-4 border-primary"
                  : ""
              }`}
            >
              <div className={`p-2 rounded-lg ${g.bg} ${g.color}`}>
                {g.icon}
              </div>
              <div className="flex-1">
                <p
                  className={`font-bold text-sm ${
                    activeGroup === g.id ? "text-primary" : ""
                  }`}
                >
                  {g.name}
                </p>
                <p className="text-[10px] opacity-60">
                  {
                    g.permissions.filter((p) =>
                      selectedPermissions.includes(p.id),
                    ).length
                  }{" "}
                  of {g.permissions.length} active
                </p>
              </div>
              <ChevronRight
                className={`w-4 h-4 opacity-30 ${
                  activeGroup === g.id
                    ? "translate-x-1 opacity-100 text-primary"
                    : ""
                }`}
              />
            </button>
          ))}
        </div>

        {/* Permission List */}
        <div className="flex-1 p-6 overflow-y-auto bg-base-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGroup}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className={`p-2 rounded-lg ${group.bg} ${group.color}`}>
                  {group.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black">{group.name}</h3>
                  <p className="text-xs opacity-60 font-medium">
                    Configure granular access for this category
                  </p>
                </div>
              </div>

              {group.permissions.map((perm) => (
                <label
                  key={perm.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:shadow-md ${
                    selectedPermissions.includes(perm.id)
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-base-200 hover:border-base-300"
                  }`}
                >
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          selectedPermissions.includes(perm.id)
                            ? "text-primary"
                            : ""
                        }`}
                      >
                        {perm.name}
                      </span>
                      {perm.critical && (
                        <div className="badge badge-error badge-xs font-bold gap-1 uppercase px-2 py-2">
                          <Shield className="w-2.5 h-2.5" />
                          Critical
                        </div>
                      )}
                    </div>
                    <p className="text-xs opacity-70 mt-1 leading-relaxed">
                      {perm.desc}
                    </p>
                  </div>
                </label>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-base-300 flex justify-between items-center bg-base-200/50">
        <div className="flex flex-col">
          <span className="text-xs font-bold opacity-50 uppercase tracking-widest">
            Selected Permissions
          </span>
          <span className="text-lg font-black text-primary">
            {selectedPermissions.length} Active
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={closeModal} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`btn btn-primary gap-2 px-8 ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            <ShieldCheck className="w-5 h-5" />
            Update Security Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default PermissionMatrix;
