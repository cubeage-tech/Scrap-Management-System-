// src/core/constants/routes.constant.js
import { USER_ROLES } from './app.constant';

class RoutePath {
  // ==================== BASE ROUTES ====================
  static SUPER_ADMIN_BASE = "/admin";
  static INDUSTRY_BASE = "/industry";
  static DEALER_BASE = "/dealer";
  static BUYER_BASE = "/buyer";

  // ==================== PUBLIC ROUTES ====================
  static HOME = "/";
  static ABOUT = "/about";
  static HELP_CENTER = "/help-center";
  static CONTACT = "/contact";
  static LOGIN = "/login";
  static SIGNUP = "/signup";
  static FORGOT_PASSWORD = "/forgot-password";

  // ======================================================
  // SUPER ADMIN
  // ======================================================

  static ADMIN_DASHBOARD = `${this.SUPER_ADMIN_BASE}/dashboard`;

  static ADMIN_INDUSTRIES = `${this.SUPER_ADMIN_BASE}/industries`;
  static ADMIN_ADD_INDUSTRY = `${this.SUPER_ADMIN_BASE}/industries/add`;
  static ADMIN_EDIT_INDUSTRY = `${this.SUPER_ADMIN_BASE}/industries/:id`;

  static ADMIN_DEALERS = `${this.SUPER_ADMIN_BASE}/dealers`;
  static ADMIN_BUYERS = `${this.SUPER_ADMIN_BASE}/buyers`;

  static ADMIN_SCRAP = `${this.SUPER_ADMIN_BASE}/scrap`;
  static ADMIN_CATEGORIES = `${this.SUPER_ADMIN_BASE}/categories`;
  static ADMIN_SCRAP_CATEGORIES = `${this.SUPER_ADMIN_BASE}/scrap-categories`;

  static ADMIN_MARKETPLACE = `${this.SUPER_ADMIN_BASE}/marketplace`;

  static ADMIN_AUCTIONS = `${this.SUPER_ADMIN_BASE}/auctions`;

  static ADMIN_NOTIFICATIONS = `${this.SUPER_ADMIN_BASE}/notifications`;

  static ADMIN_TRANSPORT = `${this.SUPER_ADMIN_BASE}/transport`;

  static ADMIN_PAYMENTS = `${this.SUPER_ADMIN_BASE}/payments`;

  static ADMIN_REPORTS = `${this.SUPER_ADMIN_BASE}/reports`;

  static ADMIN_SETTINGS = `${this.SUPER_ADMIN_BASE}/settings`;

  static ADMIN_PROFILE = `${this.SUPER_ADMIN_BASE}/profile`;

  // ======================================================
  // INDUSTRY 
  // ======================================================

  static INDUSTRY_DASHBOARD = `${this.INDUSTRY_BASE}/dashboard`;

  static INDUSTRY_MY_SCRAP = `${this.INDUSTRY_BASE}/scrap`;

  static INDUSTRY_INVENTORY = `${this.INDUSTRY_BASE}/inventory`;

  static INDUSTRY_LISTINGS = `${this.INDUSTRY_BASE}/listings`;

  static INDUSTRY_DEALER_MARKETPLACE = `${this.INDUSTRY_BASE}/industry-marketplace`;

  static INDUSTRY_ADD_SCRAP = `${this.INDUSTRY_BASE}/scrap/add`;

  static INDUSTRY_EDIT_SCRAP = `${this.INDUSTRY_BASE}/scrap/:id`;

  static INDUSTRY_AUCTIONS = `${this.INDUSTRY_BASE}/auctions`;

  static INDUSTRY_QUOTATIONS = `${this.INDUSTRY_BASE}/quotations`;

  static INDUSTRY_SALES_ORDERS = `${this.INDUSTRY_BASE}/sales-orders`;

  static INDUSTRY_REPORTS = `${this.INDUSTRY_BASE}/reports`;

