import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Factory,
  Users,
  Folder,
  Store,
  Gavel,
  FileText,
  Bell,
  Settings,
  Package,
  ChevronRight,
  X,
} from "lucide-react";
import { sidebarMenus } from "./SidebarConfig";
import { USER_ROLES } from "../../core/constants/app.constant";

const getMenuIcon = (menu) => {
  const label = menu.label?.toLowerCase() || "";
  if (label.includes("dashboard")) return LayoutDashboard;
  if (label.includes("industr")) return Factory;
  if (label.includes("dealer") && !label.includes("marketplace")) return Users;
  if (label.includes("buyer")) return Users;
  if (label.includes("categor")) return Folder;
  if (label.includes("marketplace")) return Store;
  if (label.includes("auction")) return Gavel;
  if (label.includes("report")) return FileText;
  if (label.includes("notification")) return Bell;
  if (label.includes("setting")) return Settings;
  if (label.includes("scrap")) return Package;
  return menu.icon || Package;
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  let role = USER_ROLES.INDUSTRY;

  if (location.pathname.startsWith("/admin")) {
    role = USER_ROLES.SUPER_ADMIN;
  } else if (location.pathname.startsWith("/industry")) {
    role = USER_ROLES.INDUSTRY;
  } else if (location.pathname.startsWith("/dealer")) {
    role = USER_ROLES.DEALER;
  } else if (location.pathname.startsWith("/buyer")) {
    role = USER_ROLES.BUYER;
  }

  const menus = sidebarMenus[role] || [];

  return (
    <aside
      className={`min-h-screen bg-slate-900 text-white transition-all duration-300 pt-[72px] z-30 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Top Header: Arrow when collapsed, Cross (X) when expanded */}
      <div
        className={`h-16 flex items-center border-b border-slate-700 px-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold tracking-tight">
              Smart Scrap
            </h1>

            {/* Cross (X) button to close/collapse */}
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          /* Arrow button to open/expand when collapsed (replacing hamburger) */
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="p-4 space-y-1">
        {menus.map((menu) => {
          const IconComponent = getMenuIcon(menu);
          return (
            <div key={menu.path} className="relative group">
              <NavLink
                to={menu.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  } ${isCollapsed ? "justify-center px-2" : ""}`
                }
              >
                <IconComponent size={20} className="shrink-0" />
                {!isCollapsed && <span>{menu.label}</span>}
              </NavLink>

              {/* Floating Tooltip in collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
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


// import { NavLink } from "react-router-dom";
// import { useAuth } from "../../core/hooks/useAuth";
// import { sidebarMenus } from "./SidebarConfig";

// const Sidebar = () => {
//   const { user } = useAuth();

//   const menus = sidebarMenus[user?.role] || [];

//   return (
//     <aside className="w-72 min-h-screen bg-slate-900 text-white">
//       <div className="h-20 flex items-center justify-center border-b border-slate-700">
//         <h1 className="text-2xl font-bold">
//           Smart Scrap
//         </h1>
//       </div>

//       <nav className="p-5">
//         {menus.map((menu) => (
//           <NavLink
//             key={menu.path}
//             to={menu.path}
//             className={({ isActive }) =>
//               `flex items-center gap-3 p-3 rounded-lg mb-2 ${
//                 isActive
//                   ? "bg-green-600"
//                   : "hover:bg-slate-800"
//               }`
//             }
//           >
//             <menu.icon size={20} />
//             <span>{menu.label}</span>
//           </NavLink>
//         ))}
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;
