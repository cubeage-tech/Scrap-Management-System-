import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import DealerSidebar from "../components/sidebar/DealerSidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const isDealer = pathname.startsWith("/dealer");

  return (
    <div className="min-h-screen bg-background">
      <Navbar dashboard />

      <div className="flex">
        {isDealer ? <DealerSidebar /> : <Sidebar />}

        <main className="flex-1 min-w-0 p-6 pt-[100px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
