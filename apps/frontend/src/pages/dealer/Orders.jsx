import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Package,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Building2,
  AlertCircle,
} from "lucide-react";
import ApiService from "../../core/services/api.service";
import Toast from "../../components/common/Toast";

const fmt = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

const STATUS_STYLE = {
  COMPLETED:       { bg: "bg-green-50",  text: "text-green-700",  label: "Completed",       icon: CheckCircle2 },
  PENDING_PAYMENT: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending Payment", icon: Clock },
  PAYMENT_PROCESSING: { bg: "bg-blue-50", text: "text-blue-700",  label: "Processing",      icon: Clock },
  OFFER_ACCEPTED:  { bg: "bg-indigo-50", text: "text-indigo-700", label: "Accepted",        icon: CheckCircle2 },
  CANCELLED:       { bg: "bg-red-50",    text: "text-red-700",    label: "Cancelled",       icon: XCircle },
  REFUNDED:        { bg: "bg-gray-50",   text: "text-gray-600",   label: "Refunded",        icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.PENDING_PAYMENT;
  const Icon = s.icon;
  return (
    <span className={`${s.bg} ${s.text} inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium`}>
      <Icon className="w-3 h-3" />{s.label}
    </span>
  );
};

const SaleCard = ({ sale, onComplete, isSeller }) => {
  const [completing, setCompleting] = useState(false);
  const catName = sale.listing?.scrapRecord?.category?.name || "Scrap Material";
  const desc    = sale.listing?.scrapRecord?.description;
  const other   = isSeller ? sale.buyer : sale.seller;

  const handleComplete = async () => {
    if (!window.confirm("Confirm payment received and mark sale as Completed?")) return;
    setCompleting(true);
    await onComplete(sale.id);
    setCompleting(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{catName}</h3>
              {desc && <p className="text-xs text-gray-500 truncate">{desc}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusBadge status={sale.status} />
            <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 bg-gray-50 rounded-lg text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Quantity</p>
            <p className="font-semibold text-gray-900">{Number(sale.quantityKg).toLocaleString("en-IN")} kg</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Price / kg</p>
            <p className="font-semibold text-gray-900">{fmt(sale.pricePerKg)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Value</p>
            <p className="font-semibold text-emerald-600">{fmt(sale.totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{isSeller ? "Sale ID" : "Reference"}</p>
            <p className="font-mono text-xs text-gray-700 truncate">{sale.id.slice(0, 12)}…</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Building2 className="w-4 h-4" />
            <span>
              {isSeller ? "Buyer" : "Seller"}:{" "}
              <strong className="text-gray-700">{other?.companyName || "—"}</strong>
            </span>
          </div>

          {isSeller && sale.status === "PENDING_PAYMENT" && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-60 shadow-sm"
            >
              {completing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Confirm Payment & Complete
            </button>
          )}
          {sale.status === "COMPLETED" && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, desc }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
    <AlertCircle className="w-14 h-14 text-gray-300 mx-auto mb-3" />
    <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

const Orders = () => {
  const [tab, setTab] = useState("procurement");
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => setToast({ message, type });

  const loadPurchases = useCallback(async () => {
    setLoadingPurchases(true);
    try {
      const res = await ApiService.getSales();
      if (res?.data?.success) setPurchases(res.data.data?.sales || []);
    } catch { setPurchases([]); }
    finally { setLoadingPurchases(false); }
  }, []);

  const loadSales = useCallback(async () => {
    setLoadingSales(true);
    try {
      const res = await ApiService.getSales({ view: "sales" });
      if (res?.data?.success) setSales(res.data.data?.sales || []);
    } catch { setSales([]); }
    finally { setLoadingSales(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { loadPurchases(); loadSales(); }, []);

  const handleComplete = async (saleId) => {
    try {
      await ApiService.completeSale(saleId);
      showToast("Sale completed — inventory updated.");
      loadSales();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to complete sale.", "error");
    }
  };

  const kpis = {
    procurementSpend: purchases.filter(s => s.status === "COMPLETED").reduce((sum, s) => sum + Number(s.totalValue || 0), 0),
    salesRevenue:     sales.filter(s => s.status === "COMPLETED").reduce((sum, s) => sum + Number(s.totalValue || 0), 0),
    pendingSales:     sales.filter(s => s.status === "PENDING_PAYMENT").length,
    completedSales:   sales.filter(s => s.status === "COMPLETED").length,
  };

  const loading = tab === "procurement" ? loadingPurchases : loadingSales;
  const list    = tab === "procurement" ? purchases : sales;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <nav className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
            <span>SmartScrap AI</span> <span>›</span> <span>Dealer Portal</span> <span>›</span>
            <span className="text-slate-600 font-semibold">Orders</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Order Fulfillment</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track procurement from industries and sales to buyers.</p>
        </div>
        <button
          onClick={() => { loadPurchases(); loadSales(); }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Procurement Spend",  value: fmt(kpis.procurementSpend),  icon: ShoppingBag, color: "text-amber-600",  bg: "bg-amber-50"  },
          { label: "Sales Revenue",      value: fmt(kpis.salesRevenue),      icon: DollarSign,  color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Gross Profit",       value: fmt(kpis.salesRevenue - kpis.procurementSpend), icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Pending Sales",      value: kpis.pendingSales,           icon: Clock,       color: "text-yellow-600", bg: "bg-yellow-50"  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">{label}</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">{value}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl ${bg} ${color} border border-current/10 flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-4 border-b border-slate-200">
        {[
          { id: "procurement", label: `Procurement from Industries (${purchases.length})` },
          { id: "sales",       label: `Sales to Buyers (${sales.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
            {id === "sales" && kpis.pendingSales > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold">
                {kpis.pendingSales} pending
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>
      ) : list.length === 0 ? (
        <EmptyState
          title={tab === "procurement" ? "No procurement orders yet" : "No sales to buyers yet"}
          desc={tab === "procurement"
            ? "Browse the marketplace to purchase scrap from industry listings."
            : "Create listings from your Scrap Inventory — once a buyer's quotation is accepted, sales appear here."}
        />
      ) : (
        <div className="space-y-4">
          {list.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
              isSeller={tab === "sales"}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: "" })} />
    </div>
  );
};

export default Orders;
