import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function SidebarSubmenu({ submenu, name, icon }) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  /** Open Submenu list if path found in routes, this is for directly loading submenu routes  first time */
  useEffect(() => {
    if (
      submenu.filter((m) => {
        return m.path === location.pathname;
      })[0]
    )
      setIsExpanded(true);
  }, []);

  return (
    <div className="flex flex-col">
      {/** Route header */}
      <div
        className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer group ${
          isExpanded
            ? "bg-base-200 text-base-content font-semibold"
            : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="transition-colors duration-300">{icon}</span>
        <span className="flex-1">{name}</span>
        <ChevronDownIcon
          className={
            "w-4 h-4 transition-transform duration-300 " +
            (isExpanded ? "rotate-180" : "")
          }
        />
      </div>

      {/** Submenu list */}
      <div
        className={`w-full overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
      >
        <ul className="menu menu-compact p-0 px-2 space-y-1">
          {submenu.map((m, k) => {
            const isActive = location.pathname === m.path;
            return (
              <li key={k}>
                <Link
                  to={m.path}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-content shadow-md shadow-primary/20 font-medium"
                      : "hover:bg-base-200 text-base-content/60 hover:text-base-content"
                  }`}
                >
                  {m.icon}
                  {m.name}
                  {/* Active Indicator Removal: functionality is now in the main class */}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default SidebarSubmenu;
