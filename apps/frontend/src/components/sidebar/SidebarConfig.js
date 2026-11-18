import {
  LayoutDashboard,
  Factory,
  Users,
  Package,
  ShoppingCart,
  ShoppingBag,
  Gavel,
  MessageSquare,
  TrendingUp,
  Trophy,
  Award,
  PackageCheck,
  Boxes,
  BarChart2,
  Bell,
  Settings,
  ClipboardList,
  Store,
  FileText,
  Folder,
  UserCircle,
} from "lucide-react";

import { USER_ROLES } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";

export const sidebarMenus = {
  // ── SUPER ADMIN ──────────────────────────────────────────────
  [USER_ROLES.SUPER_ADMIN]: [
    { label: "Dashboard",        icon: LayoutDashboard, path: RoutePath.ADMIN_DASHBOARD },
    { label: "Industries",       icon: Factory,         path: RoutePath.ADMIN_INDUSTRIES },
    { label: "Dealers",          icon: Users,           path: RoutePath.ADMIN_DEALERS },
    { label: "Buyers",           icon: Users,           path: RoutePath.ADMIN_BUYERS },
    { label: "Scrap Categories", icon: Folder,          path: RoutePath.ADMIN_SCRAP_CATEGORIES },
    { label: "Marketplace",      icon: Store,           path: RoutePath.ADMIN_MARKETPLACE },
    { label: "Auctions",         icon: Gavel,           path: RoutePath.ADMIN_AUCTIONS },
    { label: "Reports",          icon: BarChart2,       path: RoutePath.ADMIN_REPORTS },
    { label: "Notifications",    icon: Bell,            path: RoutePath.ADMIN_NOTIFICATIONS },
    { label: "Settings",         icon: Settings,        path: RoutePath.ADMIN_SETTINGS },
  ],

  // ── INDUSTRY ─────────────────────────────────────────────────
  [USER_ROLES.INDUSTRY]: [
    { label: "Dashboard",     icon: LayoutDashboard, path: RoutePath.INDUSTRY_DASHBOARD },
    { label: "My Scrap",      icon: Package,         path: RoutePath.INDUSTRY_MY_SCRAP },
    { label: "My Listings",   icon: FileText,        path: RoutePath.INDUSTRY_LISTINGS },
    { label: "Offers Received", icon: MessageSquare, path: RoutePath.INDUSTRY_QUOTATIONS },
    { label: "Auctions",      icon: Gavel,           path: RoutePath.INDUSTRY_AUCTIONS },
    { label: "Tenders",       icon: ClipboardList,   path: RoutePath.INDUSTRY_TENDERS },
    { label: "Sales Orders",  icon: ShoppingCart,    path: RoutePath.INDUSTRY_SALES_ORDERS },
    { label: "Reports",       icon: BarChart2,       path: RoutePath.INDUSTRY_REPORTS },
    { label: "Notifications", icon: Bell,            path: RoutePath.INDUSTRY_NOTIFICATIONS },
    { label: "Settings",      icon: Settings,        path: RoutePath.INDUSTRY_SETTINGS },
  ],

  // ── DEALER ────────────────────────────────────────────────────
  // NOTE: DealerSidebar renders the dealer nav with sections — this
  // config is kept as a flat fallback for any generic components that
  // read sidebarMenus[DEALER].
  [USER_ROLES.DEALER]: [
    { label: "Dashboard",       icon: LayoutDashboard, path: RoutePath.DEALER_DASHBOARD },
    { label: "Marketplace",     icon: Store,           path: RoutePath.DEALER_MARKETPLACE },
    { label: "Live Auctions",   icon: Gavel,           path: RoutePath.DEALER_LIVE_AUCTIONS },
    { label: "Tenders",         icon: ClipboardList,   path: RoutePath.DEALER_TENDERS },
    { label: "Quotations Sent", icon: MessageSquare,   path: RoutePath.DEALER_QUOTATIONS },
    { label: "My Bids",         icon: TrendingUp,      path: RoutePath.DEALER_MY_BIDS },
    { label: "Won Auctions",    icon: Trophy,          path: RoutePath.DEALER_WON_AUCTIONS },
    { label: "Tender Awards",   icon: Award,           path: RoutePath.DEALER_TENDER_AWARDS },
    { label: "Purchased Scrap", icon: PackageCheck,    path: RoutePath.DEALER_PURCHASED_SCRAP },
    { label: "Scrap Inventory", icon: Boxes,           path: RoutePath.DEALER_SCRAP_INVENTORY },
    { label: "Orders",          icon: ShoppingCart,    path: RoutePath.DEALER_ORDERS },
    { label: "Reports",         icon: BarChart2,       path: RoutePath.DEALER_REPORTS },
    { label: "Notifications",   icon: Bell,            path: RoutePath.DEALER_NOTIFICATIONS },
    { label: "Profile",         icon: UserCircle,      path: RoutePath.DEALER_PROFILE },
  ],

  // ── BUYER ─────────────────────────────────────────────────────
  [USER_ROLES.BUYER]: [
    { label: "Dashboard",       icon: LayoutDashboard, path: RoutePath.BUYER_DASHBOARD },
    { label: "Marketplace",     icon: ShoppingBag,     path: RoutePath.BUYER_MARKETPLACE },
    { label: "Quotations",      icon: MessageSquare,   path: RoutePath.BUYER_QUOTATIONS },
    { label: "Purchased Scrap", icon: PackageCheck,    path: RoutePath.BUYER_PURCHASES },
    { label: "Reports",         icon: BarChart2,       path: RoutePath.BUYER_REPORTS },
  ],
};
