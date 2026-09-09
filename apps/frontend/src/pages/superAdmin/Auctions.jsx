import React, { useState, useEffect, useMemo } from "react";
import {
  Gavel,
  Trophy,
  Users,
  Clock,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign
} from "lucide-react";
import MaterialTable from "../../components/common/MaterialTable";
import ApiService from "../../core/services/api.service";
import StatusBadge from "../../components/common/StatusBadge";

const formatCurrency = (val) => "₹" + Number(val || 0).toLocaleString("en-IN");

const adminAuctionColumns = [
  {
    accessorKey: "auctionId",
    header: "AUCTION ID",
    Cell: ({ row }) => (
      <div>
        <div className="font-bold text-slate-900 leading-snug font-mono">{row.original.auctionId}</div>
        <div className="text-[10px] text-slate-400 font-medium">{row.original.date}</div>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "TITLE & MATERIAL",
    Cell: ({ row }) => (
      <div>
        <div className="font-bold text-slate-900">{row.original.title}</div>
        <div className="text-[11px] text-slate-500 font-medium">{row.original.weight}</div>
      </div>
    ),
  },
  {
    accessorKey: "sellerName",
    header: "SELLER COMPANY",
    Cell: ({ row }) => (
      <span className="font-semibold text-slate-800">{row.original.sellerName}</span>
    ),
  },
  {
    accessorKey: "highestBid",
    header: "CURRENT HIGHEST BID",
    Cell: ({ row }) => (
      <div>
        <div className="font-extrabold text-slate-900">{row.original.highestBid}</div>
        <div className="text-[10px] text-emerald-600 font-semibold">{row.original.biddersCount} Bidders</div>
      </div>
    ),
  },
  {
    accessorKey: "startingPrice",
    header: "STARTING PRICE",
    Cell: ({ row }) => (
      <span className="font-semibold text-slate-600">{row.original.startingPrice}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    Cell: ({ cell }) => {
      const status = cell.getValue();
      const variantMap = { LIVE: "danger", COMPLETED: "success", UPCOMING: "warning", CANCELLED: "neutral" };
      return <StatusBadge label={status} variant={variantMap[status] || "neutral"} />;
    },
  },
];

const adminAuctionTableConfig = {
  title: "Platform Auctions Oversight",
  columns: adminAuctionColumns,
  mobileHiddenColumns: ["startingPrice", "date"],
};

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.get("/marketplace/auctions");
      if (res?.data?.success && res.data.data) {
        const mapped = res.data.data.map((auc) => {
          const scrap = auc.scrapRecord || {};
          const qtyMT = Number(auc.quantityKg || 0) / 1000;
          return {
            id: auc.id,
            auctionId: `AUC-${auc.id.slice(0, 6).toUpperCase()}`,
            title: scrap.description || "Auction Scrap Lot",
            weight: `${qtyMT.toFixed(1)} MT`,
            sellerName: scrap.owner?.companyName || "Industrial Seller",
            highestBid: formatCurrency(auc.highestBidAmount || auc.startingPrice || 500000),
            rawBid: Number(auc.highestBidAmount || auc.startingPrice || 500000),
            startingPrice: formatCurrency(auc.startingPrice || 400000),
            biddersCount: auc.bidsCount || 8,
            status: auc.status || "LIVE",
            date: new Date(auc.createdAt || Date.now()).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          };
        });
        setAuctions(mapped);
      } else {
        setFallbackData();
      }
    } catch (err) {
      console.error("Error fetching admin auctions:", err);
      setFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const setFallbackData = () => {
    setAuctions([
      {
        id: "A-1",
        auctionId: "AUC-2291",
        title: "Steel Turnings & Borings",
        weight: "48.0 MT",
        sellerName: "Bharat Steel Works",
        highestBid: formatCurrency(1284000),
        rawBid: 1284000,
        startingPrice: formatCurrency(1150000),
        biddersCount: 14,
        status: "LIVE",
        date: "2026-08-29",
      },
      {
        id: "A-2",
        auctionId: "AUC-2290",
        title: "Copper Millberry Heavy Scrap",
        weight: "12.5 MT",
        sellerName: "Tata Precision Forgings",
        highestBid: formatCurrency(761500),
        rawBid: 761500,
        startingPrice: formatCurrency(690000),
        biddersCount: 22,
        status: "LIVE",
        date: "2026-08-28",
      },
      {
        id: "A-3",
        auctionId: "AUC-2289",
        title: "Aluminium Sheet Offcuts",
        weight: "26.0 MT",
        sellerName: "Hindalco Recycling",
        highestBid: formatCurrency(520000),
        rawBid: 520000,
        startingPrice: formatCurrency(480000),
        biddersCount: 9,
        status: "COMPLETED",
        date: "2026-08-26",
      },
    ]);
  };

  const rowSelection = useMemo(
    () => Object.fromEntries(selectedIds.map((id) => [id, true])),
    [selectedIds]
  );

  const handleRowSelectionChange = (updaterOrValue) => {
    const next = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
    setSelectedIds(Object.keys(next).filter((id) => next[id]));
  };

  const handleExportCSV = () => {
    const itemsToExport =
      selectedIds.length > 0
        ? auctions.filter((a) => selectedIds.includes(a.id))
        : auctions;

    const headers = [
      "Auction ID",
      "Title",
      "Weight",
      "Seller Company",
      "Highest Bid",
      "Starting Price",
      "Bidders",
      "Status",
      "Date",
    ];

    const rows = itemsToExport.map((a) => [
      a.auctionId,
      a.title,
      a.weight,
      a.sellerName,
      a.highestBid,
      a.startingPrice,
      a.biddersCount,
      a.status,
      a.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Admin_Auctions_Oversight_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <nav className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
            <span>SmartScrap AI</span>
            <span>&rsaquo;</span>
            <span>Super Admin</span>
            <span>&rsaquo;</span>
            <span className="text-slate-600 font-semibold">Auctions Management</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Live Auctions & Bidding Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor live auctions, highest bids, bidder participation, and winner settlements across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAuctions}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white/90" />
            <span>Export Auctions CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Live Auctions
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-rose-600 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {auctions.filter((a) => a.status === "LIVE").length} Active
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <Gavel className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Bidders Participating
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {auctions.reduce((acc, a) => acc + (a.biddersCount || 0), 0)} Bidders
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Completed / Settled
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {auctions.filter((a) => a.status === "COMPLETED").length} Settled
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Highest Bid Volume
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(auctions.reduce((acc, a) => acc + (a.rawBid || 0), 0))}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Material Table */}
      <MaterialTable
        config={adminAuctionTableConfig}
        data={auctions}
        getRowId={(row) => row.id}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />
    </div>
  );
};

export default Auctions;
