import { useState, useEffect } from "react";
import {
  Factory,
  Store,
  Users,
  Package,
  Gavel,
  CheckCircle2,
  IndianRupee,
  Clock,
  ChevronRight,
  Filter,
  Download,
  Loader2
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  Line,
  Legend,
  LineChart,
  BarChart
} from "recharts";

import StateCards from "../../components/dashboard/StateCards";
import MaterialTable from "../../components/common/MaterialTable";
import { companyRegistryTableConfig } from "../../configs/tables/companyRegistryTable.config";
import ApiService from "../../core/services/api.service";

const pieColors = ["#011C6B", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"];

const getIconForType = (type) => {
  switch (type) {
    case "industries": return { icon: <Factory className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" };
    case "dealers": return { icon: <Store className="w-5 h-5 text-green-500" />, bg: "bg-green-50" };
    case "buyers": return { icon: <Users className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" };
    case "scrap": return { icon: <Package className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50" };
    case "auctions": return { icon: <Gavel className="w-5 h-5 text-red-400" />, bg: "bg-red-50" };
    case "sales": return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, bg: "bg-green-50" };
    case "revenue": return { icon: <IndianRupee className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" };
    case "pending": return { icon: <Clock className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50" };
    default: return { icon: <Factory className="w-5 h-5 text-gray-500" />, bg: "bg-gray-50" };
  }
};

const SuperAdminDashboard = () => {
  const [filterRegion, setFilterRegion] = useState("All Regions");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  // Dynamic Data Fetching
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await ApiService.getAdminDashboard();

        console.log("Dashboard API Response:", response);
        
        // Axios returns response.data, and our API wraps it in { success, data }
        if (response?.data?.success && response?.data?.data) {
          // Ensure all required arrays exist
          setData({
            statCards: response.data.data.statCards || [],
            comboData: response.data.data.comboData || [],
            inventoryData: response.data.data.inventoryData || [],
            latestCompanies: response.data.data.latestCompanies || [],
          });
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        // Fallback to empty state
        setData({
          statCards: [],
          comboData: [],
          inventoryData: [],
          latestCompanies: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filterRegion]); // Re-fetch if filter changes

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
        <Loader2 className="w-12 h-12 text-[#011C6B] animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse text-center">Loading dynamic analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto bg-gray-50 min-h-screen font-sans animate-in fade-in duration-500">

      {/* Breadcrumb & Slicer Bar (Power BI Style) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">



        {/* Interactive Slicers */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200 w-full lg:w-auto">
          <div className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:border-r border-gray-200 py-1 sm:py-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filters</span>
          </div>

          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-2 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-[#011C6B] w-full sm:w-auto">
            <option>Last 7 Months</option>
            <option>Last 30 Days</option>
            <option>Year to Date</option>
          </select>

          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-2 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-[#011C6B] w-full sm:w-auto"
          >
            <option>All Regions</option>
            <option>Maharashtra</option>
            <option>Gujarat</option>
            <option>Karnataka</option>
          </select>

          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-2 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-[#011C6B] w-full sm:w-auto">
            <option>All Materials</option>
            <option>Ferrous</option>
            <option>Non-Ferrous</option>
          </select>

          <button className="hidden sm:flex ml-auto p-2 sm:p-1.5 text-gray-500 hover:text-[#011C6B] hover:bg-blue-50 rounded-md transition-colors justify-center" title="Export Report">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Area */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Platform Analytics</h1>
        <p className="text-gray-500 text-sm">Network health, trade volume and approvals across all connected organisations.</p>
      </div>

      {/* KPI Cards with Sparklines */}

      <StateCards
        data={data?.statCards || []}
        getIconForType={getIconForType}
      />

      {/* BI Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Combo Chart (Volume vs Revenue) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900">Trade Volume vs. Revenue</h2>
            <p className="text-xs text-gray-500 mt-1">Dual-axis correlation of MT traded vs Platform Revenue (Lakhs)</p>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data?.comboData || []} margin={{ top: 10, right: -10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} dy={10} />

                {/* Left Y Axis for Volume (Bar) */}
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} width={40} />
                {/* Right Y Axis for Revenue (Line) */}
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={(value) => `₹${value}`} width={40} />

                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f0f0f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />

                <Bar yAxisId="left" dataKey="volume" name="Volume (MT)" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (₹ L)" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution Donut Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col">
          <div>
            <h2 className="text-base font-bold text-gray-900">Material Composition</h2>
            <p className="text-xs text-gray-500 mt-1 mb-4">Inventory breakdown by material type</p>
          </div>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.inventoryData || []}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {(data?.inventoryData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #f0f0f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-2 md:gap-3 mt-4 flex-wrap">
            {(data?.inventoryData || []).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[11px] md:text-xs text-gray-600 font-medium">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[index] }}></div>
                {entry.name} ({entry.value} MT)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Recent Companies */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900">Recent Company Registrations</h2>
            <p className="text-xs text-gray-500 mt-1">Latest 5 companies registered on the platform</p>
          </div>
          <MaterialTable
            config={companyRegistryTableConfig}
            data={data?.latestCompanies || []}
            getRowId={(row) => row.id}
          />
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
