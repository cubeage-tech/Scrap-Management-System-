import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Calendar,
  ChevronRight,
  IndianRupee,
  Package,
  Gavel,
  Users,
  TrendingUp,
  BarChart2,
  FileSpreadsheet,
  FileText,
  Check,
  X,
  Clock,
  Mail,
  Share2,
  Printer,
  Layers,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import MaterialTable from "../../components/common/MaterialTable";
import ApiService from "../../core/services/api.service";
import {
  inventoryReportColumns,
  industryPerformanceColumns,
} from "../../configs/tables/reportsTable.config";


// --- Mock Data Matching the Reference Screen ---

// 1. Sales Analytics (Monthly Realized Value in Lakhs)
const salesData = [
  { month: "Jan", value: 43, raw: 4300000 },
  { month: "Feb", value: 49, raw: 4900000 },
  { month: "Mar", value: 55, raw: 5500000 },
  { month: "Apr", value: 52, raw: 5200000 },
  { month: "May", value: 68, raw: 6800000 },
  { month: "Jun", value: 78, raw: 7800000 },
  { month: "Jul", value: 89, raw: 8900000 },
];

// 2. Top Selling Materials (in Metric Tons / Realized Volume Index)
const topMaterialsData = [
  { name: "Steel Turnings", value: 285, volume: "285 MT", revenue: "₹1.42 Cr" },
  { name: "Copper Millberry", value: 232, volume: "232 MT", revenue: "₹1.85 Cr" },
  { name: "Aluminium 6063", value: 190, volume: "190 MT", revenue: "₹85.5 L" },
  { name: "E-Waste PCB", value: 142, volume: "142 MT", revenue: "₹1.13 Cr" },
  { name: "HDPE Regrind", value: 95, volume: "95 MT", revenue: "₹38.2 L" },
];

// 3. Inventory Data for Inventory Tab
const inventoryData = [
  { category: "Ferrous Metals", stock: 5400, capacity: 6000, turnaround: "12 days" },
  { category: "Non-Ferrous", stock: 3200, capacity: 4000, turnaround: "8 days" },
  { category: "Industrial Polymers", stock: 2100, capacity: 3000, turnaround: "15 days" },
  { category: "E-Waste & High Value", stock: 1450, capacity: 2000, turnaround: "6 days" },
  { category: "Paper & Packaging", stock: 696, capacity: 1500, turnaround: "9 days" },
];

// 4. Auction Data for Auction Tab
const auctionPerformanceData = [
  { month: "Jan", listedLots: 120, soldLots: 108, realization: 106 },
  { month: "Feb", listedLots: 145, soldLots: 132, realization: 109 },
  { month: "Mar", listedLots: 160, soldLots: 148, realization: 107 },
  { month: "Apr", listedLots: 150, soldLots: 139, realization: 110 },
  { month: "May", listedLots: 185, soldLots: 172, realization: 111 },
  { month: "Jun", listedLots: 210, soldLots: 196, realization: 113 },
  { month: "Jul", listedLots: 240, soldLots: 228, realization: 112 },
];

// 5. Revenue Data for Revenue Tab
const revenueBreakdownData = [
  { channel: "Spot Market", amount: 18.4, percentage: "44.5%" },
  { channel: "Forward Auctions", amount: 14.8, percentage: "35.8%" },
  { channel: "Long-term Contracts", amount: 5.6, percentage: "13.6%" },
  { channel: "Platform Fees", amount: 2.5, percentage: "6.1%" },
];

// 6. Industry Performance Data
const industryPerformanceData = [
  { name: "Automotive & Forging", volume: 4850, value: "₹15.6 Cr", fulfillment: "98.2%" },
  { name: "Heavy Engineering", volume: 3420, value: "₹11.2 Cr", fulfillment: "96.5%" },
  { name: "Electronics & Tech", volume: 2100, value: "₹8.4 Cr", fulfillment: "99.1%" },
  { name: "Chemical & Plastics", volume: 1480, value: "₹4.1 Cr", fulfillment: "94.8%" },
  { name: "Textiles & Misc", volume: 996, value: "₹2.0 Cr", fulfillment: "92.4%" },
];

