import {
  LayoutDashboard,
  Factory,
  Users,
  Package,
  ShoppingCart,
} from "lucide-react";

import { USER_ROLES } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";

export const sidebarMenus = {
  [USER_ROLES.SUPER_ADMIN]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: RoutePath.ADMIN_DASHBOARD,
    },
    {
      label: "Industries",
      icon: Factory,
      path: RoutePath.ADMIN_INDUSTRIES,
    },
    {
      label: "Dealers",
      icon: Users,
      path: RoutePath.ADMIN_DEALERS,
    },
    {
      label: "Buyers",
      icon: Users,
      path: RoutePath.ADMIN_BUYERS,
    },
    {
      label: "Scrap Categories",
      icon: Package,
      path: RoutePath.ADMIN_SCRAP_CATEGORIES,
    },
    {
      label: "Marketplace",
      icon: Package,
      path: RoutePath.ADMIN_MARKETPLACE,
    },
    {
      label: "Auctions",
      icon: Package,
      path: RoutePath.ADMIN_AUCTIONS,
    },
    {
      label: "Reports",
      icon: Package,
      path: RoutePath.ADMIN_REPORTS,
    },
    {
      label: "Notifications",
      icon: Package,
      path: RoutePath.ADMIN_NOTIFICATIONS,
    },
    {
      label: "Settings",
      icon: Package,
      path: RoutePath.ADMIN_SETTINGS,
    },
  ],

  [USER_ROLES.INDUSTRY]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: RoutePath.INDUSTRY_DASHBOARD,
    },
    {
      label: "My Scrap",
      icon: Package,
      path: RoutePath.INDUSTRY_MY_SCRAP,
    },
    {
      label: "My Listings",
      icon: Package,
      path: RoutePath.INDUSTRY_LISTINGS,
    },
    {
      label: "Quotations",
      icon: Package,
      path: RoutePath.INDUSTRY_QUOTATIONS,
    },
    {
      label: "Marketplace",
      icon: Package,
      path: RoutePath.INDUSTRY_DEALER_MARKETPLACE,
    },
    {
      label: "Auctions",
      icon: Package,
      path: RoutePath.INDUSTRY_AUCTIONS,
    },
    {
      label: "Sales Orders",
      icon: Package,
      path: RoutePath.INDUSTRY_SALES_ORDERS,
    },

    {
      label: "Reports",
      icon: Package,
      path: RoutePath.INDUSTRY_REPORTS,
    },

    {
      label: "Notifications",
      icon: Package,
      path: RoutePath.INDUSTRY_NOTIFICATIONS,
    },

    {
      label: "Settings",
      icon: Package,
      path: RoutePath.INDUSTRY_SETTINGS,
    },
  ],

  [USER_ROLES.DEALER]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: RoutePath.DEALER_DASHBOARD,
    },
    {
      label: "Marketplace",
      icon: Package,
      path: RoutePath.DEALER_MARKETPLACE,
    },

    {
      label: "Quotations",
      icon: Package,
      path: RoutePath.DEALER_QUOTATIONS,
    },

    {
      label: "Live Auctions",
      icon: Package,
      path: RoutePath.DEALER_LIVE_AUCTIONS,
    },

    {
      label: "Won Auctions",
      icon: Package,
      path: RoutePath.DEALER_WON_AUCTIONS,
    },

    {
      label: "Scrap Inventory",
      icon: Package,
      path: RoutePath.DEALER_SCRAP_INVENTORY,
    },

    {
      label: "Orders",
      icon: Package,
      path: RoutePath.DEALER_ORDERS,
    },

    {
      label: "Reports",
      icon: Package,
      path: RoutePath.DEALER_REPORTS,
    },

    {
      label: "Notifications",
      icon: Package,
      path: RoutePath.DEALER_NOTIFICATIONS,
    },

    {
      label: "Settings",
      icon: Package,
      path: RoutePath.DEALER_SETTINGS,
    },

  ],


  [USER_ROLES.BUYER]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: RoutePath.BUYER_DASHBOARD,
    },
    {
      label: "Marketplace",
      icon: ShoppingCart,
      path: RoutePath.BUYER_MARKETPLACE,
    },
    {
      label: "Quotations",
      icon: Package,
      path: RoutePath.BUYER_QUOTATIONS,
    },
    {
      label: "Reports",
      icon: ShoppingCart,
      path: RoutePath.BUYER_REPORTS,
    },
  ],
};