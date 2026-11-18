import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import { sidebarMenus } from "./SidebarConfig";
import { useAuth } from "../../core/hooks/useAuth";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const menus = sidebarMenus[user?.role] || [];

  return (
    <aside
      className={`min-h-screen bg-slate-900 text-white transition-all duration-300 pt-[72px] z-30 shrink-0 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`h-14 flex items-center border-b border-slate-700 px-3 shrink-0 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight size={20} />
          </button>
        ) : (
          <>
            <span className="text-base font-bold tracking-tight truncate">SmartScrap AI</span>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <X size={18} />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-0.5">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <div key={menu.path} className="relative group">
              <NavLink
                to={menu.path}
                end={menu.path.endsWith("/dashboard")}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isCollapsed ? "justify-center px-2" : ""
                  } ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{menu.label}</span>}
              </NavLink>

              {/* Tooltip in collapsed mode */}
              {isCollapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
                  {menu.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
