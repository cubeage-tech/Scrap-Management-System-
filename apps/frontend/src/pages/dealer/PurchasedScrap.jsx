import { useState, useEffect, useMemo, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  PackageCheck,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Truck,
  Building2,
  Download,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Plus,
  Boxes,
  RefreshCw,
  IndianRupee,
  CreditCard,
  Printer,
  X,
  Gavel,
  MessageSquare,
  Award,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  LayoutGrid,
  List,
  Loader2,
  TrendingUp,
  Scale,
} from "lucide-react";
import ApiService from "../../core/services/api.service";
import Toast from "../../components/common/Toast";
import RoutePath from "../../core/constants/routes.constant";

// ── Category Styling Helpers ──────────────────────────────────────────────────

const CATEGORY_THEMES = {
  Steel: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    avatar: "bg-slate-700 text-white",
    dot: "bg-slate-500",
  },
  Copper: {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    avatar: "bg-amber-600 text-white",
    dot: "bg-amber-500",
  },
  Aluminium: {
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    avatar: "bg-sky-600 text-white",
    dot: "bg-sky-500",
  },
  Plastic: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    avatar: "bg-emerald-600 text-white",
    dot: "bg-emerald-500",
  },
  "Electronic Waste": {
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    avatar: "bg-violet-600 text-white",
    dot: "bg-violet-500",
  },
  Rubber: {
    badge: "bg-stone-100 text-stone-800 border-stone-200",
    avatar: "bg-stone-600 text-white",
    dot: "bg-stone-500",
  },
};

const getCategoryTheme = (cat = "") => {
  return (
    CATEGORY_THEMES[cat] || {
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      avatar: "bg-indigo-600 text-white",
      dot: "bg-indigo-500",
    }
  );
};

// ── Currency & Unit Formatters ─────────────────────────────────────────────────

const fmtCcy = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val ?? 0);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// ── Invoice Modal Component ───────────────────────────────────────────────────