// 7. Buyer Performance Data
const buyerPerformanceData = [
  { tier: "Tier 1 Recyclers", count: 184, avgSpend: "₹1.4 Cr", repeatRate: "94%" },
  { tier: "Secondary Smelters", count: 296, avgSpend: "₹65 L", repeatRate: "88%" },
  { tier: "Local Aggregators", count: 320, avgSpend: "₹28 L", repeatRate: "79%" },
  { tier: "Specialized E-Waste Processors", count: 132, avgSpend: "₹85 L", repeatRate: "91%" },
];

// --- Custom Chart Tooltips ---
const CustomSalesTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs">
        <p className="font-semibold text-slate-300">{label} 2026</p>
        <p className="text-blue-400 font-bold text-sm mt-1">
          ₹{payload[0].value} Lakhs
        </p>
        <p className="text-slate-400 text-[11px] mt-0.5">
          Realised Value: ₹{(payload[0].payload.raw || 0).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

const CustomMaterialsTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs">
        <p className="font-semibold text-emerald-400">{data.name}</p>
        <p className="text-white font-medium mt-1">Volume: {data.volume}</p>
        <p className="text-slate-400 mt-0.5">Est. Value: {data.revenue}</p>
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState("Sales");

  const [adminReportData, setAdminReportData] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchAdminReports();
  }, []);

  const fetchAdminReports = async () => {
    try {
      const res = await ApiService.getAdminReports();
      if (res.data?.success) {
        setAdminReportData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching admin reports:", err);
    }
  };

  // Schedule Modal Form State
  const [scheduleForm, setScheduleForm] = useState({
    reportType: "Full Operational & Financial Digest",
    frequency: "Weekly",
    day: "Monday",
    time: "09:00 AM",
    format: "PDF",
    recipients: "finance@smartscrap.ai, management@smartscrap.ai",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };


  const handleExportPDF = () => {
    setIsExporting(true);
    showToast("Generating PDF report...");
    setTimeout(() => {
      setIsExporting(false);
      showToast("PDF report downloaded successfully!");
      try {
        window.print();
      } catch (e) {
        // Safe fallback
      }
    }, 1200);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    setIsScheduleModalOpen(false);
    showToast(
      `Scheduled ${scheduleForm.frequency} report to ${scheduleForm.recipients.split(",")[0].trim()}`
    );
  };

  const tabs = [
    "Sales",
    "Inventory",
    "Auction",
    "Revenue",
    "Industry performance",
    "Buyer performance",
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 font-sans text-foreground">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= TOAST NOTIFICATION ================= */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-border animate-in fade-in slide-in-from-bottom-5 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
            <button
              onClick={() => setToastMessage("")}
              className="text-muted-foreground hover:text-foreground ml-2"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ================= BREADCRUMBS ================= */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-normal">
          <Link
            to="/admin/dashboard"
            className="hover:text-foreground transition-colors"
          >
            SmartScrap AI
          </Link>
          <ChevronRight size={14} className="text-muted-foreground/70" />
          <span className="text-foreground font-semibold">Reports</span>
        </nav>

        {/* ================= HEADER & ACTIONS ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Reports & analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-normal">
              Operational and financial intelligence across the scrap value chain.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Schedule report button */}
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-foreground bg-card border border-border hover:border-border/80 rounded-lg hover:bg-muted transition-colors shadow-2xs cursor-pointer"
            >
              <span>Schedule report</span>
            </button>

            {/* Export PDF button */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-75"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
            </button>
          </div>
        </div>

        {/* ================= 4 KPI SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Revenue (YTD) */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Revenue (YTD)
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">
                ₹
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight">
                ₹41.3 Cr
              </div>
              <div className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
                <span>↗ +18.2%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Volume Traded */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Volume Traded
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight">
                12,846 MT
              </div>
              <div className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
                <span>↗ +8.4%</span>
              </div>
            </div>
          </div>

          {/* Card 3: Auction Realisation */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Auction Realisation
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Gavel className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight">
                112%
              </div>
              <div className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
                <span>↗ +4 pts vs reserve</span>
              </div>
            </div>
          </div>

          {/* Card 4: Active Buyers */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Active Buyers
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight">
                932
              </div>
              <div className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
                <span>↗ +21</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TABS NAVIGATION BAR ================= */}
        <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex p-1 bg-muted rounded-xl gap-1 border border-border min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-card text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ================= MAIN ANALYTICS SECTION ================= */}
        {activeTab === "Sales" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Chart: Sales analytics */}
            <div className="lg:col-span-6 xl:col-span-6 bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div className="mb-4">
                <h2 className="text-sm sm:text-base font-semibold text-foreground">
                  Sales analytics
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Realised value by month
                </p>
              </div>

              <div className="w-full h-[280px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesData}
                    margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.16} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="currentColor"
                      className="text-border"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 11 }}
                      className="text-muted-foreground"
                      dy={8}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(val) => `₹${val}L`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 11 }}
                      className="text-muted-foreground"
                      dx={-4}
                    />
                    <Tooltip content={<CustomSalesTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      fill="url(#salesGrad)"
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: "#2563EB",
                        stroke: "#FFFFFF",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Chart: Top selling materials */}
            <div className="lg:col-span-6 xl:col-span-6 bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div className="mb-4">
                <h2 className="text-sm sm:text-base font-semibold text-foreground">
                  Top selling materials
                </h2>
              </div>

              <div className="w-full h-[280px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topMaterialsData}
                    margin={{ top: 5, right: 15, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      vertical={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 11, fontWeight: 500 }}
                      className="text-foreground"
                      width={110}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 300]}
                      ticks={[0, 75, 150, 225, 300]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 11 }}
                      className="text-muted-foreground"
                      dy={8}
                    />
                    <Tooltip content={<CustomMaterialsTooltip />} />
                    <Bar
                      dataKey="value"
                      fill="#10B981"
                      radius={[0, 8, 8, 0]}
                      barSize={14}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ================= INVENTORY TAB ================= */}
        {activeTab === "Inventory" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Stock Volume by Material Category
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live stock vs storage capacity across certified yards
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600">
                  12,846 MT Total
                </span>
              </div>
              <MaterialTable columns={inventoryReportColumns} data={inventoryData} />
            </div>

            <div className="lg:col-span-5 bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Inventory Liquidity Status
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  High vs slow moving asset turnaround
                </p>
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
                      <span>Fast Moving (Turnaround &lt; 10 days)</span>
                      <span className="font-bold">68%</span>
                    </div>
                    <p className="text-[11px] text-emerald-600 mt-1">
                      Copper Millberry, Steel Turnings, Brass Honey
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100">
                    <div className="flex items-center justify-between text-xs font-medium text-blue-800">
                      <span>Standard Flow (10 - 20 days)</span>
                      <span className="font-bold">24%</span>
                    </div>
                    <p className="text-[11px] text-blue-600 mt-1">
                      Aluminium Castings, HDPE Polymers, Industrial Drums
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-100">
                    <div className="flex items-center justify-between text-xs font-medium text-amber-800">
                      <span>Aged Inventory (&gt; 20 days)</span>
                      <span className="font-bold">8%</span>
                    </div>
                    <p className="text-[11px] text-amber-600 mt-1">
                      Heavy Structural Shears, Specialized Composite Alloys
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>Inspection Pass Rate</span>
                <span className="font-semibold text-foreground">99.4%</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= AUCTION TAB ================= */}
        {activeTab === "Auction" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  Auction Realisation vs Reserve Price
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Monthly trend of average winning bid percentage above reserve floor
                </p>
              </div>

              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={auctionPerformanceData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="auctionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis domain={[95, 120]} ticks={[95, 100, 105, 110, 115, 120]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip
                      formatter={(val) => [`${val}% of Reserve`, "Realisation"]}
                      contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFF", borderRadius: 8, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="realization" stroke="#10B981" strokeWidth={2.5} fill="url(#auctionGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Auction Clearance Metrics
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Conversion of scheduled lots to completed settlements
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">Total Lots Listed</span>
                    <p className="text-xl font-bold text-foreground mt-1">1,215</p>
                    <span className="text-[11px] text-emerald-600 font-medium">↗ +14% MoM</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">Lots Sold</span>
                    <p className="text-xl font-bold text-foreground mt-1">1,123</p>
                    <span className="text-[11px] text-emerald-600 font-medium">92.4% Clearance</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">Avg Bids / Lot</span>
                    <p className="text-xl font-bold text-foreground mt-1">14.8</p>
                    <span className="text-[11px] text-blue-600 font-medium">High Competition</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">Dispute Rate</span>
                    <p className="text-xl font-bold text-foreground mt-1">0.18%</p>
                    <span className="text-[11px] text-emerald-600 font-medium">Near Zero</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Avg. auction duration</span>
                <span className="font-semibold text-foreground">45 minutes</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= REVENUE TAB ================= */}
        {activeTab === "Revenue" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs">
              <h2 className="text-base font-semibold text-foreground">
                Revenue Streams (YTD Breakdown)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 mb-4">
                Total ₹41.3 Cr generated across all operational channels
              </p>

              <div className="space-y-4">
                {revenueBreakdownData.map((stream, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-foreground">
                      <span>{stream.channel}</span>
                      <span className="font-bold text-foreground">
                        ₹{stream.amount} Cr ({stream.percentage})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: stream.percentage }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Financial Performance Highlights
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Platform fee margins and settlement velocity
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground">Average Commission Fee</span>
                    <span className="text-sm font-bold text-foreground">2.1%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground">Same-Day Escrow Payouts</span>
                    <span className="text-sm font-bold text-emerald-600">97.8%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground">EBITDA Margin</span>
                    <span className="text-sm font-bold text-primary">+31.4%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Audited for FY 2025-26</span>
                <span className="font-semibold text-foreground">Clean Opinion</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= INDUSTRY PERFORMANCE TAB ================= */}
        {activeTab === "Industry performance" && (
          <div className="bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Manufacturing Industry Segment Performance
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Trade volume, gross value, and contract fulfillment rate by sector
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 self-start sm:self-auto">
                486 Enrolled Industries
              </span>
            </div>

            <MaterialTable columns={industryPerformanceColumns} data={industryPerformanceData} />
          </div>
        )}

        {/* ================= BUYER PERFORMANCE TAB ================= */}
        {activeTab === "Buyer performance" && (
          <div className="bg-card rounded-xl border border-border p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Buyer Tiers & Liquidity Engagement
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Participation rate, average monthly spend, and repeat purchase loyalty
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 self-start sm:self-auto">
                932 Active Verified Buyers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {buyerPerformanceData.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-muted/40 hover:bg-card hover:shadow-2xs transition-all">
                  <span className="text-xs font-semibold text-primary">{item.tier}</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-foreground">{item.count}</span>
                    <span className="text-xs text-muted-foreground">Verified</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Avg. Spend:</span>
                      <span className="font-semibold text-foreground">{item.avgSpend}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Repeat Rate:</span>
                      <span className="font-semibold text-emerald-600">{item.repeatRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= BOTTOM INFORMATIONAL CALLOUT ================= */}
        <div className="bg-blue-50/60 border border-blue-100/90 rounded-xl p-3.5 sm:p-4 flex items-center gap-3 text-xs sm:text-sm text-foreground/80 shadow-2xs">
          <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <BarChart2 size={13} />
          </div>
          <p className="leading-relaxed">
            Reports refresh every 15 minutes. Scheduled exports are delivered to{" "}
            <a
              href="mailto:finance@smartscrap.ai"
              className="font-semibold text-primary hover:underline"
            >
              finance@smartscrap.ai
            </a>
            .
          </p>
        </div>

      </div>

      {/* ================= SCHEDULE REPORT MODAL ================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Schedule Automated Report
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure automated delivery to your team or stakeholders.
                </p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSchedule} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Report Type
                </label>
                <select
                  value={scheduleForm.reportType}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, reportType: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                >
                  <option>Full Operational & Financial Digest</option>
                  <option>Sales & Realisation Analytics</option>
                  <option>Material Category & Inventory Breakdown</option>
                  <option>Auction Clearance & Bidding Efficiency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Frequency
                  </label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, frequency: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Delivery Time
                  </label>
                  <select
                    value={scheduleForm.time}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, time: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                  >
                    <option>08:00 AM IST</option>
                    <option>09:00 AM IST</option>
                    <option>06:00 PM IST</option>
                    <option>11:59 PM IST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScheduleForm({ ...scheduleForm, format: "PDF" })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      scheduleForm.format === "PDF"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <FileText size={14} /> PDF Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleForm({ ...scheduleForm, format: "Excel" })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      scheduleForm.format === "Excel"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <FileSpreadsheet size={14} /> Excel / CSV Data
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Email Recipients (Comma Separated)
                </label>
                <input
                  type="text"
                  value={scheduleForm.recipients}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, recipients: e.target.value })
                  }
                  placeholder="name@smartscrap.ai, team@smartscrap.ai"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
