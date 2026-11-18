import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Gavel,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  Trophy,
  Award,
  PackageCheck,
  Boxes,
  ShoppingCart,
  BarChart2,
  Bell,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../core/hooks/useAuth";
import RoutePath from "../../core/constants/routes.constant";

const SECTIONS = [
  {
    id: "overview",
    label: null,
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: RoutePath.DEALER_DASHBOARD },
    ],
  },
  {
    id: "buy",
    label: "Buy Scrap",
    items: [
      { label: "Marketplace",   icon: Store,         path: RoutePath.DEALER_MARKETPLACE },
      { label: "Live Auctions", icon: Gavel,         path: RoutePath.DEALER_LIVE_AUCTIONS },
      { label: "Tenders",       icon: ClipboardList, path: RoutePath.DEALER_TENDERS },
    ],
  },
  {
    id: "activity",
    label: "My Activity",
    items: [
      { label: "Quotations Sent", icon: MessageSquare, path: RoutePath.DEALER_QUOTATIONS },
      { label: "My Bids",         icon: TrendingUp,    path: RoutePath.DEALER_MY_BIDS },
      { label: "Won Auctions",    icon: Trophy,        path: RoutePath.DEALER_WON_AUCTIONS },
      { label: "Tender Awards",   icon: Award,         path: RoutePath.DEALER_TENDER_AWARDS },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    items: [
      { label: "Purchased Scrap",  icon: PackageCheck, path: RoutePath.DEALER_PURCHASED_SCRAP },
      { label: "Scrap Inventory",  icon: Boxes,        path: RoutePath.DEALER_SCRAP_INVENTORY },
      { label: "Orders",           icon: ShoppingCart, path: RoutePath.DEALER_ORDERS },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { label: "Reports",       icon: BarChart2,   path: RoutePath.DEALER_REPORTS },
      { label: "Notifications", icon: Bell,        path: RoutePath.DEALER_NOTIFICATIONS },
      { label: "Profile",       icon: UserCircle,  path: RoutePath.DEALER_PROFILE },
    ],
  },
];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "D";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const DealerSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const initials = getInitials(user?.contactName || user?.companyName || "");
  const displayName = user?.companyName || user?.contactName || "Dealer";

  return (
    <aside
      className={`
        flex flex-col bg-slate-900 text-white
        min-h-screen shrink-0 transition-all duration-300 pt-[72px] z-30
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* ── Brand header ── */}
      <div
        className={`h-14 flex items-center border-b border-slate-700 shrink-0 ${
          collapsed ? "justify-center px-2" : "px-4 justify-between"
        }`}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <>
            <span className="text-base font-bold tracking-tight truncate">SmartScrap AI</span>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {SECTIONS.map((section) => (
          <div key={section.id}>
            {/* Section divider / label */}
            {section.label && (
              collapsed
                ? <div className="my-2 mx-1 border-t border-slate-700" />
                : (
                  <p className="mt-4 mb-1 px-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                    {section.label}
                  </p>
                )
            )}

            {/* Items */}
            {section.items.map((item) => (
              <div key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  end={item.path === RoutePath.DEALER_DASHBOARD}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors ${
                      collapsed ? "justify-center px-2" : ""
                    } ${
                      isActive
                        ? "bg-green-600 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={18} className="shrink-0" />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </>
                  )}
                </NavLink>

                {/* Tooltip in collapsed mode */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className="shrink-0 border-t border-slate-700">
        {collapsed ? (
          <div className="flex justify-center py-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
              {initials}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400">Dealer account</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DealerSidebar;
