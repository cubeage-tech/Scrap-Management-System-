import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import RoutePath from "../core/constants/routes.constant";
import { USER_ROLES } from "../core/constants/app.constant";

// Public Pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import HelpCenter from "../pages/public/HelpCenter";


// Super Admin
import SuperAdminDashboard from "../pages/superAdmin/SuperAdminDashboard";
import Industries from "../pages/superAdmin/Industries";
import Dealers from "../pages/superAdmin/Dealers";
import Buyers from "../pages/superAdmin/Buyers";
import ScrapCategories from "../pages/superAdmin/ScrapCategories";
import Marketplace from "../pages/superAdmin/Marketplace";
import Auctions from "../pages/superAdmin/Auctions";
import Reports from "../pages/superAdmin/Reports";
import Notifications from "../pages/superAdmin/Notifications";
import Settings from "../pages/superAdmin/Settings";



// Industry
import IndustryDashboard from "../pages/industry/IndustryDashboard";
import MyScrap from "../pages/industry/MyScrap";
import IndustryInventory from "../pages/industry/IndustryInventory";
import MyListings from "../pages/industry/MyListings";
import IndustrySettings from "../pages/industry/Settings";
import IndustryAuctions from "../pages/industry/IndustryAuctions";
import IndustryMarketplace from "../pages/industry/IndustryMarketplace";
import IndustryNotification from "../pages/industry/Notification";
import IndustryQuotation from "../pages/industry/Quotation";
// import IndustryReports from "../pages/industry/Reports";

// Dealer
import DealerDashboard from "../pages/dealer/DealerDashboard";
import DealerProfile from "../pages/dealer/Profile";
import DealerMarketplace from "../pages/dealer/DealerMarketplace";
import SubmitQuotation from "../pages/dealer/SubmitQuotation";
import PurchasedScrap from "../pages/dealer/PurchasedScrap";
import ScrapInventory from "../pages/dealer/ScrapInventory";
import LiveAuctions from "../pages/dealer/LiveAuction";
import MyBids from "../pages/dealer/MyBids";
import WonAuctions from "../pages/dealer/WonAuction";
import Orders from "../pages/dealer/Orders";
import DealerReports from "../pages/dealer/DealerReports";
import DealerQuotation from "../pages/dealer/DealerQuotation";
import Notification from "../pages/dealer/Notification";

// Buyer
import BuyerDashboard from "../pages/buyer/BuyerDashboard";
import BuyerProfile from "../pages/buyer/Profile";
import BuyerReports from "../pages/buyer/BuyerReports";
import BuyerMarketplace from "../pages/buyer/BuyerMarketplace";
import BuyerSubmitQuotation from "../pages/buyer/SubmitQuotation";
import BuyerQuotation from "../pages/buyer/BuyerQuotation";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}

      <Route element={<MainLayout />}>
        <Route path={RoutePath.HOME} element={<Home />} />
        <Route path={RoutePath.ABOUT} element={<About />} />
        <Route path={RoutePath.CONTACT} element={<Contact />} />
        <Route path={RoutePath.LOGIN} element={<Login />} />
        <Route path={RoutePath.SIGNUP} element={<Signup />} />
        <Route path={RoutePath.HELP_CENTER} element={<HelpCenter />} />

      </Route>

      {/* ================= DASHBOARD LAYOUT ================= */}

      <Route element={<DashboardLayout />}>

        {/* ================= SUPER ADMIN ================= */}

        <Route
          // element={
          //   <ProtectedRoute
          //     allowedRoles={[USER_ROLES.SUPER_ADMIN]}
          //   />
          // }
        >
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

        <Route
          // element={
          //   <ProtectedRoute
          //     allowedRoles={[USER_ROLES.INDUSTRY]}
          //   />
          // }
        >
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
            path={RoutePath.INDUSTRY_SETTINGS}
            element={<IndustrySettings />}
          />

           <Route
            path={RoutePath.INDUSTRY_AUCTIONS}
            element={<IndustryAuctions />}
          />

          <Route
            path={RoutePath.INDUSTRY_DEALER_MARKETPLACE}
            element={<IndustryMarketplace />}
          />

          <Route
            path={RoutePath.INDUSTRY_NOTIFICATIONS}
            element={<IndustryNotification />}
          />


        </Route>

        {/* ================= DEALER ================= */}

        <Route
          // element={
          //   <ProtectedRoute
          //     allowedRoles={[USER_ROLES.DEALER]}
          //   />
          // }
        >
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
        </Route>

        {/* ================= BUYER ================= */}

        <Route
          // element={
          //   <ProtectedRoute
          //     allowedRoles={[USER_ROLES.BUYER]}
          //   />
          // }
        >
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
            path={RoutePath.BUYER_REPORTS}
            element={<BuyerReports/>}
          />

          <Route
            path={RoutePath.BUYER_PROFILE}
            element={<BuyerProfile />}
          />
        </Route>

      </Route>

    </Routes>
  );
};

export default AppRoutes;