  static INDUSTRY_NOTIFICATIONS = `${this.INDUSTRY_BASE}/notifications`;

  static INDUSTRY_SETTINGS = `${this.INDUSTRY_BASE}/settings`;

  static INDUSTRY_ORDERS = `${this.INDUSTRY_BASE}/orders`;

  static INDUSTRY_TRANSPORT = `${this.INDUSTRY_BASE}/transport`;

  static INDUSTRY_PAYMENTS = `${this.INDUSTRY_BASE}/payments`;

  static INDUSTRY_PROFILE = `${this.INDUSTRY_BASE}/profile`;

  // ======================================================
  // DEALER
  // ======================================================

  static DEALER_DASHBOARD = `${this.DEALER_BASE}/dashboard`;

  static DEALER_MARKETPLACE = `${this.DEALER_BASE}/marketplace`;

  static DEALER_LIVE_AUCTIONS = `${this.DEALER_BASE}/auctions`;

  static DEALER_QUOTATIONS = `${this.DEALER_BASE}/quotations`;

  static DEALER_MY_BIDS = `${this.DEALER_BASE}/bids`;

  static DEALER_WON_AUCTIONS = `${this.DEALER_BASE}/won-auctions`;

  static DEALER_PURCHASED_SCRAP = `${this.DEALER_BASE}/purchased-scrap`;

  static DEALER_SCRAP_INVENTORY = `${this.DEALER_BASE}/scrap-inventory`;

  static DEALER_ORDERS = `${this.DEALER_BASE}/orders`;

  static DEALER_REPORTS = `${this.DEALER_BASE}/reports`;

  static DEALER_NOTIFICATIONS = `${this.DEALER_BASE}/notifications`;

  static DEALER_SETTINGS = `${this.DEALER_BASE}/settings`;

  static DEALER_TRANSPORT = `${this.DEALER_BASE}/transport`;

  static DEALER_INVOICES = `${this.DEALER_BASE}/invoices`;

  static DEALER_PROFILE = `${this.DEALER_BASE}/profile`;

  // ======================================================
  // BUYER
  // ======================================================

  static BUYER_DASHBOARD = `${this.BUYER_BASE}/dashboard`;

  static BUYER_MARKETPLACE = `${this.BUYER_BASE}/marketplace`;

  static BUYER_QUOTATIONS = `${this.BUYER_BASE}/quotations`;

  static BUYER_AUCTIONS = `${this.BUYER_BASE}/auctions`;

  static BUYER_PURCHASES = `${this.BUYER_BASE}/purchases`;

  static BUYER_TRANSPORT = `${this.BUYER_BASE}/transport`;

  static BUYER_PAYMENTS = `${this.BUYER_BASE}/payments`;

  static BUYER_PROFILE = `${this.BUYER_BASE}/profile`;

  static BUYER_REPORTS = `${this.BUYER_BASE}/reports`;

  // ======================================================
  // COMMON
  // ======================================================

  static UNAUTHORIZED = "/unauthorized";

  static NOT_FOUND = "*";
}

export const ROLE_HOME_ROUTE = {
  [USER_ROLES.SUPER_ADMIN]: RoutePath.ADMIN_DASHBOARD,
  [USER_ROLES.INDUSTRY]: RoutePath.INDUSTRY_DASHBOARD,
  [USER_ROLES.DEALER]: RoutePath.DEALER_DASHBOARD,
  [USER_ROLES.BUYER]: RoutePath.BUYER_DASHBOARD,
};

export const ROLE_SETTINGS_ROUTE = {
  [USER_ROLES.SUPER_ADMIN]: RoutePath.ADMIN_SETTINGS,
  [USER_ROLES.INDUSTRY]: RoutePath.INDUSTRY_SETTINGS,
  [USER_ROLES.DEALER]: RoutePath.DEALER_PROFILE,
  [USER_ROLES.BUYER]: RoutePath.BUYER_PROFILE,
};

export default RoutePath;