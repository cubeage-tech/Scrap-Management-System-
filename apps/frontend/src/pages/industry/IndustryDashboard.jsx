import { useState } from "react";
import {
  Package,
  FileText,
  MessageSquare,
  CheckCircle2,
  IndianRupee,
  Percent,
  Search,
  Bell,
  Settings,
  Plus,
  Key
} from "lucide-react";

import AddScrapModal from "../../components/industry/AddScrapModal";
import LiveBidsModal from "../../components/industry/LiveBidsModal";
import MaterialTable from "../../components/common/MaterialTable";
import { industryTableConfig } from "../../configs/tables/industryTable.config";
import { recentTransactionsColumns } from "../../configs/tables/recentTransactionsTable.config";

const initialStockData = [
  {
    id: "SCRAP-2026-001",
    title: "MS Steel HMS 1&2 Heavy Melting",
    category: "Ferrous Metal",
    grade: "Grade A",
    weight: "45.0 MT",
    pricePerUnit: "₹37,800/MT",
    totalValue: "₹17,01,000",
    mode: "Live Auction",
    status: "Bidding Live",
    biddersCount: 14,
    topBid: "₹37,800/MT",
    buyer: "Metro Recyclers Pvt Ltd",
    dateAdded: "Aug 10, 2026",
  },
  {
    id: "SCRAP-2026-002",
    title: "Copper Cable & Armored Wire Scrap",
    category: "Electrical & Cable",
    grade: "Grade A",
    weight: "8.5 MT",
    pricePerUnit: "₹330,000/MT",
    totalValue: "₹28,05,000",
    mode: "Sealed Tender",
    status: "Pending Quote",
    biddersCount: 6,
    topBid: "₹330,000/MT",
    buyer: "Sanjay Metals Pvt. Ltd.",
    dateAdded: "Aug 11, 2026",
  },
  {
    id: "SCRAP-2026-003",
    title: "Aluminium Die-Cast Scrap",
    category: "Non-Ferrous Metal",
    grade: "Grade B",
    weight: "12.0 MT",
    pricePerUnit: "₹172,000/MT",
    totalValue: "₹20,64,000",
    mode: "B2B Marketplace",
    status: "Completed",
    biddersCount: 9,
    topBid: "₹172,000/MT",
    buyer: "National Scrap Corp",
    dateAdded: "Aug 08, 2026",
  },
  {
    id: "SCRAP-2026-004",
    title: "Mixed E-Waste Scrap",
    category: "E-Scrap & Machinery",
    grade: "Grade C",
    weight: "2.8 MT",
    pricePerUnit: "₹91,000/MT",
    totalValue: "₹2,54,800",
    mode: "Live Auction",
    status: "Bidding Live",
    biddersCount: 9,
    topBid: "₹91,000/MT",
    buyer: "GreenMetal Solutions",
    dateAdded: "Aug 12, 2026",
  },
  {
    id: "SCRAP-2026-005",
    title: "LDPE Film Industrial Scrap",
    category: "Plastic & Rubber",
    grade: "Grade B",
    weight: "8.0 MT",
    pricePerUnit: "₹52,000/MT",
    totalValue: "₹4,16,000",
    mode: "B2B Marketplace",
    status: "Cancelled",
    biddersCount: 0,
    topBid: "-",
    buyer: "Ravi Kumar Agency",
    dateAdded: "Aug 13, 2026",
  },
  {
    id: "SCRAP-2026-006",
    title: "Stainless Steel 304 Offcuts",
    category: "Ferrous Metal",
    grade: "Grade A",
    weight: "6.5 MT",
    pricePerUnit: "₹147,500/MT",
    totalValue: "₹9,58,750",
    mode: "Sealed Tender",
    status: "Scheduled",
    biddersCount: 0,
    topBid: "₹1,47,500/MT",
    buyer: "Pending Auction",
    dateAdded: "Aug 14, 2026",
  },
];

