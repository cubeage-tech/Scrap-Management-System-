import { useState, useEffect } from "react";
import {
  Package,
  FileText,
  MessageSquare,
  CheckCircle2,
  IndianRupee,
  Percent,
  Search,
  Plus,
  Key,
} from "lucide-react";

import AddScrapModal from "../../components/common/AddScrapModal";

import LiveBidsModal from "../../components/industry/LiveBidsModal";
import MaterialTable from "../../components/common/MaterialTable";
import { industryTableConfig } from "../../configs/tables/industryTable.config";
import { recentTransactionsColumns } from "../../configs/tables/recentTransactionsTable.config";
import ApiService from "../../core/services/api.service";

const initialTransactions = [];
const initialAuctions = [];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DONUT_COLORS = ["#2563eb", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#64748b", "#0ea5e9", "#eab308"];

function buildChartMonths(salesHistory) {
  const now = new Date();
  const map = {};
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map[key] = { month: MONTH_NAMES[d.getMonth()], rev: 0, vol: 0 };
  }
  salesHistory.forEach((s) => {
    const d = new Date(s.completedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (map[key]) {
      map[key].rev += Number(s.totalValue || 0);
      map[key].vol += Number(s.quantityKg || 0);
    }
  });
  const months = Object.values(map);
  const maxRev = Math.max(...months.map((m) => m.rev), 1);
  const maxVol = Math.max(...months.map((m) => m.vol), 1);
  return months.map((m) => ({
    month: m.month,
    revRaw: m.rev,
    volRaw: m.vol,
    rev: Math.round((m.rev / maxRev) * 95) || 0,
    vol: Math.round((m.vol / maxVol) * 80) || 0,
  }));
}

function buildMaterialMix(categoryPerformance) {
  if (!categoryPerformance || categoryPerformance.length === 0) return [];
  const total = categoryPerformance.reduce((s, c) => s + Number(c.soldKg || 0), 0) || 1;
  return categoryPerformance
    .sort((a, b) => b.soldKg - a.soldKg)
    .slice(0, 6)
    .map((c, i) => ({
      name: c.category,
      pct: Math.round((Number(c.soldKg) / total) * 100),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
}

function buildRecentActivity(salesHistory) {
  if (!salesHistory || salesHistory.length === 0) return [];
  return [...salesHistory]
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5)
    .map((s) => {
      const ago = (() => {
        const diff = Date.now() - new Date(s.completedAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} min ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
        return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
      })();
      const val = Number(s.totalValue || 0).toLocaleString("en-IN");
      return {
        id: s.id,
        title: "Sale Completed",
        desc: `${s.buyerName} purchased ${Number(s.quantityKg).toLocaleString("en-IN")} kg at ₹${Number(s.pricePerKg).toLocaleString("en-IN")}/kg — total ₹${val}`,
        ago,
        color: "bg-emerald-500",
      };
    });
}

const IndustryDashboard = () => {
  // State management for inventory, transactions, and auctions
  const [stockList, setStockList] = useState([]);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [auctions, setAuctions] = useState(initialAuctions);
  const [dashboardData, setDashboardData] = useState(null);
  const [_isLoading, setIsLoading] = useState(true);
  const [chartMonths, setChartMonths] = useState([]);
  const [materialMix, setMaterialMix] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Filters & Search State
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("B2B Marketplace");
  const [selectedAuctionLot, setSelectedAuctionLot] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, reportsRes] = await Promise.allSettled([
        ApiService.getIndustryDashboard(),
        ApiService.getIndustryReports(),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value?.data?.success) {
        const data = dashRes.value.data.data;
        setDashboardData(data);
        if (data.stockList && data.stockList.length > 0) setStockList(data.stockList);
        if (data.transactions) setTransactions(data.transactions);
        if (data.auctionsWidget) setAuctions(data.auctionsWidget);
      }

      if (reportsRes.status === "fulfilled" && reportsRes.value?.data?.success) {
        const rdata = reportsRes.value.data.data;
        const history = rdata.salesHistory || [];
        setChartMonths(buildChartMonths(history));
        setMaterialMix(buildMaterialMix(rdata.categoryPerformance || []));
        setRecentActivity(buildRecentActivity(history));
      }
    } catch (err) {
      console.error("Error fetching industry dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchDashboardData(); }, []);

  // Helper Toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Filtered Stock Items
  const filteredStock = stockList.filter((item) => {
    const matchesTab = 
      selectedTab === "All" ||
      (selectedTab === "Live Auctions" && item.mode === "Live Auction") ||
      (selectedTab === "Sealed Tenders" && item.mode === "Sealed Tender") ||
      (selectedTab === "Marketplace" && item.mode === "B2B Marketplace") ||
      (selectedTab === "Completed" && item.status === "Completed");

    const matchesCategory = 
      selectedCategory === "All" || item.category === selectedCategory;

    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.buyer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  // Calculate dynamic stats
  const totalWeight = stockList.reduce((acc, item) => acc + (parseFloat(item.weight) || 0), 0).toFixed(2);
  const totalListings = stockList.length;
  const liveAuctionsCount = stockList.filter((item) => item.mode === "Live Auction" && item.status === "Bidding Live").length;
  const openTendersCount = stockList.filter((item) => item.mode === "Sealed Tender").length;

  // Add new scrap lot handler
  const handleAddScrapLot = (newLot) => {
    setStockList([newLot, ...stockList]);

    // Add to recent transactions if sold/listed
    const newTx = {
      id: `SAL-00${transactions.length + 1}`,
      material: newLot.title,
      buyer: "Pending Buyer Match",
      value: newLot.totalValue,
      status: newLot.mode === "Live Auction" ? "Pending" : "Pending"
    };
    setTransactions([newTx, ...transactions]);

    // Add to auctions widget if Live Auction
    if (newLot.mode === "Live Auction") {
      const newAuc = {
        id: `AUC-00${auctions.length + 1}`,
        title: `${newLot.title} - ${newLot.weight}`,
        status: "Live",
        currentBid: newLot.pricePerUnit,
        timer: "04:00:00",
        bids: "0 bids · 0 bidders"
      };
      setAuctions([newAuc, ...auctions]);
    }

    showToast(`New scrap lot "${newLot.title}" logged successfully!`);
  };

  // Open modal with specific channel mode
  const openAddModalWithMode = (mode) => {
    setModalMode(mode);
    setIsAddModalOpen(true);
  };

  // Accept top bid handler
  const handleAcceptBid = (bidderName, bidAmount) => {
    if (!selectedAuctionLot) return;
    
    // Update inventory item status to Completed
    setStockList(stockList.map(item => item.id === selectedAuctionLot.id ? { ...item, status: "Completed", buyer: bidderName } : item));
    
    // Add to transactions as completed
    const newTx = {
      id: `SAL-00${transactions.length + 1}`,
      material: selectedAuctionLot.title,
      buyer: bidderName,
      value: bidAmount,
      status: "Completed"
    };
    setTransactions([newTx, ...transactions]);
    
    showToast(`Accepted bid of ${bidAmount} from ${bidderName}! Deal closed.`);
  };

  // Scrap Inventory table row actions
  const handleViewLot = (lot) => {
    if (lot.mode === "Live Auction") {
      setSelectedAuctionLot(lot);
    } else {
      showToast(`Viewing details for ${lot.id}`);
    }
  };

  const handleEditLot = (lot) => {
    showToast(`Editing ${lot.id} — full edit flow coming soon.`);
  };

  const handleDeleteLot = (lot) => {
    setStockList((prev) => prev.filter((item) => item.id !== lot.id));
  };

  return (
    <div className="space-y-6 pb-12 font-sans bg-[#FAF8F5] text-slate-800 -m-6 p-6 min-h-screen relative">
      
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#02154c] text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      
      {/* ================= 8 KPI STATS CARDS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat Card 1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              Live DB
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {dashboardData?.stats?.totalWeightMT ?? totalWeight} Tons
            </div>
            <div className="text-xs font-semibold text-slate-400">Total Scrap Inventory</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {dashboardData?.stats?.totalScrapValue || "₹0 value"}
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              Listings
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {dashboardData?.stats?.totalListings ?? totalListings}
            </div>
            <div className="text-xs font-semibold text-slate-400">Marketplace Listings</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {dashboardData?.stats?.todayListingsCount ?? 0} new today
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
              Active
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {dashboardData?.stats?.liveAuctionsCount ?? liveAuctionsCount}
            </div>
            <div className="text-xs font-semibold text-slate-400">Active Auctions</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Real-time bidding</div>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              Tenders
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {dashboardData?.stats?.openTendersCount ?? openTendersCount}
            </div>
            <div className="text-xs font-semibold text-slate-400">Open Tenders</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Sealed bids open</div>
          </div>
        </div>

        {/* Stat Card 5 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              Quotes
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {dashboardData?.stats?.pendingQuotesCount ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-400">Pending Quotations</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {dashboardData?.stats?.pendingQuotesValueDisplay || "₹0"} potential
            </div>
          </div>
        </div>

        {/* Stat Card 6 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              Deals
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {dashboardData?.stats?.completedSalesCount ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-400">Completed Sales</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Fulfilled orders</div>
          </div>
        </div>

        {/* Stat Card 7 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              Today
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {dashboardData?.stats?.todaysRevenueDisplay || "₹0"}
            </div>
            <div className="text-xs font-semibold text-slate-400">Today's Revenue</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Realized sales</div>
          </div>
        </div>

        {/* Stat Card 8 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              Fees
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {dashboardData?.stats?.totalCommissionDisplay || "₹0"}
            </div>
            <div className="text-xs font-semibold text-slate-400">Total Commission</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Platform fee paid</div>
          </div>
        </div>

      </div>

      {/* ================= MIDDLE CHARTS & RECENT ACTIVITY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column (2/3 width) - Charts */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Revenue & Volume Dual Bar Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Revenue & Volume</h2>
                <p className="text-xs text-slate-400">Monthly performance overview</p>
              </div>
              <select className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
                <option>Last 8 months</option>
                <option>Last 12 months</option>
              </select>
            </div>

            <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100 relative">
              <div className="absolute inset-x-0 top-0 text-[10px] text-slate-300 border-b border-dashed border-slate-100 pt-1">₹2.2Cr / 600 Tons</div>
              <div className="absolute inset-x-0 top-1/3 text-[10px] text-slate-300 border-b border-dashed border-slate-100 pt-1">₹1.5Cr / 450 Tons</div>
              <div className="absolute inset-x-0 top-2/3 text-[10px] text-slate-300 border-b border-dashed border-slate-100 pt-1">₹0.8Cr / 300 Tons</div>

              {(chartMonths.length > 0 ? chartMonths : [
                { month: "Jan", rev: 0, vol: 0 }, { month: "Feb", rev: 0, vol: 0 },
                { month: "Mar", rev: 0, vol: 0 }, { month: "Apr", rev: 0, vol: 0 },
                { month: "May", rev: 0, vol: 0 }, { month: "Jun", rev: 0, vol: 0 },
                { month: "Jul", rev: 0, vol: 0 }, { month: "Aug", rev: 0, vol: 0 },
              ]).map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end z-10">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div
                      className="w-4 bg-blue-600 rounded-t-xs transition-all hover:opacity-90 cursor-pointer"
                      style={{ height: `${Math.max(bar.rev, 2)}%` }}
                      title={bar.revRaw ? `Revenue: ₹${Number(bar.revRaw).toLocaleString("en-IN")}` : `Revenue: ${bar.rev}%`}
                    ></div>
                    <div
                      className="w-4 bg-sky-200 rounded-t-xs transition-all hover:opacity-90 cursor-pointer"
                      style={{ height: `${Math.max(bar.vol, 2)}%` }}
                      title={bar.volRaw ? `Volume: ${(bar.volRaw / 1000).toFixed(1)} Tons` : `Volume: ${bar.vol}%`}
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 mt-2">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Growth Trend (Smooth Spline Chart) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <div className="mb-3">
              <h2 className="text-base font-bold text-slate-900">Revenue Growth Trend</h2>
              <p className="text-xs text-slate-400">In crores (₹Cr)</p>
            </div>

            <div className="h-44 relative flex items-end">
              {(() => {
                const months = chartMonths.length > 0 ? chartMonths : Array(8).fill({ month: "—", rev: 0, revRaw: 0 });
                const maxRev = Math.max(...months.map((m) => m.revRaw || 0), 1);
                const pts = months.map((m, i) => ({
                  x: Math.round((i / (months.length - 1)) * 500),
                  y: Math.round(100 - ((m.revRaw || 0) / maxRev) * 90),
                  val: m.revRaw ? `₹${(m.revRaw / 100000).toFixed(1)}L` : "₹0",
                  month: m.month,
                }));
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
                const fill = d + ` L ${pts[pts.length - 1].x},120 L 0,120 Z`;
                return (
                  <svg className="w-full h-36 overflow-visible" viewBox="0 0 500 120">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={fill} fill="url(#chartGradient)" />
                    <path d={d} fill="none" stroke="#2563eb" strokeWidth="3" />
                    {pts.map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2">
                        <title>{pt.month}: {pt.val}</title>
                      </circle>
                    ))}
                  </svg>
                );
              })()}
              <div className="absolute bottom-0 inset-x-0 flex justify-between text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-100">
                {(chartMonths.length > 0 ? chartMonths : Array(8).fill(null)).map((m, i) => (
                  <span key={i}>{m?.month || "—"}</span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) - Material Mix & Recent Activity */}
        <div className="space-y-4">
          
          {/* Material Mix Donut Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">Material Mix</h2>
            <p className="text-xs text-slate-400 mb-4">By inventory volume %</p>

            {materialMix.length > 0 ? (
              <>
                <div className="flex items-center justify-center my-3">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {(() => {
                        let offset = 0;
                        return materialMix.map((m, i) => {
                          const el = (
                            <circle key={i} cx="18" cy="18" r="14" fill="none" stroke={m.color} strokeWidth="5"
                              strokeDasharray={`${m.pct} 100`} strokeDashoffset={-offset}>
                              <title>{m.name}: {m.pct}%</title>
                            </circle>
                          );
                          offset += m.pct;
                          return el;
                        });
                      })()}
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
                  {materialMix.map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }}></span>
                      {m.name} {m.pct}%
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-xs text-slate-400">No sales data yet</div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-4">Recent Activity</h2>

              {recentActivity.length > 0 ? (
                <div className="space-y-4 text-xs">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="flex items-start gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${act.color} mt-1 shrink-0`}></span>
                      <div>
                        <div className="font-bold text-slate-900">{act.title}</div>
                        <div className="text-slate-500 leading-tight">{act.desc}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{act.ago}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-xs text-slate-400">No recent activity</div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button 
                onClick={() => showToast("Loading full activity logs...")}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all notifications →
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ================= DYNAMIC SCRAP INVENTORY & FILTERING TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        
        {/* Table Header Controls & Filter Tabs */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {["All", "Live Auctions", "Sealed Tenders", "Marketplace", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTab === tab
                    ? "bg-[#011C6B] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Lot ID, title, or buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Ferrous Metal">Ferrous Metal</option>
                <option value="Non-Ferrous Metal">Non-Ferrous Metal</option>
                <option value="Electrical & Cable">Electrical & Cable</option>
                <option value="Plastic & Rubber">Plastic & Rubber</option>
                <option value="E-Scrap & Machinery">E-Scrap & Machinery</option>
              </select>
            </div>
          </div>

        </div>

        {/* Inventory Items Table */}
        <MaterialTable
          config={industryTableConfig}
          data={filteredStock}
          onView={handleViewLot}
          onEdit={handleEditLot}
          onDelete={handleDeleteLot}
        />

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Socket Sync Active
          </div>
        </div>
      </div>

      {/* ================= BOTTOM TABLES & LIVE AUCTIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column (2/3 width) - Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
              <button onClick={() => setSelectedTab("Completed")} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                View all
              </button>
            </div>

            <MaterialTable
              columns={recentTransactionsColumns}
              data={transactions}
              getRowId={(row) => row.id}
            />
          </div>
        </div>

        {/* Right Column (1/3 width) - Live Auctions Widget */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Live Auctions</h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> LIVE
                </span>
              </div>
              <button onClick={() => setSelectedTab("Live Auctions")} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {auctions.map((auc) => (
                <div 
                  key={auc.id}
                  onClick={() => setSelectedAuctionLot({
                    id: auc.id,
                    title: auc.title,
                    topBid: auc.currentBid,
                    pricePerUnit: "₹37,800/Ton"
                  })}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{auc.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        auc.status === "Live"
                          ? "bg-rose-100 text-rose-700"
                          : auc.status === "Scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {auc.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">⏱ {auc.timer}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-semibold">Current Bid</div>
                    <div className="text-sm font-extrabold text-blue-600">{auc.currentBid}</div>
                    <div className="text-[9px] text-slate-400">{auc.bids}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ================= BOTTOM QUICK ACTIONS BAR ================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => openAddModalWithMode("B2B Marketplace")}
            className="px-5 py-2.5 rounded-xl bg-[#855836] hover:bg-[#6e482b] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Scrap
          </button>

          <button
            onClick={() => openAddModalWithMode("B2B Marketplace")}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            📄 Create Listing
          </button>

          <button
            onClick={() => openAddModalWithMode("Live Auction")}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            🔑 Start Auction
          </button>

          <button
            onClick={() => openAddModalWithMode("Sealed Tender")}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            📄 Create Tender
          </button>

          <button
            onClick={() => showToast("Generating full platform report PDF...")}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* ================= MODAL DIALOGS ================= */}
      {isAddModalOpen && (
        <AddScrapModal
          key={modalMode}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddScrap={handleAddScrapLot}
          initialMode={modalMode}
        />
      )}

      <LiveBidsModal
        isOpen={!!selectedAuctionLot}
        onClose={() => setSelectedAuctionLot(null)}
        lot={selectedAuctionLot}
        onAcceptBid={handleAcceptBid}
      />

    </div>
  );
};

export default IndustryDashboard;