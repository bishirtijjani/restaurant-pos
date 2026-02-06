import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function SidebarSubmenu({ submenu, name, icon }) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  /** Open Submenu list if path found in routes, this is for directly loading submenu routes first time */
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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer group w-full  hover:border-l-2 hover:border-primary ${
          isExpanded
            ? "glass-pill font-bold"
            : "hover:bg-base-200/50 text-base-content font-medium"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-1.5 rounded-lg bg-accent transition-all duration-300 group-hover:bg-base-300/50 group-hover:scale-110">
          {icon}
        </div>
        <span className="flex-1 tracking-wide text-[14px]">{name}</span>
        <ChevronDownIcon
          className={
            "w-4 h-4 transition-transform duration-300 opacity-40 group-hover:opacity-100 " +
            (isExpanded ? "rotate-180" : "")
          }
        />
      </a>

      {/** Submenu list container */}
      <div
        className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded
            ? "max-h-[2000px] opacity-100 mt-1 pb-2"
            : "max-h-0 opacity-0 p-0 m-0 "
        }`}
      >
        <ul className="menu menu-compact pl-4 flex flex-col gap-0.5">
          {submenu.map((m, k) => {
            const isActive = location.pathname === m.path;
            return (
              <li key={k} className="list-none">
                <Link
                  to={m.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl group ${
                    isActive
                      ? "glass-pill font-bold border-l-2 bg-primary text-primary-content"
                      : "hover:bg-base-200/50 hover:shadow-lg text-base-content/90 hover:text-base-content font-medium  hover:border-l-2 hover:border-primary"
                  }`}
                >
                  <div
                    className={`p-1 bg-accent rounded-lg ${isActive ? "" : "group-hover:bg-base-300/50 group-hover:scale-110"}`}
                  >
                    {m.icon}
                  </div>
                  <span className="flex-1 tracking-wide text-sm">{m.name}</span>
                  {isActive && <div className="active-indicator-dot" />}
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