const initialTransactions = [
  { id: "SAL-001", material: "MS Steel HMS 1&2", buyer: "Metro Recyclers Pvt Ltd", value: "₹17,01,000", status: "Completed" },
  { id: "SAL-002", material: "Copper Cable Scrap", buyer: "Sanjay Metals Pvt. Ltd.", value: "₹28,05,000", status: "Pending" },
  { id: "SAL-003", material: "Aluminium Die-Cast Scrap", buyer: "National Scrap Corp", value: "₹20,64,000", status: "Completed" },
  { id: "SAL-004", material: "Mixed E-Waste", buyer: "GreenMetal Solutions", value: "₹2,54,800", status: "Pending" },
  { id: "SAL-005", material: "LDPE Film Scrap", buyer: "Ravi Kumar Agency", value: "₹4,16,000", status: "Cancelled" },
];

const initialAuctions = [
  { id: "AUC-001", title: "MS Steel HMS 1&2 - 45 MT", status: "Live", currentBid: "₹37,800", timer: "02:34:18", bids: "38 bids · 14 bidders" },
  { id: "AUC-002", title: "Stainless Steel 304 - 6.5 MT", status: "Scheduled", currentBid: "₹1,47,500", timer: "05:00:00", bids: "0 bids · 0 bidders" },
  { id: "AUC-003", title: "Mixed E-Waste - 2.8 MT", status: "Completed", currentBid: "₹91,000", timer: "00:00:00", bids: "22 bids · 9 bidders" },
  { id: "AUC-004", title: "Copper Wire Scrap - 3.2 MT", status: "Scheduled", currentBid: "₹5,19,000", timer: "22:00:00", bids: "0 bids · 0 bidders" },
];