const InvoiceModal = ({ isOpen, onClose, purchase }) => {
  if (!isOpen || !purchase) return null;

  const gross = Number(purchase.totalValNum || 0);
  const gst = Math.round(gross * 0.18);
  const grandTotal = gross + gst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Purchase Tax Invoice</h3>
              <p className="text-[11px] text-slate-400 font-mono">{purchase.invoice}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 font-sans">
          {/* Top Invoice Metadata */}
          <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Issued By Seller
              </span>
              <p className="font-bold text-slate-900 text-sm">{purchase.seller}</p>
              <p className="text-slate-500 mt-0.5">{purchase.location}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">GSTIN: 27AABCS1429B1Z8 (Verified)</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Tax Invoice Details
              </span>
              <p className="font-mono font-bold text-slate-900">{purchase.invoice}</p>
              <p className="text-slate-500 mt-0.5">Date: {purchase.date}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Paid & Cleared
              </span>
            </div>
          </div>

          {/* Bill To */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Procured By (Buyer / Dealer)
            </span>
            <p className="font-bold text-slate-900">Registered Platform Dealer</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Lot Ref: #{purchase.id}</p>
          </div>

          {/* Line Item Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Agreed Rate</th>
                  <th className="p-3 text-right">Taxable Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{purchase.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Category: {purchase.category} · Mode: {purchase.type}
                    </p>
                  </td>
                  <td className="p-3 text-right font-medium">{purchase.weight}</td>
                  <td className="p-3 text-right font-medium">{purchase.rate}</td>
                  <td className="p-3 text-right font-bold text-slate-900">{fmtCcy(gross)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">{fmtCcy(gross)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18% Reverse Charge/IGST):</span>
                <span className="font-medium text-slate-900">{fmtCcy(gst)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Value:</span>
                <span className="text-blue-600">{fmtCcy(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Transport Note */}
          <div className="text-[11px] text-slate-500 bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
            <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Transport & Handover: </strong>
              Vehicle: {purchase.vehicle} ({purchase.transporter}). E-Way bill generated automatically upon dispatch.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={() => {
                handlePrint();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Payment Modal Component (for PENDING_PAYMENT items) ────────────────────────

const QuickPayModal = ({ isOpen, onClose, purchase, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !purchase) return null;

  const handlePay = async () => {
    setProcessing(true);
    setError(null);
    try {
      // 1. Initiate payment
      const initRes = await ApiService.initiatePayment(purchase.rawId);
      const paymentId = initRes?.data?.data?.id;

      // 2. Verify payment (simulated immediate settlement in demo environment)
      if (paymentId) {
        await ApiService.verifyPayment(purchase.rawId, paymentId);
      }
      onSuccess(purchase);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to process payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-sm">Complete Purchase Payment</h3>
          </div>
          <button onClick={onClose} className="text-amber-200 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs font-sans">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Material</span>
              <span className="font-bold text-slate-900">{purchase.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Quantity</span>
              <span className="font-bold text-slate-900">{purchase.weight}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Agreed Rate</span>
              <span className="font-bold text-slate-900">{purchase.rate}</span>
            </div>
            <div className="pt-2 border-t border-amber-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>Amount Due</span>
              <span className="text-amber-700">{purchase.totalPaid}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500">
            Payment will clear this transaction immediately, generate your official Tax Invoice, and transfer scrap ownership directly to your inventory.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={processing}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              {processing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Payment & Transfer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page Component ───────────────────────────────────────────────────────

const PurchasedScrap = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [expandedCards, setExpandedCards] = useState({});
  const [importingId, setImportingId] = useState(null);
  const [importedIds, setImportedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [invoiceTarget, setInvoiceTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);

  const loadPurchases = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getSales();
      const list = res?.data?.data?.sales || res?.data?.data || [];
      const mapped = list.map((s) => {
        const listing = s.listing || {};
        const scrap = listing.scrapRecord || {};
        const catName = scrap.category?.name || "General";
        const totalVal = Number(s.totalValue || 0);

        let pStatus = "Pending Payment";
        if (s.status === "COMPLETED") pStatus = "Completed";
        else if (s.status === "CANCELLED" || s.status === "REFUNDED") pStatus = "Cancelled";
        else if (s.status === "PAYMENT_PROCESSING") pStatus = "Processing";

        const modeLabel = s.auctionId
          ? "Auction"
          : listing.sellingMode
          ? listing.sellingMode.charAt(0) + listing.sellingMode.slice(1).toLowerCase()
          : "Quotation";

        const alreadyInInventory = Boolean(s.sourceInventory?.id || s.sourceInventoryId);

        return {
          id: s.id.slice(0, 8).toUpperCase(),
          rawId: s.id,
          status: pStatus,
          rawStatus: s.status,
          isCompleted: s.status === "COMPLETED",
          type: modeLabel,
          title: scrap.description || `${catName} Scrap`,
          weight: `${(Number(s.quantityKg || 0) / 1000).toFixed(1)} MT`,
          weightKg: Number(s.quantityKg || 0),
          rate: `₹${Number(s.pricePerKg || 0).toLocaleString("en-IN")}/kg`,
          rateNum: Number(s.pricePerKg || 0),
          seller: s.seller?.companyName || "Industrial Supplier",
          sellerContact: s.seller?.contactName || "Sales Dept",
          sellerPhone: s.seller?.contactPhone || "+91-9876543210",
          location: `${s.seller?.city || "Industrial Area"}${s.seller?.state ? `, ${s.seller.state}` : ""}`,
          category: catName,
          date: fmtDate(s.completedAt || s.createdAt),
          rawDate: new Date(s.createdAt).getTime(),
          invoice: `INV-${s.id.slice(0, 6).toUpperCase()}`,
          totalPaid: fmtCcy(totalVal),
          totalValNum: totalVal,
          weightNumMT: Number(s.quantityKg || 0) / 1000,
          currentStep:
            s.status === "COMPLETED"
              ? alreadyInInventory
                ? 4
                : 3
              : s.status === "PAYMENT_PROCESSING"
              ? 2
              : s.status === "PENDING_PAYMENT"
              ? 1
              : 0,
          deliveryStatus: s.deliveryStatus || (s.status === "COMPLETED" ? "DELIVERED" : "AWAITING_DISPATCH"),
          transporter: "SmartScrap Logistics Network",
          vehicle: "MH-12-AB-9821",
          alreadyInInventory,
          shortCode: catName.slice(0, 2).toUpperCase(),
        };
      });

      // Track already imported items
      const alreadySet = new Set(mapped.filter((m) => m.alreadyInInventory).map((m) => m.rawId));
      setImportedIds(alreadySet);

      setPurchases(mapped);
    } catch (err) {
      console.error("Error loading purchases:", err);
      setToast({ message: "Failed to load purchases. Please refresh.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleImportToInventory = async (item) => {
    setImportingId(item.rawId);
    try {
      await ApiService.importSaleToInventory(item.rawId);
      setImportedIds((prev) => new Set([...prev, item.rawId]));
      setToast({
        message: `✓ "${item.title}" successfully added to your Scrap Inventory!`,
        type: "success",
      });
    } catch (err) {
      setToast({
        message: err?.response?.data?.message || "Failed to import to inventory.",
        type: "error",
      });
    } finally {
      setImportingId(null);
    }
  };

  const handleCopyId = (rawId, e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(rawId);
    setCopiedId(rawId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleDetails = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ── Stat Aggregations ───────────────────────────────────────────────────────

  const totalCount = purchases.length;
  const completedCount = purchases.filter((p) => p.status === "Completed").length;
  const pendingCount = purchases.filter((p) => p.status === "Pending Payment").length;
  const cancelledCount = purchases.filter((p) => p.status === "Cancelled").length;

  const totalSpentVal = purchases
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + (p.totalValNum || 0), 0);
  const totalVolumeVal = purchases.reduce((sum, p) => sum + (p.weightNumMT || 0), 0);

  // ── Available Filter Options ───────────────────────────────────────────────

  const categories = useMemo(() => {
    const list = new Set(purchases.map((p) => p.category));
    return ["All", ...Array.from(list)];
  }, [purchases]);

  // ── Filtered List ──────────────────────────────────────────────────────────

  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      // Status Filter
      if (activeFilter !== "All") {
        if (activeFilter === "Completed" && item.status !== "Completed") return false;
        if (activeFilter === "Pending Payment" && item.status !== "Pending Payment") return false;
        if (activeFilter === "Cancelled" && item.status !== "Cancelled") return false;
      }

      // Category Filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;

      // Mode Filter
      if (selectedMode !== "All" && item.type.toLowerCase() !== selectedMode.toLowerCase()) return false;

      // Search Filter
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.seller.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [purchases, activeFilter, selectedCategory, selectedMode, searchQuery]);

  // ── CSV Export ─────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (filteredPurchases.length === 0) {
      setToast({ message: "No records to export.", type: "error" });
      return;
    }
    const headers = "Purchase Ref,Status,Procurement Mode,Material,Category,Quantity (MT),Rate (INR/kg),Total Paid,Seller,Location,Date,Invoice\n";
    const rows = filteredPurchases
      .map(
        (p) =>
          `"${p.id}","${p.status}","${p.type}","${p.title.replace(/"/g, '""')}","${p.category}","${p.weight}","${p.rate}","${p.totalPaid}","${p.seller.replace(/"/g, '""')}","${p.location}","${p.date}","${p.invoice}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SmartScrap_Purchased_Scrap_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ message: "Purchase history CSV exported successfully.", type: "success" });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 p-3 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Breadcrumb & Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <span>SmartScrap AI</span>
              <span>/</span>
              <span>Inventory</span>
              <span>/</span>
              <span className="text-slate-600 font-semibold">Purchased Scrap</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Purchased Scrap
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {totalCount} Lots Acquired
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Track acquired scrap lots from auctions, quotations, and tenders. Review tax invoices, track transport, and import stock directly into your active inventory.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={loadPurchases}
              disabled={isLoading}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-xl shadow-2xs transition-all disabled:opacity-50"
              title="Refresh purchases"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleExport}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => navigate(RoutePath.DEALER_SCRAP_INVENTORY)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Boxes className="w-4 h-4" />
              <span>Go to Inventory</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>

        {/* ── Executive Metric KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total Acquired */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
              <Package className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">{totalCount}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">All-time lots</p>
            </div>
          </div>

          {/* Completed / Ready */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600">{completedCount}</div>
              <p className="text-[11px] text-emerald-700/70 mt-0.5">Paid & transferred</p>
            </div>
          </div>

          {/* Pending Payment */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Pay</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-600">{pendingCount}</div>
              <p className="text-[11px] text-amber-700/70 mt-0.5">Action required</p>
            </div>
          </div>

          {/* Cancelled */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-rose-600">{cancelledCount}</div>
              <p className="text-[11px] text-rose-700/70 mt-0.5">Void / Refunded</p>
            </div>
          </div>

          {/* Total Capital Deployed */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Capital Spent</span>
              <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 truncate">
                {fmtCcy(totalSpentVal)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Settled purchases</p>
            </div>
          </div>

          {/* Total Volume */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Volume</span>
              <Scale className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {totalVolumeVal.toFixed(1)} MT
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Total procurement</p>
            </div>
          </div>
        </div>

        {/* ── Search, Filters & View Mode Toolbar ── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by material, lot ID, seller, city..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { key: "All", label: "All", count: totalCount },
              { key: "Completed", label: "Completed", count: completedCount },
              { key: "Pending Payment", label: "Pending Pay", count: pendingCount },
              { key: "Cancelled", label: "Cancelled", count: cancelledCount },
            ].map((tab) => {
              const active = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? "bg-slate-800 text-slate-200" : "bg-white text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dropdown Filters & Layout Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>

            {/* Procurement Mode Filter */}
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="All">All Modes</option>
              <option value="Auction">Auctions Won</option>
              <option value="Quotation">Direct Quotations</option>
              <option value="Tender">Tender Awards</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "cards" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Content Area: Cards or Table ── */}
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading purchase records…</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving sales orders and inventory status</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <PackageCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No Purchased Scrap Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery || activeFilter !== "All" || selectedCategory !== "All"
                  ? "No records matched your search filters. Try clearing your filters."
                  : "You haven't purchased any scrap yet. Browse live auctions or the marketplace to start acquiring stock."}
              </p>
            </div>
            {(searchQuery || activeFilter !== "All" || selectedCategory !== "All") ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                  setSelectedCategory("All");
                  setSelectedMode("All");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={() => navigate(RoutePath.DEALER_MARKETPLACE)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Explore Scrap Marketplace
              </button>
            )}
          </div>
        ) : viewMode === "table" ? (
          /* ══════════════ COMPACT TABLE VIEW ══════════════ */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Lot ID</th>
                    <th className="p-4">Material & Category</th>
                    <th className="p-4">Seller (Industry)</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4 text-right">Quantity</th>
                    <th className="p-4 text-right">Agreed Rate</th>
                    <th className="p-4 text-right">Total Paid</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Inventory</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPurchases.map((item) => {
                    const theme = getCategoryTheme(item.category);
                    const isInInventory = importedIds.has(item.rawId);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Lot ID */}
                        <td className="p-4 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>#{item.id}</span>
                            <button
                              onClick={(e) => handleCopyId(item.rawId, e)}
                              className="text-slate-300 hover:text-slate-600"
                              title="Copy Full UUID"
                            >
                              {copiedId === item.rawId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">{item.date}</span>
                        </td>

                        {/* Title & Category */}
                        <td className="p-4">
                          <p className="font-bold text-slate-900 truncate max-w-xs">{item.title}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border mt-1 ${theme.badge}`}>
                            {item.category}
                          </span>
                        </td>

                        {/* Seller */}
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{item.seller}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.location}
                          </p>
                        </td>

                        {/* Mode */}
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {item.type === "Auction" ? (
                              <Gavel className="w-3 h-3 text-rose-500" />
                            ) : item.type === "Tender" ? (
                              <Award className="w-3 h-3 text-purple-500" />
                            ) : (
                              <MessageSquare className="w-3 h-3 text-blue-500" />
                            )}
                            {item.type}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="p-4 text-right font-bold text-slate-900">{item.weight}</td>

                        {/* Rate */}
                        <td className="p-4 text-right font-semibold text-slate-700">{item.rate}</td>

                        {/* Total Paid */}
                        <td className="p-4 text-right font-black text-slate-900 text-sm">
                          {item.totalPaid}
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : item.status === "Pending Payment"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "Completed"
                                  ? "bg-emerald-500"
                                  : item.status === "Pending Payment"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {item.status}
                          </span>
                        </td>

                        {/* Inventory Status */}
                        <td className="p-4 text-center">
                          {isInInventory ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Stocked
                            </span>
                          ) : item.status === "Completed" ? (
                            <button
                              onClick={() => handleImportToInventory(item)}
                              disabled={importingId === item.rawId}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
                            >
                              {importingId === item.rawId ? "Importing…" : "+ Import"}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === "Pending Payment" && (
                              <button
                                onClick={() => setPayTarget(item)}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                              >
                                Pay Now
                              </button>
                            )}
                            <button
                              onClick={() => setInvoiceTarget(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ══════════════ RICH CARDS VIEW ══════════════ */
          <div className="space-y-4">
            {filteredPurchases.map((item) => {
              const theme = getCategoryTheme(item.category);
              const isExpanded = Boolean(expandedCards[item.id]);
              const isInInventory = importedIds.has(item.rawId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Card Header & Primary Details */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

                      {/* Left: Material Avatar + Title + Badges */}
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-xs border border-white/20 select-none ${theme.avatar}`}
                        >
                          <Package className="w-5 h-5 mb-0.5 opacity-90" />
                          <span className="text-[10px] font-black tracking-wider uppercase">
                            {item.shortCode}
                          </span>
                        </div>

                        {/* Title and Badges */}
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Lot ID Chip */}
                            <button
                              onClick={(e) => handleCopyId(item.rawId, e)}
                              className="inline-flex items-center gap-1 font-mono font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                              title="Click to copy ID"
                            >
                              <span>#{item.id}</span>
                              {copiedId === item.rawId ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>

                            {/* Mode Chip */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                              {item.type === "Auction" ? (
                                <Gavel className="w-3.5 h-3.5 text-rose-500" />
                              ) : item.type === "Tender" ? (
                                <Award className="w-3.5 h-3.5 text-purple-500" />
                              ) : (
                                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                              )}
                              <span>{item.type}</span>
                            </span>

                            {/* Status Chip */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                item.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : item.status === "Pending Payment"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === "Completed"
                                    ? "bg-emerald-500"
                                    : item.status === "Pending Payment"
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                              />
                              {item.status}
                            </span>

                            {/* Category Pill */}
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${theme.badge}`}>
                              {item.category}
                            </span>
                          </div>

                          {/* Material Description Title */}
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                            {item.title}
                          </h2>

                          {/* Seller & Origin Location */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-slate-700 font-semibold">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {item.seller}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {item.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity, Rate & Total Price */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 gap-3">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Total Value
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {item.totalPaid}
                          </span>
                          <span className="text-xs text-slate-500 font-medium block">
                            {item.weight} @ {item.rate}
                          </span>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2">
                          {item.status === "Pending Payment" && (
                            <button
                              onClick={() => setPayTarget(item)}
                              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Now</span>
                            </button>
                          )}

                          <button
                            onClick={() => toggleDetails(item.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <span>Details</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── Order Lifecycle Tracker Bar ── */}
                    <div className="mt-5 pt-4 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
                      <div className="flex items-center justify-between min-w-[360px] sm:min-w-0 max-w-2xl">
                        {[
                          { step: 1, label: "Deal Confirmed" },
                          { step: 2, label: "Payment Cleared" },
                          { step: 3, label: "Dispatched / Delivery" },
                          { step: 4, label: "In My Inventory" },
                        ].map((s, idx) => {
                          const isDone = item.currentStep >= s.step;
                          const isCurrent = item.currentStep === s.step - 1;
                          const isLast = idx === 3;

                          return (
                            <Fragment key={s.step}>
                              <div className="flex items-center gap-2 shrink-0">
                                {isDone ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                                      isCurrent
                                        ? "bg-blue-50 text-blue-600 border-blue-400 ring-2 ring-blue-500/20"
                                        : "bg-slate-100 text-slate-400 border-slate-200"
                                    }`}
                                  >
                                    {s.step}
                                  </div>
                                )}
                                <span
                                  className={`text-xs font-bold ${
                                    isDone
                                      ? "text-emerald-700"
                                      : isCurrent
                                      ? "text-blue-700"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {s.label}
                                </span>
                              </div>

                              {!isLast && (
                                <div className="flex-1 h-0.5 mx-2 bg-slate-200">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      item.currentStep >= s.step ? "bg-emerald-500" : "bg-transparent"
                                    }`}
                                  />
                                </div>
                              )}
                            </Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── Expandable Details & Inventory Actions Drawer ── */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 text-xs text-slate-700 space-y-4 animate-in slide-in-from-top-2 duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Column 1: Seller Plant Information */}
                        <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-500" /> Seller Plant Info
                          </div>
                          <p className="font-bold text-slate-900 text-sm">{item.seller}</p>
                          <p className="text-slate-500">{item.location}</p>
                          <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                            <div>
                              Contact Person: <strong className="text-slate-800">{item.sellerContact}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{item.sellerPhone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Order & Payment Specs */}
                        <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Transaction Specs
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Invoice:</span>
                              <span className="font-mono font-bold text-slate-800">{item.invoice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Order Method:</span>
                              <span className="font-bold text-slate-800">{item.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Quantity Net:</span>
                              <span className="font-bold text-slate-800">{item.weight} ({item.weightKg.toLocaleString("en-IN")} kg)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Agreed Price:</span>
                              <span className="font-bold text-slate-800">{item.rate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Logistics & Physical Delivery */}
                        <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-indigo-500" /> Transport & Handover
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div>
                              Carrier: <strong className="text-slate-800">{item.transporter}</strong>
                            </div>
                            <div>
                              Vehicle No: <strong className="text-slate-800 font-mono">{item.vehicle}</strong>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="text-slate-500">Delivery Status:</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.deliveryStatus === "DELIVERED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : item.deliveryStatus === "IN_TRANSIT"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {item.deliveryStatus.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar for Invoicing & Inventory Import */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setInvoiceTarget(item)}
                            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>View & Download Tax Invoice</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.status === "Completed" && (
                            <>
                              {isInInventory ? (
                                <div className="flex items-center gap-2">
                                  <span className="px-3.5 py-2 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Stock in Inventory</span>
                                  </span>
                                  <button
                                    onClick={() => navigate(RoutePath.DEALER_SCRAP_INVENTORY)}
                                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                                  >
                                    <Boxes className="w-3.5 h-3.5" />
                                    <span>Create Resale Listing</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleImportToInventory(item)}
                                  disabled={importingId === item.rawId}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                                >
                                  {importingId === item.rawId ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Importing to Inventory…</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4" />
                                      <span>Import to My Inventory</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Invoice Modal ── */}
        <InvoiceModal
          isOpen={Boolean(invoiceTarget)}
          onClose={() => setInvoiceTarget(null)}
          purchase={invoiceTarget}
        />

        {/* ── Quick Payment Modal ── */}
        <QuickPayModal
          isOpen={Boolean(payTarget)}
          onClose={() => setPayTarget(null)}
          purchase={payTarget}
          onSuccess={(paidItem) => {
            setToast({
              message: `Payment completed for ${paidItem.title}! Ownership transferred.`,
              type: "success",
            });
            loadPurchases();
          }}
        />

        {/* ── Toast Notification ── */}
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, message: "" })}
        />
      </div>
    </div>
  );
};

export default PurchasedScrap;
