import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import RoutePath from "../core/constants/routes.constant";
import ProtectedRoute from "./ProtectedRoute";
import { USER_ROLES } from "../core/constants/app.constant";

// Public Pages
const Home = lazy(() => import("../pages/public/Home"));
const About = lazy(() => import("../pages/public/About"));
const Contact = lazy(() => import("../pages/public/Contact"));
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const HelpCenter = lazy(() => import("../pages/public/HelpCenter"));

// Super Admin
const SuperAdminDashboard = lazy(() => import("../pages/superAdmin/SuperAdminDashboard"));
const Industries = lazy(() => import("../pages/superAdmin/Industries"));
const Dealers = lazy(() => import("../pages/superAdmin/Dealers"));
const Buyers = lazy(() => import("../pages/superAdmin/Buyers"));
const ScrapCategories = lazy(() => import("../pages/superAdmin/ScrapCategories"));
const Marketplace = lazy(() => import("../pages/superAdmin/Marketplace"));
const Auctions = lazy(() => import("../pages/superAdmin/Auctions"));
const Reports = lazy(() => import("../pages/superAdmin/Reports"));
const Notifications = lazy(() => import("../pages/superAdmin/Notifications"));
const Settings = lazy(() => import("../pages/superAdmin/Settings"));

// Industry
const IndustryTenders = lazy(() => import("../pages/industry/IndustryTenders"));
const IndustryTenderDetail = lazy(() => import("../pages/industry/IndustryTenderDetail"));
const IndustryDashboard = lazy(() => import("../pages/industry/IndustryDashboard"));
const MyScrap = lazy(() => import("../pages/industry/MyScrap"));
const IndustryInventory = lazy(() => import("../pages/industry/IndustryInventory"));
const MyListings = lazy(() => import("../pages/industry/MyListings"));
const IndustrySettings = lazy(() => import("../pages/industry/Settings"));
const IndustryAuctions = lazy(() => import("../pages/industry/IndustryAuctions"));
const IndustryNotification = lazy(() => import("../pages/industry/Notification"));
const IndustryQuotation = lazy(() => import("../pages/industry/Quotation"));
const IndustrySales = lazy(() => import("../pages/industry/Sales"));
const IndustryReports = lazy(() => import("../pages/industry/Reports"));

// Dealer
const DealerTenders = lazy(() => import("../pages/dealer/DealerTenders"));
const DealerTenderDetail = lazy(() => import("../pages/dealer/DealerTenderDetail"));
const DealerTenderSubmit = lazy(() => import("../pages/dealer/DealerTenderSubmit"));
const DealerTenderAwards = lazy(() => import("../pages/dealer/DealerTenderAwards"));
const DealerDashboard = lazy(() => import("../pages/dealer/DealerDashboard"));
const DealerProfile = lazy(() => import("../pages/dealer/Profile"));
const DealerMarketplace = lazy(() => import("../pages/dealer/DealerMarketplace"));
const SubmitQuotation = lazy(() => import("../pages/dealer/SubmitQuotation"));
const PurchasedScrap = lazy(() => import("../pages/dealer/PurchasedScrap"));
const ScrapInventory = lazy(() => import("../pages/dealer/ScrapInventory"));
const LiveAuctions = lazy(() => import("../pages/dealer/LiveAuction"));
const MyBids = lazy(() => import("../pages/dealer/MyBids"));
const WonAuctions = lazy(() => import("../pages/dealer/WonAuction"));
const Orders = lazy(() => import("../pages/dealer/Orders"));
const DealerReports = lazy(() => import("../pages/dealer/DealerReports"));
const DealerQuotation = lazy(() => import("../pages/dealer/DealerQuotation"));
const Notification = lazy(() => import("../pages/dealer/Notification"));