const IndustryDashboard = () => {
  // State management for inventory, transactions, and auctions
  const [stockList, setStockList] = useState(initialStockData);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [auctions, setAuctions] = useState(initialAuctions);

  // Filters & Search State
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("B2B Marketplace"); // 'B2B Marketplace', 'Live Auction', 'Sealed Tender'
  const [selectedAuctionLot, setSelectedAuctionLot] = useState(null);

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
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              +12%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{totalWeight} MT</div>
            <div className="text-xs font-semibold text-slate-400">Total Scrap Inventory</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">₹38.2L value</div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              +33%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{totalListings}</div>
            <div className="text-xs font-semibold text-slate-400">Today's Listings</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">2 new today</div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
              -1
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{liveAuctionsCount || 2}</div>
            <div className="text-xs font-semibold text-slate-400">Active Auctions</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">1 live now</div>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              stable
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{openTendersCount || 3}</div>
            <div className="text-xs font-semibold text-slate-400">Open Tenders</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">7 offers received</div>
          </div>
        </div>

        {/* Stat Card 5 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              +2
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">3</div>
            <div className="text-xs font-semibold text-slate-400">Pending Quotations</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">₹50.4L potential</div>
          </div>
        </div>

        {/* Stat Card 6 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              +50%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">3</div>
            <div className="text-xs font-semibold text-slate-400">Completed Sales</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">This month</div>
          </div>
        </div>

        {/* Stat Card 7 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              +8%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">₹1.70Cr</div>
            <div className="text-xs font-semibold text-slate-400">Today's Revenue</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">From 1 transaction</div>
          </div>
        </div>

        {/* Stat Card 8 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
              +15%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">₹65,650</div>
            <div className="text-xs font-semibold text-slate-400">Total Commission</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Platform earnings</div>
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
              <div className="absolute inset-x-0 top-0 text-[10px] text-slate-300 border-b border-dashed border-slate-100 pt-1">₹2.2Cr / 600 MT</div>
              <div className="absolute inset-x-0 top-1/3 text-[10px] text-slate-300 border-b border-dashed border-slate-100 pt-1">₹1.5Cr / 450 MT</div>
              <div className="absolute inset-x-0 top-2/3 text-[10px] text-slate-300 border-b border-dashed border-slate-100 pt-1">₹0.8Cr / 300 MT</div>

              {[
                { month: "Jan", rev: 55, vol: 45 },
                { month: "Feb", rev: 70, vol: 55 },
                { month: "Mar", vol: 45, rev: 50 },
                { month: "Apr", rev: 85, vol: 70 },
                { month: "May", rev: 90, vol: 75 },
                { month: "Jun", rev: 75, vol: 65 },
                { month: "Jul", rev: 100, vol: 85 },
                { month: "Aug", rev: 48, vol: 40 },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end z-10">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div 
                      className="w-4 bg-blue-600 rounded-t-xs transition-all hover:opacity-90 cursor-pointer" 
                      style={{ height: `${bar.rev}%` }}
                      title={`Revenue: ${bar.rev}%`}
                    ></div>
                    <div 
                      className="w-4 bg-sky-200 rounded-t-xs transition-all hover:opacity-90 cursor-pointer" 
                      style={{ height: `${bar.vol}%` }}
                      title={`Volume: ${bar.vol}%`}
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
              <svg className="w-full h-36 overflow-visible" viewBox="0 0 500 120">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,80 Q 70,55 140,75 T 280,35 T 420,15 T 500,90 L 500,120 L 0,120 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M 0,80 Q 70,55 140,75 T 280,35 T 420,15 T 500,90"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                />
                {[
                  { x: 0, y: 80, val: "₹1.2Cr" },
                  { x: 70, y: 65, val: "₹1.4Cr" },
                  { x: 140, y: 75, val: "₹1.1Cr" },
                  { x: 210, y: 45, val: "₹1.7Cr" },
                  { x: 280, y: 35, val: "₹1.8Cr" },
                  { x: 350, y: 50, val: "₹1.6Cr" },
                  { x: 420, y: 15, val: "₹2.2Cr" },
                  { x: 500, y: 90, val: "₹1.0Cr" },
                ].map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                ))}
              </svg>

              <div className="absolute bottom-0 inset-x-0 flex justify-between text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-100">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
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

            <div className="flex items-center justify-center my-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#2563eb" strokeWidth="5" strokeDasharray="42 100" strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="5" strokeDasharray="18 100" strokeDashoffset="-42" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#22c55e" strokeWidth="5" strokeDasharray="15 100" strokeDashoffset="-60" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#a855f7" strokeWidth="5" strokeDasharray="12 100" strokeDashoffset="-75" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray="8 100" strokeDashoffset="-87" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#64748b" strokeWidth="5" strokeDasharray="5 100" strokeDashoffset="-95" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Steel 42%</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Copper 18%</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Aluminium 15%</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Plastic 12%</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> E-Waste 8%</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Others 5%</div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-4">Recent Activity</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0"></span>
                  <div>
                    <div className="font-bold text-slate-900">New Quotation Received</div>
                    <div className="text-slate-500 leading-tight">Sanjay Metals submitted a quotation of ₹37,800/MT for MS Steel Scrap (45 MT)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">10 minutes ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                  <div>
                    <div className="font-bold text-slate-900">Auction Won</div>
                    <div className="text-slate-500 leading-tight">Metro Recyclers won the auction for Mixed E-Waste batch at ₹91,000/MT</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">2 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0"></span>
                  <div>
                    <div className="font-bold text-slate-900">Tender Closed</div>
                    <div className="text-slate-500 leading-tight">Tender TND-003 for Brass Turning Scrap has been closed. 11 offers received.</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">1 day ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0"></span>
                  <div>
                    <div className="font-bold text-slate-900">Inventory Updated</div>
                    <div className="text-slate-500 leading-tight">Stock deducted for SAL-001 — 45 MT MS Steel HMS cleared from Warehouse A Bay 3</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">1 day ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                  <div>
                    <div className="font-bold text-slate-900">Listing Expiring Soon</div>
                    <div className="text-slate-500 leading-tight">LST-001 MS Steel HMS expires in 7 days. Renew or extend the listing.</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">2 days ago</div>
                  </div>
                </div>
              </div>
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
                    pricePerUnit: "₹37,800/MT"
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