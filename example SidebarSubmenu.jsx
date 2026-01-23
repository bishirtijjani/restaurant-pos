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
  }, [location.pathname, submenu]);

  return (
    <>
      {/** Route header */}
      <a
        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-base-200 text-base-content hover:text-base-content font-medium group w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-1.5 rounded-lg transition-colors group-hover:bg-base-300/50">
          {icon}
        </div>
        <span className="flex-1 tracking-wide">{name}</span>
        <ChevronDownIcon
          className={
            "w-4 h-4 transition-transform duration-300 opacity-50 " +
            (isExpanded ? "rotate-180" : "")
          }
        />
      </a>

      {/** Submenu list */}
      <div
        className={
          `overflow-hidden transition-all duration-300 ` +
          (isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0")
        }
      >
        <ul className="menu menu-compact pl-4 gap-1">
          {submenu.map((m, k) => {
            const isActive = location.pathname === m.path;
            return (
              <li key={k}>
                <Link
                  to={m.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-base-200 text-base-content hover:text-base-content font-medium"
                  }`}
                >
                  <div
                    className={`p-1 rounded-lg transition-colors ${isActive ? "" : "group-hover:bg-base-300/50"}`}
                  >
                    {m.icon}
                  </div>
                  <span className="flex-1 tracking-wide text-sm">{m.name}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--p),0.5)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default SidebarSubmenu;
