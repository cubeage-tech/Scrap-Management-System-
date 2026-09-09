import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/Navbar";


const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar/>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 min-w-0 p-6 pt-[100px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;