// Buyer
const BuyerDashboard = lazy(() => import("../pages/buyer/BuyerDashboard"));
const BuyerProfile = lazy(() => import("../pages/buyer/Profile"));
const BuyerReports = lazy(() => import("../pages/buyer/BuyerReports"));
const BuyerMarketplace = lazy(() => import("../pages/buyer/BuyerMarketplace"));
const BuyerSubmitQuotation = lazy(() => import("../pages/buyer/SubmitQuotation"));
const BuyerQuotation = lazy(() => import("../pages/buyer/BuyerQuotation"));
const BuyerPurchasedScrap = lazy(() => import("../pages/buyer/PurchasedScrap"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        <Route element={<MainLayout />}>
          <Route path={RoutePath.HOME} element={<Home />} />
          <Route path={RoutePath.ABOUT} element={<About />} />
          <Route path={RoutePath.CONTACT} element={<Contact />} />
          <Route path={RoutePath.LOGIN} element={<Login />} />
          <Route path={RoutePath.SIGNUP} element={<Signup />} />
          <Route path={RoutePath.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={RoutePath.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={RoutePath.HELP_CENTER} element={<HelpCenter />} />

        </Route>

        {/* ================= DASHBOARD LAYOUT ================= */}

        {/* Auth gate: prevents DashboardLayout from mounting before session is confirmed */}
        <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* ================= SUPER ADMIN ================= */}

          <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN]} />}>
            <Route
              path={RoutePath.ADMIN_DASHBOARD}
              element={<SuperAdminDashboard />}
            />

            <Route
              path={RoutePath.ADMIN_INDUSTRIES}
              element={<Industries />}
            />

            <Route
              path={RoutePath.ADMIN_DEALERS}
              element={<Dealers />}
            />

            <Route
              path={RoutePath.ADMIN_BUYERS}
              element={<Buyers />}
            />

            <Route
              path={RoutePath.ADMIN_SCRAP_CATEGORIES}
              element={<ScrapCategories />}
            />

             <Route
              path={RoutePath.ADMIN_MARKETPLACE}
              element={<Marketplace/>}
            />

            <Route
              path={RoutePath.ADMIN_AUCTIONS}
              element={<Auctions/>}
            />

            <Route
              path={RoutePath.ADMIN_REPORTS}
              element={<Reports/>}
            />

            <Route
              path={RoutePath.ADMIN_NOTIFICATIONS}
              element={<Notifications/>}
            />

            <Route
              path={RoutePath.ADMIN_SETTINGS}
              element={<Settings/>}
            />
          </Route>

          {/* ================= INDUSTRY ================= */}

          <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.INDUSTRY]} />}>
            <Route
              path={RoutePath.INDUSTRY_DASHBOARD}
              element={<IndustryDashboard />}
            />

             <Route
              path={RoutePath.INDUSTRY_MY_SCRAP}
              element={<MyScrap />}
            />

            <Route
              path={RoutePath.INDUSTRY_INVENTORY}
              element={<IndustryInventory />}
            />

            <Route
              path={RoutePath.INDUSTRY_LISTINGS}
              element={<MyListings />}
            />

            <Route
              path={RoutePath.INDUSTRY_QUOTATIONS}
              element={<IndustryQuotation />}
            />

            <Route
              path={RoutePath.INDUSTRY_SALES_ORDERS}
              element={<IndustrySales />}
            />

            <Route
              path={RoutePath.INDUSTRY_ORDERS}
              element={<IndustrySales />}
            />

            <Route
              path={RoutePath.INDUSTRY_REPORTS}
              element={<IndustryReports />}
            />

            <Route
              path={RoutePath.INDUSTRY_SETTINGS}
              element={<IndustrySettings />}
            />

             <Route
              path={RoutePath.INDUSTRY_AUCTIONS}
              element={<IndustryAuctions />}
            />

            <Route
              path={RoutePath.INDUSTRY_NOTIFICATIONS}
              element={<IndustryNotification />}
            />

            <Route
              path={RoutePath.INDUSTRY_TENDERS}
              element={<IndustryTenders />}
            />

            <Route
              path={RoutePath.INDUSTRY_TENDER_DETAIL}
              element={<IndustryTenderDetail />}
            />

          </Route>

          {/* ================= DEALER ================= */}

          <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.DEALER]} />}>
            <Route
              path={RoutePath.DEALER_DASHBOARD}
              element={<DealerDashboard />}
            />

            <Route
              path={RoutePath.DEALER_PROFILE}
              element={<DealerProfile />}
            />

             <Route
              path={RoutePath.DEALER_MARKETPLACE}
              element={<DealerMarketplace />}
            />

             <Route
              path="/dealer/submit-quotation"
              element={<SubmitQuotation />}
            />

             <Route
              path={RoutePath.DEALER_QUOTATIONS}
              element={<DealerQuotation />}
            />

             <Route
              path={RoutePath.DEALER_PURCHASED_SCRAP}
              element={<PurchasedScrap />}
            />

             <Route
              path={RoutePath.DEALER_SCRAP_INVENTORY}
              element={<ScrapInventory />}
            />

             <Route
              path={RoutePath.DEALER_LIVE_AUCTIONS}
              element={<LiveAuctions />}
            />

             <Route
              path={RoutePath.DEALER_MY_BIDS}
              element={<MyBids />}
            />

             <Route
              path={RoutePath.DEALER_WON_AUCTIONS}
              element={<WonAuctions />}
            />

             <Route
              path={RoutePath.DEALER_ORDERS}
              element={<Orders />}
            />

             <Route
              path={RoutePath.DEALER_REPORTS}
              element={<DealerReports />}
            />

              <Route
              path={RoutePath.DEALER_NOTIFICATIONS}
              element={<Notification/>}
            />

            <Route
              path={RoutePath.DEALER_TENDERS}
              element={<DealerTenders />}
            />

            <Route
              path={RoutePath.DEALER_TENDER_AWARDS}
              element={<DealerTenderAwards />}
            />

            <Route
              path={RoutePath.DEALER_TENDER_DETAIL}
              element={<DealerTenderDetail />}
            />

            <Route
              path={RoutePath.DEALER_TENDER_SUBMIT}
              element={<DealerTenderSubmit />}
            />
          </Route>

          {/* ================= BUYER ================= */}

          <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.BUYER]} />}>
            <Route
              path={RoutePath.BUYER_DASHBOARD}
              element={<BuyerDashboard />}
            />

             <Route
              path={RoutePath.BUYER_MARKETPLACE}
              element={<BuyerMarketplace />}
            />

             <Route
              path="/buyer/submit-quotation"
              element={<BuyerSubmitQuotation />}
            />

             <Route
              path={RoutePath.BUYER_QUOTATIONS}
              element={<BuyerQuotation />}
            />

             <Route
              path={RoutePath.BUYER_PURCHASES}
              element={<BuyerPurchasedScrap />}
            />

             <Route
              path={RoutePath.BUYER_REPORTS}
              element={<BuyerReports/>}
            />

            <Route
              path={RoutePath.BUYER_PROFILE}
              element={<BuyerProfile />}
            />
          </Route>

        </Route>
        </Route> {/* /ProtectedRoute auth gate */}

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
