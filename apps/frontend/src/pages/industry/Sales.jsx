import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  Download,
  RefreshCw,
} from "lucide-react";
import MaterialTable from "../../components/common/MaterialTable";
import ApiService from "../../core/services/api.service";
import { salesTableConfig } from "../../configs/tables/salesTable.config";

const formatCurrency = (val) => "₹" + Number(val || 0).toLocaleString("en-IN");

const Sales = () => {
  const [salesList, setSalesList] = useState([]);
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalSoldKg: 0,
    totalSalesCount: 0,
    availableStockKg: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      const [salesRes, scrapRes, tendersRes] = await Promise.all([
        ApiService.getSales(),
        ApiService.getScraps().catch(() => null),
        ApiService.getTenders({ status: "AWARDED" }).catch(() => null),
      ]);

      const paymentStatusLabel = (status) => {
        switch (status) {
          case "COMPLETED":          return "Paid";
          case "PAYMENT_PROCESSING": return "Processing";
          case "PENDING_PAYMENT":    return "Awaiting Payment";
          case "REFUNDED":           return "Refunded";
          case "CANCELLED":          return "Cancelled";
          default:                   return status || "Pending";
        }
      };

      // --- Quotation/auction-based sales ---
      let quotationRows = [];
      let quotationTotal = 0;
      if (salesRes?.data?.success && salesRes.data.data?.sales) {
        const { sales } = salesRes.data.data;
        // Auction sales only appear here after delivery is confirmed (DELIVERED)
        const visibleSales = sales.filter((s) =>
          !s.auctionId || s.deliveryStatus === 'DELIVERED'
        );
        quotationTotal = visibleSales.length;
        quotationRows = visibleSales.map((s) => ({
          id: s.id,
          orderId: `ORD-${s.id.slice(0, 6).toUpperCase()}`,
          saleType: s.auctionId ? "Auction" : "Quotation",
          buyerName: s.buyer?.companyName || "Registered Buyer",
          location: `${s.buyer?.city || "Industrial Zone"}${s.buyer?.state ? `, ${s.buyer.state}` : ""}`,
          material: s.listing?.scrapRecord?.description || s.listing?.scrapRecord?.category?.name || "Scrap Material",
          category: s.listing?.scrapRecord?.category?.name || "Ferrous",
          quantity: `${(Number(s.quantityKg || 0) / 1000).toFixed(1)} Tons`,
          totalValue: formatCurrency(s.totalValue),
          rawTotal: Number(s.totalValue || 0),
          rawQty: Number(s.quantityKg || 0),
          paymentStatus: paymentStatusLabel(s.status),
          fulfillmentStatus: s.deliveryStatus === 'DELIVERED' ? "Delivered" : s.status === "COMPLETED" ? "Completed" : s.status === "CANCELLED" ? "Cancelled" : s.status === "REFUNDED" ? "Refunded" : "Pending",
          deliveryStatus: s.deliveryStatus || null,
          date: new Date(s.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          isCompleted: s.status === "COMPLETED",
        }));
      }

      // --- Tender-award-based sales ---
      let tenderRows = [];
      if (tendersRes?.data?.success && Array.isArray(tendersRes.data.data)) {
        const awardedTenders = tendersRes.data.data.filter((t) => t.status === "AWARDED" && t.award);
        tenderRows = awardedTenders.map((t) => ({
          id: `tender-${t.id}`,
          orderId: t.ref || `TND-${t.id.slice(0, 6).toUpperCase()}`,
          saleType: "Tender",
          buyerName: t.award.dealer?.companyName || "Awarded Dealer",
          location: `${t.award.dealer?.city || ""}${t.award.dealer?.state ? `, ${t.award.dealer.state}` : ""}` || "Industrial Zone",
          material: t.scrapRecord?.description || t.scrapRecord?.category?.name || "Scrap Material",
          category: t.scrapRecord?.category?.name || "Ferrous",
          quantity: `${(Number(t.quantityKg || 0) / 1000).toFixed(1)} Tons`,
          totalValue: formatCurrency(t.award.finalTotalValue),
          rawTotal: Number(t.award.finalTotalValue || 0),
          rawQty: Number(t.quantityKg || 0),
          paymentStatus: "Paid",
          fulfillmentStatus: "Completed",
          date: new Date(t.award.awardedAt || t.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          isCompleted: true,
        }));
      }

      const allRows = [...quotationRows, ...tenderRows].sort((a, b) => new Date(b.date) - new Date(a.date));
      setSalesList(allRows);

      const completedRows = allRows.filter((r) => r.isCompleted);
      const rev   = completedRows.reduce((sum, r) => sum + r.rawTotal, 0);
      const volKg = completedRows.reduce((sum, r) => sum + r.rawQty, 0);

      let availableKg = 0;
      if (scrapRes?.data?.success && Array.isArray(scrapRes.data.data)) {
        availableKg = scrapRes.data.data.reduce((sum, s) => sum + Number(s.availableQuantityKg || 0), 0);
      }

      setKpis({
        totalRevenue: rev,
        totalSoldKg: volKg,
        totalSalesCount: quotationTotal + tenderRows.length,
        availableStockKg: availableKg,
      });
    } catch (err) {
      console.error("Error fetching sales orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSalesData(); }, []);

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
        ? salesList.filter((s) => selectedIds.includes(s.id))
        : salesList;

    const headers = [
      "Order ID",
      "Buyer Name",
      "Material",
      "Category",
      "Quantity",
      "Total Amount",
      "Payment Status",
      "Fulfillment",
      "Date",
    ];

    const rows = itemsToExport.map((s) => [
      s.orderId,
      s.buyerName,
      s.material,
      s.category,
      s.quantity,
      s.totalValue,
      s.paymentStatus,
      s.fulfillmentStatus,
      s.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Industry_Sales_Orders_${Date.now()}.csv`);
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
            <span>Industry Portal</span>
            <span>&rsaquo;</span>
            <span className="text-slate-600 font-semibold">Sales Orders</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sales & Order Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track completed sales, buyer payments, and pickup schedules in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSalesData}
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
            <span>Export Sales CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Revenue
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(kpis.totalRevenue || salesList.reduce((acc, s) => acc + (s.rawTotal || 0), 0))}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Volume Sold
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {(Number(kpis.totalSoldKg || 0) / 1000).toFixed(1)} MT
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Sales Count
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {kpis.totalSalesCount || salesList.length} Orders
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Available Stock
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
              {(Number(kpis.availableStockKg || 0) / 1000).toFixed(1)} MT
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Material Table */}
      <MaterialTable
        config={salesTableConfig}
        data={salesList}
        getRowId={(row) => row.id}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />
    </div>
  );
};

export default Sales;
