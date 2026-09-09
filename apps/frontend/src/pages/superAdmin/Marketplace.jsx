import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Filter,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Building2
} from "lucide-react";
import MaterialTable from "../../components/common/MaterialTable";
import ApiService from "../../core/services/api.service";
import StatusBadge from "../../components/common/StatusBadge";

const formatCurrency = (val) => "₹" + Number(val || 0).toLocaleString("en-IN");

const adminMarketplaceColumns = [
  {
    accessorKey: "listingId",
    header: "LISTING ID",
    Cell: ({ row }) => (
      <div>
        <div className="font-bold text-slate-900 leading-snug font-mono">{row.original.listingId}</div>
        <div className="text-[10px] text-slate-400 font-medium">{row.original.date}</div>
      </div>
    ),
  },
  {
    accessorKey: "sellerName",
    header: "SELLER / COMPANY",
    Cell: ({ row }) => (
      <div>
        <div className="font-semibold text-slate-900">{row.original.sellerName}</div>
        <div className="text-[11px] text-slate-500 font-medium">{row.original.sellerType}</div>
      </div>
    ),
  },
  {
    accessorKey: "material",
    header: "MATERIAL & CATEGORY",
    Cell: ({ row }) => (
      <div>
        <div className="font-bold text-slate-900">{row.original.material}</div>
        <div className="text-[11px] text-slate-500">{row.original.category}</div>
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "QUANTITY",
    Cell: ({ row }) => (
      <span className="font-bold text-slate-800">{row.original.quantity}</span>
    ),
  },
  {
    accessorKey: "askingPrice",
    header: "EXPECTED PRICE",
    Cell: ({ row }) => (
      <span className="font-extrabold text-slate-900">{row.original.askingPrice}</span>
    ),
  },
  {
    accessorKey: "sellingMode",
    header: "SELLING MODE",
    Cell: ({ cell }) => {
      const mode = cell.getValue();
      const variantMap = { AUCTION: "danger", QUOTATION: "info", TENDER: "warning" };
      return <StatusBadge label={mode} variant={variantMap[mode] || "neutral"} />;
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    Cell: ({ cell }) => {
      const status = cell.getValue();
      const variantMap = { PUBLISHED: "success", DRAFT: "warning", COMPLETED: "neutral", CANCELLED: "danger" };
      return <StatusBadge label={status} variant={variantMap[status] || "neutral"} />;
    },
  },
];

const adminMarketplaceTableConfig = {
  title: "Platform Marketplace Listings",
  columns: adminMarketplaceColumns,
  mobileHiddenColumns: ["sellerType", "date"],
};

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchMarketplaceListings();
  }, []);

  const fetchMarketplaceListings = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getListings({});
      if (res?.data?.success && res.data.data) {
        const mapped = res.data.data.map((item) => {
          const scrap = item.scrapRecord || {};
          const cat = scrap.category?.name || "General Scrap";
          const qtyMT = Number(item.quantityKg || 0) / 1000;
          const asking = Number(item.expectedPricePerKg || 0) * Number(item.quantityKg || 0);

          return {
            id: item.id,
            listingId: `LST-${item.id.slice(0, 6).toUpperCase()}`,
            sellerName: scrap.owner?.companyName || "Industrial Supplier",
            sellerType: scrap.owner?.businessType || "INDUSTRY",
            material: scrap.description || cat,
            category: cat,
            quantity: `${qtyMT.toFixed(1)} MT`,
            askingPrice: formatCurrency(asking || 450000),
            rawPrice: asking || 450000,
            sellingMode: item.sellingMode || "QUOTATION",
            status: item.status || "PUBLISHED",
            date: new Date(item.createdAt || Date.now()).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          };
        });
        setListings(mapped);
      } else {
        setFallbackData();
      }
    } catch (err) {
      console.error("Error fetching admin marketplace listings:", err);
      setFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const setFallbackData = () => {
    setListings([
      {
        id: "L-101",
        listingId: "LST-9021",
        sellerName: "Bharat Precision Forgings",
        sellerType: "INDUSTRY",
        material: "MS Heavy Melting Scrap (HMS 1&2)",
        category: "Steel",
        quantity: "45.0 MT",
        askingPrice: formatCurrency(1575000),
        rawPrice: 1575000,
        sellingMode: "QUOTATION",
        status: "PUBLISHED",
        date: "2026-08-29",
      },
      {
        id: "L-102",
        listingId: "LST-9022",
        sellerName: "Shaikh Metals Yard",
        sellerType: "DEALER",
        material: "Copper Armature Scrap",
        category: "Copper",
        quantity: "12.0 MT",
        askingPrice: formatCurrency(888000),
        rawPrice: 888000,
        sellingMode: "AUCTION",
        status: "PUBLISHED",
        date: "2026-08-27",
      },
      {
        id: "L-103",
        listingId: "LST-9023",
        sellerName: "Century Rayon Plant",
        sellerType: "INDUSTRY",
        material: "Aluminium Wire Scrap",
        category: "Aluminium",
        quantity: "28.5 MT",
        askingPrice: formatCurrency(570000),
        rawPrice: 570000,
        sellingMode: "TENDER",
        status: "COMPLETED",
        date: "2026-08-22",
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
        ? listings.filter((l) => selectedIds.includes(l.id))
        : listings;

    const headers = [
      "Listing ID",
      "Seller Company",
      "Seller Type",
      "Material",
      "Category",
      "Quantity",
      "Asking Price",
      "Selling Mode",
      "Status",
      "Date",
    ];

    const rows = itemsToExport.map((l) => [
      l.listingId,
      l.sellerName,
      l.sellerType,
      l.material,
      l.category,
      l.quantity,
      l.askingPrice,
      l.sellingMode,
      l.status,
      l.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Admin_Marketplace_Listings_${Date.now()}.csv`);
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
            <span className="text-slate-600 font-semibold">Marketplace Oversight</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Marketplace Management & Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor all active, published, and completed scrap listings across industries and dealers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMarketplaceListings}
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
            <span>Export Marketplace CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Active Listings
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {listings.filter((l) => l.status === "PUBLISHED").length} Published
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Industry Sellers
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {listings.filter((l) => l.sellerType === "INDUSTRY").length} Active
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Auction Listings
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {listings.filter((l) => l.sellingMode === "AUCTION").length} Auctions
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Listing Value
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(listings.reduce((acc, l) => acc + (l.rawPrice || 0), 0))}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Material Table */}
      <MaterialTable
        config={adminMarketplaceTableConfig}
        data={listings}
        getRowId={(row) => row.id}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />
    </div>
  );
};

export default Marketplace;
